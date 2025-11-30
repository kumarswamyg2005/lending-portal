// Contract addresses
// Supports both localhost and Sepolia testnet

// Network configurations
export const NETWORKS = {
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl:
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
  },
};

// Get contract addresses based on current network
export function getContractAddresses(chainId: number) {
  // Sepolia testnet
  if (chainId === 11155111) {
    return {
      lendingPool: process.env.NEXT_PUBLIC_SEPOLIA_LENDING_POOL || "",
      dai: process.env.NEXT_PUBLIC_SEPOLIA_DAI || "",
      usdc: process.env.NEXT_PUBLIC_SEPOLIA_USDC || "",
      weth: process.env.NEXT_PUBLIC_SEPOLIA_WETH || "",
    };
  }

  // Localhost / Hardhat (default)
  try {
    const deployment = require("../deployment.json");
    return {
      lendingPool:
        deployment.lendingPool || deployment.contracts?.lendingPool || "",
      dai: deployment.tokens?.DAI || deployment.contracts?.tokens?.DAI || "",
      usdc: deployment.tokens?.USDC || deployment.contracts?.tokens?.USDC || "",
      weth: deployment.tokens?.WETH || deployment.contracts?.tokens?.WETH || "",
    };
  } catch (error) {
    console.error("Error loading deployment.json:", error);
    return {
      lendingPool: "",
      dai: "",
      usdc: "",
      weth: "",
    };
  }
}

// Legacy export for backward compatibility
let deployment: any = {};
try {
  deployment = require("../deployment.json");
} catch (error) {
  console.warn("deployment.json not found, using environment variables");
}

export const CONTRACTS = {
  dai: deployment.tokens?.DAI || "",
  usdc: deployment.tokens?.USDC || "",
  weth: deployment.tokens?.WETH || "",
  lendingPool: deployment.lendingPool || "",
  interestModel: deployment.interestModel || "",
  flashLoanReceiver: deployment.flashLoanReceiver || "",
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
  "function allowance(address owner, address spender) view returns (uint256)",
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
