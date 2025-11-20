#!/bin/bash

echo "🚀 Setting up Hardhat node and minting tokens..."

# Check if node is running
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Hardhat node is not running!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Open a NEW terminal window"
    echo "2. Run: npx hardhat node"
    echo "3. Keep that terminal running"
    echo "4. Come back to this terminal and run this script again"
    echo ""
    exit 1
fi

echo "✅ Hardhat node is running"
echo ""

# Deploy contracts
echo "📦 Deploying contracts..."
npx hardhat run scripts/deploy.cjs --network localhost

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Contracts deployed successfully"
echo ""

# Mint tokens
echo "🪙 Minting DAI tokens..."
node test-mint.cjs

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All done! Tokens minted successfully!"
else
    echo ""
    echo "❌ Minting failed. Check the error above."
    exit 1
fi
