#!/bin/bash

# 🚀 Sepolia Deployment Setup Script
# This script will guide you through deploying to Sepolia testnet

echo "🚀 DeFi Lending Platform - Sepolia Deployment Setup"
echo "===================================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ Found existing .env file"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env file with your credentials!"
    echo ""
fi

echo "📋 What you need before deploying:"
echo ""
echo "1. ��� Sepolia Test ETH in your MetaMask wallet"
echo "   Get free ETH at: https://sepoliafaucet.com"
echo "   You need at least 0.5 ETH for deployment"
echo ""
echo "2. 🔑 Your MetaMask Private Key"
echo "   - Open MetaMask"
echo "   - Click your account"
echo "   - ⋮ Menu → Account Details → Export Private Key"
echo "   - ⚠️  NEVER share this with anyone!"
echo ""
echo "3. 🌐 Infura or Alchemy API Key (FREE)"
echo "   - Visit: https://infura.io (or https://alchemy.com)"
echo "   - Sign up for free account"
echo "   - Create new project"
echo "   - Copy Sepolia endpoint URL"
echo ""

read -p "Do you have all three items ready? (y/n): " ready

if [ "$ready" != "y" ]; then
    echo ""
    echo "📚 Please gather the required items first:"
    echo "   1. Get Sepolia ETH: https://sepoliafaucet.com"
    echo "   2. Export private key from MetaMask"
    echo "   3. Get Infura key: https://infura.io"
    echo ""
    echo "Then run this script again!"
    exit 0
fi

echo ""
echo "✏️  Now edit the .env file:"
echo ""
echo "   code .env"
echo "   # or"
echo "   nano .env"
echo ""
echo "Update these values:"
echo "   PRIVATE_KEY=your_actual_private_key_without_0x"
echo "   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_actual_api_key"
echo ""

read -p "Have you updated .env file? (y/n): " updated

if [ "$updated" != "y" ]; then
    echo ""
    echo "Please update .env file first, then run:"
    echo "   ./setup-sepolia.sh"
    exit 0
fi

echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Run this command to deploy to Sepolia:"
echo ""
echo "   npx hardhat run scripts/deploy.cjs --network sepolia"
echo ""
echo "This will:"
echo "   ✅ Deploy all smart contracts to Sepolia testnet"
echo "   ✅ Create deployment.json with contract addresses"
echo "   ✅ Take ~2-5 minutes"
echo "   ✅ Cost ~$20-50 in test ETH (free from faucet)"
echo ""

read -p "Deploy now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ]; then
    echo ""
    echo "🚀 Deploying to Sepolia..."
    echo ""
    npx hardhat run scripts/deploy.cjs --network sepolia
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📝 Next steps:"
    echo ""
    echo "1. Check deployment.json for contract addresses"
    echo "2. Add environment variables to Vercel:"
    echo "   - Go to: https://vercel.com/dashboard"
    echo "   - Your project → Settings → Environment Variables"
    echo "   - Copy addresses from deployment.json"
    echo ""
    echo "3. See .env.vercel.example for the variables to add"
    echo ""
    echo "4. Redeploy on Vercel to apply changes"
    echo ""
else
    echo ""
    echo "👍 No problem! When you're ready, run:"
    echo "   npx hardhat run scripts/deploy.cjs --network sepolia"
    echo ""
fi

echo "📚 For detailed instructions, see: FIX_VERCEL_RPC.md"
echo ""
