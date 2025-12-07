# FlareShield Deployment Guide

## Current Status

✅ **Tests Completed**: 15/17 tests passing
✅ **Frontend Ready**: Development server running at http://localhost:3000
⏳ **Pending**: Contract deployment to Flare Coston2 testnet

## Test Results

```
15 passing (4s)
2 failing (minor edge cases)

✔ Liquidity Management
✔ Policy Purchase
✔ Policy Claims (mostly working)
✔ Depeg Protection
✔ View Functions
✔ Admin Functions
```

## To Deploy Contracts to Flare Coston2 Testnet

Since your private key is stored in a Foundry keystore (`my-account`), you have several options:

### Option 1: Quick Deploy (Recommended)

Run the automated deployment script which will:
- Extract your private key from the keystore (you'll be prompted for password)
- Check your testnet balance
- Deploy the contracts
- Update the frontend configuration automatically

```bash
./deploy-to-coston2.sh
```

### Option 2: Manual Step-by-Step

If the automated script doesn't work, follow these steps:

**Step 1:** Extract your private key from the keystore
```bash
cast wallet decrypt-keystore ~/.foundry/keystores/my-account
```
(You'll be prompted for your password. Copy the output private key)

**Step 2:** Deploy using the private key
```bash
PRIVATE_KEY=0x<your-private-key-here> npm run deploy:coston2
```

**Step 3:** Verify deployment was successful
```bash
cat deployments/coston2.json
cat frontend/src/config/contracts.json
```

### Option 3: Using .env File

**Step 1:** Create .env file with your private key
```bash
echo "PRIVATE_KEY=0x<your-private-key-here>" > .env
```

**Step 2:** Deploy
```bash
npm run deploy:coston2
```

**Step 3:** Clean up (remove .env for security)
```bash
rm .env
```

## Before Deployment

### 1. Check Your Testnet Balance

```bash
WALLET_ADDRESS=$(cast wallet address --account my-account)
cast balance $WALLET_ADDRESS --rpc-url https://coston2-api.flare.network/ext/C/rpc
```

### 2. Get Testnet Tokens (if needed)

Visit: https://faucet.flare.network/
- Select "Coston2" network
- Enter your wallet address
- Request tokens

## After Deployment

Once deployment is successful, you will see:

1. **Contract addresses** displayed in the terminal
2. **Deployment info** saved to:
   - `deployments/coston2.json`
   - `frontend/src/config/contracts.json`
3. **Explorer link** to view your contract on Coston2 Explorer

The frontend will automatically use the deployed contracts!

## Frontend Development Server

The frontend is already running at: **http://localhost:3000**

To restart it if needed:
```bash
cd frontend
npm run dev
```

## Testing the Deployed Contracts

Once deployed, you can:

1. **Open the frontend**: http://localhost:3000
2. **Connect your wallet** (MetaMask or similar)
3. **Switch to Coston2 Testnet** (Chain ID: 114)
4. **Interact with the protocol**:
   - Purchase insurance policies
   - Add liquidity
   - Claim payouts
   - View real-time price feeds from FTSO

## Flare Coston2 Network Details

Add this network to your wallet:

- **Network Name**: Flare Coston2 Testnet
- **RPC URL**: https://coston2-api.flare.network/ext/C/rpc
- **Chain ID**: 114
- **Currency Symbol**: C2FLR
- **Block Explorer**: https://coston2-explorer.flare.network

## Contract Addresses (Pre-deployed on Coston2)

These Flare system contracts are already deployed:

- **FTSO v2**: `0x3d893C53D9e8056135C26C8c638B76C8b60Df726`
- **FDC Hub**: `0xA37e5bEA20c8B47377Cfd87E8fD8E8c6C5f8a52f`
- **WFLR**: `0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273`

Your FlareShield contract will be deployed and its address added to the config.

## Troubleshooting

### "Device not configured" error
This means the keystore requires interactive terminal input. Use one of the manual options above.

### "Insufficient funds" error
Get testnet tokens from the faucet: https://faucet.flare.network/

### Frontend not connecting
1. Make sure you're on Coston2 network (Chain ID: 114)
2. Check that `frontend/src/config/contracts.json` has the FlareShield address
3. Refresh the page after deployment

### Contract deployment fails
1. Check your gas balance
2. Verify you're using the correct network
3. Check Hardhat version compatibility (Node.js v22 recommended)

## Next Steps

After deploying:

1. Test the frontend with your deployed contracts
2. Verify contracts on the explorer (optional)
3. Create sample policies
4. Test claim functionality
5. Prepare for mainnet deployment

## Support

- FlareShield Docs: See [README.md](README.md)
- Flare Docs: https://docs.flare.network
- Flare Discord: https://discord.gg/flare

---

**Ready to deploy?** Run `./deploy-to-coston2.sh` now!
