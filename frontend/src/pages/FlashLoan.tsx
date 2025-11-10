"use client"

import type React from "react"
import { useState } from "react"
import { ethers } from "ethers"
import "./FlashLoan.css"

interface FlashLoanPageProps {
  lendingPoolAddress: string
  flashLoanReceiverAddress: string
  signer: ethers.Signer | null
  account: string | null
  tokens: { address: string; symbol: string }[]
}

export function FlashLoanPage({
  lendingPoolAddress,
  flashLoanReceiverAddress,
  signer,
  account,
  tokens,
}: FlashLoanPageProps) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.address || "")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<string | null>(null)
  const [executionDetails, setExecutionDetails] = useState<any>(null)

  const selectedTokenSymbol = tokens.find((t) => t.address === selectedToken)?.symbol || ""

  const handleFlashLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !signer) return

    setLoading(true)
    setTxStatus("Executing flash loan...")
    setExecutionDetails(null)

    try {
      const lendingPool = new ethers.Contract(
        lendingPoolAddress,
        ["function flashLoan(address receiver, address token, uint256 amount, bytes calldata params)"],
        signer,
      )

      const amountWei = ethers.parseUnits(amount, 18)
      const params = ethers.toBeHex(0)

      const tx = await lendingPool.flashLoan(flashLoanReceiverAddress, selectedToken, amountWei, params)

      setTxStatus("Transaction pending...")
      const receipt = await tx.wait()

      const details = {
        transactionHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? "Success" : "Failed",
        flashLoanAmount: amount,
        token: selectedTokenSymbol,
        fee: (Number(amount) * 0.0009).toFixed(6),
      }

      setExecutionDetails(details)
      setTxStatus("Flash loan executed successfully!")
      setAmount("")
      setTimeout(() => setTxStatus(null), 5000)
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`)
      setExecutionDetails(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flash-loan-page">
      <div className="flash-loan-container">
        <div className="flash-loan-header">
          <h2>Flash Loan Playground</h2>
          <p>Execute uncollateralized loans in a single transaction</p>
        </div>

        <div className="flash-loan-content">
          <div className="explanation-panel">
            <h3>How Flash Loans Work</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Borrow</h4>
                  <p>Request a flash loan of any amount available in the pool</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Execute</h4>
                  <p>Use the borrowed funds for any operation (arbitrage, swaps, etc.)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Repay</h4>
                  <p>Repay the loan plus a small fee before the transaction ends</p>
                </div>
              </div>
            </div>
            <div className="key-features">
              <h4>Key Features</h4>
              <ul>
                <li>No collateral required</li>
                <li>Must repay in same transaction</li>
                <li>0.09% fee</li>
                <li>Atomic execution</li>
              </ul>
            </div>
          </div>

          <div className="flash-loan-form-panel">
            <form className="flash-loan-form" onSubmit={handleFlashLoan}>
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
                <label htmlFor="amount">Flash Loan Amount</label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100000"
                  disabled={loading}
                  step="1000"
                />
                <div className="input-hint">Minimum: 1,000 tokens</div>
              </div>

              <div className="fee-calculation">
                <div className="calc-item">
                  <span className="label">Loan Amount:</span>
                  <span className="value">
                    {amount || "0"} {selectedTokenSymbol}
                  </span>
                </div>
                <div className="calc-item">
                  <span className="label">Flash Loan Fee (0.09%):</span>
                  <span className="value">
                    {amount ? (Number(amount) * 0.0009).toFixed(6) : "0"} {selectedTokenSymbol}
                  </span>
                </div>
                <div className="calc-item total">
                  <span className="label">Total to Repay:</span>
                  <span className="value">
                    {amount ? (Number(amount) * 1.0009).toFixed(6) : "0"} {selectedTokenSymbol}
                  </span>
                </div>
              </div>

              {txStatus && (
                <div
                  className={`status ${txStatus.includes("Error") ? "error" : txStatus.includes("successfully") ? "success" : "pending"}`}
                >
                  {txStatus}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading || !amount}>
                {loading ? "Executing Flash Loan..." : "Execute Flash Loan"}
              </button>

              <div className="disclaimer">
                <strong>Demo Note:</strong> This demo executes a flash loan with a simple callback. In production, you
                would implement complex arbitrage, liquidation, or other strategies within the callback function.
              </div>
            </form>
          </div>
        </div>

        {executionDetails && (
          <div className="execution-results">
            <h3>Execution Results</h3>
            <div className="results-grid">
              <div className="result-item">
                <span className="label">Status:</span>
                <span className="value success">{executionDetails.status}</span>
              </div>
              <div className="result-item">
                <span className="label">Flash Loan Amount:</span>
                <span className="value">
                  {executionDetails.flashLoanAmount} {executionDetails.token}
                </span>
              </div>
              <div className="result-item">
                <span className="label">Fee Paid:</span>
                <span className="value">
                  {executionDetails.fee} {executionDetails.token}
                </span>
              </div>
              <div className="result-item">
                <span className="label">Block Number:</span>
                <span className="value">{executionDetails.blockNumber}</span>
              </div>
              <div className="result-item full-width">
                <span className="label">Transaction Hash:</span>
                <span className="value monospace">{executionDetails.transactionHash}</span>
              </div>
              <div className="result-item">
                <span className="label">Gas Used:</span>
                <span className="value">{executionDetails.gasUsed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
