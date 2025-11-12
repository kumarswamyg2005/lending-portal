// Contract addresses (deployed to Hardhat localhost)
export const CONTRACTS = {
  dai: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  usdc: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  weth: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  lendingPool: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  interestModel: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  flashLoanReceiver: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
};

// Contract ABIs
export const LENDING_POOL_ABI = [
  "function deposit(address token, uint256 amount)",
  "function withdraw(address token, uint256 amount)",
  "function borrow(address collateralToken, uint256 collateralAmount, address borrowToken, uint256 borrowAmount)",
  "function repay(uint256 loanId, uint256 repayAmount)",
  "function flashLoan(address receiver, address token, uint256 amount, bytes calldata params)",
  "function addMarket(address token)",
  "function getMarket(address token) view returns (uint256 totalLiquidity, uint256 totalBorrows, uint256 utilization)",
  "function getReputation(address user) view returns (uint256)",
  "function userDeposits(address user, address token) view returns (uint256)",
  "function userLoans(address user, uint256 loanId) view returns (uint256 borrowAmount, uint256 collateralAmount, address collateralToken, address borrowToken, uint256 borrowRateAtTime, uint256 borrowBlock, bool active)",
  "function userLoanCount(address user) view returns (uint256)",
  "event Deposit(address indexed user, address indexed token, uint256 amount)",
  "event Withdraw(address indexed user, address indexed token, uint256 amount)",
  "event Borrow(address indexed user, uint256 loanId, address indexed borrowToken, uint256 amount, address collateralToken, uint256 collateralAmount)",
  "event Repay(address indexed user, uint256 loanId, uint256 amount)",
];

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function mint(address to, uint256 amount)", // For testing with mock tokens
];

// Token addresses mapped by symbol
export const TOKEN_ADDRESSES: { [key: string]: string } = {
  DAI: CONTRACTS.dai,
  USDC: CONTRACTS.usdc,
  WETH: CONTRACTS.weth,
};
