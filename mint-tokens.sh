#!/bin/bash

echo "🚀 Complete Setup Script"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the account from user
echo "Which account are you using in MetaMask?"
echo "1) Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "2) Other account (I'll enter it)"
read -p "Choose (1 or 2): " choice

if [ "$choice" = "1" ]; then
    ACCOUNT="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
else
    read -p "Enter your account address: " ACCOUNT
fi

echo ""
echo "${BLUE}Using account: $ACCOUNT${NC}"
echo ""

# Mint tokens
echo "${BLUE}📝 Minting 1000 DAI, USDC, and WETH to your account...${NC}"

node << EOF
const hre = require("hardhat");
const deployment = require("./deployment.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const tokens = [
    { name: "DAI", address: deployment.DAI },
    { name: "USDC", address: deployment.USDC },
    { name: "WETH", address: deployment.WETH }
  ];
  
  for (const token of tokens) {
    console.log(\`Minting 1000 \${token.name}...\`);
    const tokenContract = await hre.ethers.getContractAt("MockERC20", token.address);
    const amount = hre.ethers.utils.parseEther("1000");
    const tx = await tokenContract.mint("$ACCOUNT", amount);
    await tx.wait();
    console.log(\`✅ Minted 1000 \${token.name}\`);
  }
  
  console.log("\\n✅ All tokens minted successfully!");
}

main().catch(console.error);
EOF

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Make sure MetaMask is connected to 'Localhost 8545'"
echo "2. Import the account if needed (or it should already have 10000 ETH)"
echo "3. Refresh your browser at http://localhost:3000"
echo "4. Click 'Connect Wallet'"
echo "5. Try minting more tokens or supplying assets!"
echo ""
