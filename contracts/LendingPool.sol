// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IVariableInterestRateModel {
    function getBorrowRate(address token) external view returns (uint256);
    function getSupplyRate(address token) external view returns (uint256);
}

interface IFlashLoanReceiver {
    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata params
    ) external returns (bool);
}

/// @title LendingPool - Core lending protocol
/// @notice Manages deposits, borrows, flash loans, and reputation
contract LendingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Market {
        uint256 totalLiquidity;
        uint256 totalBorrows;
        uint256 reservesFactor; // 10% = 1000
        uint256 lastAccrualBlock;
        uint256 borrowIndex;
    }

    struct Loan {
        uint256 borrowAmount;
        uint256 collateralAmount;
        address collateralToken;
        address borrowToken;
        uint256 borrowRateAtTime;
        uint256 borrowBlock;
        bool active;
    }

    mapping(address => Market) public markets;
    mapping(address => mapping(address => uint256)) public userDeposits; // user => token => amount
    mapping(address => mapping(uint256 => Loan)) public userLoans; // user => loanId => loan
    mapping(address => uint256) public userLoanCount;
    mapping(address => uint256) public userReputation;
    mapping(address => bool) public supportedTokens;

    IVariableInterestRateModel public interestModel;
    uint256 public flashLoanFee = 9; // 0.09% = 9 basis points
    uint256 public constant FLASH_LOAN_FEE_PRECISION = 10000;
    uint256 public constant LTV_RATIO = 7500; // 75%
    uint256 public constant HEALTH_FACTOR_MIN = 1100; // 1.1x minimum
    uint256 public constant LIQUIDATION_BONUS = 1100; // 10% bonus for liquidators

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(
        address indexed user,
        uint256 loanId,
        address indexed borrowToken,
        uint256 amount,
        address collateralToken,
        uint256 collateralAmount
    );
    event Repay(address indexed user, uint256 loanId, uint256 amount);
    event FlashLoan(
        address indexed receiver,
        address indexed token,
        uint256 amount,
        uint256 fee
    );
    event Liquidation(
        address indexed liquidator,
        address indexed borrower,
        uint256 loanId,
        uint256 repayAmount
    );
    event ReputationUpdated(address indexed user, int256 change, uint256 newReputation);

    constructor(address _interestModel) {
        interestModel = IVariableInterestRateModel(_interestModel);
    }

    /// @notice Add a new token market
    function addMarket(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!supportedTokens[token], "Market exists");
        supportedTokens[token] = true;
        markets[token] = Market({
            totalLiquidity: 0,
            totalBorrows: 0,
            reservesFactor: 1000,
            lastAccrualBlock: block.number,
            borrowIndex: 1e18
        });
    }

    /// @notice Deposit tokens to earn interest
    function deposit(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");

        _accruInterest(token);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        userDeposits[msg.sender][token] += amount;
        markets[token].totalLiquidity += amount;

        emit Deposit(msg.sender, token, amount);
    }

    /// @notice Withdraw deposited tokens
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(userDeposits[msg.sender][token] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be > 0");

        _accruInterest(token);

        uint256 available = IERC20(token).balanceOf(address(this)) -
            markets[token].totalBorrows;
        require(available >= amount, "Insufficient liquidity");

        userDeposits[msg.sender][token] -= amount;
        markets[token].totalLiquidity -= amount;

        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, token, amount);
    }

    /// @notice Borrow against collateral
    function borrow(
        address collateralToken,
        uint256 collateralAmount,
        address borrowToken,
        uint256 borrowAmount
    ) external nonReentrant {
        require(supportedTokens[collateralToken], "Collateral token not supported");
        require(supportedTokens[borrowToken], "Borrow token not supported");
        require(borrowAmount > 0, "Amount must be > 0");

        _accruInterest(borrowToken);

        // Check LTV
        uint256 maxBorrow = (collateralAmount * LTV_RATIO) / 10000;
        require(borrowAmount <= maxBorrow, "Exceeds LTV limit");

        // Transfer collateral
        IERC20(collateralToken).safeTransferFrom(
            msg.sender,
            address(this),
            collateralAmount
        );

        // Create loan record
        uint256 loanId = userLoanCount[msg.sender];
        userLoanCount[msg.sender]++;

        uint256 borrowRate = interestModel.getBorrowRate(borrowToken);

        userLoans[msg.sender][loanId] = Loan({
            borrowAmount: borrowAmount,
            collateralAmount: collateralAmount,
            collateralToken: collateralToken,
            borrowToken: borrowToken,
            borrowRateAtTime: borrowRate,
            borrowBlock: block.number,
            active: true
        });

        markets[borrowToken].totalBorrows += borrowAmount;

        // Transfer borrowed amount
        IERC20(borrowToken).safeTransfer(msg.sender, borrowAmount);

        // Reputation: +5 for successful borrow
        _updateReputation(msg.sender, 5);

        emit Borrow(msg.sender, loanId, borrowToken, borrowAmount, collateralToken, collateralAmount);
    }

    /// @notice Repay a loan
    function repay(uint256 loanId, uint256 repayAmount) external nonReentrant {
        Loan storage loan = userLoans[msg.sender][loanId];
        require(loan.active, "Loan not active");
        require(repayAmount > 0, "Amount must be > 0");

        _accruInterest(loan.borrowToken);

        // Calculate owed amount with interest
        uint256 blocksElapsed = block.number - loan.borrowBlock;
        uint256 interestAccrued = (loan.borrowAmount * loan.borrowRateAtTime * blocksElapsed) /
            (1e18 * 365 * 24 * 60 * 4); // Approx 4 blocks per minute

        uint256 totalOwed = loan.borrowAmount + interestAccrued;
        require(repayAmount <= totalOwed, "Repay amount exceeds debt");

        IERC20(loan.borrowToken).safeTransferFrom(msg.sender, address(this), repayAmount);

        loan.borrowAmount -= repayAmount;
        markets[loan.borrowToken].totalBorrows -= repayAmount;

        if (loan.borrowAmount == 0) {
            loan.active = false;
            // Return collateral
            IERC20(loan.collateralToken).safeTransfer(msg.sender, loan.collateralAmount);
            // Reputation: +10 for full repay
            _updateReputation(msg.sender, 10);
        } else {
            // Reputation: +2 for partial repay
            _updateReputation(msg.sender, 2);
        }

        emit Repay(msg.sender, loanId, repayAmount);
    }

    /// @notice Flash loan - borrow without collateral for one transaction
    function flashLoan(
        address receiver,
        address token,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");

        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        require(balanceBefore >= amount, "Insufficient liquidity");

        uint256 fee = (amount * flashLoanFee) / FLASH_LOAN_FEE_PRECISION;
        uint256 amountToRepay = amount + fee;

        // Transfer to receiver
        IERC20(token).safeTransfer(receiver, amount);

        // Call callback
        require(
            IFlashLoanReceiver(receiver).executeOperation(
                token,
                amount,
                fee,
                params
            ),
            "Flash loan callback failed"
        );

        // Verify repayment
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        require(balanceAfter >= balanceBefore + fee, "Flash loan not repaid");

        // Reputation: +3 for successful flash loan
        _updateReputation(receiver, 3);

        emit FlashLoan(receiver, token, amount, fee);
    }

    /// @notice Get market utilization
    function getUtilization(address token) public view returns (uint256) {
        Market memory market = markets[token];
        uint256 total = market.totalLiquidity + market.totalBorrows;
        if (total == 0) return 0;
        return (market.totalBorrows * 1e18) / total;
    }

    /// @notice Accrue interest on market
    function _accruInterest(address token) internal {
        Market storage market = markets[token];
        if (market.lastAccrualBlock == block.number) return;

        uint256 borrowRate = interestModel.getBorrowRate(token);
        uint256 blockDelta = block.number - market.lastAccrualBlock;

        // Interest = principal * rate * time
        uint256 interestAccrued = (market.totalBorrows * borrowRate * blockDelta) / (1e18 * 365 * 24 * 60 * 4);

        market.totalBorrows += interestAccrued;
        market.borrowIndex = (market.borrowIndex * (1e18 + borrowRate * blockDelta / (1e18 * 365 * 24 * 60 * 4))) / 1e18;
        market.lastAccrualBlock = block.number;
    }

    /// @notice Update user reputation
    function _updateReputation(address user, int256 change) internal {
        uint256 oldReputation = userReputation[user];
        if (change > 0) {
            userReputation[user] += uint256(change);
        } else if (userReputation[user] >= uint256(-change)) {
            userReputation[user] -= uint256(-change);
        }
        emit ReputationUpdated(user, change, userReputation[user]);
    }

    /// @notice Get user reputation
    function getReputation(address user) external view returns (uint256) {
        return userReputation[user];
    }

    /// @notice Get market info
    function getMarket(address token)
        external
        view
        returns (
            uint256 totalLiquidity,
            uint256 totalBorrows,
            uint256 utilization
        )
    {
        Market memory market = markets[token];
        return (market.totalLiquidity, market.totalBorrows, getUtilization(token));
    }
}
