"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useLendingPool } from "../hooks/useLendingPool"
import "./Repay.css"

interface Loan {
  loanId: number
  borrowAmount: string
  borrowToken: string
  collateralToken: string
  collateralAmount: string
  active: boolean
}

interface RepayPageProps {
  lendingPoolAddress: string
  signer: ethers.Signer | null
  account: string | null
  tokens: { address: string; symbol: string }[]
}

export function RepayPage({ lendingPoolAddress, signer, account, tokens }: RepayPageProps) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [selectedLoanId, setSelectedLoanId] = useState(0)
  const [repayAmount, setRepayAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [txStatus, setTxStatus] = useState<string | null>(null)

  const { repay } = useLendingPool({ lendingPoolAddress, signer })

  useEffect(() => {
    const loadLoans = async () => {
      if (!signer || !account) return

      try {
        const lendingPool = new ethers.Contract(
          lendingPoolAddress,
          [
            "function userLoanCount(address) view returns (uint256)",
            "function userLoans(address, uint256) view returns (uint256, uint256, address, address, uint256, uint256, bool)",
          ],
          signer,
        )

        const loanCount = await lendingPool.userLoanCount(account)
        const loadedLoans = []

        for (let i = 0; i < Number(loanCount); i++) {
          const loan = await lendingPool.userLoans(account, i)
          if (loan[6]) {
            // active
            loadedLoans.push({
              loanId: i,
              borrowAmount: ethers.formatUnits(loan[0], 18),
              borrowToken: loan[3],
              collateralToken: loan[2],
              collateralAmount: ethers.formatUnits(loan[1], 18),
              active: loan[6],
            })
          }
        }

        setLoans(loadedLoans)
        if (loadedLoans.length > 0) {
          setSelectedLoanId(loadedLoans[0].loanId)
        }
      } catch (err) {
        console.error("Failed to load loans:", err)
      }
    }

    loadLoans()
  }, [signer, account, lendingPoolAddress])

  const selectedLoan = loans.find((l) => l.loanId === selectedLoanId)
  const tokenSymbol = tokens.find((t) => t.address === selectedLoan?.borrowToken)?.symbol || ""

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repayAmount || !selectedLoan) return

    setLoading(true)
    setTxStatus("Submitting...")

    try {
      await repay(selectedLoan.loanId, repayAmount, selectedLoan.borrowToken)
      setTxStatus("Repay successful!")
      setRepayAmount("")
      setTimeout(() => setTxStatus(null), 3000)
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="repay-page">
      <div className="repay-container">
        <div className="repay-header">
          <h2>Repay Loans</h2>
          <p>Pay back your borrowed assets</p>
        </div>

        {loans.length === 0 ? (
          <div className="no-loans">
            <p>You have no active loans.</p>
          </div>
        ) : (
          <form className="repay-form" onSubmit={handleRepay}>
            <div className="form-group">
              <label htmlFor="loan-select">Select Loan</label>
              <select
                id="loan-select"
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(Number(e.target.value))}
                disabled={loading}
              >
                {loans.map((loan) => (
                  <option key={loan.loanId} value={loan.loanId}>
                    Loan {loan.loanId}: {Number(loan.borrowAmount).toFixed(2)}{" "}
                    {tokens.find((t) => t.address === loan.borrowToken)?.symbol}
                  </option>
                ))}
              </select>
            </div>

            {selectedLoan && (
              <>
                <div className="loan-details">
                  <div className="detail-item">
                    <span className="label">Borrowed:</span>
                    <span className="value">
                      {Number(selectedLoan.borrowAmount).toFixed(2)} {tokenSymbol}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Collateral:</span>
                    <span className="value">
                      {Number(selectedLoan.collateralAmount).toFixed(4)}{" "}
                      {tokens.find((t) => t.address === selectedLoan.collateralToken)?.symbol}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="repay-amount">Repay Amount</label>
                  <div className="input-with-max">
                    <input
                      id="repay-amount"
                      type="number"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={loading}
                      step="0.01"
                      max={selectedLoan.borrowAmount}
                    />
                    <button
                      type="button"
                      className="max-btn"
                      onClick={() => setRepayAmount(selectedLoan.borrowAmount)}
                      disabled={loading}
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </>
            )}

            {txStatus && <div className={`status ${txStatus.includes("Error") ? "error" : "success"}`}>{txStatus}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading || !repayAmount || loans.length === 0}>
              {loading ? "Repaying..." : "Repay"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
