# DeFi Lending Platform - Blockchain Integration Setup

## 🚀 Quick Start

Your lending platform now supports **REAL blockchain transactions** that will appear in MetaMask!

### Prerequisites

1. **MetaMask Extension** installed in your browser
2. **Node.js** and **pnpm** installed
3. **Hardhat** local blockchain running

---

## 📋 Step-by-Step Setup

### 1. Start Hardhat Local Blockchain

In Terminal 1, run:

```bash
npx hardhat node
```

This starts a local blockchain at `http://127.0.0.1:8545` with test accounts.

**Important:** Keep this terminal running!

### 2. Deploy Smart Contracts

In Terminal 2, run:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

This deploys:

- Mock ERC20 tokens (DAI, USDC, WETH)
- LendingPool contract
- Interest rate model
- Flash loan receiver

The contract addresses are hardcoded in `lib/contracts.ts`.

### 3. Configure MetaMask

#### Add Localhost Network

1. Open MetaMask
2. Click network dropdown → **Add Network** → **Add network manually**
3. Enter these details:
   - **Network name**: Localhost 8545
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency symbol**: ETH

#### Import a Test Account

1. From the Hardhat node terminal, copy a private key (e.g., Account #0)
2. In MetaMask: **Account menu** → **Import account**
3. Paste the private key
4. You'll see 10,000 ETH balance!

### 4. Start the Frontend

In Terminal 3, run:

```bash
pnpm run dev
```

Open `http://localhost:3000`

---

## 🎮 How to Use

### 1. Connect Wallet

- Click **"Connect Wallet"** button
- Approve the connection in MetaMask
- Make sure you're on the **Localhost 8545** network

### 2. Get Test Tokens

On the Dashboard page:

- Click **"Mint 1000 DAI"** (or USDC, WETH)
- Approve the transaction in MetaMask
- Wait for confirmation
- **Check MetaMask Activity tab - you'll see the transaction!**

### 3. Supply Tokens

Navigate to **Supply** page:

- Select token (DAI, USDC, or WETH)
- Enter amount (e.g., 100)
- Click **"Supply"**
- Approve TWO transactions:
  1. **Approval** - Allows contract to spend your tokens
  2. **Deposit** - Actually deposits the tokens
- **Both transactions appear in MetaMask!**

### 4. Borrow Tokens

Navigate to **Borrow** page:

- Select collateral token and amount
- Select borrow token and amount (max 75% LTV)
- Click **"Borrow"**
- Approve transactions
- **See them in MetaMask!**

### 5. Repay Loan

Navigate to **Repay** page:

- Select token and repay amount
- Click **"Repay"**
- **Transaction appears in MetaMask!**

### 6. Flash Loan

Navigate to **Flash Loan** page:

- Select token and amount
- Click **"Execute Flash Loan"**
- **See the atomic transaction in MetaMask!**

---

## 🔍 View Transactions in MetaMask

Every transaction you make will:

- ✅ Appear in MetaMask's **Activity** tab
- ✅ Show real transaction hashes
- ✅ Display gas fees
- ✅ Show confirmation status
- ✅ Be viewable on block explorers (if you use a testnet)

Click on any transaction in MetaMask to see:

- Transaction hash
- Block number
- Gas used
- From/To addresses
- Contract interaction details

---

## 🐛 Troubleshooting

### "Transaction failed" errors

**Problem:** Contract might not be deployed or addresses are wrong.

**Solution:**

1. Make sure Hardhat node is running
2. Re-deploy contracts: `npx hardhat run scripts/deploy.ts --network localhost`
3. Check that contract addresses in `lib/contracts.ts` match deployed addresses

### "Insufficient funds" error

**Problem:** Not enough tokens or ETH.

**Solution:**

1. Use "Mint Test Tokens" buttons on Dashboard
2. Make sure you have ETH for gas (Hardhat accounts start with 10,000 ETH)

### "Wrong network" error

**Problem:** MetaMask is not on Localhost network.

**Solution:**

1. Switch to "Localhost 8545" in MetaMask
2. Make sure RPC URL is `http://127.0.0.1:8545`
3. Chain ID should be `31337`

### Transactions not appearing in MetaMask

**Problem:** Using mock transactions instead of real ones.

**Solution:**

1. Make sure you're using the updated `page.tsx` with blockchain integration
2. Check browser console for `[Blockchain]` log messages
3. Real transactions show transaction hash starting with `0x...`

---

## 📝 Contract Addresses

Current contract addresses (deployed to localhost):

```typescript
DAI: 0x5fbdb2315678afecb367f032d93f642f64180aa3;
USDC: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512;
WETH: 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0;
LendingPool: 0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9;
InterestModel: 0xdc64a140aa3e981100a9beca4e685f962f0cf6c9;
FlashLoanReceiver: 0x5fc8d32690cc91d4c39d9d3abcbd16989f875707;
```

**Note:** These addresses change every time you restart Hardhat. After redeploying, update `lib/contracts.ts`.

---

## 🎯 What's Different Now?

### Before (Mock Transactions)

- ❌ Fake transaction hashes
- ❌ No MetaMask activity
- ❌ Only UI updates
- ❌ No blockchain interaction

### After (Real Transactions)

- ✅ Real transaction hashes
- ✅ Transactions in MetaMask
- ✅ Blockchain state changes
- ✅ Gas fees paid
- ✅ Smart contract execution

---

## 🔗 Next Steps

1. **Deploy to Testnet** (Sepolia, Mumbai)

   - Update `hardhat.config.js` with testnet RPC
   - Get testnet ETH from faucets
   - Deploy contracts to testnet
   - Update contract addresses

2. **Add Transaction History**

   - Query blockchain for past events
   - Display user's deposit/borrow history
   - Show real APY calculations

3. **Add Token Balance Display**
   - Query ERC20 balances
   - Show real-time balance updates
   - Display supply/borrow positions

---

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## 🎉 You're All Set!

Your DeFi lending platform now uses real blockchain transactions! Every action you take will:

- Execute smart contracts
- Cost gas fees
- Update blockchain state
- Appear in MetaMask

Happy testing! 🚀
