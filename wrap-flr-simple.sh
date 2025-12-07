#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 💰 Wrap FLR to WFLR 💰                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will wrap your C2FLR to WFLR tokens."
echo ""
echo "Enter your private key (it will not be displayed):"
read -s PRIVATE_KEY
echo ""

# Validate private key format
if [[ ! "$PRIVATE_KEY" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    echo "❌ Invalid private key format"
    echo "Expected: 0x followed by 64 hex characters"
    echo "Example: 0x1234567890abcdef..."
    exit 1
fi

echo "✅ Private key format is valid"
echo ""

# Get amount to wrap (default 10 FLR)
AMOUNT=${1:-10}

echo "🔄 Wrapping $AMOUNT C2FLR to WFLR..."
echo ""

# Run the wrapping script
PRIVATE_KEY=$PRIVATE_KEY WRAP_AMOUNT=$AMOUNT npx hardhat run scripts/wrap-flr.js --network coston2

# Clear private key from memory
PRIVATE_KEY=""
WRAP_AMOUNT=""

echo ""
echo "✅ Done! Check your WFLR balance in the frontend."
