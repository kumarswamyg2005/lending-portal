# 🔍 MetaMask Not Opening - Debug Steps

## Quick Checks:

### 1️⃣ Is MetaMask Installed?

- Look for the 🦊 MetaMask icon in your browser toolbar
- If not installed: https://metamask.io/download/

### 2️⃣ Is MetaMask Connected?

- Click the MetaMask icon
- Should show "Connected" with a green dot
- Should show your wallet address

### 3️⃣ Is MetaMask on the Right Network?

- Click MetaMask icon
- Check network at top (should show "Localhost 8545" or "Hardhat")
- If wrong network, click it and select "Localhost 8545"

### 4️⃣ Open Browser Console

**Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)**

Look for these logs when you click "Mint" button:

```
✅ SHOULD SEE:
[Mint] handleMintTokens called - Token: DAI, Amount: 1000
[Mint] User clicked Confirm Transaction button
[Mint] Pending transaction: {type: "mint", ...}
[Blockchain] mintTestTokens called with: {tokenSymbol: "DAI", ...}
[Blockchain] getProvider called
[Blockchain] window.ethereum exists? true
[Blockchain] Getting signer...
[Blockchain] Calling tokenContract.mint() - MetaMask should popup now...

🦊 MetaMask popup appears HERE
```

```
❌ IF YOU SEE THIS - MetaMask NOT installed:
[Blockchain] MetaMask not found!
Error: MetaMask not installed
```

```
❌ IF YOU SEE THIS - Wrong network:
Error: Incorrect network
```

---

## Step-by-Step Test:

### Step 1: Refresh Page

- Go to http://localhost:3000
- Press Ctrl+Shift+R (Cmd+Shift+R on Mac) for hard refresh

### Step 2: Connect Wallet

- Click "Connect Wallet" button at top right
- MetaMask should popup asking to connect
- Click "Next" then "Connect"

### Step 3: Open Console (F12)

- Keep console open to see logs

### Step 4: Click "Mint 1000 DAI"

- Watch the console logs
- Should see the confirmation dialog appear

### Step 5: Click "Confirm Transaction"

- Watch console logs
- Should see "[Blockchain] Calling tokenContract.mint()"
- MetaMask should popup immediately after

---

## Common Issues:

### Issue 1: "Please connect your wallet first"

**Fix:** Click "Connect Wallet" button first

### Issue 2: MetaMask shows "Switch Network"

**Fix:** Click "Switch Network" in MetaMask popup

### Issue 3: No console logs appear

**Fix:**

1. Check if dev server is running: `npm run dev`
2. Refresh page with Ctrl+Shift+R

### Issue 4: Console shows "MetaMask not installed"

**Fix:** Install MetaMask from https://metamask.io

### Issue 5: Confirmation dialog doesn't show

**Fix:** Check if `account` is set - you must connect wallet first

---

## What to Look For:

**When you click "Mint 1000 DAI":**

1. ✅ Confirmation dialog appears (purple color)
2. ✅ Shows "Amount: 1000 DAI"
3. ✅ "Confirm Transaction" button is visible

**When you click "Confirm Transaction":**

1. ✅ Dialog closes
2. ✅ Console shows blockchain logs
3. ✅ MetaMask popup appears
4. ✅ MetaMask shows "Confirm" button

---

## Send Me These Details:

If it's still not working, copy and paste:

1. **What you see in console when clicking "Mint 1000 DAI"**
2. **What you see in console when clicking "Confirm Transaction"**
3. **Does the confirmation dialog appear?** (Yes/No)
4. **Is MetaMask installed?** (Check browser toolbar for 🦊)
5. **Is wallet connected?** (Check "Connect Wallet" button - should show address)
6. **Any error messages?** (Red text in console)

---

## Quick Test Commands:

Open browser console (F12) and type:

```javascript
// Check if MetaMask installed
window.ethereum ? "✅ MetaMask installed" : "❌ MetaMask NOT installed";

// Check if connected
ethereum.selectedAddress
  ? `✅ Connected: ${ethereum.selectedAddress}`
  : "❌ Not connected";

// Check network
ethereum.chainId;
// Should be "0x7a69" (31337 in hex = localhost)
```
