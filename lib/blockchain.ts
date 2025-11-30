import { ethers } from "ethers";
import {
  CONTRACTS,
  LENDING_POOL_ABI,
  TOKEN_ABI,
  TOKEN_ADDRESSES,
  getContractAddresses,
  NETWORKS,
} from "./contracts";

// Get provider from MetaMask (uses whatever network MetaMask is connected to)
export function getProvider() {
  console.log("[Blockchain] getProvider called");
  console.log(
    "[Blockchain] window.ethereum exists?",
    typeof window !== "undefined" && !!(window as any).ethereum
  );

  if (typeof window === "undefined" || !(window as any).ethereum) {
    console.error("[Blockchain] MetaMask not found!");
    throw new Error(
      "MetaMask not installed. Please install MetaMask browser extension."
    );
  }

  console.log("[Blockchain] Creating Web3Provider...");
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  console.log("[Blockchain] Provider created successfully");
  return provider;
}

// Get signer (connected wallet)
export async function getSigner() {
  console.log("[Blockchain] getSigner called");
  const provider = getProvider();
  console.log("[Blockchain] Getting signer from provider...");
  const signer = provider.getSigner();
  console.log("[Blockchain] Signer obtained");
  return signer;
}

// Get current network info
export async function getNetworkInfo() {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return {
    chainId: network.chainId,
    name:
      network.chainId === 11155111
        ? "Sepolia"
        : network.chainId === 31337
        ? "Localhost"
        : "Unknown",
  };
}

// Get token addresses for current network
export async function getTokenAddressesForNetwork() {
  const network = await getNetworkInfo();
  const addresses = getContractAddresses(network.chainId);

  return {
    DAI: addresses.dai,
    USDC: addresses.usdc,
    WETH: addresses.weth,
  };
}

// Mint test tokens (works on both localhost and Sepolia with mock tokens)
export async function mintTestTokens(
  tokenSymbol: string,
  amount: string,
  recipient: string
) {
  console.log("[Blockchain] mintTestTokens called with:", {
    tokenSymbol,
    amount,
    recipient,
  });

  try {
    console.log("[Blockchain] Getting signer...");
    const signer = await getSigner();
    const provider = getProvider();
    const network = await getNetworkInfo();

    console.log(
      `[Blockchain] Connected to: ${network.name} (Chain ID: ${network.chainId})`
    );
    console.log("[Blockchain] Signer obtained, checking balance...");

    // Check ETH balance first
    const balance = await provider.getBalance(recipient);
    console.log(
      `[Blockchain] Account ETH balance: ${ethers.utils.formatEther(
        balance
      )} ETH`
    );

    if (balance.isZero()) {
      const message =
        network.chainId === 11155111
          ? "⚠️ No Sepolia ETH! Get free test ETH from: https://sepoliafaucet.com/"
          : "⚠️ No ETH in account. Transaction may fail without gas funds.";
      console.warn(message);
      alert(message);
      return null;
    }

    // Get token addresses for current network
    const tokenAddresses = await getTokenAddressesForNetwork();
    const tokenAddress =
      tokenAddresses[tokenSymbol as keyof typeof tokenAddresses];

    console.log(`[Blockchain] Token address for ${tokenSymbol}:`, tokenAddress);

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found on ${network.name}`);
    }

    console.log("[Blockchain] Creating token contract...");
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    // Get decimals
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);

    console.log(
      `[Blockchain] Minting ${amount} ${tokenSymbol} (${amountWei.toString()} wei) to ${recipient}`
    );

    console.log(
      "[Blockchain] Calling tokenContract.mint() - MetaMask should popup now..."
    );
    // Let MetaMask estimate gas automatically
    const tx = await tokenContract.mint(recipient, amountWei);
    console.log(`[Blockchain] Mint transaction sent: ${tx.hash}`);

    console.log("[Blockchain] Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log(`[Blockchain] Mint confirmed in block ${receipt.blockNumber}`);

    return tx.hash;
  } catch (error: any) {
    console.error("[Blockchain] Mint error:", error);
    throw error;
  }
}

// Supply/Deposit tokens to lending pool
export async function depositTokens(
  tokenSymbol: string,
  amount: string,
  account: string
) {
  try {
    const signer = await getSigner();
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const lendingPoolContract = new ethers.Contract(
      CONTRACTS.lendingPool,
      LENDING_POOL_ABI,
      signer
    );

    // Get decimals
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);

    console.log(`[Blockchain] Depositing ${amount} ${tokenSymbol}`);

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(
      account,
      CONTRACTS.lendingPool
    );
    console.log(
      `[Blockchain] Current allowance: ${currentAllowance.toString()}`
    );

    // Only approve if needed
    if (currentAllowance.lt(amountWei)) {
      console.log(
        `[Blockchain] Approval needed. Requesting approval for ${tokenSymbol}...`
      );
      // Approve a large amount (1 billion tokens) to avoid multiple approvals
      // This is large enough for many transactions but won't trigger MetaMask's unlimited warning
      const largeAmount = ethers.utils.parseUnits("1000000000", decimals); // 1 billion tokens
      const approveTx = await tokenContract.approve(
        CONTRACTS.lendingPool,
        largeAmount
      );
      console.log(`[Blockchain] Approval transaction sent: ${approveTx.hash}`);
      await approveTx.wait();
      console.log(`[Blockchain] Approval confirmed`);
    } else {
      console.log(
        `[Blockchain] Sufficient allowance already exists, skipping approval`
      );
    }

    // Deposit tokens - THIS WILL SHOW A CLEAR CONFIRM BUTTON
    console.log(`[Blockchain] Depositing tokens to lending pool`);
    const depositTx = await lendingPoolContract.deposit(
      tokenAddress,
      amountWei
    );
    console.log(`[Blockchain] Deposit transaction sent: ${depositTx.hash}`);

    const receipt = await depositTx.wait();
    console.log(
      `[Blockchain] Deposit confirmed in block ${receipt.blockNumber}`
    );

    return depositTx.hash;
  } catch (error: any) {
    console.error("[Blockchain] Deposit error:", error);
    throw error;
  }
}

// Borrow tokens from lending pool
export async function borrowTokens(
  collateralTokenSymbol: string,
  collateralAmount: string,
  borrowTokenSymbol: string,
  borrowAmount: string
) {
  try {
    const signer = await getSigner();
    const account = await signer.getAddress();
    const collateralTokenAddress = TOKEN_ADDRESSES[collateralTokenSymbol];
    const borrowTokenAddress = TOKEN_ADDRESSES[borrowTokenSymbol];

    if (!collateralTokenAddress || !borrowTokenAddress) {
      throw new Error("Token not found");
    }

    const collateralTokenContract = new ethers.Contract(
      collateralTokenAddress,
      TOKEN_ABI,
      signer
    );
    const lendingPoolContract = new ethers.Contract(
      CONTRACTS.lendingPool,
      LENDING_POOL_ABI,
      signer
    );

    // Get decimals
    const collateralDecimals = await collateralTokenContract.decimals();
    const borrowTokenContract = new ethers.Contract(
      borrowTokenAddress,
      TOKEN_ABI,
      signer
    );
    const borrowDecimals = await borrowTokenContract.decimals();

    const collateralAmountWei = ethers.utils.parseUnits(
      collateralAmount,
      collateralDecimals
    );
    const borrowAmountWei = ethers.utils.parseUnits(
      borrowAmount,
      borrowDecimals
    );

    console.log(
      `[Blockchain] Borrowing ${borrowAmount} ${borrowTokenSymbol} with ${collateralAmount} ${collateralTokenSymbol} collateral`
    );

    // Check current allowance
    const currentAllowance = await collateralTokenContract.allowance(
      account,
      CONTRACTS.lendingPool
    );

    // Only approve if needed
    if (currentAllowance.lt(collateralAmountWei)) {
      console.log(`[Blockchain] Approving collateral...`);
      const approveTx = await collateralTokenContract.approve(
        CONTRACTS.lendingPool,
        collateralAmountWei
      );
      await approveTx.wait();
      console.log(`[Blockchain] Collateral approved`);
    } else {
      console.log(
        `[Blockchain] Sufficient allowance exists, skipping approval`
      );
    }

    // Borrow - THIS WILL SHOW CLEAR CONFIRM BUTTON
    const borrowTx = await lendingPoolContract.borrow(
      collateralTokenAddress,
      collateralAmountWei,
      borrowTokenAddress,
      borrowAmountWei
    );
    console.log(`[Blockchain] Borrow transaction sent: ${borrowTx.hash}`);

    const receipt = await borrowTx.wait();
    console.log(
      `[Blockchain] Borrow confirmed in block ${receipt.blockNumber}`
    );

    return borrowTx.hash;
  } catch (error: any) {
    console.error("[Blockchain] Borrow error:", error);
    throw error;
  }
}

// Repay loan
export async function repayLoan(
  loanId: number,
  tokenSymbol: string,
  repayAmount: string
) {
  try {
    const signer = await getSigner();
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const lendingPoolContract = new ethers.Contract(
      CONTRACTS.lendingPool,
      LENDING_POOL_ABI,
      signer
    );

    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(repayAmount, decimals);

    console.log(
      `[Blockchain] Repaying loan #${loanId} with ${repayAmount} ${tokenSymbol}`
    );

    // Approve tokens (unlimited approval for better UX)
    const approveTx = await tokenContract.approve(
      CONTRACTS.lendingPool,
      ethers.constants.MaxUint256
    );
    await approveTx.wait();

    // Repay
    const repayTx = await lendingPoolContract.repay(loanId, amountWei);
    console.log(`[Blockchain] Repay transaction sent: ${repayTx.hash}`);

    const receipt = await repayTx.wait();
    console.log(`[Blockchain] Repay confirmed in block ${receipt.blockNumber}`);

    return repayTx.hash;
  } catch (error: any) {
    console.error("[Blockchain] Repay error:", error);
    throw error;
  }
}

// Execute flash loan
export async function executeFlashLoan(tokenSymbol: string, amount: string) {
  try {
    const signer = await getSigner();
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const lendingPoolContract = new ethers.Contract(
      CONTRACTS.lendingPool,
      LENDING_POOL_ABI,
      signer
    );

    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);

    console.log(
      `[Blockchain] Executing flash loan for ${amount} ${tokenSymbol}`
    );

    // Execute flash loan with flash loan receiver contract
    const flashLoanTx = await lendingPoolContract.flashLoan(
      CONTRACTS.flashLoanReceiver,
      tokenAddress,
      amountWei,
      "0x" // Empty params
    );
    console.log(
      `[Blockchain] Flash loan transaction sent: ${flashLoanTx.hash}`
    );

    const receipt = await flashLoanTx.wait();
    console.log(
      `[Blockchain] Flash loan confirmed in block ${receipt.blockNumber}`
    );

    return flashLoanTx.hash;
  } catch (error: any) {
    console.error("[Blockchain] Flash loan error:", error);
    throw error;
  }
}

// Get token balance
export async function getTokenBalance(
  tokenSymbol: string,
  account: string
): Promise<string> {
  try {
    const provider = getProvider();
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      provider
    );
    const balance = await tokenContract.balanceOf(account);
    const decimals = await tokenContract.decimals();

    return ethers.utils.formatUnits(balance, decimals);
  } catch (error: any) {
    console.error("[Blockchain] Balance error:", error);
    return "0";
  }
}
