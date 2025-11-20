# DeFi Lending Platform - Setup Guide

## Quick Start with MetaMask

The platform now works with **any network** that MetaMask is connected to. You can use:

- Local Hardhat network (for testing)
- Ethereum testnets (Sepolia, Goerli)
- Polygon testnets (Mumbai)
- Any other EVM-compatible network

## Option 1: Use Local Hardhat Network (Recommended for Testing)

### Step 1: Start Hardhat Node

```bash
npx hardhat node
```

This starts a local blockchain at `http://127.0.0.1:8545` with test accounts pre-funded with ETH.

### Step 2: Deploy Contracts

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

This deploys all contracts and saves addresses to `deployment.json`.

### Step 3: Configure MetaMask

1. Open MetaMask
2. Click on the network dropdown (top left)
3. Click "Add Network" → "Add a network manually"
4. Fill in:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH
5. Click "Save"

### Step 4: Import a Test Account

1. In MetaMask, click your account icon → "Import Account"
2. Paste one of the private keys shown when you started Hardhat node
   - Example (Account #0): `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - ⚠️ **NEVER use these keys on mainnet - they are publicly known!**

### Step 5: Start the Frontend

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 6: Use the Platform

1. Click "Connect Wallet" and approve in MetaMask
2. Make sure MetaMask is connected to "Hardhat Local" network
3. **Mint Tokens**: Enter amount and click "Mint" - MetaMask will ask for confirmation
4. **Supply/Deposit**: After minting, enter amount and click "Supply" - MetaMask will ask for confirmation twice (approve + deposit)
5. **Borrow**: Similar process
6. All transactions will show up in MetaMask's activity!

## Option 2: Use a Testnet (Sepolia, Mumbai, etc.)

### Step 1: Get Testnet ETH

Get free testnet ETH from faucets:

- **Sepolia**: https://sepoliafaucet.com/
- **Mumbai**: https://faucet.polygon.technology/

### Step 2: Deploy to Testnet

Update `hardhat.config.cjs` with your network config, then:

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

### Step 3: Update Contract Addresses

The deployment will save addresses to `deployment.json`. The frontend automatically reads from this file.

### Step 4: Connect MetaMask

1. Make sure MetaMask is connected to the same testnet you deployed to
2. Open http://localhost:3000
3. Click "Connect Wallet"
4. Use the platform - all transactions will show in MetaMask!

## Troubleshooting

### "Transaction failed" or "Internal JSON-RPC error"

- **Check Network**: Make sure MetaMask is connected to the same network where contracts are deployed
- **Check Balance**: Make sure you have enough ETH for gas fees
- **Hardhat Node**: If using local network, make sure `npx hardhat node` is still running

### "Contract not found" or "Call revert exception"

- Run deployment again: `npx hardhat run scripts/deploy.cjs --network localhost`
- Restart the dev server: Kill `npm run dev` and run it again

### MetaMask shows wrong balance

- Click the 3 dots in MetaMask → Settings → Advanced → Clear activity tab data

### "Nonce too high" error

- In MetaMask: Settings → Advanced → Clear activity tab data and reset account

## How It Works

1. **Frontend reads from deployment.json**: All contract addresses are loaded automatically
2. **MetaMask handles the network**: You can switch networks in MetaMask and the app adapts
3. **Gas estimation is automatic**: MetaMask calculates gas fees based on the connected network
4. **All transactions go through MetaMask**: You confirm every transaction in MetaMask's popup

## Network Information

Your current deployment is on: **${deployment.network}** (Chain ID: ${deployment.chainId})

- Lending Pool: `${deployment.lendingPool}`
- DAI Token: `${deployment.tokens.DAI}`
- USDC Token: `${deployment.tokens.USDC}`
- WETH Token: `${deployment.tokens.WETH}`

To change networks, just switch in MetaMask and (if needed) redeploy contracts to that network.
