"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

interface UseWeb3Return {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  chainId: number | null
  isConnected: boolean
  connect: () => Promise<void>
  switchToLocalhost: () => Promise<void>
  error: string | null
}

const LOCALHOST_CHAIN_ID = 31337
const LOCALHOST_RPC = "http://127.0.0.1:8545"

export function useWeb3(): UseWeb3Return {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const chainId = await provider.getNetwork().then((net) => Number(net.chainId))

      setAccount(accounts[0])
      setProvider(provider)
      setSigner(provider.getSigner())
      setChainId(chainId)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  const switchToLocalhost = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed")
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${LOCALHOST_CHAIN_ID.toString(16)}` }],
      })
    } catch (err: any) {
      if (err.code === 4902) {
        // Chain not added, try to add it
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${LOCALHOST_CHAIN_ID.toString(16)}`,
              chainName: "Localhost 8545",
              rpcUrls: [LOCALHOST_RPC],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        })
      } else {
        setError(err.message)
      }
    }
  }, [])

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })

          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const chainId = await provider.getNetwork().then((net) => Number(net.chainId))

            setAccount(accounts[0])
            setProvider(provider)
            setSigner(provider.getSigner())
            setChainId(chainId)
          }
        }
      } catch (err) {
        console.error("Failed to check connection:", err)
      }
    }

    checkConnection()

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null)
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  return {
    account,
    provider,
    signer,
    chainId,
    isConnected: !!account && chainId === LOCALHOST_CHAIN_ID,
    connect,
    switchToLocalhost,
    error,
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
