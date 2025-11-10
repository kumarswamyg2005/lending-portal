"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useLendingPool } from "../hooks/useLendingPool"
import "./Supply.css"

interface SupplyPageProps {
  lendingPoolAddress: string
  signer: ethers.Signer | null
  account: string | null
  tokens: { address: string; symbol: string }[]
}

export function SupplyPage({ lendingPoolAddress, signer, account, tokens }: SupplyPageProps) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.address || "")
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState("0")
  const [loading, setLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<string | null>(null)

  const { deposit } = useLendingPool({ lendingPoolAddress, signer })

  const selectedTokenSymbol = tokens.find((t) => t.address === selectedToken)?.symbol || ""

  useEffect(() => {
    const getBalance = async () => {
      if (!signer || !account || !selectedToken) return
      try {
        const token = new ethers.Contract(selectedToken, ["function balanceOf(address) view returns (uint256)"], signer)
        const bal = await token.balanceOf(account)
        setBalance(ethers.formatUnits(bal, 18))
      } catch (err) {
        console.error("Failed to get balance:", err)
      }
    }

    getBalance()
  }, [signer, account, selectedToken])

  const handleSupply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    setLoading(true)
    setTxStatus("Submitting...")

    try {
      await deposit(selectedToken, amount)
      setTxStatus("Supply successful!")
      setAmount("")
      setTimeout(() => setTxStatus(null), 3000)
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="supply-page">
      <div className="supply-container">
        <div className="supply-header">
          <h2>Supply Assets</h2>
          <p>Deposit tokens to earn interest on the protocol</p>
        </div>

        <form className="supply-form" onSubmit={handleSupply}>
          <div className="form-group">
            <label htmlFor="token">Select Token</label>
            <select
              id="token"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
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
            <label htmlFor="amount">Amount to Supply</label>
            <div className="input-with-max">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                step="0.01"
              />
              <button type="button" className="max-btn" onClick={() => setAmount(balance)} disabled={loading}>
                MAX
              </button>
            </div>
            <div className="balance-info">
              Balance: {Number(balance).toFixed(4)} {selectedTokenSymbol}
            </div>
          </div>

          <div className="form-info">
            <div className="info-item">
              <span className="label">You will receive:</span>
              <span className="value">
                {amount || "0"} a{selectedTokenSymbol}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Expected APY:</span>
              <span className="value">3.5%</span>
            </div>
          </div>

          {txStatus && <div className={`status ${txStatus.includes("Error") ? "error" : "success"}`}>{txStatus}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading || !amount}>
            {loading ? "Supplying..." : "Supply"}
          </button>
        </form>
      </div>
    </div>
  )
}
