"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "./hooks/useWeb3"
import { Navbar } from "./components/Navbar"
import { Dashboard } from "./components/Dashboard"
import { SupplyPage } from "./pages/Supply"
import { BorrowPage } from "./pages/Borrow"
import { RepayPage } from "./pages/Repay"
import { FlashLoanPage } from "./pages/FlashLoan"
import "./App.css"

type Page = "dashboard" | "supply" | "borrow" | "repay" | "flashloan"

interface Deployment {
  dai: string
  usdc: string
  weth: string
  lendingPool: string
  interestModel: string
  flashLoanReceiver: string
}

const TOKENS = [
  { symbol: "DAI", address: "" },
  { symbol: "USDC", address: "" },
  { symbol: "WETH", address: "" },
]

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const { account, signer, chainId, isConnected, connect, switchToLocalhost, error } = useWeb3()

  useEffect(() => {
    const loadDeployment = async () => {
      try {
        const response = await fetch("/deployment.json")
        const data = await response.json()
        setDeployment(data)

        // Update token addresses
        TOKENS[0].address = data.dai
        TOKENS[1].address = data.usdc
        TOKENS[2].address = data.weth
      } catch (err) {
        console.error("Failed to load deployment:", err)
      }
    }

    loadDeployment()
  }, [])

  if (!deployment) {
    return (
      <div className="app loading">
        <p>Loading deployment configuration...</p>
      </div>
    )
  }

  if (!isConnected && account) {
    return (
      <div className="app warning">
        <Navbar
          account={account}
          isConnected={isConnected}
          chainId={chainId}
          onConnect={connect}
          onSwitchNetwork={switchToLocalhost}
          error={error}
        />
        <div className="warning-content">
          <h2>Wrong Network</h2>
          <p>Please switch to the Localhost network to use this platform.</p>
          <button className="btn btn-primary" onClick={switchToLocalhost}>
            Switch to Localhost
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar
        account={account}
        isConnected={isConnected}
        chainId={chainId}
        onConnect={connect}
        onSwitchNetwork={switchToLocalhost}
        error={error}
      />

      {!isConnected ? (
        <div className="connect-prompt">
          <div className="prompt-content">
            <h2>Connect Your Wallet</h2>
            <p>Please connect MetaMask to use the lending platform.</p>
            <button className="btn btn-primary" onClick={connect}>
              Connect MetaMask
            </button>
          </div>
        </div>
      ) : (
        <>
          <nav className="sidebar">
            <div className="nav-links">
              <button
                className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
                onClick={() => setCurrentPage("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${currentPage === "supply" ? "active" : ""}`}
                onClick={() => setCurrentPage("supply")}
              >
                Supply
              </button>
              <button
                className={`nav-link ${currentPage === "borrow" ? "active" : ""}`}
                onClick={() => setCurrentPage("borrow")}
              >
                Borrow
              </button>
              <button
                className={`nav-link ${currentPage === "repay" ? "active" : ""}`}
                onClick={() => setCurrentPage("repay")}
              >
                Repay
              </button>
              <button
                className={`nav-link ${currentPage === "flashloan" ? "active" : ""}`}
                onClick={() => setCurrentPage("flashloan")}
              >
                Flash Loans
              </button>
            </div>
          </nav>

          <main className="main-content">
            {currentPage === "dashboard" && (
              <Dashboard
                lendingPoolAddress={deployment.lendingPool}
                signer={signer}
                account={account}
                tokens={TOKENS}
              />
            )}
            {currentPage === "supply" && (
              <SupplyPage
                lendingPoolAddress={deployment.lendingPool}
                signer={signer}
                account={account}
                tokens={TOKENS}
              />
            )}
            {currentPage === "borrow" && (
              <BorrowPage
                lendingPoolAddress={deployment.lendingPool}
                signer={signer}
                account={account}
                tokens={TOKENS}
              />
            )}
            {currentPage === "repay" && (
              <RepayPage
                lendingPoolAddress={deployment.lendingPool}
                signer={signer}
                account={account}
                tokens={TOKENS}
              />
            )}
            {currentPage === "flashloan" && (
              <FlashLoanPage
                lendingPoolAddress={deployment.lendingPool}
                flashLoanReceiverAddress={deployment.flashLoanReceiver}
                signer={signer}
                account={account}
                tokens={TOKENS}
              />
            )}
          </main>
        </>
      )}
    </div>
  )
}

export default App
