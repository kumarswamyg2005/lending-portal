# DeFi Lending Platform - DEMO PROJECT

> ⚠️ **EDUCATIONAL/TEST PROJECT ONLY**  
> This is a demonstration DeFi lending platform for learning purposes.  
> **NO REAL MONEY** - Uses test tokens on a local blockchain only.

A complete decentralized lending platform built with Solidity smart contracts and Next.js, featuring collateralized borrowing, interest-bearing deposits, flash loans, and on-chain reputation tracking.

## 🚨 Important Notice

**This is a TEST/DEMO project:**

- ✅ Runs on **Hardhat local blockchain** (localhost:8545)
- ✅ Uses **test tokens** with no real value (DAI, USDC, WETH)
- ✅ Requires **MetaMask test account** with test ETH
- ❌ **NO REAL CRYPTOCURRENCY** is used
- ❌ **NOT deployed to mainnet** or any real blockchain
- ❌ **FOR EDUCATIONAL PURPOSES ONLY**

## Features

- **Lending**: Deposit test ERC-20 tokens to earn simulated interest
- **Borrowing**: Borrow test tokens against collateral with 75% LTV ratio
- **Flash Loans**: Execute uncollateralized loans in a single transaction
- **Reputation System**: Track user history and reward good behavior
- **Interest Rates**: Utilization-based dynamic interest rates
- **MetaMask Integration**: Real blockchain transactions (on test network)

## Quick Start

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Git
- **Important**: This runs on a LOCAL blockchain only (no real money)

### Installation & Setup

#### 1. Clone and Install

\`\`\`bash

# Clone the repository

git clone https://github.com/kumarswamyg2005/lending-portal.git
cd lending-portal

# Install dependencies

pnpm install
\`\`\`

#### 2. Start Hardhat Local Blockchain

\`\`\`bash

# Start local test blockchain (keep this running)

npx hardhat node
\`\`\`

This starts a **test blockchain** on `http://127.0.0.1:8545` with:

- 20 test accounts, each with 10,000 test ETH
- Chain ID: 31337
- **NO REAL VALUE - Test environment only**

#### 3. Deploy Smart Contracts (in a new terminal)

\`\`\`bash

# Deploy test contracts to local blockchain

npx hardhat run scripts/deploy-direct.ts --network localhost
\`\`\`

This deploys **test contracts**:

- Mock tokens (DAI, USDC, WETH) - **NO REAL VALUE**
- LendingPool contract
- VariableInterestRateModel
- FlashLoanReceiver

The deployment addresses will be saved to `deployment.json`

#### 3. Seed Demo Data

\`\`\`bash
npm run seed
\`\`\`

This populates the platform with:

- 500,000 DAI liquidity (LenderA)
- 300,000 USDC liquidity (LenderC)
- 100,000 DAI borrow with 100 WETH collateral (BorrowerB)
- Successful flash loan demo

#### 4. Setup MetaMask

1. Open MetaMask and select "Add a custom network"
2. Enter these details:

   - **Network name**: Localhost 8545
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency symbol**: ETH

3. Import demo accounts from Hardhat:
   - Open Hardhat console: `npm run node`
   - Copy any private key shown at startup
   - In MetaMask: Settings → Import Account
   - Paste private key (without 0x prefix)

#### 5. Start Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Open `http://localhost:5173` and connect your MetaMask wallet.

## Demo Walkthrough

### 1. Dashboard

- View market overview (liquidity, borrows, utilization)
- See your reputation score
- Monitor interest rates

### 2. Supply

- Deposit DAI to earn interest
- Expected APY: 3.5%
- Receive aDAI tokens

### 3. Borrow

- Deposit WETH as collateral
- Borrow DAI (75% LTV limit)
- Track health factor

### 4. Repay

- View active loans
- Repay full or partial amounts
- Unlock collateral on full repayment

### 5. Flash Loans

- Execute 50,000 DAI flash loan
- Fee: 0.09%
- View transaction details and gas used

## Test Suite

Run the comprehensive test suite:

\`\`\`bash
npm test
\`\`\`

Tests cover:

- Deposit and withdraw functionality
- Borrowing with LTV validation
- Repayment and interest accrual
- Flash loan success and failure paths
- Reputation updates

## Smart Contract Architecture

### LendingPool

Core contract managing:

- Multi-token markets
- User deposits and borrows
- Interest accrual
- Flash loan execution
- Reputation tracking

### VariableInterestRateModel

Implements utilization-based interest rates:
\`\`\`
Rate = baseRate + (utilization × multiplier)
\`\`\`

With kink at 80% utilization for steeper curve after high utilization.

### FlashLoanReceiver

Template contract for flash loan callbacks with executeOperation implementation.

## Security Checklist

- ✅ ReentrancyGuard on all external functions
- ✅ SafeERC20 for token transfers
- ✅ Input validation on all parameters
- ✅ LTV and health factor checks
- ✅ Event logging for all state changes
- ✅ Rate model bounds validation
- ✅ Flash loan atomicity enforcement

## Gas Optimization

- Batch operations where possible
- Minimize storage writes
- Optimize loop iterations
- Use efficient data structures

## Future Enhancements

- [ ] Chainlink Price Feeds integration
- [ ] ERC-3156 full compliance
- [ ] Liquidation mechanism
- [ ] Governance token (LEND)
- [ ] IPFS-based reputation metadata
- [ ] Multi-sig admin contract

## Deployment to Testnet

To deploy to Goerli or Sepolia:

1. Update `hardhat.config.ts` with testnet RPC and private key
2. Get testnet ETH from faucet
3. Run: `npx hardhat run scripts/deploy.ts --network goerli`

## License

MIT

## Support

For issues or questions:

1. Check README troubleshooting
2. Review smart contract comments
3. Check test cases for usage examples

## Credits

Built with:

- Solidity 0.8.x
- Hardhat
- React 18
- ethers.js v6
- OpenZeppelin Contracts

# lending-portal
