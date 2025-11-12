"use client";

import { useState, useEffect } from "react";

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
  reputation: any
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

    const ethereum = (window as any).ethereum;

    if (ethereum) {
      // Try to sign with MetaMask
      const message = `Lending Portal: ${type} ${amount} ${token} at ${apy}% APY`;

      try {
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [message, account],
        });
        console.log("[v0] Transaction signed by MetaMask:", signature);
      } catch (signError: any) {
        console.error("[v0] MetaMask signing error:", signError);
        console.error("[v0] Error details:", {
          code: signError?.code,
          message: signError?.message,
          data: signError?.data,
          stack: signError?.stack,
        });
        setIsLoading(false);

        // Extract error code and message
        const errorCode = signError?.code || signError?.error?.code;
        const errorMessage =
          signError?.message ||
          signError?.error?.message ||
          JSON.stringify(signError);

        // Handle user rejection (MetaMask code 4001)
        if (errorCode === 4001 || errorCode === "ACTION_REJECTED") {
          console.log("[v0] User rejected the transaction");
          alert("Transaction cancelled by user");
          return false;
        }

        // Handle internal errors
        if (errorCode === -32603) {
          console.log("[v0] Internal JSON-RPC error");
          alert("Transaction rejected: " + errorMessage);
          return false;
        }

        // Handle other MetaMask errors
        if (errorMessage && errorMessage !== "{}") {
          console.log("[v0] MetaMask error:", errorMessage);
          alert("Failed to sign transaction: " + errorMessage);
          return false;
        }

        // Generic error fallback
        console.log("[v0] Unknown error during signing");
        alert("Transaction cancelled or failed. Please try again.");
        return false;
      }
    }

    // Simulate transaction processing
    console.log("[v0] Processing transaction...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const txHash = "0x" + Math.random().toString(16).substr(2, 40);
    const newTransaction: LoanHistoryItem = {
      id: Date.now().toString(),
      type: type as "supply" | "borrow" | "repay" | "flashloan",
      token,
      amount,
      apy,
      date: new Date().toLocaleString(),
      txHash,
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
    alert(`Transaction successful! Tx: ${txHash}`);
    return true;
  } catch (error: any) {
    setIsLoading(false);
    console.error("[v0] Transaction failed:", error);
    alert("Transaction failed: " + (error.message || "Unknown error"));
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
    apy: number
  ) => {
    return await executeTransaction(
      type,
      amount,
      token,
      apy,
      account,
      setIsLoading,
      setLoanHistory,
      loanHistory,
      setReputation,
      reputation
    );
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
              Please connect MetaMask to access the DeFi Lending Platform.
              Supply tokens to earn interest, borrow against collateral, or
              execute flash loans.
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
            <DashboardContent markets={markets} reputation={reputation} />
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
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({
  markets,
  reputation,
}: {
  markets: Market[];
  reputation: number;
}) {
  return (
    <div>
      <h2 style={{ color: "#64c8ff", fontSize: "2rem", marginBottom: "2rem" }}>
        Market Overview
      </h2>
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
      market?.borrowAPY || 0
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
