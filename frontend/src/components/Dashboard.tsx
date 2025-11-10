"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useLendingPool } from "../hooks/useLendingPool"
import "./Dashboard.css"

interface Market {
  token: string
  symbol: string
  totalLiquidity: string
  totalBorrows: string
  utilization: string
  supplyAPY: string
  borrowAPY: string
}

interface DashboardProps {
  lendingPoolAddress: string
  signer: ethers.Signer | null
  account: string | null
  tokens: { address: string; symbol: string }[]
}

export function Dashboard({ lendingPoolAddress, signer, account, tokens }: DashboardProps) {
  const [markets, setMarkets] = useState<Market[]>([])
  const [reputation, setReputation] = useState(0)
  const [loading, setLoading] = useState(false)

  const { getMarket } = useLendingPool({ lendingPoolAddress, signer })

  useEffect(() => {
    const loadData = async () => {
      if (!signer || !account) return
      setLoading(true)

      try {
        const lendingPool = new ethers.Contract(
          lendingPoolAddress,
          ["function getReputation(address) view returns (uint256)"],
          signer,
        )

        const rep = await lendingPool.getReputation(account)
        setReputation(Number(rep))

        const marketData = await Promise.all(
          tokens.map(async (token) => {
            const market = await getMarket(token.address)
            return {
              token: token.address,
              symbol: token.symbol,
              ...market,
            }
          }),
        )

        setMarkets(marketData)
      } catch (err) {
        console.error("Failed to load dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [signer, account, lendingPoolAddress, tokens, getMarket])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="user-stats">
          <div className="stat">
            <span className="label">Your Reputation:</span>
            <span className="value">{reputation} pts</span>
          </div>
        </div>
      </div>

      <div className="markets-section">
        <h3>Market Overview</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="markets-grid">
            {markets.map((market) => (
              <div key={market.token} className="market-card">
                <div className="market-header">
                  <h4>{market.symbol}</h4>
                </div>
                <div className="market-stats">
                  <div className="stat-item">
                    <span className="label">Total Liquidity:</span>
                    <span className="value">${Number(market.totalLiquidity).toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Total Borrows:</span>
                    <span className="value">${Number(market.totalBorrows).toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Utilization:</span>
                    <span className="value">{market.utilization}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Supply APY:</span>
                    <span className="value supply">{market.supplyAPY}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Borrow APY:</span>
                    <span className="value borrow">{market.borrowAPY}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
