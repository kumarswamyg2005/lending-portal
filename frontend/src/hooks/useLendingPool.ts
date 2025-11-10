"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { LENDING_POOL_ABI, TOKEN_ABI } from "../abi"

interface Market {
  totalLiquidity: string
  totalBorrows: string
  utilization: string
  supplyAPY: string
  borrowAPY: string
}

interface useLendingPoolProps {
  lendingPoolAddress: string
  signer: ethers.Signer | null
}

export function useLendingPool({ lendingPoolAddress, signer }: useLendingPoolProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deposit = useCallback(
    async (tokenAddress: string, amount: string) => {
      if (!signer) throw new Error("Not connected")
      setLoading(true)
      try {
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, signer)
        const lendingPool = new ethers.Contract(lendingPoolAddress, LENDING_POOL_ABI, signer)

        const amountWei = ethers.parseUnits(amount, 18)

        // Approve
        let tx = await token.approve(lendingPoolAddress, amountWei)
        await tx.wait()

        // Deposit
        tx = await lendingPool.deposit(tokenAddress, amountWei)
        const receipt = await tx.wait()

        setError(null)
        return receipt
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [signer, lendingPoolAddress],
  )

  const borrow = useCallback(
    async (collateralToken: string, collateralAmount: string, borrowToken: string, borrowAmount: string) => {
      if (!signer) throw new Error("Not connected")
      setLoading(true)
      try {
        const collateral = new ethers.Contract(collateralToken, TOKEN_ABI, signer)
        const lendingPool = new ethers.Contract(lendingPoolAddress, LENDING_POOL_ABI, signer)

        const collateralWei = ethers.parseUnits(collateralAmount, 18)
        const borrowWei = ethers.parseUnits(borrowAmount, 18)

        // Approve collateral
        let tx = await collateral.approve(lendingPoolAddress, collateralWei)
        await tx.wait()

        // Borrow
        tx = await lendingPool.borrow(collateralToken, collateralWei, borrowToken, borrowWei)
        const receipt = await tx.wait()

        setError(null)
        return receipt
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [signer, lendingPoolAddress],
  )

  const repay = useCallback(
    async (loanId: number, repayAmount: string, borrowToken: string) => {
      if (!signer) throw new Error("Not connected")
      setLoading(true)
      try {
        const token = new ethers.Contract(borrowToken, TOKEN_ABI, signer)
        const lendingPool = new ethers.Contract(lendingPoolAddress, LENDING_POOL_ABI, signer)

        const amountWei = ethers.parseUnits(repayAmount, 18)

        // Approve
        let tx = await token.approve(lendingPoolAddress, amountWei)
        await tx.wait()

        // Repay
        tx = await lendingPool.repay(loanId, amountWei)
        const receipt = await tx.wait()

        setError(null)
        return receipt
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [signer, lendingPoolAddress],
  )

  const getMarket = useCallback(
    async (tokenAddress: string): Promise<Market> => {
      if (!signer) throw new Error("Not connected")
      try {
        const lendingPool = new ethers.Contract(lendingPoolAddress, LENDING_POOL_ABI, signer)

        const [totalLiquidity, totalBorrows, utilization] = await lendingPool.getMarket(tokenAddress)

        return {
          totalLiquidity: ethers.formatUnits(totalLiquidity, 18),
          totalBorrows: ethers.formatUnits(totalBorrows, 18),
          utilization: ((Number(utilization) / 1e18) * 100).toFixed(2),
          supplyAPY: "3.5%",
          borrowAPY: "5.2%",
        }
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [signer, lendingPoolAddress],
  )

  return {
    deposit,
    borrow,
    repay,
    getMarket,
    loading,
    error,
  }
}
