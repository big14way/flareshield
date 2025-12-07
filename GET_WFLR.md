# How to Get WFLR Tokens

## The Problem
You need WFLR (Wrapped FLR) tokens to add liquidity to FlareShield, but you only have C2FLR (native Coston2 tokens).

## The Solution
Wrap your C2FLR into WFLR using the WFLR contract!

## Quick Start

### Wrap 10 FLR to WFLR (Easiest Method):
```bash
./wrap-flr.sh
```

This will prompt for your keystore password and wrap 10 FLR.

### Wrap a custom amount (e.g., 50 FLR):
```bash
./wrap-flr.sh 50
```

## Alternative: Direct PRIVATE_KEY Method

If you have your private key directly:

```bash
PRIVATE_KEY=0x<your-64-char-hex-key> npm run wrap:coston2
```

Or wrap a custom amount:
```bash
PRIVATE_KEY=0x<your-key> npx hardhat run scripts/wrap-flr.js --network coston2 50
```

## What Happens?

1. ✅ Checks your C2FLR balance
2. ✅ Wraps the specified amount to WFLR
3. ✅ Shows your new balances
4. ✅ You can now add liquidity!

## Example Output

```
╔══════════════════════════════════════════════════════════════╗
║                 💰 Wrap FLR to WFLR 💰                       ║
╚══════════════════════════════════════════════════════════════╝

📍 Network: coston2
👤 Account: 0x3C343AD077983371b29fee386bdBC8a92E934C51
💰 C2FLR Balance: 89.87

🪙 Current WFLR Balance: 0.0

🔄 Wrapping 10 C2FLR to WFLR...
📝 Transaction hash: 0x...
⏳ Waiting for confirmation...
✅ Transaction confirmed in block 12345

╔══════════════════════════════════════════════════════════════╗
║                    ✅ Success! ✅                             ║
╚══════════════════════════════════════════════════════════════╝

📊 New Balances:
   C2FLR: 79.87
   WFLR:  10.0

🎉 You can now add liquidity to FlareShield!
```

## What is WFLR?

WFLR (Wrapped FLR) is an ERC-20 token that represents FLR (the native token). You need it because:
- FlareShield uses ERC-20 tokens for liquidity
- Native FLR cannot be transferred like ERC-20 tokens
- WFLR is 1:1 backed by FLR - you can always unwrap it back

## Unwrapping (Converting WFLR back to FLR)

If you ever need to convert WFLR back to native FLR:

```bash
PRIVATE_KEY=<your-key> npx hardhat run scripts/unwrap-flr.js --network coston2 <amount>
```

## Recommended Amounts

For testing FlareShield:
- **Minimum**: 5 WFLR (to add small liquidity)
- **Recommended**: 50-100 WFLR (to test multiple policies)
- **Safe**: Keep at least 5 C2FLR unwrapped for gas fees

## After Wrapping

Once you have WFLR:
1. Open http://localhost:3000
2. Connect your wallet
3. Go to "Add Liquidity"
4. Enter amount (you now have WFLR!)
5. Confirm the transaction

---

**Ready to wrap?** Run: `PRIVATE_KEY=$(cast wallet decrypt-keystore ~/.foundry/keystores/my-account) npm run wrap:coston2`
