# 🚀 Quick Start - Deploy with Fake ETH in 10 Minutes

## What You'll Get

- ✅ Live website on Vercel (accessible worldwide)
- ✅ Works with FREE fake ETH (Sepolia testnet)
- ✅ MetaMask transactions work perfectly
- ✅ Users can mint DAI, USDC, WETH
- ✅ Full lending/borrowing functionality
- ✅ Zero cost

---

## Step 1: Get Free Test ETH (2 minutes)

```bash
1. Open MetaMask
2. Add Sepolia Network:
   - Network Name: Sepolia Testnet
   - RPC URL: https://rpc.sepolia.org
   - Chain ID: 11155111
   - Save

3. Get free ETH:
   - Go to: https://sepoliafaucet.com/
   - Enter your wallet address
   - Get 0.5 Sepolia ETH (free!)
```

---

## Step 2: Setup Project (2 minutes)

```bash
# Install dependency
npm install dotenv

# Create environment file
cp .env.example .env.local

# Get Alchemy API key (free):
# 1. Go to https://www.alchemy.com/
# 2. Sign up → Create App → Select "Sepolia"
# 3. Copy HTTPS URL

# Edit .env.local
nano .env.local
```

**Add to .env.local:**

```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_metamask_private_key
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
```

---

## Step 3: Deploy Contracts to Sepolia (3 minutes)

```bash
# Deploy smart contracts
npx hardhat run scripts/deploy-testnet.cjs --network sepolia

# Copy the contract addresses shown
# Example output:
# Lending Pool: 0xABC123...
# DAI: 0xDEF456...
# USDC: 0xGHI789...
# WETH: 0xJKL012...
```

**Add addresses to .env.local:**

```bash
NEXT_PUBLIC_SEPOLIA_LENDING_POOL=0xYourLendingPoolAddress
NEXT_PUBLIC_SEPOLIA_DAI=0xYourDAIAddress
NEXT_PUBLIC_SEPOLIA_USDC=0xYourUSDCAddress
NEXT_PUBLIC_SEPOLIA_WETH=0xYourWETHAddress
```

---

## Step 4: Deploy to Vercel (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Add environment variables in Vercel:**

```
1. Go to vercel.com → Your Project → Settings
2. Environment Variables
3. Add all NEXT_PUBLIC_* variables from .env.local
4. Redeploy: vercel --prod
```

---

## Step 5: Test Your Live Site! ✅

```bash
1. Open your Vercel URL (e.g., https://your-app.vercel.app)
2. Connect MetaMask (make sure on Sepolia)
3. Mint 1000 DAI → MetaMask popup → Confirm
4. Mint 1000 USDC → MetaMask popup → Confirm
5. Mint 1000 WETH → MetaMask popup → Confirm
6. Supply 500 DAI → 2 MetaMask popups → Confirm both
7. Borrow 300 USDC → 2 MetaMask popups → Confirm both
8. Check MetaMask Activity → See all transactions!
```

---

## 🎉 Done!

Your DeFi platform is now:

- ✅ Live on the internet
- ✅ Using fake ETH (free)
- ✅ MetaMask integrated
- ✅ Anyone can use it
- ✅ Cost: $0

**Share your URL:**
`https://your-project-name.vercel.app`

---

## 📚 Full Documentation

- **Detailed Guide:** See DEPLOYMENT_GUIDE.md
- **Presentation Help:** See PRESENTATION_GUIDE.md
- **Troubleshooting:** See DEPLOYMENT_GUIDE.md → Troubleshooting section

---

## 🆘 Quick Fixes

### "Insufficient funds"

→ Get more Sepolia ETH from https://sepoliafaucet.com/

### "Wrong network"

→ Switch MetaMask to Sepolia (Chain ID: 11155111)

### "Contract not found"

→ Check .env.local has correct addresses

### "Transaction failed"

→ Make sure you have Sepolia ETH for gas

---

## 💡 Pro Tips

1. **Use Separate Wallet:** Create new MetaMask account for testnet
2. **Save Private Key Safely:** Never commit to GitHub
3. **Test Locally First:** Run `npm run dev` before deploying
4. **Check Etherscan:** Verify contracts at https://sepolia.etherscan.io/
5. **Share Link:** Anyone can use it with MetaMask + Sepolia ETH

---

**Total Time: ~10 minutes | Total Cost: $0** 🚀
