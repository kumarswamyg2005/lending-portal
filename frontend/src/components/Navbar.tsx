"use client"
import "./Navbar.css"

interface NavbarProps {
  account: string | null
  isConnected: boolean
  chainId: number | null
  onConnect: () => Promise<void>
  onSwitchNetwork: () => Promise<void>
  error: string | null
}

export function Navbar({ account, isConnected, chainId, onConnect, onSwitchNetwork, error }: NavbarProps) {
  const formatAddress = (addr: string) => {
    return addr.slice(0, 6) + "..." + addr.slice(-4)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>DeFi Lending Platform</h1>
        </div>
        <div className="navbar-connect">
          {error && <div className="error-message">{error}</div>}
          {!account ? (
            <button className="btn btn-primary" onClick={onConnect}>
              Connect MetaMask
            </button>
          ) : (
            <div className="account-info">
              <span className="account-address">{formatAddress(account)}</span>
              {!isConnected && (
                <button className="btn btn-warning" onClick={onSwitchNetwork}>
                  Switch to Localhost
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
