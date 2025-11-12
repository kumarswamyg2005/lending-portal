#!/bin/bash

# Colors
GREEN='\033[0.32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting DeFi Lending Platform Setup...${NC}\n"

# Step 1: Start Hardhat node
echo -e "${BLUE}1️⃣  Starting Hardhat local blockchain...${NC}"
cd "/Users/kumaraswamy/Downloads/code (1)"
npx hardhat node > /tmp/hardhat-node.log 2>&1 &
NODE_PID=$!
echo "   Node PID: $NODE_PID"

# Wait for node to start
echo "   Waiting for node to start..."
sleep 5

# Check if node is running
if lsof -i :8545 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Hardhat node is running on http://127.0.0.1:8545${NC}\n"
else
    echo -e "${RED}   ❌ Failed to start Hardhat node${NC}"
    exit 1
fi

# Step 2: Deploy contracts
echo -e "${BLUE}2️⃣  Deploying smart contracts...${NC}"
npx hardhat run scripts/deploy-direct.ts --network localhost

# Check deployment result
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment successful!${NC}"
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "   1. Keep the Hardhat node running (PID: $NODE_PID)"
    echo "   2. Configure MetaMask:"
    echo "      - Network: Localhost 8545"
    echo "      - RPC URL: http://127.0.0.1:8545"
    echo "      - Chain ID: 31337"
    echo "   3. Import test account with private key:"
    echo "      0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo "   4. Start the frontend: pnpm run dev"
    echo -e "\n${BLUE}To stop the node later: kill $NODE_PID${NC}"
else
    echo -e "\n${RED}❌ Deployment failed${NC}"
    kill $NODE_PID
    exit 1
fi
