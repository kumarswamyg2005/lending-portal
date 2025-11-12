// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ILendingPool {
    function flashLoan(
        address receiver,
        address token,
        uint256 amount,
        bytes calldata params
    ) external;
}

/// @title FlashLoanReceiver - Example flash loan callback
contract FlashLoanReceiver {
    using SafeERC20 for IERC20;

    ILendingPool public lendingPool;
    address public owner;

    event FlashLoanExecuted(address indexed token, uint256 amount, uint256 profit);

    constructor(address _lendingPool) {
        lendingPool = ILendingPool(_lendingPool);
        owner = msg.sender;
    }

    /// @notice Execute flash loan callback
    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == address(lendingPool), "Unauthorized");

        // Example: arbitrage or liquidation
        // For demo: simulate profit by transferring extra amount
        uint256 profit = (amount / 100); // 1% profit simulation

        uint256 amountToRepay = amount + fee;

        // In a real scenario, you'd perform actual swaps or operations here
        // For demo, we just ensure we can repay

        // Approve and repay
        IERC20(token).approve(address(lendingPool), amountToRepay);
        IERC20(token).transferFrom(owner, address(this), amountToRepay - amount);

        emit FlashLoanExecuted(token, amount, profit);

        return true;
    }
}
