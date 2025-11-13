# 🏦 DeFi Lending Platform - College Project

A complete decentralized finance (DeFi) lending platform with MetaMask integration, built with Next.js and Solidity smart contracts.

## ✨ Features

- 💰 **Supply & Earn Interest** - Deposit crypto assets and earn yield
- 🏦 **Collateralized Borrowing** - Borrow against your deposited assets
- ⚡ **Flash Loans** - Uncollateralized instant loans
- 🦊 **MetaMask Integration** - All transactions via MetaMask wallet
- 📊 **Real-time APY** - Variable interest rates based on utilization
- 🎮 **Reputation System** - Gamified user engagement
- 🔐 **Secure** - OpenZeppelin contracts, user-controlled funds

## 🎯 Live Demo

1. **Start the blockchain:**

   ```bash
   npx hardhat node
   ```

2. **Deploy contracts:**

   ```bash
   npx hardhat run scripts/deploy.cjs --network localhost
   ```

3. **Start frontend:**

   ```bash
   npm run dev
   ```

4. **Open:** http://localhost:3000

## 🦊 MetaMask Setup

### Add Network:

```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

### Import Test Account:

```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

_This account has 10,000 test ETH for gas fees_

⚠️ **Note:** This is a PUBLIC test key. NEVER use on mainnet!

## 🚀 How to Use

1. **Connect Wallet** - Click "Connect Wallet" and approve in MetaMask
2. **Mint Tokens** - Get test tokens (DAI, USDC, WETH)
3. **Supply** - Deposit tokens and earn interest
4. **Borrow** - Borrow against your collateral
5. **Repay** - Pay back loans and unlock collateral

## 💡 Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, TailwindCSS
- **Smart Contracts:** Solidity 0.8.20, OpenZeppelin
- **Blockchain:** Hardhat (local development)
- **Web3:** Ethers.js v5, MetaMask
- **Deployment:** Can deploy to Ethereum, Polygon, Arbitrum, etc.

## 📋 Project Structure

````
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main UI component
│   └── layout.tsx         # App layout
├── contracts/             # Solidity smart contracts
│   ├── LendingPool.sol    # Main lending logic
│   ├── MockERC20.sol      # Test tokens
│   └── *.sol              # Other contracts
├── scripts/               # Deployment scripts
│   └── deploy.cjs         # Contract deployment
├── lib/                   # Frontend utilities
│   ├── blockchain.ts      # Web3 interactions
│   └── contracts.ts       # Contract ABIs & addresses
└── components/            # UI components

## 🔧 Troubleshooting

### "Confirm" Button Not Working in MetaMask?

**Problem:** Button shows "Review alert" instead of "Confirm"
**Solution:** Import the test account (see MetaMask Setup above)

**Why:** Your current account has no ETH for gas fees. The test account has 10,000 ETH.

### Detailed Fix:
See `FIX_NOW.md` for step-by-step instructions.

## 🎓 Educational Purpose

This project demonstrates:
- Smart contract development (Solidity)
- DeFi protocols (lending, borrowing, flash loans)
- Web3 wallet integration (MetaMask)
- Full-stack dApp development
- Blockchain security best practices

## 🌟 Features Comparison

| Feature | This Project | Aave | Compound |
|---------|--------------|------|----------|
| Supply & Earn | ✅ | ✅ | ✅ |
| Borrow | ✅ | ✅ | ✅ |
| Flash Loans | ✅ | ✅ | ❌ |
| Variable APY | ✅ | ✅ | ✅ |
| MetaMask | ✅ | ✅ | ✅ |
| Reputation | ✅ | ❌ | ❌ |

## 📝 Smart Contracts

### LendingPool.sol
Main contract handling deposits, withdrawals, borrows, and repayments.

### VariableInterestRateModel.sol
Calculates interest rates based on pool utilization.

### MockERC20.sol
Test ERC20 tokens for demonstration.

### FlashLoanReceiver.sol
Example flash loan receiver contract.

## 🔐 Security

- ✅ OpenZeppelin audited libraries
- ✅ Two-step approval process (approve + execute)
- ✅ Overcollateralized loans (prevent defaults)
- ✅ User controls funds via MetaMask
- ✅ On-chain transparency

## 🚀 Deployment

### Local (Hardhat):
```bash
npx hardhat run scripts/deploy.cjs --network localhost
````

### Testnet (Sepolia):

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

### Mainnet:

Update `hardhat.config.cjs` with mainnet RPC and deploy.

## 📊 Contract Addresses (Local)

After deployment, addresses are saved in `deployment.json`:

- Lending Pool
- DAI Token
- USDC Token
- WETH Token
- Interest Rate Model
- Flash Loan Receiver

## 🎬 Demo Video

[To be added - Record your demo and add link here]

## 📸 Screenshots

[To be added - Add screenshots of your UI]

## 🤝 Contributing

This is a college project for educational purposes.

## 📄 License

MIT License - Feel free to use for learning!

## 👨‍💻 Author

Kumar Swamy G

- GitHub: [@kumarswamyg2005](https://github.com/kumarswamyg2005)
- Project: [lending-portal](https://github.com/kumarswamyg2005/lending-portal)

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Hardhat for development environment
- Aave & Compound for DeFi inspiration
- Next.js team for the amazing framework

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [MetaMask Docs](https://docs.metamask.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

## ⚡ Quick Start Commands

```bash
# Install dependencies
npm install

# Start Hardhat node
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.cjs --network localhost

# Start frontend (in another terminal)
npm run dev

# Open browser
# http://localhost:3000
```

---

**Built with ❤️ for DeFi education**

**Ready to demo? See `PUBLISH_READY.md` for complete presentation guide!**
