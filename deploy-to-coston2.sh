#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║      🛡️  FlareShield Deployment to Coston2 Testnet 🛡️        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if keystore exists
if [ ! -f ~/.foundry/keystores/my-account ]; then
    echo "❌ Keystore 'my-account' not found!"
    exit 1
fi

echo "📝 Step 1: Extracting private key from keystore..."
echo "You will be prompted for your keystore password."
echo ""

# Decrypt keystore
PRIVATE_KEY=$(cast wallet decrypt-keystore ~/.foundry/keystores/my-account)

if [ $? -ne 0 ]; then
    echo "❌ Failed to decrypt keystore"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ No private key extracted"
    exit 1
fi

echo "✅ Private key extracted successfully"
echo ""

# Get wallet address
WALLET_ADDRESS=$(cast wallet address --private-key "$PRIVATE_KEY")
echo "👤 Deploying from: $WALLET_ADDRESS"
echo ""

# Check balance
echo "💰 Checking balance on Coston2..."
BALANCE=$(cast balance $WALLET_ADDRESS --rpc-url https://coston2-api.flare.network/ext/C/rpc)
BALANCE_ETH=$(cast --from-wei $BALANCE)
echo "Balance: $BALANCE_ETH C2FLR"
echo ""

if [ "$BALANCE" = "0" ]; then
    echo "⚠️  WARNING: Your balance is 0!"
    echo "Get testnet tokens from: https://faucet.flare.network/"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🚀 Step 2: Deploying contracts to Coston2..."
echo ""

# Deploy using Hardhat
PRIVATE_KEY=$PRIVATE_KEY npx hardhat run scripts/deploy.js --network coston2

DEPLOY_STATUS=$?

# Clear private key from memory
PRIVATE_KEY=""

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║            ✅ Deployment Successful! ✅                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📁 Deployment info saved to:"
    echo "   - deployments/coston2.json"
    echo "   - frontend/src/config/contracts.json"
    echo ""
    echo "🌐 Next steps:"
    echo "   1. cd frontend && npm install"
    echo "   2. npm run dev"
else
    echo "❌ Deployment failed"
    exit 1
fi
