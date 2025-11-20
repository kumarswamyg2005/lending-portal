"use client";

import { useState, useEffect } from "react";
import {
  depositTokens,
  borrowTokens,
  repayLoan,
  executeFlashLoan,
  mintTestTokens,
} from "../lib/blockchain";

// Types
type Page =
  | "dashboard"
  | "supply"
  | "borrow"
  | "repay"
  | "flashloan"
  | "history";

interface Market {
  symbol: string;
  totalLiquidity: number;
  totalBorrows: number;
  utilization: number;
  supplyAPY: number;
  borrowAPY: number;
  userSupply: number;
  userBorrow: number;
  userBalance: number;
}

interface LoanHistoryItem {
  id: string;
  type: "supply" | "borrow" | "repay" | "flashloan";
  token: string;
  amount: number;
  apy: number;
  date: string;
  txHash: string;
}

interface TransactionDetails {
  type: "supply" | "borrow" | "repay" | "flashloan" | "mint";
  token: string;
  amount: number;
  apy?: number;
  collateralToken?: string;
  collateralAmount?: number;
  fee?: number;
  estimatedGas?: string;
}

// Transaction Confirmation Dialog Component
function TransactionConfirmationDialog({
  transaction,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  transaction: TransactionDetails;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  const getActionLabel = () => {
    switch (transaction.type) {
      case "supply":
        return "Supply Assets";
      case "borrow":
        return "Borrow Assets";
      case "repay":
        return "Repay Loan";
      case "flashloan":
        return "Execute Flash Loan";
      case "mint":
        return "Mint Test Tokens";
      default:
        return "Confirm Transaction";
    }
  };

  const getActionColor = () => {
    switch (transaction.type) {
      case "supply":
        return "#4ade80";
      case "borrow":
        return "#f87171";
      case "repay":
        return "#64c8ff";
      case "flashloan":
        return "#fbbf24";
      case "mint":
        return "#a78bfa";
      default:
        return "#64c8ff";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.90)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)",
          border: "3px solid rgba(100, 200, 255, 0.5)",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "500px",
          width: "100%",
          boxShadow:
            "0 25px 80px rgba(0, 0, 0, 0.8), 0 0 100px rgba(100, 200, 255, 0.2)",
          animation: "slideIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${getActionColor()}33 0%, ${getActionColor()}11 100%)`,
              border: `2px solid ${getActionColor()}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "1.5rem",
            }}
          >
            {transaction.type === "supply" && "📥"}
            {transaction.type === "borrow" && "💰"}
            {transaction.type === "repay" && "✅"}
            {transaction.type === "flashloan" && "⚡"}
            {transaction.type === "mint" && "🪙"}
          </div>
          <h2
            style={{
              color: getActionColor(),
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
              fontWeight: 700,
            }}
          >
            {getActionLabel()}
          </h2>
          <p style={{ color: "#999", fontSize: "0.875rem" }}>
            Please review and confirm this transaction
          </p>
        </div>

        {/* Transaction Details */}
        <div
          style={{
            background: "rgba(15, 20, 25, 0.8)",
            border: "1px solid rgba(100, 200, 255, 0.2)",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Amount */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#999", fontSize: "0.875rem" }}>
                Amount
              </span>
              <span
                style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 600 }}
              >
                {transaction.amount.toLocaleString()} {transaction.token}
              </span>
            </div>

            {/* APY (if applicable) */}
            {transaction.apy !== undefined && transaction.apy > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#999", fontSize: "0.875rem" }}>
                  {transaction.type === "supply" ? "Supply APY" : "Borrow APY"}
                </span>
                <span
                  style={{
                    color:
                      transaction.type === "supply" ? "#4ade80" : "#f87171",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {transaction.apy}%
                </span>
              </div>
            )}

            {/* Collateral (for borrow) */}
            {transaction.collateralToken && transaction.collateralAmount && (
              <>
                <div
                  style={{
                    height: "1px",
                    background: "rgba(100, 200, 255, 0.1)",
                    margin: "0.5rem 0",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#999", fontSize: "0.875rem" }}>
                    Collateral
                  </span>
                  <span
                    style={{
                      color: "#64c8ff",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {transaction.collateralAmount.toLocaleString()}{" "}
                    {transaction.collateralToken}
                  </span>
                </div>
              </>
            )}

            {/* Fee (for flash loans) */}
            {transaction.fee !== undefined && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#999", fontSize: "0.875rem" }}>
                  Flash Loan Fee
                </span>
                <span
                  style={{
                    color: "#fbbf24",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {transaction.fee} {transaction.token}
                </span>
              </div>
            )}

            {/* Estimated Gas */}
            <div
              style={{
                height: "1px",
                background: "rgba(100, 200, 255, 0.1)",
                margin: "0.5rem 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#999", fontSize: "0.875rem" }}>
                Estimated Gas Fee
              </span>
              <span style={{ color: "#999", fontSize: "0.875rem" }}>
                {transaction.estimatedGas || "~0.002 ETH"}
              </span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div
          style={{
            background: "rgba(100, 200, 255, 0.05)",
            border: "1px solid rgba(100, 200, 255, 0.2)",
            borderRadius: "0.5rem",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              color: "#64c8ff",
              fontSize: "0.75rem",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            ⓘ This transaction will be submitted to the blockchain. You will
            need to confirm it in MetaMask.
            {transaction.type === "supply" &&
              " First-time users may need to approve token spending (1 confirmation), then deposit (1 confirmation)."}
            {transaction.type === "borrow" &&
              " First-time users may need to approve collateral (1 confirmation), then borrow (1 confirmation)."}
            {transaction.type === "repay" &&
              " This will reduce your outstanding debt."}
            {transaction.type === "flashloan" &&
              " Flash loan will be executed atomically."}
            {transaction.type === "mint" &&
              " Test tokens will be minted to your wallet address."}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#999",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "0.5rem",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              opacity: isProcessing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(255, 255, 255, 0.1)";
                (e.target as HTMLButtonElement).style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(255, 255, 255, 0.05)";
                (e.target as HTMLButtonElement).style.color = "#999";
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: "1rem",
              background: isProcessing
                ? "#555"
                : `linear-gradient(135deg, ${getActionColor()} 0%, ${getActionColor()}dd 100%)`,
              color: isProcessing ? "#999" : "#0f1419",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              boxShadow: isProcessing
                ? "none"
                : `0 4px 12px ${getActionColor()}44`,
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
                (
                  e.target as HTMLButtonElement
                ).style.boxShadow = `0 6px 20px ${getActionColor()}66`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (
                  e.target as HTMLButtonElement
                ).style.boxShadow = `0 4px 12px ${getActionColor()}44`;
              }
            }}
          >
            {isProcessing ? "Processing..." : "Confirm Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}

const executeTransaction = async (
  type: string,
  amount: number,
  token: string,
  apy: number,
  account: string | null,
  setIsLoading: any,
  setLoanHistory: any,
  loanHistory: any,
  setReputation: any,
  reputation: any,
  collateralToken?: string,
  collateralAmount?: number
) => {
  if (!account) {
    alert("Please connect your MetaMask wallet first");
    return false;
  }

  setIsLoading(true);

  try {
    console.log(
      `[v0] Executing ${type} transaction: ${amount} ${token} at ${apy}% APY`
    );

    let txHash: string;

    // Execute real blockchain transaction based on type
    switch (type) {
      case "supply":
        console.log(`[v0] Calling depositTokens(${token}, ${amount})`);
        txHash = await depositTokens(token, amount.toString(), account);
        break;

      case "borrow":
        if (!collateralToken || !collateralAmount) {
          throw new Error("Collateral information required for borrow");
        }
        console.log(
          `[v0] Calling borrowTokens(${collateralToken}, ${collateralAmount}, ${token}, ${amount})`
        );
        txHash = await borrowTokens(
          collateralToken,
          collateralAmount.toString(),
          token,
          amount.toString()
        );
        break;

      case "repay":
        // For repay, we'll use loan ID 0 for now (in real app, track user's loans)
        console.log(`[v0] Calling repayLoan(0, ${token}, ${amount})`);
        txHash = await repayLoan(0, token, amount.toString());
        break;

      case "flashloan":
        console.log(`[v0] Calling executeFlashLoan(${token}, ${amount})`);
        txHash = await executeFlashLoan(token, amount.toString());
        break;

      default:
        throw new Error(`Unknown transaction type: ${type}`);
    }

    console.log("[v0] Real blockchain transaction confirmed:", txHash);

    // Create transaction record with REAL hash
    const newTransaction: LoanHistoryItem = {
      id: Date.now().toString(),
      type: type as "supply" | "borrow" | "repay" | "flashloan",
      token,
      amount,
      apy,
      date: new Date().toLocaleString(),
      txHash: txHash, // Real transaction hash from blockchain
    };

    setLoanHistory([newTransaction, ...loanHistory]);

    // Update reputation
    const reputationGain =
      type === "supply"
        ? 5
        : type === "borrow"
        ? 5
        : type === "repay"
        ? 10
        : type === "flashloan"
        ? 2
        : 0;
    setReputation(reputation + reputationGain);

    setIsLoading(false);
    console.log("[v0] Transaction successful:", txHash);

    // Show success message with transaction details
    const actionWord =
      type === "supply"
        ? "Deposited"
        : type === "borrow"
        ? "Borrowed"
        : type === "repay"
        ? "Repaid"
        : type === "flashloan"
        ? "Flash Loan"
        : "Completed";

    alert(
      `✅ Success! ${actionWord} ${amount} ${token}\n\n` +
        `Transaction Hash:\n${txHash}\n\n` +
        `You earned +${reputationGain} reputation points!\n\n` +
        `View this transaction in MetaMask's activity tab.`
    );
    return true;
  } catch (error: any) {
    setIsLoading(false);
    console.error("[v0] Transaction failed:", error);

    // Handle user rejection
    if (error.code === 4001 || error.code === "ACTION_REJECTED") {
      alert("Transaction cancelled by user");
      return false;
    }

    // Extract meaningful error message
    let errorMessage = "Unknown error";

    if (error.message) {
      // Check for common error patterns
      if (error.message.includes("insufficient funds")) {
        errorMessage =
          "Insufficient ETH for gas fees. You need test ETH to pay for transactions.";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction cancelled by user";
        return false;
      } else if (error.message.includes("Token not supported")) {
        errorMessage = "This token is not supported by the lending pool";
      } else if (error.message.includes("Amount must be > 0")) {
        errorMessage = "Amount must be greater than 0";
      } else if (error.message.includes("Insufficient balance")) {
        errorMessage =
          "You don't have enough tokens to complete this transaction";
      } else if (error.message.includes("Exceeds LTV limit")) {
        errorMessage =
          "Borrow amount exceeds the allowed loan-to-value ratio (max 75%)";
      } else if (error.message.includes("Insufficient liquidity")) {
        errorMessage = "Not enough liquidity in the pool for this withdrawal";
      } else if (
        error.message.includes("execution reverted") ||
        error.message.includes("revert")
      ) {
        errorMessage =
          "Smart contract rejected the transaction. Please check: \n• You have enough tokens\n• Token is approved\n• You meet all requirements";
      } else {
        errorMessage = error.message;
      }
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    }

    alert("❌ Transaction Failed\n\n" + errorMessage);
    return false;
  }
};

// Demo data - added userBalance for wallet balances
const DEMO_MARKETS: Market[] = [
  {
    symbol: "DAI",
    totalLiquidity: 1000000,
    totalBorrows: 200000,
    utilization: 16.67,
    supplyAPY: 3.5,
    borrowAPY: 5.2,
    userSupply: 50000,
    userBorrow: 10000,
    userBalance: 100000,
  },
  {
    symbol: "USDC",
    totalLiquidity: 800000,
    totalBorrows: 320000,
    utilization: 40.0,
    supplyAPY: 4.2,
    borrowAPY: 6.8,
    userSupply: 30000,
    userBorrow: 5000,
    userBalance: 75000,
  },
  {
    symbol: "WETH",
    totalLiquidity: 500000,
    totalBorrows: 150000,
    utilization: 30.0,
    supplyAPY: 2.8,
    borrowAPY: 4.5,
    userSupply: 20000,
    userBorrow: 3000,
    userBalance: 50000,
  },
];

const DEMO_HISTORY: LoanHistoryItem[] = [
  {
    id: "1",
    type: "supply",
    token: "DAI",
    amount: 50000,
    apy: 3.5,
    date: "2024-11-08 14:32:00",
    txHash: "0x1234567890abcdef",
  },
  {
    id: "2",
    type: "borrow",
    token: "USDC",
    amount: 5000,
    apy: 6.8,
    date: "2024-11-07 10:15:00",
    txHash: "0x2345678901bcdef0",
  },
  {
    id: "3",
    type: "flashloan",
    token: "DAI",
    amount: 100000,
    apy: 0.09,
    date: "2024-11-06 09:42:00",
    txHash: "0x3456789012cdef01",
  },
  {
    id: "4",
    type: "repay",
    token: "USDC",
    amount: 2500,
    apy: 6.8,
    date: "2024-11-05 16:20:00",
    txHash: "0x456789012def012",
  },
];

function WalletMenu({ account, onDisconnect, onClose }: any) {
  const formatAddress = (addr: string) =>
    addr.slice(0, 10) + "..." + addr.slice(-8);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(account);
    alert("Address copied to clipboard!");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        background: "rgba(31, 35, 50, 0.95)",
        border: "1px solid rgba(100, 200, 255, 0.3)",
        borderRadius: "0.5rem",
        padding: "0.75rem",
        zIndex: 1000,
        minWidth: "200px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          padding: "0.75rem",
          borderBottom: "1px solid rgba(100, 200, 255, 0.1)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: "#999",
            marginBottom: "0.5rem",
          }}
        >
          Connected Account
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            fontFamily: "monospace",
            color: "#64c8ff",
            fontWeight: 600,
          }}
        >
          {formatAddress(account)}
        </p>
      </div>
      <button
        onClick={copyToClipboard}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: "transparent",
          color: "#64c8ff",
          border: "1px solid rgba(100, 200, 255, 0.2)",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
          marginTop: "0.75rem",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background =
            "rgba(100, 200, 255, 0.1)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = "transparent";
        }}
      >
        Copy Address
      </button>
      <button
        onClick={onDisconnect}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: "rgba(255, 107, 107, 0.1)",
          color: "#ff6b6b",
          border: "1px solid rgba(255, 107, 107, 0.2)",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
          marginTop: "0.75rem",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background =
            "rgba(255, 107, 107, 0.2)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background =
            "rgba(255, 107, 107, 0.1)";
        }}
      >
        Disconnect Wallet
      </button>
    </div>
  );
}

// Navbar Component - added wallet menu and dropdown state
function Navbar({
  account,
  isConnected,
  onConnect,
  onDisconnect,
  reputation,
  onSwitchNetwork,
}: any) {
  const formatAddress = (addr: string) =>
    addr.slice(0, 6) + "..." + addr.slice(-4);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  return (
    <>
      <nav
        style={{
          background: "linear-gradient(90deg, #0f1419 0%, #1a1f2e 100%)",
          color: "white",
          padding: "1rem 0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          borderBottom: "1px solid rgba(100, 200, 255, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "70px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
              <span style={{ color: "#64c8ff" }}>Lending</span> Portal
            </h1>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.75rem",
                color: "#999",
                letterSpacing: "0.05em",
              }}
            >
              Professional DeFi Lending Platform
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {reputation > 0 && (
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#999" }}>
                  Reputation Score
                </p>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#64c8ff",
                  }}
                >
                  {reputation} pts
                </p>
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                position: "relative",
              }}
            >
              {!account ? (
                <button
                  onClick={onConnect}
                  style={{
                    padding: "0.625rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
                    color: "#0f1419",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = "1";
                  }}
                >
                  Connect Wallet
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: "#64c8ff",
                    }}
                  >
                    {formatAddress(account)}
                  </p>
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    style={{
                      padding: "0.625rem 1.5rem",
                      background:
                        "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
                      color: "#0f1419",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.opacity = "1";
                    }}
                  >
                    Wallet
                  </button>
                  {showWalletMenu && (
                    <WalletMenu
                      account={account}
                      onDisconnect={onDisconnect}
                      onClose={() => setShowWalletMenu(false)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default function Page() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reputation, setReputation] = useState(0);
  const [loanHistory, setLoanHistory] =
    useState<LoanHistoryItem[]>(DEMO_HISTORY);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [markets, setMarkets] = useState<Market[]>(DEMO_MARKETS);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionDetails | null>(null);

  const connectWallet = async () => {
    if (typeof window === "undefined") return;

    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        console.log("[v0] MetaMask not installed");
        alert(
          "MetaMask is not installed. Please install MetaMask extension from https://metamask.io/"
        );
        // Using mock wallet for demo
        console.log("[v0] Using mock wallet for demo");
        setAccount("0xca5b3038a012294065c729f61e4c1618dbadf6bd");
        setIsConnected(true);
        setReputation(120);
        return;
      }

      console.log("[v0] MetaMask detected, requesting connection...");

      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("[v0] Accounts received:", accounts);

      if (accounts && accounts.length > 0) {
        console.log("[v0] MetaMask connected successfully:", accounts[0]);
        setAccount(accounts[0]);
        setIsConnected(true);
        setReputation(120);

        // Request chain ID
        const chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("[v0] Connected to chain ID:", chainId);

        // Listen for account changes
        ethereum.on("accountsChanged", (newAccounts: string[]) => {
          console.log("[v0] Account changed:", newAccounts);
          if (newAccounts.length === 0) {
            // User disconnected
            setAccount(null);
            setIsConnected(false);
            setReputation(0);
          } else {
            setAccount(newAccounts[0]);
          }
        });

        // Listen for chain changes
        ethereum.on("chainChanged", (newChainId: string) => {
          console.log("[v0] Chain changed:", newChainId);
          // Reload the page as recommended by MetaMask
          window.location.reload();
        });
      } else {
        console.error("[v0] No accounts returned from MetaMask");
        alert("Failed to connect to MetaMask. Please try again.");
      }
    } catch (error: any) {
      console.error("[v0] MetaMask connection error:", error);

      if (error.code === 4001) {
        // User rejected the connection request
        alert(
          "Connection request rejected. Please try again and approve the connection in MetaMask."
        );
      } else if (error.code === -32002) {
        // Request already pending
        alert(
          "Connection request already pending. Please check your MetaMask extension."
        );
      } else {
        alert(`Failed to connect: ${error.message || "Unknown error"}`);
      }
    }
  };

  const onDisconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setReputation(0);
  };

  const onSwitchNetwork = () => {
    // Implement network switching logic here
  };

  // Note: Auto-connect disabled - user must manually click "Connect Wallet"
  // If you want to restore auto-connect, uncomment the useEffect below:
  /*
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined") return;
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;
      
      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setReputation(120);
        }
      } catch (error) {
        console.error("[v0] Error checking connection:", error);
      }
    };
    checkConnection();
  }, []);
  */

  const handleTransaction = async (
    type: string,
    token: string,
    amount: number,
    apy: number,
    collateralToken?: string,
    collateralAmount?: number
  ) => {
    // Go straight to MetaMask - no custom dialog
    console.log(`[Transaction] Executing ${type} for ${amount} ${token}`);

    const success = await executeTransaction(
      type,
      amount,
      token,
      apy,
      account,
      setIsLoading,
      setLoanHistory,
      loanHistory,
      setReputation,
      reputation,
      collateralToken,
      collateralAmount
    );
  };

  const confirmTransaction = async () => {
    if (!pendingTransaction) return;

    // Handle mint separately
    if (pendingTransaction.type === "mint") {
      await confirmMint();
      return;
    }

    setShowConfirmation(false);

    const success = await executeTransaction(
      pendingTransaction.type,
      pendingTransaction.amount,
      pendingTransaction.token,
      pendingTransaction.apy || 0,
      account,
      setIsLoading,
      setLoanHistory,
      loanHistory,
      setReputation,
      reputation,
      pendingTransaction.collateralToken,
      pendingTransaction.collateralAmount
    );

    if (success) {
      setPendingTransaction(null);
    }
  };

  const cancelTransaction = () => {
    setShowConfirmation(false);
    setPendingTransaction(null);
  };

  const handleMintTokens = async (tokenSymbol: string, amount = "1000") => {
    console.log(
      `[Mint] handleMintTokens called - Token: ${tokenSymbol}, Amount: ${amount}`
    );

    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    // Go straight to MetaMask - no custom dialog
    console.log("[Mint] Opening MetaMask for confirmation...");
    setIsLoading(true);

    try {
      const txHash = await mintTestTokens(tokenSymbol, amount, account);
      console.log("[Mint] Transaction successful! Hash:", txHash);
      alert(
        `✅ Success! Minted ${amount} ${tokenSymbol}\n\n` +
          `Transaction Hash:\n${txHash}\n\n` +
          `The tokens should appear in your wallet shortly.`
      );
    } catch (error: any) {
      console.error("[Mint] Transaction failed:", error);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        alert(
          "❌ Transaction Cancelled\n\nYou rejected the transaction in MetaMask."
        );
      } else if (error.message?.includes("insufficient funds")) {
        alert(
          "❌ Insufficient Funds\n\nYou don't have enough ETH to pay for gas fees."
        );
      } else {
        alert("❌ Minting Failed\n\n" + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMint = async () => {
    if (!pendingTransaction || pendingTransaction.type !== "mint") {
      console.error("[Mint] Invalid state - no pending mint transaction");
      return;
    }

    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    console.log("[Mint] User clicked Confirm Transaction button");
    console.log("[Mint] Pending transaction:", pendingTransaction);
    setShowConfirmation(false);
    setIsLoading(true);

    try {
      console.log(
        `[Mint] Minting ${pendingTransaction.amount} ${pendingTransaction.token} test tokens...`
      );
      console.log("[Mint] Opening MetaMask for confirmation...");

      const txHash = await mintTestTokens(
        pendingTransaction.token,
        pendingTransaction.amount.toString(),
        account
      );

      console.log("[Mint] Transaction successful! Hash:", txHash);
      alert(
        `✅ Success! Minted ${pendingTransaction.amount} ${pendingTransaction.token}\n\n` +
          `Transaction Hash:\n${txHash}\n\n` +
          `The tokens should appear in your wallet shortly.`
      );

      setPendingTransaction(null);
    } catch (error: any) {
      console.error("[Mint] Transaction failed:", error);
      console.error("[Mint] Error details:", {
        code: error.code,
        message: error.message,
        reason: error.reason,
      });

      // Better error handling
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        alert(
          "❌ Transaction Cancelled\n\nYou rejected the transaction in MetaMask."
        );
      } else if (error.message?.includes("insufficient funds")) {
        alert(
          "❌ Insufficient Funds\n\nYou don't have enough ETH to pay for gas fees."
        );
      } else if (error.message?.includes("user rejected")) {
        alert(
          "❌ Transaction Rejected\n\nYou cancelled the transaction in MetaMask."
        );
      } else {
        alert("❌ Minting Failed\n\n" + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
      console.log("[Mint] Process complete, loading state cleared");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e14" }}>
      <Navbar
        account={account}
        isConnected={isConnected}
        onConnect={connectWallet}
        onDisconnect={onDisconnect}
        reputation={reputation}
        onSwitchNetwork={onSwitchNetwork}
      />

      {!isConnected ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 90px)",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(31, 35, 50, 0.8)",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            <h2
              style={{
                color: "#64c8ff",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}
            >
              Connect Your Wallet
            </h2>
            <p
              style={{ color: "#999", marginBottom: "2rem", lineHeight: "1.6" }}
            >
              Please connect your MetaMask wallet to access the DeFi Lending
              Platform. Supply tokens to earn interest, borrow against
              collateral, or execute flash loans.
            </p>
            <button
              onClick={connectWallet}
              style={{
                padding: "1rem 2rem",
                background: "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
                color: "#0f1419",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = "translateY(-2px)";
                btn.style.boxShadow = "0 8px 20px rgba(100, 200, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = "translateY(0)";
                btn.style.boxShadow = "none";
              }}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              borderBottom: "1px solid rgba(100, 200, 255, 0.1)",
              paddingBottom: "1rem",
            }}
          >
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "supply", label: "Supply" },
              { id: "borrow", label: "Borrow" },
              { id: "repay", label: "Repay" },
              { id: "flashloan", label: "Flash Loan" },
              { id: "history", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as Page)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background:
                    currentPage === tab.id
                      ? "rgba(100, 200, 255, 0.15)"
                      : "transparent",
                  color: currentPage === tab.id ? "#64c8ff" : "#999",
                  border:
                    currentPage === tab.id
                      ? "1px solid rgba(100, 200, 255, 0.3)"
                      : "1px solid transparent",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: currentPage === tab.id ? 600 : 400,
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== tab.id) {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.background = "rgba(100, 200, 255, 0.05)";
                    btn.style.color = "#64c8ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== tab.id) {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.background = "transparent";
                    btn.style.color = "#999";
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Page Content */}
          {currentPage === "dashboard" && (
            <DashboardContent
              markets={markets}
              reputation={reputation}
              account={account}
              onMintTokens={handleMintTokens}
              isMinting={isLoading}
            />
          )}
          {currentPage === "supply" && (
            <SupplyContent
              markets={markets}
              onSubmit={handleTransaction}
              isLoading={isLoading}
            />
          )}
          {currentPage === "borrow" && (
            <BorrowContent
              markets={markets}
              onSubmit={handleTransaction}
              isLoading={isLoading}
            />
          )}
          {currentPage === "repay" && (
            <RepayContent
              markets={markets}
              onSubmit={handleTransaction}
              isLoading={isLoading}
            />
          )}
          {currentPage === "flashloan" && (
            <FlashLoanContent
              markets={markets}
              onSubmit={handleTransaction}
              isLoading={isLoading}
            />
          )}
          {currentPage === "history" && (
            <HistoryContent history={loanHistory} />
          )}
        </div>
      )}

      {/* Transaction Confirmation Dialog */}
      {showConfirmation && pendingTransaction && (
        <TransactionConfirmationDialog
          transaction={pendingTransaction}
          onConfirm={
            pendingTransaction.type === "mint"
              ? confirmMint
              : confirmTransaction
          }
          onCancel={cancelTransaction}
          isProcessing={isLoading}
        />
      )}
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({
  markets,
  reputation,
  account,
  onMintTokens,
  isMinting,
}: {
  markets: Market[];
  reputation: number;
  account: string | null;
  onMintTokens: (token: string, amount: string) => void;
  isMinting: boolean;
}) {
  const handleMintTokens = (tokenSymbol: string) => {
    console.log(`[DashboardContent] Mint button clicked for ${tokenSymbol}`);
    onMintTokens(tokenSymbol, "1000");
  };

  return (
    <div>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Market Overview
      </h2>

      {/* Test Tokens Section */}
      <div
        style={{
          background: "rgba(100, 200, 255, 0.1)",
          border: "1px solid rgba(100, 200, 255, 0.3)",
          borderRadius: "1rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h3
          style={{
            color: "#64c8ff",
            fontSize: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          🪙 Get Tokens
        </h3>
        <p
          style={{ color: "#999", marginBottom: "1rem", fontSize: "0.875rem" }}
        >
          Mint tokens to your wallet to start using the platform!
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {["DAI", "USDC", "WETH"].map((token) => (
            <button
              key={token}
              onClick={() => handleMintTokens(token)}
              disabled={isMinting}
              style={{
                padding: "0.75rem 1.5rem",
                background: isMinting
                  ? "#555"
                  : "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
                color: "#0f1419",
                border: "none",
                borderRadius: "0.5rem",
                cursor: isMinting ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {isMinting ? "Processing..." : `Mint 1000 ${token}`}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {markets.map((market) => (
          <div
            key={market.symbol}
            style={{
              background: "rgba(31, 35, 50, 0.8)",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "1rem",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "#64c8ff",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              {market.symbol}
            </h3>
            <div style={{ display: "grid", gap: "0.75rem", color: "#ccc" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Liquidity:</span>
                <span style={{ fontWeight: 600 }}>
                  ${market.totalLiquidity.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Borrows:</span>
                <span style={{ fontWeight: 600 }}>
                  ${market.totalBorrows.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Utilization:</span>
                <span style={{ fontWeight: 600, color: "#64c8ff" }}>
                  {market.utilization.toFixed(2)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Supply APY:</span>
                <span style={{ fontWeight: 600, color: "#4ade80" }}>
                  {market.supplyAPY}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Borrow APY:</span>
                <span style={{ fontWeight: 600, color: "#f87171" }}>
                  {market.borrowAPY}%
                </span>
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(100, 200, 255, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Your Supply:</span>
                  <span style={{ fontWeight: 600, color: "#64c8ff" }}>
                    ${market.userSupply.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Your Borrow:</span>
                  <span style={{ fontWeight: 600, color: "#f87171" }}>
                    ${market.userBorrow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Supply Content Component
function SupplyContent({ markets, onSubmit, isLoading }: any) {
  const [selectedToken, setSelectedToken] = useState("DAI");
  const [amount, setAmount] = useState("");

  const selectedMarket = markets.find(
    (m: Market) => m.symbol === selectedToken
  );

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    await onSubmit(
      "supply",
      selectedToken,
      parseFloat(amount),
      selectedMarket?.supplyAPY || 0
    );
    setAmount("");
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Supply Assets
      </h2>
      <div
        style={{
          background: "rgba(31, 35, 50, 0.8)",
          border: "1px solid rgba(100, 200, 255, 0.2)",
          borderRadius: "1rem",
          padding: "2rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Select Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {markets.map((market: Market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol} - {market.supplyAPY}% APY
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          />
          {selectedMarket && (
            <p
              style={{
                color: "#999",
                fontSize: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              Available: ${selectedMarket.userBalance.toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "1rem",
            background: isLoading
              ? "#555"
              : "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
            color: "#0f1419",
            border: "none",
            borderRadius: "0.5rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {isLoading ? "Processing..." : "Supply"}
        </button>
      </div>
    </div>
  );
}

// Borrow Content Component
function BorrowContent({ markets, onSubmit, isLoading }: any) {
  const [collateralToken, setCollateralToken] = useState("WETH");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowToken, setBorrowToken] = useState("DAI");
  const [borrowAmount, setBorrowAmount] = useState("");

  const handleSubmit = async () => {
    if (!collateralAmount || !borrowAmount) {
      alert("Please enter both collateral and borrow amounts");
      return;
    }
    const market = markets.find((m: Market) => m.symbol === borrowToken);
    await onSubmit(
      "borrow",
      borrowToken,
      parseFloat(borrowAmount),
      market?.borrowAPY || 0,
      collateralToken,
      parseFloat(collateralAmount)
    );
    setCollateralAmount("");
    setBorrowAmount("");
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Borrow Assets
      </h2>
      <div
        style={{
          background: "rgba(31, 35, 50, 0.8)",
          border: "1px solid rgba(100, 200, 255, 0.2)",
          borderRadius: "1rem",
          padding: "2rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Collateral Token
          </label>
          <select
            value={collateralToken}
            onChange={(e) => setCollateralToken(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {markets.map((market: Market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Collateral Amount
          </label>
          <input
            type="number"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Borrow Token
          </label>
          <select
            value={borrowToken}
            onChange={(e) => setBorrowToken(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {markets.map((market: Market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol} - {market.borrowAPY}% APY
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Borrow Amount
          </label>
          <input
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          />
          <p
            style={{ color: "#999", fontSize: "0.75rem", marginTop: "0.5rem" }}
          >
            Max LTV: 75% of collateral value
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "1rem",
            background: isLoading
              ? "#555"
              : "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
            color: "#0f1419",
            border: "none",
            borderRadius: "0.5rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {isLoading ? "Processing..." : "Borrow"}
        </button>
      </div>
    </div>
  );
}

// Repay Content Component
function RepayContent({ markets, onSubmit, isLoading }: any) {
  const [selectedToken, setSelectedToken] = useState("DAI");
  const [amount, setAmount] = useState("");

  const selectedMarket = markets.find(
    (m: Market) => m.symbol === selectedToken
  );

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    await onSubmit(
      "repay",
      selectedToken,
      parseFloat(amount),
      selectedMarket?.borrowAPY || 0
    );
    setAmount("");
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Repay Loan
      </h2>
      <div
        style={{
          background: "rgba(31, 35, 50, 0.8)",
          border: "1px solid rgba(100, 200, 255, 0.2)",
          borderRadius: "1rem",
          padding: "2rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Select Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {markets.map((market: Market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          />
          {selectedMarket && (
            <p
              style={{
                color: "#999",
                fontSize: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              Outstanding Debt: ${selectedMarket.userBorrow.toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "1rem",
            background: isLoading
              ? "#555"
              : "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
            color: "#0f1419",
            border: "none",
            borderRadius: "0.5rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {isLoading ? "Processing..." : "Repay"}
        </button>
      </div>
    </div>
  );
}

// Flash Loan Content Component
function FlashLoanContent({ markets, onSubmit, isLoading }: any) {
  const [selectedToken, setSelectedToken] = useState("DAI");
  const [amount, setAmount] = useState("");

  const fee = amount ? (parseFloat(amount) * 0.0009).toFixed(2) : "0.00";

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    await onSubmit("flashloan", selectedToken, parseFloat(amount), 0.09);
    setAmount("");
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Flash Loan
      </h2>
      <div
        style={{
          background: "rgba(31, 35, 50, 0.8)",
          border: "1px solid rgba(100, 200, 255, 0.2)",
          borderRadius: "1rem",
          padding: "2rem",
        }}
      >
        <p style={{ color: "#999", marginBottom: "1.5rem", lineHeight: "1.6" }}>
          Execute an uncollateralized loan that must be repaid within the same
          transaction. Flash loan fee: 0.09%
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Select Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {markets.map((market: Market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              color: "#999",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(15, 20, 25, 0.8)",
              color: "#fff",
              border: "1px solid rgba(100, 200, 255, 0.2)",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          />
          <p
            style={{
              color: "#64c8ff",
              fontSize: "0.875rem",
              marginTop: "0.5rem",
            }}
          >
            Fee: {fee} {selectedToken} (0.09%)
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "1rem",
            background: isLoading
              ? "#555"
              : "linear-gradient(135deg, #64c8ff 0%, #4db8e8 100%)",
            color: "#0f1419",
            border: "none",
            borderRadius: "0.5rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {isLoading ? "Processing..." : "Execute Flash Loan"}
        </button>
      </div>
    </div>
  );
}

// History Content Component
function HistoryContent({ history }: { history: LoanHistoryItem[] }) {
  return (
    <div>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Transaction History
      </h2>
      <div
        style={{
          background: "rgba(31, 35, 50, 0.8)",
          border: "1px solid rgba(100, 200, 255, 0.2)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(100, 200, 255, 0.1)",
                  borderBottom: "1px solid rgba(100, 200, 255, 0.2)",
                }}
              >
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "#64c8ff",
                    fontWeight: 600,
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "#64c8ff",
                    fontWeight: 600,
                  }}
                >
                  Token
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "right",
                    color: "#64c8ff",
                    fontWeight: 600,
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "right",
                    color: "#64c8ff",
                    fontWeight: 600,
                  }}
                >
                  APY
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "#64c8ff",
                    fontWeight: 600,
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "#64c8ff",
                    fontWeight: 600,
                  }}
                >
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: "1px solid rgba(100, 200, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem", color: "#ccc" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background:
                          item.type === "supply"
                            ? "rgba(74, 222, 128, 0.1)"
                            : item.type === "borrow"
                            ? "rgba(248, 113, 113, 0.1)"
                            : item.type === "repay"
                            ? "rgba(100, 200, 255, 0.1)"
                            : "rgba(251, 191, 36, 0.1)",
                        color:
                          item.type === "supply"
                            ? "#4ade80"
                            : item.type === "borrow"
                            ? "#f87171"
                            : item.type === "repay"
                            ? "#64c8ff"
                            : "#fbbf24",
                      }}
                    >
                      {item.type.toUpperCase()}
                    </span>
                  </td>
                  <td
                    style={{ padding: "1rem", color: "#ccc", fontWeight: 600 }}
                  >
                    {item.token}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#ccc",
                      textAlign: "right",
                    }}
                  >
                    ${item.amount.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#ccc",
                      textAlign: "right",
                    }}
                  >
                    {item.apy}%
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#999",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.date}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#64c8ff",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.txHash.slice(0, 10)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
