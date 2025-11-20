#!/bin/bash

# Check if Hardhat node is already running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Hardhat node is already running on port 8545"
    exit 0
else
    echo "🚀 Starting Hardhat node..."
    npx hardhat node
fi
