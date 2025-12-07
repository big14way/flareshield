#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 💰 Wrap FLR to WFLR 💰                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if keystore exists
if [ ! -f ~/.foundry/keystores/my-account ]; then
    echo "❌ Keystore 'my-account' not found!"
    echo "Please create a keystore first or provide PRIVATE_KEY directly."
    exit 1
fi

echo "🔑 Decrypting keystore..."
echo "Enter your keystore password:"

# Decrypt keystore (stderr to /dev/null to ignore warnings)
PRIVATE_KEY=$(cast wallet decrypt-keystore ~/.foundry/keystores/my-account 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to decrypt keystore"
    echo "Please check your password and try again."
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ No private key extracted"
    exit 1
fi

# Remove any whitespace or newlines
PRIVATE_KEY=$(echo "$PRIVATE_KEY" | tr -d '[:space:]')

# Extract just the hex part if there's extra text
# Look for pattern: 0x followed by 64 hex characters
if [[ "$PRIVATE_KEY" =~ (0x[0-9a-fA-F]{64}) ]]; then
    PRIVATE_KEY="${BASH_REMATCH[1]}"
fi

# Check if it's a valid private key (should start with 0x and be 66 chars)
if [[ ! "$PRIVATE_KEY" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    echo "❌ Invalid private key format"
    echo "Expected: 0x followed by 64 hex characters"
    echo "Got: ${#PRIVATE_KEY} characters"
    exit 1
fi

echo "✅ Keystore decrypted successfully"
echo ""

# Get amount to wrap (default 10 FLR)
AMOUNT=${1:-10}

echo "🔄 Wrapping $AMOUNT C2FLR to WFLR..."
echo ""

# Run the wrapping script (pass amount via environment variable)
PRIVATE_KEY=$PRIVATE_KEY WRAP_AMOUNT=$AMOUNT npx hardhat run scripts/wrap-flr.js --network coston2

# Clear private key from memory
PRIVATE_KEY=""
WRAP_AMOUNT=""
