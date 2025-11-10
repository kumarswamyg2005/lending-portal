export const LENDING_POOL_ABI = [
  "function deposit(address token, uint256 amount)",
  "function withdraw(address token, uint256 amount)",
  "function borrow(address collateralToken, uint256 collateralAmount, address borrowToken, uint256 borrowAmount)",
  "function repay(uint256 loanId, uint256 repayAmount)",
  "function flashLoan(address receiver, address token, uint256 amount, bytes calldata params)",
  "function getMarket(address token) view returns (uint256 totalLiquidity, uint256 totalBorrows, uint256 utilization)",
  "function getReputation(address user) view returns (uint256)",
  "function userDeposits(address user, address token) view returns (uint256)",
  "function userLoans(address user, uint256 loanId) view returns (uint256 borrowAmount, uint256 collateralAmount, address collateralToken, address borrowToken, uint256 borrowRateAtTime, uint256 borrowBlock, bool active)",
  "function userLoanCount(address user) view returns (uint256)",
  "event Deposit(address indexed user, address indexed token, uint256 amount)",
  "event Withdraw(address indexed user, address indexed token, uint256 amount)",
  "event Borrow(address indexed user, uint256 loanId, address indexed borrowToken, uint256 amount, address collateralToken, uint256 collateralAmount)",
  "event Repay(address indexed user, uint256 loanId, uint256 amount)",
  "event ReputationUpdated(address indexed user, int256 change, uint256 newReputation)",
]

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]
