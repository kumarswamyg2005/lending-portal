// Contract addresses (deployed to Hardhat localhost)
export const CONTRACTS = {
  dai: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  usdc: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  weth: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  lendingPool: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  interestModel: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  flashLoanReceiver: "0x9A676e781A523b5d0C0e43731313A708CB607508",
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
