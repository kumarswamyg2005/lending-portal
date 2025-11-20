# 🚀 Quick Start - Use with MetaMask

Everything is now set up to work with MetaMask! The platform will use **whatever network MetaMask is connected to**.

## ✅ What's Already Running

1. **Hardhat Node**: Running at `http://127.0.0.1:8545` (Chain ID: 31337)
2. **Deployed Contracts**: All contracts deployed to the local node
3. **Frontend**: Running at `http://localhost:3000`

## 🦊 MetaMask Setup (2 Minutes)

### Step 1: Add Hardhat Network to MetaMask

1. Open MetaMask extension
2. Click the network dropdown (top left, probably says "Ethereum Mainnet")
3. Click **"Add Network"** → **"Add a network manually"**
4. Fill in these exact values:

```
Network Name:    Hardhat Local
RPC URL:         http://127.0.0.1:8545
Chain ID:        31337
Currency Symbol: ETH
```

5. Click **"Save"**
6. Switch to the "Hardhat Local" network in MetaMask

### Step 2: Import a Test Account

You need an account with test ETH. Use one of the Hardhat accounts:

1. In MetaMask, click your account icon (top right)
2. Click **"Import Account"**
3. Paste this private key:

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

This is Account #0 from Hardhat (has 10,000 test ETH).

⚠️ **WARNING**: This key is publicly known. **NEVER** use it on real networks (mainnet)!

### Step 3: Use the Platform

1. Open http://localhost:3000 in your browser
2. Click **"Connect Wallet"** in the top right
3. MetaMask will ask you to approve - click **"Connect"**
4. You should see your address and balance

## 💰 Making Transactions

### Mint Test Tokens

1. Go to the **"Mint"** tab
2. Select a token (DAI, USDC, or WETH)
3. Enter amount (e.g., 1000)
4. Click **"Mint"**
5. **MetaMask popup will appear** - Review and click **"Confirm"**
6. Wait a few seconds - you'll see a success message!

### Supply/Deposit

1. After minting, go to **"Supply"** tab
2. Select the same token you minted
3. Enter amount to supply (e.g., 500)
4. Click **"Supply"**
5. **MetaMask will show 2 popups**:
   - First: Approve the lending pool to spend your tokens - **Confirm**
   - Second: Deposit transaction - **Confirm**
6. Success! You'll earn interest on your deposit.

### Borrow

1. Go to **"Borrow"** tab
2. Select collateral token and amount
3. Select token to borrow and amount
4. Click **"Borrow"**
5. **MetaMask popup** - **Confirm**

### View Transactions

All your transactions will show up in:

- MetaMask's **Activity** tab
- The platform's transaction history

## 🎯 What Changed

Before, the app had hardcoded settings. Now:

✅ **MetaMask controls everything**: Gas fees, network, confirmations
✅ **Works on any network**: Local, Sepolia, Mumbai, etc.
✅ **No more "Internal JSON-RPC error"**: MetaMask shows clear error messages
✅ **Real blockchain transactions**: Everything is on-chain and visible in MetaMask

## 🔧 Troubleshooting

### "Please connect your wallet"

- Make sure MetaMask is unlocked
- Click "Connect Wallet" in the app
- Approve the connection in MetaMask

### "Transaction failed"

- Check you have enough ETH for gas
- Check you're on the right network (Hardhat Local)
- Check the Hardhat node is running (terminal should show activity)

### "Insufficient funds" or "Insufficient allowance"

- Make sure you minted tokens first
- The app auto-approves unlimited tokens, but you need to confirm in MetaMask

### MetaMask shows wrong balance

- Click **···** (3 dots) in MetaMask
- Settings → Advanced → **"Clear activity tab data"**
- Refresh the page

### Want to restart fresh?

```bash
# Kill Hardhat node (Ctrl+C in terminal)
# Start it again
npx hardhat node

# In another terminal, redeploy
npx hardhat run scripts/deploy.cjs --network localhost

# Restart dev server (Ctrl+C and then)
npm run dev
```

## 📱 Current Deployment Info

**Network**: localhost (Chain ID: 31337)

**Contract Addresses** (automatically loaded):

- Lending Pool: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- DAI: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- USDC: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- WETH: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## 🌐 Want to Use a Testnet Instead?

1. Get testnet ETH from a faucet (e.g., https://sepoliafaucet.com/)
2. Deploy to testnet:
   ```bash
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```
3. Switch MetaMask to Sepolia network
4. Use the platform - it automatically works!

---

**That's it!** 🎉 The platform now works exactly like any other DeFi app - all transactions go through MetaMask and you can see everything in your wallet.
