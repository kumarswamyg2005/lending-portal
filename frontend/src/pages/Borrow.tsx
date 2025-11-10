"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { ethers } from "ethers"
import { useLendingPool } from "../hooks/useLendingPool"
import "./Borrow.css"

interface BorrowPageProps {
  lendingPoolAddress: string
  signer: ethers.Signer | null
  account: string | null
  tokens: { address: string; symbol: string }[]
}

const LTV_RATIO = 0.75

export function BorrowPage({ lendingPoolAddress, signer, account, tokens }: BorrowPageProps) {
  const [collateralToken, setCollateralToken] = useState(tokens[2]?.address || "")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowToken, setBorrowToken] = useState(tokens[0]?.address || "")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [maxBorrow, setMaxBorrow] = useState("0")
  const [loading, setLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<string | null>(null)

  const { borrow } = useLendingPool({ lendingPoolAddress, signer })

  const collateralTokenSymbol = tokens.find((t) => t.address === collateralToken)?.symbol || ""
  const borrowTokenSymbol = tokens.find((t) => t.address === borrowToken)?.symbol || ""

  useEffect(() => {
    if (collateralAmount) {
      const max = (Number(collateralAmount) * LTV_RATIO).toString()
      setMaxBorrow(max)
    } else {
      setMaxBorrow("0")
    }
  }, [collateralAmount])

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collateralAmount || !borrowAmount) return

    const borrowNum = Number(borrowAmount)
    const maxNum = Number(maxBorrow)
    if (borrowNum > maxNum) {
      setTxStatus("Error: Borrow amount exceeds LTV limit")
      return
    }

    setLoading(true)
    setTxStatus("Submitting...")

    try {
      await borrow(collateralToken, collateralAmount, borrowToken, borrowAmount)
      setTxStatus("Borrow successful!")
      setCollateralAmount("")
      setBorrowAmount("")
      setTimeout(() => setTxStatus(null), 3000)
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="borrow-page">
      <div className="borrow-container">
        <div className="borrow-header">
          <h2>Borrow Assets</h2>
          <p>Deposit collateral to borrow tokens</p>
        </div>

        <form className="borrow-form" onSubmit={handleBorrow}>
          <div className="form-section">
            <h3>Collateral</h3>
            <div className="form-group">
              <label htmlFor="collateral-token">Token</label>
              <select
                id="collateral-token"
                value={collateralToken}
                onChange={(e) => setCollateralToken(e.target.value)}
                disabled={loading}
              >
                {tokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="collateral-amount">Amount</label>
              <input
                id="collateral-amount"
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                step="0.01"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Borrow</h3>
            <div className="form-group">
              <label htmlFor="borrow-token">Token</label>
              <select
                id="borrow-token"
                value={borrowToken}
                onChange={(e) => setBorrowToken(e.target.value)}
                disabled={loading}
              >
                {tokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="borrow-amount">Amount</label>
              <div className="input-with-max">
                <input
                  id="borrow-amount"
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  step="0.01"
                />
                <button type="button" className="max-btn" onClick={() => setBorrowAmount(maxBorrow)} disabled={loading}>
                  MAX
                </button>
              </div>
            </div>
          </div>

          <div className="borrow-summary">
            <div className="summary-item">
              <span className="label">LTV Ratio:</span>
              <span className="value">75%</span>
            </div>
            <div className="summary-item">
              <span className="label">Max Borrow:</span>
              <span className="value">
                {Number(maxBorrow).toFixed(2)} {borrowTokenSymbol}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Borrow APY:</span>
              <span className="value">5.2%</span>
            </div>
          </div>

          {txStatus && <div className={`status ${txStatus.includes("Error") ? "error" : "success"}`}>{txStatus}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading || !collateralAmount || !borrowAmount}>
            {loading ? "Borrowing..." : "Borrow"}
          </button>
        </form>
      </div>
    </div>
  )
}
