# Demo Runbook

Step-by-step guide to demonstrate the DeFi Lending Platform to instructors.

## Setup (5 minutes)

### Terminal 1: Start Blockchain
\`\`\`bash
npm run node
\`\`\`
Shows Hardhat accounts and private keys

### Terminal 2: Deploy & Seed
\`\`\`bash
npm run deploy:local
npm run seed
\`\`\`
Shows deployment addresses and initial state

### Terminal 3: Start Frontend
\`\`\`bash
cd frontend
npm run dev
\`\`\`
Open http://localhost:5173

## Demo Flow (15 minutes)

### 1. Connect Wallet (1 min)
- Show MetaMask connection
- Display connected account
- Show network is Localhost

### 2. Dashboard Overview (2 min)
- **DAI Market**:
  - Total Liquidity: 500,000
  - Total Borrows: ~100,000
  - Utilization: ~17%
  - Supply APY: 3.5%
- **Reputation**: Show that borrowers have positive reputation

### 3. Supply Flow (2 min)
- Navigate to Supply page
- Select USDC token
- Enter amount: 5,000
- Click "Supply"
- Show transaction pending, then success
- Return to Dashboard to verify balance updated

### 4. Borrow Flow (3 min)
- Navigate to Borrow page
- **Collateral**: Select WETH, enter 10
- **Borrow**: Select DAI, enter 7,500 (within 75% LTV)
- Show LTV calculation: 10 × 0.75 = 7.5 max borrow
- Click "Borrow"
- Show transaction success
- Display loan created

### 5. Flash Loan Demo (4 min)
- Navigate to Flash Loans
- Select DAI token
- Enter amount: 50,000
- Show fee calculation: 50,000 × 0.09% = 45 DAI
- Click "Execute Flash Loan"
- Show:
  - Transaction hash
  - Block number
  - Gas used
  - Status: Success
- Explain: Borrowed 50,000 DAI, executed callback, repaid 50,045 DAI all in one transaction

### 6. Repay Flow (2 min)
- Navigate to Repay page
- Show active loan from earlier
- Enter repay amount: 5,000 (partial repayment)
- Click "Repay"
- Show transaction success
- Can show loan still active with reduced amount

### 7. Reputation Tracking (1 min)
- Go back to Dashboard
- Show reputation increased after successful operations
- Explain: +5 for borrow, +2 for partial repay, +10 for full repay

## Key Talking Points

1. **No Collateral Risk**: Flash loans execute atomically - if repayment fails, entire transaction reverts
2. **Dynamic Rates**: Interest rates adjust based on utilization - incentivizes lending/borrowing
3. **On-Chain Reputation**: Immutable history of user behavior
4. **Permissionless**: Anyone with wallet can participate
5. **Full Demo**: Shows real DeFi mechanics - supply, borrow, liquidation-proof with LTV, flash loans

## Troubleshooting

### MetaMask shows wrong network
- Check network settings
- Verify chain ID is 31337
- Try switching networks manually

### Transactions failing
- Ensure deployed contracts are running
- Check gas limit (increase to 1,000,000)
- Verify accounts have ETH balance

### Frontend not loading
- Check if `deployment.json` exists
- Verify Vite dev server is running
- Clear browser cache

## Expected Results

- ✅ All transactions succeed
- ✅ Balances update correctly
- ✅ Reputation increases appropriately
- ✅ Interest rates reflect utilization
- ✅ Flash loans execute atomically
