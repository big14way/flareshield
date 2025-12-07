#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║      🛡️  FlareShield Deployment to Coston2 Testnet 🛡️        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if keystore exists
if [ ! -f ~/.foundry/keystores/my-account ]; then
    echo "❌ Keystore 'my-account' not found!"
    exit 1
fi

echo "🔑 Extracting private key from keystore..."
echo "Enter your keystore password:"

# Decrypt keystore - this will prompt for password interactively
PRIVATE_KEY=$(cast wallet decrypt-keystore ~/.foundry/keystores/my-account)

if [ $? -ne 0 ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Failed to decrypt keystore"
    exit 1
fi

echo "✅ Private key extracted successfully"
echo ""

# Get wallet address
WALLET_ADDRESS=$(echo "$PRIVATE_KEY" | cast wallet address --private-key-stdin)
echo "👤 Deploying from: $WALLET_ADDRESS"
echo ""

# Check balance on Coston2
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
        PRIVATE_KEY=""
        exit 1
    fi
fi

echo "🚀 Deploying contracts to Coston2..."
echo ""

# Deploy using Hardhat with the extracted private key
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
    echo "🌐 View your deployment:"
    if [ -f deployments/coston2.json ]; then
        FLARESHIELD_ADDR=$(cat deployments/coston2.json | grep -o '"FlareShield": "[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$FLARESHIELD_ADDR" ]; then
            echo "   https://coston2-explorer.flare.network/address/$FLARESHIELD_ADDR"
        fi
    fi
    echo ""
    echo "✅ Frontend is ready at: http://localhost:3000"
else
    echo "❌ Deployment failed"
    exit 1
fi
