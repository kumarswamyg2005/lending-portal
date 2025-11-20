#!/bin/bash

echo "🚀 Complete Hardhat Setup and Token Minting"
echo "==========================================="
echo ""

# Step 1: Check if Hardhat node is running
echo "📡 Step 1: Checking Hardhat node..."
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Hardhat node is NOT running!"
    echo ""
    echo "Starting Hardhat node in background..."
    npx hardhat node > hardhat-node.log 2>&1 &
    NODE_PID=$!
    echo "✅ Hardhat node started (PID: $NODE_PID)"
    echo "📝 Logs are being written to hardhat-node.log"
    
    # Wait for node to be ready
    echo "⏳ Waiting for node to be ready..."
    sleep 3
    
    STARTED_NODE=true
    
    # Better readiness check
    MAX_RETRIES=10
    RETRY=0
    while [ $RETRY -lt $MAX_RETRIES ]; do
        if curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            http://127.0.0.1:8545 > /dev/null 2>&1; then
            echo "✅ Node is ready!"
            break
        fi
        RETRY=$((RETRY + 1))
        sleep 1
    done
    
    if [ $RETRY -eq $MAX_RETRIES ]; then
        echo "❌ Node failed to start properly"
        kill $NODE_PID 2>/dev/null
        exit 1
    fi
else
    echo "✅ Hardhat node is already running"
    STARTED_NODE=false
fi

echo ""

# Step 2: Deploy contracts
echo "📦 Step 2: Deploying contracts..."
sleep 1  # Give node a moment to settle
npx hardhat run scripts/deploy.cjs --network localhost

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    
    if [ "$STARTED_NODE" = true ]; then
        echo "🛑 Stopping Hardhat node..."
        kill $NODE_PID 2>/dev/null
    fi
    
    exit 1
fi

echo "✅ Contracts deployed successfully!"
echo ""

# Give contracts a moment to settle
sleep 1

# Step 3: Mint tokens
echo "🪙 Step 3: Minting DAI tokens..."
node test-mint.cjs

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! All operations completed!"
    echo ""
    
    if [ "$STARTED_NODE" = true ]; then
        echo "ℹ️  Hardhat node is running in background (PID: $NODE_PID)"
        echo "   To stop it: kill $NODE_PID"
        echo "   View logs: tail -f hardhat-node.log"
    fi
else
    echo ""
    echo "❌ Minting failed. Check the error above."
    
    if [ "$STARTED_NODE" = true ]; then
        echo "🛑 Stopping Hardhat node..."
        kill $NODE_PID 2>/dev/null
    fi
    
    exit 1
fi
