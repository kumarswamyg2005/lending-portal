import { ethers } from "ethers";
import {
  CONTRACTS,
  LENDING_POOL_ABI,
  TOKEN_ABI,
  TOKEN_ADDRESSES,
} from "./contracts";

// Get provider from MetaMask
export function getProvider() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not installed");
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

// Get signer (connected wallet)
export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

// Mint test tokens (only works with mock tokens on local network)
export async function mintTestTokens(
  tokenSymbol: string,
  amount: string,
  recipient: string
) {
  try {
    const signer = await getSigner();
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];

    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    // Get decimals
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    console.log(
      `[Blockchain] Minting ${amount} ${tokenSymbol} to ${recipient}`
    );

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
    const amountWei = ethers.parseUnits(amount, decimals);

    console.log(`[Blockchain] Depositing ${amount} ${tokenSymbol}`);

    // Step 1: Approve lending pool to spend tokens
    console.log(
      `[Blockchain] Approving ${CONTRACTS.lendingPool} to spend ${amount} ${tokenSymbol}`
    );
    const approveTx = await tokenContract.approve(
      CONTRACTS.lendingPool,
      amountWei
    );
    console.log(`[Blockchain] Approval transaction sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log(`[Blockchain] Approval confirmed`);

    // Step 2: Deposit tokens
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

    const collateralAmountWei = ethers.parseUnits(
      collateralAmount,
      collateralDecimals
    );
    const borrowAmountWei = ethers.parseUnits(borrowAmount, borrowDecimals);

    console.log(
      `[Blockchain] Borrowing ${borrowAmount} ${borrowTokenSymbol} with ${collateralAmount} ${collateralTokenSymbol} collateral`
    );

    // Step 1: Approve collateral
    console.log(`[Blockchain] Approving collateral`);
    const approveTx = await collateralTokenContract.approve(
      CONTRACTS.lendingPool,
      collateralAmountWei
    );
    await approveTx.wait();
    console.log(`[Blockchain] Collateral approved`);

    // Step 2: Borrow
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
    const amountWei = ethers.parseUnits(repayAmount, decimals);

    console.log(
      `[Blockchain] Repaying loan #${loanId} with ${repayAmount} ${tokenSymbol}`
    );

    // Approve tokens
    const approveTx = await tokenContract.approve(
      CONTRACTS.lendingPool,
      amountWei
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
    const amountWei = ethers.parseUnits(amount, decimals);

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

    return ethers.formatUnits(balance, decimals);
  } catch (error: any) {
    console.error("[Blockchain] Balance error:", error);
    return "0";
  }
}
