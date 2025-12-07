# 🧪 FlareShield Testing Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js v18+** installed ([download](https://nodejs.org/))
- **Git** installed
- **MetaMask** browser extension ([download](https://metamask.io/))

## Quick Start (5 Minutes)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd flareshield

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Start Local Blockchain

Open **Terminal 1**:
```bash
npx hardhat node
```

You'll see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

**Keep this terminal running!**

### Step 3: Deploy Contracts

Open **Terminal 2**:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
╔══════════════════════════════════════════════════════════════╗
║           🛡️  FlareShield Deployment Script 🛡️               ║
╚══════════════════════════════════════════════════════════════╝

📍 Network: localhost
👤 Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Balance: 10000.0 FLR/ETH

📦 Deploying Mock Contracts for Local Testing...
────────────────────────────────────────────────────────────────
✅ MockFtsoV2 deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ MockFdcHub deployed: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ MockWFLR deployed: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

🛡️  Deploying FlareShield Insurance Protocol...
────────────────────────────────────────────────────────────────
✅ FlareShield deployed: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

🪙 Setting up test tokens...
   Minted 100,000 WFLR to deployer
   Approved FlareShield for token spending
   Added 50,000 WFLR initial liquidity to pool

╔══════════════════════════════════════════════════════════════╗
║               ✅ Deployment Complete! ✅                      ║
╚══════════════════════════════════════════════════════════════╝
```

**📝 Note the contract addresses! You'll need them for testing.**

### Step 4: Configure MetaMask

1. Open MetaMask
2. Click the network dropdown → "Add Network" → "Add a network manually"
3. Enter:
   - **Network Name**: Localhost 8545
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
4. Click "Save"
5. Import an account:
   - Click your account icon → "Import Account"
   - Paste a private key from Terminal 1 (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)

### Step 5: Start Frontend

Open **Terminal 3**:
```bash
cd frontend
npm run dev
```

Open your browser to **http://localhost:3000**

---

## Testing Workflows

### Test 1: Connect Wallet
1. Click "Connect Wallet" in the header
2. MetaMask popup appears
3. Select your imported account
4. Approve the connection
5. ✅ **Expected**: Your address and balance appear in the header

### Test 2: View Pool Stats
1. Look at the stats bar below the hero
2. ✅ **Expected**: Shows "50,000 WFLR" Total Value Locked

### Test 3: Buy Insurance Policy
1. Click "Buy Protection" tab (default)
2. Click "Get Protection" on "Price Drop" card
3. In the modal:
   - Select asset: **BTC**
   - Coverage: **1000** WFLR
   - Duration: **30** days
   - Leave strike price empty (uses 90% of current)
4. Click "Purchase Policy"
5. Confirm in MetaMask
6. ✅ **Expected**: Success toast appears

### Test 4: View Your Policies
1. Click "My Policies" tab
2. ✅ **Expected**: See your new policy with "Active" status

### Test 5: Simulate Price Crash
Open **Terminal 4** (Hardhat console):
```bash
npx hardhat console --network localhost
```

In the console:
```javascript
// Get the MockFtsoV2 contract
const ftso = await ethers.getContractAt("MockFtsoV2", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

// Check current BTC price (should be $105,000)
const price = await ftso.prices("0x014254432f55534400000000000000000000000000")
console.log("Current BTC price:", price.toString()) // 10500000000 (with 5 decimals)

// Simulate a 20% crash
await ftso.simulateCrash("0x014254432f55534400000000000000000000000000", 20)

// Verify new price (~$84,000)
const newPrice = await ftso.prices("0x014254432f55534400000000000000000000000000")
console.log("New BTC price:", newPrice.toString()) // Should be ~8400000000
```

### Test 6: Claim Payout
1. Refresh the frontend
2. Go to "My Policies" tab
3. ✅ **Expected**: Policy shows "Claimable!" status with yellow highlight
4. Click "Claim Now" button
5. Confirm in MetaMask
6. ✅ **Expected**: Success toast, policy status changes to "Claimed"

### Test 7: Provide Liquidity
1. Click "Provide Liquidity" tab
2. Click "Add Liquidity" button
3. Enter amount: **5000** WFLR
4. Click "Add Liquidity"
5. Confirm in MetaMask
6. ✅ **Expected**: Your position shows 5,000 WFLR deposited

### Test 8: View Oracle Prices
1. Click "Price Oracle" tab
2. ✅ **Expected**: See 7 assets with prices
3. Click "Refresh" button
4. ✅ **Expected**: Prices update (timestamps change)

---

## Running Automated Tests

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Run specific test file
npx hardhat test test/FlareShield.test.js

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run test:coverage
```

### Expected Test Output
```
  FlareShield
    Liquidity Management
      ✓ Should allow adding liquidity (45ms)
      ✓ Should allow removing liquidity when available (52ms)
      ✓ Should calculate rewards over time (89ms)
    Policy Purchase
      ✓ Should allow purchasing a price drop policy (67ms)
      ✓ Should calculate correct premium
      ✓ Should reject policy if insufficient liquidity
      ✓ Should reject policy with coverage too low
    Policy Claims
      ✓ Should allow claiming when trigger condition met (78ms)
      ✓ Should reject claim when trigger not met
      ✓ Should reject claim from non-holder
      ✓ Should not allow double claims
    Depeg Protection
      ✓ Should trigger on stablecoin depeg (65ms)
    View Functions
      ✓ Should return correct pool stats
      ✓ Should return current price from FTSO
    Admin Functions
      ✓ Should allow owner to update reward rate
      ✓ Should reject non-owner admin calls
      ✓ Should reject excessive reward rate

  17 passing (3s)
```

---

## Deploy to Coston2 Testnet

### Step 1: Get Testnet Tokens
1. Go to https://faucet.flare.network/coston2
2. Enter your wallet address
3. Request C2FLR tokens

### Step 2: Configure Environment
```bash
# Copy example env
cp .env.example .env

# Edit .env and add your private key
# PRIVATE_KEY=your_private_key_here (without 0x prefix)
```

### Step 3: Deploy
```bash
npm run deploy:coston2
```

### Step 4: Configure MetaMask for Coston2
- **Network Name**: Flare Coston2
- **RPC URL**: `https://coston2-api.flare.network/ext/C/rpc`
- **Chain ID**: `114`
- **Currency Symbol**: `C2FLR`
- **Explorer**: `https://coston2-explorer.flare.network`

---

## Troubleshooting

### "Nonce too high" Error
```bash
# In MetaMask: Settings → Advanced → Clear activity tab data
```

### "Insufficient funds" Error
- Make sure you imported an account from Hardhat node
- Each account has 10,000 ETH for testing

### Frontend Not Loading Contracts
- Check that `frontend/src/config/contracts.json` exists
- It's auto-generated by the deploy script
- Re-run deployment if missing

### "Transaction reverted" Error
- Check you have enough WFLR tokens
- Ensure pool has liquidity for policy coverage
- Verify contract addresses match deployment output

### MetaMask Not Connecting
- Ensure you're on the correct network (localhost:8545 or Coston2)
- Try disconnecting and reconnecting
- Clear MetaMask cache if needed

---

## Demo Commands Cheatsheet

```bash
# Start everything (3 terminals)
Terminal 1: npx hardhat node
Terminal 2: npx hardhat run scripts/deploy.js --network localhost
Terminal 3: cd frontend && npm run dev

# Hardhat console commands
npx hardhat console --network localhost

# Get contracts
const ftso = await ethers.getContractAt("MockFtsoV2", "<address>")
const shield = await ethers.getContractAt("FlareShield", "<address>")
const wflr = await ethers.getContractAt("MockWFLR", "<address>")

# Check prices
await ftso.prices("0x014254432f55534400000000000000000000000000") // BTC
await ftso.prices("0x01555344432f555344000000000000000000000000") // USDC

# Simulate crashes
await ftso.simulateCrash("0x014254432f55534400000000000000000000000000", 20) // 20% BTC crash
await ftso.simulateDepeg("0x01555344432f555344000000000000000000000000") // USDC depeg

# Reset prices
await ftso.resetPrices()

# Check pool stats
await shield.getPoolStats()

# Get policy details
await shield.getPolicy(0)
```

---

## What Success Looks Like

After completing all tests, you should have:

✅ Connected wallet showing address & balance  
✅ At least one policy purchased  
✅ Successfully claimed a policy after price crash  
✅ Liquidity position with pending rewards  
✅ All 17 automated tests passing  
✅ Understanding of the full user journey  

---

*Happy testing! 🛡️*
