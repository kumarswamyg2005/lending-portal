// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILendingPool {
    function getUtilization(address token) external view returns (uint256);
}

/// @title VariableInterestRateModel - Utilization-based interest rates
/// @notice Implements a kinked interest rate model
contract VariableInterestRateModel {
    ILendingPool public lendingPool;
    address public owner;

    // Interest rate parameters
    uint256 public baseRateBorrow = 2e16; // 2%
    uint256 public baseRateSupply = 0;
    uint256 public multiplierPerBlock = 4e15; // ~15% APY at 100% utilization
    uint256 public kinkUtilization = 8e17; // 80%
    uint256 public multiplierAfterKink = 12e15; // 45% APY after kink

    mapping(address => bool) public tokenConfigs;

    constructor(address _lendingPool) {
        lendingPool = ILendingPool(_lendingPool);
        owner = msg.sender;
    }

    /// @notice Update lending pool address (for initial setup)
    function setLendingPool(address _lendingPool) external {
        require(msg.sender == owner, "Only owner");
        lendingPool = ILendingPool(_lendingPool);
    }

    /// @notice Get borrow rate for a token
    function getBorrowRate(address token) external view returns (uint256) {
        uint256 utilization = lendingPool.getUtilization(token);

        if (utilization <= kinkUtilization) {
            // Before kink: baseRate + utilization * multiplier
            return baseRateBorrow + (utilization * multiplierPerBlock) / 1e18;
        } else {
            // After kink: steeper increase
            uint256 utilizationAfterKink = utilization - kinkUtilization;
            return
                baseRateBorrow +
                (kinkUtilization * multiplierPerBlock) /
                1e18 +
                (utilizationAfterKink * multiplierAfterKink) /
                1e18;
        }
    }

    /// @notice Get supply rate for a token
    function getSupplyRate(address token) external view returns (uint256) {
        uint256 utilization = lendingPool.getUtilization(token);
        // Supply rate = (borrow rate * utilization * (1 - reserve factor)) / 1e18
        uint256 borrowRate = this.getBorrowRate(token);
        uint256 supplyRateBefore = (borrowRate * utilization) / 1e18;
        // Assume 10% reserve factor
        return (supplyRateBefore * 9000) / 10000;
    }
}
