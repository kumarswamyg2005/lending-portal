import { ethers } from "ethers";
import {
  CONTRACTS,
  LENDING_POOL_ABI,
  TOKEN_ABI,
  TOKEN_ADDRESSES,
} from "./contracts";

// Get provider from MetaMask (uses whatever network MetaMask is connected to)
export function getProvider() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not installed");
  }
  return new ethers.providers.Web3Provider((window as any).ethereum);
}

// Get signer (connected wallet)
export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

// Mint test tokens (only works with mock tokens on local network)
export async function mintTestTokens(
  tokenSymbol: string,
  amount: string,
  recipient: string
) {
  try {
    const signer = await getSigner();
    const provider = getProvider();

    // Check ETH balance first
    const balance = await provider.getBalance(recipient);
    console.log(
      `[Blockchain] Account ETH balance: ${ethers.utils.formatEther(
        balance
      )} ETH`
    );

    if (balance.isZero()) {
      console.warn(
        `⚠️ Warning: No TEST ETH in account. Transaction may fail without gas funds.`
      );
      // Don't throw - let the user try anyway. MetaMask will handle the error.
    }

    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    // Get decimals
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);

    console.log(
      `[Blockchain] Minting ${amount} ${tokenSymbol} to ${recipient}`
    );

    // Let MetaMask estimate gas automatically
    const tx = await tokenContract.mint(recipient, amountWei);
    console.log(`[Blockchain] Mint transaction sent: ${tx.hash}`);

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

    // Step 1: Approve lending pool to spend tokens (approve maximum for better UX)
    const maxApproval = ethers.constants.MaxUint256; // Approve unlimited amount
    console.log(
      `[Blockchain] Approving ${CONTRACTS.lendingPool} to spend unlimited ${tokenSymbol} (one-time approval)`
    );

    // Try to estimate gas first to catch validation errors early
    try {
      await tokenContract.estimateGas.approve(
        CONTRACTS.lendingPool,
        maxApproval
      );
    } catch (estimateError: any) {
      // Suppress gas estimation errors from console, will be caught by transaction
      if (estimateError.message?.includes("cannot estimate gas")) {
        console.log(
          "[Blockchain] Gas estimation skipped, proceeding with transaction"
        );
      }
    }

    const approveTx = await tokenContract.approve(
      CONTRACTS.lendingPool,
      maxApproval
    );
    console.log(`[Blockchain] Approval transaction sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log(`[Blockchain] Approval confirmed`);

    // Step 2: Deposit tokens
    console.log(`[Blockchain] Depositing tokens to lending pool`);

    // Try to estimate gas for deposit
    try {
      await lendingPoolContract.estimateGas.deposit(tokenAddress, amountWei);
    } catch (estimateError: any) {
      // Suppress gas estimation errors from console
      if (estimateError.message?.includes("cannot estimate gas")) {
        console.log("[Blockchain] Gas estimation skipped for deposit");
      }
    }

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

    // Step 1: Approve collateral (unlimited approval for better UX)
    console.log(`[Blockchain] Approving collateral`);

    // Try to estimate gas, suppress errors
    try {
      await collateralTokenContract.estimateGas.approve(
        CONTRACTS.lendingPool,
        ethers.constants.MaxUint256
      );
    } catch (estimateError: any) {
      if (estimateError.message?.includes("cannot estimate gas")) {
        console.log(
          "[Blockchain] Gas estimation skipped for collateral approval"
        );
      }
    }

    const approveTx = await collateralTokenContract.approve(
      CONTRACTS.lendingPool,
      ethers.constants.MaxUint256
    );
    await approveTx.wait();
    console.log(`[Blockchain] Collateral approved`);

    // Step 2: Borrow - try to estimate gas first to catch LTV errors early
    try {
      await lendingPoolContract.estimateGas.borrow(
        collateralTokenAddress,
        collateralAmountWei,
        borrowTokenAddress,
        borrowAmountWei
      );
    } catch (estimateError: any) {
      // Check for specific validation errors
      if (estimateError.message?.includes("Exceeds LTV limit")) {
        throw new Error(
          "Borrow amount exceeds the allowed loan-to-value ratio (max 75%). Please reduce the borrow amount or increase collateral."
        );
      } else if (estimateError.message?.includes("Insufficient liquidity")) {
        throw new Error(
          "Not enough liquidity in the pool for this borrow amount."
        );
      } else if (estimateError.message?.includes("cannot estimate gas")) {
        // Generic gas estimation error - let transaction proceed, it will fail with proper error
        console.log("[Blockchain] Gas estimation skipped for borrow");
      } else {
        // Re-throw other errors
        throw estimateError;
      }
    }

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
    try {
      await tokenContract.estimateGas.approve(
        CONTRACTS.lendingPool,
        ethers.constants.MaxUint256
      );
    } catch (estimateError: any) {
      if (estimateError.message?.includes("cannot estimate gas")) {
        console.log("[Blockchain] Gas estimation skipped for repay approval");
      }
    }

    const approveTx = await tokenContract.approve(
      CONTRACTS.lendingPool,
      ethers.constants.MaxUint256
    );
    await approveTx.wait();

    // Repay
    try {
      await lendingPoolContract.estimateGas.repay(loanId, amountWei);
    } catch (estimateError: any) {
      if (estimateError.message?.includes("cannot estimate gas")) {
        console.log("[Blockchain] Gas estimation skipped for repay");
      }
    }

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
    try {
      await lendingPoolContract.estimateGas.flashLoan(
        CONTRACTS.flashLoanReceiver,
        tokenAddress,
        amountWei,
        "0x"
      );
    } catch (estimateError: any) {
      if (estimateError.message?.includes("cannot estimate gas")) {
        console.log("[Blockchain] Gas estimation skipped for flash loan");
      } else if (estimateError.message?.includes("Insufficient liquidity")) {
        throw new Error(
          "Not enough liquidity in the pool for this flash loan amount."
        );
      }
    }

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
