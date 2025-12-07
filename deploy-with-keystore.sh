#!/bin/bash

echo "Getting wallet address from keystore..."
DEPLOYER_ADDRESS=$(cast wallet address --account my-account --password-file <(echo "$KEYSTORE_PASSWORD"))

echo "Deployer address: $DEPLOYER_ADDRESS"
echo ""
echo "To deploy, you need to run:"
echo "forge script script/Deploy.s.sol --rpc-url https://coston2-api.flare.network/ext/C/rpc --account my-account --sender $DEPLOYER_ADDRESS --broadcast"
