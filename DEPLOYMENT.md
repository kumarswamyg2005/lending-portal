# 🚀 Deployment Guide - DeFi Lending Platform

## ✅ Successfully Pushed to GitHub!

Your code is now live at: **https://github.com/kumarswamyg2005/lending-portal**

---

## 📦 Deployment Options

### Option 1: Deploy Frontend to Vercel (Recommended - FREE)

**Vercel** is perfect for Next.js apps and offers free hosting!

#### Step-by-Step:

1. **Go to [Vercel](https://vercel.com)**

   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Repository**

   - Click "Add New Project"
   - Find `lending-portal` repository
   - Click "Import"

3. **Configure Project**

   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `pnpm build` or leave default
   - **Output Directory**: `.next` (leave default)
   - Click "Deploy"

4. **Wait for Build** (~2-3 minutes)

   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://lending-portal-xyz.vercel.app`

5. **⚠️ Important Note:**
   - The frontend will work for UI/UX demo
   - But blockchain features need a live network (see below)

---

### Option 2: Deploy Smart Contracts to Testnet

To have **FULL WORKING DEMO** with real blockchain transactions:

#### A. Deploy to Sepolia Testnet (Ethereum)

**Prerequisites:**

- MetaMask wallet with Sepolia ETH ([Get free testnet ETH](https://sepoliafaucet.com/))
- Infura or Alchemy API key ([Free signup](https://infura.io))

**Steps:**

1. **Get Sepolia Test ETH**

   ```
   Visit: https://sepoliafaucet.com/
   Enter your wallet address
   Wait for ETH (~0.5 ETH)
   ```

2. **Create `.env` file** in project root:

   ```bash
   PRIVATE_KEY=your_metamask_private_key_here
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ```

3. **Update `hardhat.config.cjs`** - Add Sepolia network:

   ```javascript
   module.exports = {
     networks: {
       sepolia: {
         url: process.env.SEPOLIA_RPC_URL,
         accounts: [process.env.PRIVATE_KEY],
         chainId: 11155111,
       },
     },
   };
   ```

4. **Deploy Contracts:**

   ```bash
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```

5. **Update Frontend** - Copy contract addresses from `deployment.json` to:

   - `lib/contracts.ts`
   - Or use dynamic import (already configured!)

6. **Switch MetaMask to Sepolia**

   - Network name: Sepolia Test Network
   - Already in MetaMask by default

7. **Done!** Your app now works on Sepolia testnet

---

#### B. Deploy to Polygon Mumbai (Cheaper Gas)

**Why Mumbai?** Lower gas fees, faster transactions

**Steps:**

1. **Get Mumbai Test MATIC**

   ```
   Visit: https://faucet.polygon.technology/
   Select Mumbai network
   Enter your address
   ```

2. **Add Mumbai to Hardhat** (`hardhat.config.cjs`):

   ```javascript
   mumbai: {
     url: "https://rpc-mumbai.maticvigil.com",
     accounts: [process.env.PRIVATE_KEY],
     chainId: 80001
   }
   ```

3. **Deploy:**

   ```bash
   npx hardhat run scripts/deploy.cjs --network mumbai
   ```

4. **Add Mumbai to MetaMask:**
   - Network Name: Mumbai Testnet
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency: MATIC

---

### Option 3: Full Production Deployment (Advanced)

For **REAL MONEY** deployment on Ethereum Mainnet:

⚠️ **WARNING:** This costs real money! Only do this if you:

- Have audited smart contracts
- Understand security risks
- Have proper insurance/safeguards

**Estimated Costs:**

- Deploy all contracts: ~$500-1000 USD (depending on gas)
- Transaction fees for users: ~$50-200 per transaction

**Not recommended for college projects!** Use testnet instead.

---

## 🎯 Recommended Deployment Strategy for College Demo

### Best Approach: Vercel + Local Hardhat

1. **Deploy Frontend to Vercel** (for impressive live URL)
2. **Run Hardhat locally** during demo (for blockchain features)
3. **Use your laptop's IP** so others can connect

**Setup:**

1. **Deploy to Vercel** (Steps above)

2. **For Live Demo, run locally:**

   ```bash
   # Terminal 1: Start Hardhat
   npx hardhat node

   # Terminal 2: Deploy contracts
   npx hardhat run scripts/deploy.cjs --network localhost

   # Terminal 3: Start frontend
   pnpm dev
   ```

3. **Get your laptop's IP:**

   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

4. **Share access:**
   - Your Hardhat: `http://YOUR_IP:8545`
   - Your Frontend: `http://YOUR_IP:3000`
   - Others can connect MetaMask to your Hardhat node!

---

## 🌐 Alternative: Deploy to Testnet for Permanent Demo

**Best for:** Leaving demo online 24/7 for professors to review

### Quick Sepolia Deployment:

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env
echo "PRIVATE_KEY=your_key_here" > .env
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key" >> .env

# 3. Deploy
npx hardhat run scripts/deploy.cjs --network sepolia

# 4. Deploy frontend to Vercel
# (Use Vercel dashboard)
```

**Result:**

- ✅ Frontend live on Vercel: `https://lending-portal.vercel.app`
- ✅ Contracts live on Sepolia: Anyone can use with MetaMask
- ✅ 24/7 availability
- ✅ Free!

---

## 📊 Deployment Comparison

| Feature             | Vercel + Local | Vercel + Sepolia | Vercel + Mainnet  |
| ------------------- | -------------- | ---------------- | ----------------- |
| **Cost**            | Free           | Free             | $500-1000+        |
| **Speed**           | Instant        | Fast             | Fast              |
| **24/7 Access**     | ❌ No          | ✅ Yes           | ✅ Yes            |
| **Real Blockchain** | ✅ Yes (local) | ✅ Yes (testnet) | ✅ Yes (real $$$) |
| **Best For**        | Live demos     | Portfolio/review | Production        |
| **Risk**            | Zero           | Zero             | High              |

---

## 🎓 For Your College Demo - Recommended Setup

### **My Recommendation: Vercel + Sepolia Testnet**

**Why?**

- ✅ Free forever
- ✅ Always online (professor can test anytime)
- ✅ Real blockchain transactions
- ✅ Professional live URL
- ✅ No maintenance needed
- ✅ Safe (testnet = fake money)

**Setup Time:** ~15 minutes

**Links to show professor:**

```
Live Demo: https://lending-portal-xyz.vercel.app
Sepolia Explorer: https://sepolia.etherscan.io
Contract Address: 0x... (from deployment.json)
GitHub Repo: https://github.com/kumarswamyg2005/lending-portal
```

---

## 🚨 Quick Deploy Commands

### For Vercel (Frontend):

```bash
# Already done! Just go to vercel.com and import repo
```

### For Sepolia (Smart Contracts):

```bash
# 1. Get test ETH from https://sepoliafaucet.com
# 2. Create .env with your private key
# 3. Deploy
npx hardhat run scripts/deploy.cjs --network sepolia
```

### For Local Demo:

```bash
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat run scripts/deploy.cjs --network localhost

# Terminal 3
pnpm dev

# Open: http://localhost:3000
```

---

## 📝 Environment Variables for Vercel

If deploying to Sepolia, add these to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add:
   ```
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x... (from deployment.json)
   NEXT_PUBLIC_DAI_ADDRESS=0x...
   NEXT_PUBLIC_USDC_ADDRESS=0x...
   NEXT_PUBLIC_WETH_ADDRESS=0x...
   ```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] GitHub repo is public and updated
- [ ] Frontend deployed to Vercel
- [ ] Contracts deployed to Sepolia (or running locally)
- [ ] MetaMask connects successfully
- [ ] Can mint test tokens
- [ ] Can supply/deposit tokens
- [ ] Can borrow with collateral
- [ ] Toast notifications work
- [ ] Transaction history shows
- [ ] All links work

---

## 🆘 Troubleshooting

### "Transaction Failed" on Vercel:

- Make sure you deployed contracts to same network as MetaMask
- Check `deployment.json` has correct addresses
- Verify `.env` variables in Vercel

### "Cannot Connect to Network":

- For Sepolia: Add network to MetaMask
- For Local: Make sure Hardhat node is running
- Check RPC URL is correct

### "Out of Gas":

- Sepolia: Get more test ETH from faucet
- Local: You should have 10,000 ETH per account

---

## 🎉 You're Ready!

Choose your deployment path and follow the steps above. For a college project, I highly recommend **Vercel + Sepolia** for the perfect balance of professional quality and zero cost!

Good luck with your demo! 🚀
