# 🔧 Fix Vercel RPC Error

## Quick Fix for "RPC endpoint returned too many errors"

This error happens because Vercel can't connect to your local Hardhat blockchain at `http://127.0.0.1:8545`.

---

## ✅ Solution 1: Deploy to Sepolia Testnet (Recommended)

Make your app work 24/7 with real blockchain transactions:

### Step 1: Get Sepolia Test ETH

```bash
# Visit and enter your MetaMask address:
https://sepoliafaucet.com
```

### Step 2: Get Free Infura RPC

```bash
# Sign up at: https://infura.io
# Create a new project
# Copy your Sepolia endpoint: https://sepolia.infura.io/v3/YOUR_KEY
```

### Step 3: Update hardhat.config.cjs

Add this to your `hardhat.config.cjs`:

```javascript
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};
```

### Step 4: Create .env file

```bash
# In your project root, create .env:
echo "PRIVATE_KEY=your_metamask_private_key_without_0x" > .env
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY" >> .env
```

**⚠️ Important:** Add `.env` to `.gitignore` (already done in most projects)

### Step 5: Install dotenv

```bash
pnpm add dotenv
```

### Step 6: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

This will create `deployment.json` with Sepolia contract addresses.

### Step 7: Add Environment Variables to Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these (get values from `deployment.json`):

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_LENDING_POOL=0x... (from deployment.json)
NEXT_PUBLIC_DAI_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_WETH_ADDRESS=0x...
NEXT_PUBLIC_FLASH_LOAN_RECEIVER=0x...
```

### Step 8: Update lib/contracts.ts

Make it use environment variables:

```typescript
export const CONTRACTS = {
  lendingPool: process.env.NEXT_PUBLIC_LENDING_POOL || deployment.lendingPool,
  flashLoanReceiver:
    process.env.NEXT_PUBLIC_FLASH_LOAN_RECEIVER || deployment.flashLoanReceiver,
};

export const TOKEN_ADDRESSES: { [key: string]: string } = {
  DAI: process.env.NEXT_PUBLIC_DAI_ADDRESS || deployment.tokens.DAI,
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || deployment.tokens.USDC,
  WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS || deployment.tokens.WETH,
};
```

### Step 9: Redeploy on Vercel

```bash
git add .
git commit -m "Configure for Sepolia testnet"
git push origin main

# Or use Vercel dashboard: Deployments → Redeploy
```

### Step 10: Switch MetaMask to Sepolia

In MetaMask:

- Network: Sepolia Test Network
- Your app will now work on Vercel! ✅

---

## ✅ Solution 2: Mock Mode for Vercel (Quick Fix)

If you just want the UI to work on Vercel without blockchain:

### Update app/page.tsx

Add a check at the top:

```typescript
const IS_VERCEL = process.env.NEXT_PUBLIC_VERCEL === "1";

// In connectWallet function:
if (IS_VERCEL) {
  console.log("Running on Vercel - using mock mode");
  setAccount("0xMockAddress...");
  setIsConnected(true);
  return;
}
```

Then in Vercel environment variables, add:

```
NEXT_PUBLIC_VERCEL=1
```

**Result:** UI works but no real transactions. Good for showing design only.

---

## 📊 Comparison

| Solution      | Pros                                                              | Cons                             | Best For           |
| ------------- | ----------------------------------------------------------------- | -------------------------------- | ------------------ |
| **Sepolia**   | ✅ Real blockchain<br>✅ Works 24/7<br>✅ Free<br>✅ Professional | Need to deploy contracts         | **College demo**   |
| **Mock Mode** | ✅ Instant<br>✅ No setup                                         | ❌ No transactions<br>❌ UI only | Quick preview      |
| **Local**     | ✅ Full features                                                  | ❌ Only works when you run it    | Live presentations |

---

## 🎯 Recommendation for Your College Project

**Use Sepolia testnet** - It's:

- ✅ Free forever
- ✅ Professional
- ✅ Works 24/7 (professor can test anytime)
- ✅ Real blockchain transactions
- ✅ Easy to set up (30 minutes)

---

## 🆘 Quick Commands Summary

```bash
# 1. Get Sepolia ETH from faucet
# Visit: https://sepoliafaucet.com

# 2. Install dotenv
pnpm add dotenv

# 3. Create .env
echo "PRIVATE_KEY=your_key" > .env
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/key" >> .env

# 4. Deploy to Sepolia
npx hardhat run scripts/deploy.cjs --network sepolia

# 5. Update Vercel environment variables
# (Use Vercel dashboard)

# 6. Push and redeploy
git push origin main
```

---

**Choose Solution 1 (Sepolia) for the best demo experience!** 🚀
