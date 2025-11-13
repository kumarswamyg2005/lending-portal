# ✅ Sepolia Deployment Checklist

## What I've Done For You

✅ Installed `dotenv` package  
✅ Updated `hardhat.config.cjs` with Sepolia network  
✅ Created `.env.example` template  
✅ Created `setup-sepolia.sh` deployment script  
✅ Verified `.env` is in `.gitignore` (safe!)

---

## What YOU Need To Do

### Step 1: Get Sepolia Test ETH (5 minutes)

1. Open MetaMask
2. Make sure you're on **Sepolia Test Network**
   - If you don't see it, enable "Show test networks" in MetaMask settings
3. Copy your wallet address
4. Visit: **https://sepoliafaucet.com**
5. Paste your address and request ETH
6. Wait ~1 minute for ETH to arrive
7. ✅ Check MetaMask shows ~0.5 ETH

### Step 2: Get Infura API Key (3 minutes)

1. Visit: **https://infura.io**
2. Sign up (free account)
3. Create a new project
   - Name: "DeFi Lending Platform"
   - Product: Web3 API
4. Click on your project
5. Copy the **Sepolia** endpoint URL
   - Example: `https://sepolia.infura.io/v3/abc123...`
6. ✅ Save this URL

**Alternative:** Use Alchemy instead

- Visit: **https://alchemy.com**
- Create free account
- Get Sepolia API endpoint

### Step 3: Get Your MetaMask Private Key (2 minutes)

⚠️ **WARNING:** NEVER share your private key with anyone!

1. Open MetaMask
2. Click your account icon
3. Click "⋮" (three dots)
4. Select "Account Details"
5. Click "Export Private Key"
6. Enter your MetaMask password
7. Copy the private key (WITHOUT the `0x` prefix)
8. ✅ Keep this safe!

### Step 4: Create .env File (1 minute)

```bash
# Copy the example file
cp .env.example .env

# Edit it (choose your editor)
code .env
# or
nano .env
# or
vi .env
```

Update with YOUR values:

```
PRIVATE_KEY=your_actual_private_key_without_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_actual_api_key
```

**Example:**

```
PRIVATE_KEY=abc123def456...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/9aa3d95...
```

✅ Save the file

### Step 5: Deploy to Sepolia (5 minutes)

```bash
# Run the deployment
npx hardhat run scripts/deploy.cjs --network sepolia
```

**What happens:**

- Deploys LendingPool contract
- Deploys all token contracts (DAI, USDC, WETH)
- Deploys Interest Rate Model
- Deploys Flash Loan Receiver
- Creates `deployment.json` with all addresses

**Time:** ~2-5 minutes  
**Cost:** ~$20-50 in test ETH (FREE from faucet)

✅ Wait for "Deployment complete!" message

### Step 6: Configure Vercel (3 minutes)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Open your project**
3. **Settings** → **Environment Variables**
4. **Add these variables** (get values from `deployment.json`):

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_LENDING_POOL=0x... (from deployment.json)
NEXT_PUBLIC_DAI_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_WETH_ADDRESS=0x...
NEXT_PUBLIC_FLASH_LOAN_RECEIVER=0x...
```

**Tip:** Open `deployment.json` and copy the addresses

5. **Save** all variables

### Step 7: Redeploy on Vercel

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait ~2 minutes for build

✅ Your app now works on Vercel with Sepolia!

### Step 8: Test It!

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Switch MetaMask to **Sepolia Test Network**
3. Connect wallet
4. Try minting tokens
5. Try supply/borrow

✅ Everything should work!

---

## 🚀 Quick Command Summary

```bash
# 1. Get Sepolia ETH from faucet
# https://sepoliafaucet.com

# 2. Create and edit .env
cp .env.example .env
code .env  # Add your keys

# 3. Deploy to Sepolia
npx hardhat run scripts/deploy.cjs --network sepolia

# 4. Check deployment
cat deployment.json

# 5. Update Vercel environment variables
# (Use Vercel dashboard)

# 6. Redeploy on Vercel
# (Use Vercel dashboard)
```

---

## 🆘 Troubleshooting

### "Insufficient funds" error

- You need more Sepolia ETH from the faucet
- Request more at https://sepoliafaucet.com

### "Invalid API Key" error

- Check your `SEPOLIA_RPC_URL` in .env
- Make sure you copied the full URL from Infura/Alchemy

### "Invalid private key" error

- Remove `0x` prefix from private key in .env
- Make sure no spaces or quotes around the key

### Vercel still shows RPC error

- Make sure you added ALL environment variables
- Click "Redeploy" after adding variables
- Check variable names match exactly (case-sensitive!)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] `deployment.json` file created with contract addresses
- [ ] Can see deployment transaction on Sepolia Etherscan
- [ ] Added all environment variables to Vercel
- [ ] Redeployed on Vercel
- [ ] Vercel app loads without errors
- [ ] Can connect MetaMask to app (on Sepolia network)
- [ ] Can mint test tokens
- [ ] Can supply tokens
- [ ] Can borrow with collateral
- [ ] Transactions show in MetaMask activity
- [ ] Can view transaction history

---

## 📊 What You'll Have

**Before:**

- ❌ Vercel shows "RPC endpoint error"
- ❌ Can't use blockchain features
- ✅ UI works but no transactions

**After:**

- ✅ Works 24/7 on Vercel
- ✅ Real blockchain transactions on Sepolia
- ✅ Anyone can test your demo
- ✅ Professor can review anytime
- ✅ Professional deployment

---

## 🎉 You're Done!

Your app will be fully deployed and working on:

- **Frontend**: Vercel (https://your-app.vercel.app)
- **Blockchain**: Sepolia testnet (https://sepolia.etherscan.io)
- **Available**: 24/7 for free!

**Share with professor:**

- Live app URL
- GitHub repo
- Sepolia contract addresses

Good luck with your demo! 🚀
