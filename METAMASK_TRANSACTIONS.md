# 🦊 MetaMask Transaction Guide

## ✅ System Status

Your DeFi Lending Platform is now fully configured to work with MetaMask!

**What's Running:**

- ✅ Hardhat Node: http://127.0.0.1:8545 (Chain ID: 31337)
- ✅ Frontend: http://localhost:3000
- ✅ All contracts deployed and ready

**Every action below will trigger a MetaMask popup for confirmation!**

---

## 🔐 Initial Setup (One-Time)

### 1. Add Hardhat Network to MetaMask

Open MetaMask → Networks → Add Network → Add manually:

```
Network Name:    Hardhat Local
RPC URL:         http://127.0.0.1:8545
Chain ID:        31337
Currency:        ETH
```

### 2. Import Test Account

MetaMask → Account menu → Import Account:

```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

This account has **10,000 TEST ETH** for gas fees.

⚠️ **This key is public - NEVER use on mainnet!**

---

## 🎯 All Transactions That Require MetaMask Confirmation

### Transaction 1: Connect Wallet

**Action:** Click "Connect Wallet" button  
**MetaMask Popup:** ✅ YES - "Connect with MetaMask"  
**What to do:** Click "Next" → "Connect"  
**Result:** Your address appears in the UI

---

### Transaction 2: Mint Test Tokens

**Action:** Go to "Mint" tab → Select DAI → Enter 1000 → Click "Mint"  
**MetaMask Popup:** ✅ YES - "Contract Interaction"  
**What you'll see in MetaMask:**

```
To: DAI Token Contract
Data: mint(address, uint256)
Gas: ~100,000
```

**What to do:** Review → Click "Confirm"  
**Result:** 1000 DAI added to your wallet

---

### Transaction 3: Supply/Deposit Tokens

**Action:** Go to "Supply" tab → Select DAI → Enter 500 → Click "Supply"

**MetaMask Popup #1:** ✅ YES - "Token Approval"

```
To: DAI Token Contract
Function: approve(spender, amount)
Spending Cap: Unlimited DAI
```

**What to do:** Click "Confirm"

**MetaMask Popup #2:** ✅ YES - "Deposit Transaction"

```
To: Lending Pool Contract
Function: deposit(token, amount)
Amount: 500 DAI
Gas: ~200,000
```

**What to do:** Click "Confirm"

**Result:** 500 DAI deposited, earning interest!

---

### Transaction 4: Borrow Tokens

**Action:** Go to "Borrow" tab → Enter collateral (DAI 200) → Borrow token (USDC 100) → Click "Borrow"

**MetaMask Popup #1:** ✅ YES - "Collateral Approval"

```
To: DAI Token Contract
Function: approve(spender, amount)
Spending Cap: Unlimited DAI
```

**What to do:** Click "Confirm"

**MetaMask Popup #2:** ✅ YES - "Borrow Transaction"

```
To: Lending Pool Contract
Function: borrow(collateralToken, collateralAmount, borrowToken, borrowAmount)
Collateral: 200 DAI
Borrow: 100 USDC
Gas: ~250,000
```

**What to do:** Click "Confirm"

**Result:** 100 USDC borrowed, 200 DAI locked as collateral

---

### Transaction 5: Repay Loan

**Action:** Go to "Repay" tab → Select loan → Enter repay amount → Click "Repay"

**MetaMask Popup #1:** ✅ YES - "Token Approval"

```
To: USDC Token Contract
Function: approve(spender, amount)
Spending Cap: Unlimited USDC
```

**What to do:** Click "Confirm"

**MetaMask Popup #2:** ✅ YES - "Repay Transaction"

```
To: Lending Pool Contract
Function: repay(loanId, repayAmount)
Amount: [your amount] USDC
Gas: ~200,000
```

**What to do:** Click "Confirm"

**Result:** Loan repaid, collateral released

---

### Transaction 6: Flash Loan

**Action:** Go to "Flash Loan" tab → Select token → Enter amount → Click "Execute"

**MetaMask Popup:** ✅ YES - "Flash Loan Transaction"

```
To: Lending Pool Contract
Function: flashLoan(receiver, token, amount, params)
Amount: [your amount]
Fee: 0.09% (9 basis points)
Gas: ~300,000
```

**What to do:** Click "Confirm"

**Result:** Flash loan executed and repaid in same transaction

---

## 📱 Viewing Transactions in MetaMask

After each confirmed transaction, you can:

1. **Click on the MetaMask extension**
2. **Go to "Activity" tab**
3. **See all your transactions:**

   - ✅ Contract Interaction (Mint)
   - ✅ Approve (Token approvals)
   - ✅ Contract Interaction (Deposit)
   - ✅ Contract Interaction (Borrow)
   - ✅ Contract Interaction (Repay)
   - ✅ Contract Interaction (Flash Loan)

4. **Click any transaction to see:**
   - Transaction hash
   - Block number
   - Gas used
   - Status (Success/Failed)
   - Link to block explorer (if on testnet)

---

## 🎮 Try It Now - Complete Flow

### Step-by-Step Test (All via MetaMask)

1. **Open** http://localhost:3000

2. **Connect Wallet**

   - Click "Connect Wallet"
   - MetaMask popup → Confirm ✅

3. **Mint 1000 DAI**

   - Go to Mint tab
   - Select DAI, enter 1000
   - Click "Mint"
   - MetaMask popup → Confirm ✅
   - Wait for success message

4. **Supply 500 DAI**

   - Go to Supply tab
   - Select DAI, enter 500
   - Click "Supply"
   - MetaMask popup #1 (Approve) → Confirm ✅
   - MetaMask popup #2 (Deposit) → Confirm ✅
   - Wait for success message

5. **Mint 500 USDC** (for collateral)

   - Go to Mint tab
   - Select USDC, enter 500
   - Click "Mint"
   - MetaMask popup → Confirm ✅

6. **Borrow 200 USDC with 300 DAI collateral**

   - Go to Borrow tab
   - Collateral: DAI, 300
   - Borrow: USDC, 200
   - Click "Borrow"
   - MetaMask popup #1 (Approve collateral) → Confirm ✅
   - MetaMask popup #2 (Borrow) → Confirm ✅

7. **Check MetaMask Activity**
   - Open MetaMask
   - Click "Activity" tab
   - See all your transactions! 🎉

---

## ❌ Transaction Rejection

**What happens if you click "Reject" in MetaMask?**

The app will show:

- ❌ "Transaction rejected" error message
- No on-chain action occurs
- No gas fees charged
- You can try again

This is normal behavior - users should have full control!

---

## 🔍 Troubleshooting

### "Please connect your MetaMask wallet first"

→ You haven't connected wallet yet. Click "Connect Wallet" first.

### MetaMask doesn't pop up

→ Check if MetaMask is unlocked  
→ Check if you're on the right network (Hardhat Local)  
→ Refresh the page and try again

### "Insufficient funds for gas"

→ Make sure your imported account has ETH  
→ The test account should have 10,000 ETH

### "Transaction failed" after confirming

→ Check Hardhat node is running (`lsof -ti:8545`)  
→ Check you have enough token balance  
→ Try minting tokens first

### "Nonce too high" or "Nonce too low"

→ MetaMask → Settings → Advanced → "Clear activity tab data"  
→ Refresh the page

---

## 🌟 Summary

**Every single action in this DeFi platform requires MetaMask confirmation:**

1. ✅ Connect Wallet → MetaMask popup
2. ✅ Mint Tokens → MetaMask popup
3. ✅ Supply/Deposit → 2 MetaMask popups (approve + deposit)
4. ✅ Borrow → 2 MetaMask popups (approve + borrow)
5. ✅ Repay → 2 MetaMask popups (approve + repay)
6. ✅ Flash Loan → MetaMask popup

**This is exactly how real DeFi apps like Aave, Compound, and Uniswap work!**

All transactions are:

- 🔗 On-chain (real blockchain transactions)
- 💰 Require gas fees (from your TEST ETH)
- 📱 Visible in MetaMask Activity
- ✅ Can be confirmed or rejected by you
- 🔍 Verifiable on the blockchain

---

**Ready to test?** Open http://localhost:3000 and start making transactions! 🚀
