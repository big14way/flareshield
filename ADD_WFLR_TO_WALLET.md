# How to See Your WFLR in MetaMask

## ✅ Good News: You Have WFLR!

Your wallet has **40 WFLR tokens**, but MetaMask doesn't show them automatically. You need to add the token manually.

## Quick Steps to Add WFLR to MetaMask

### Step 1: Open MetaMask
- Make sure you're connected to **Coston2 Testnet**

### Step 2: Add Custom Token

1. Click on **"Assets"** tab in MetaMask
2. Scroll down and click **"Import tokens"**
3. Click **"Custom token"** tab
4. Enter the following details:

```
Token Contract Address: 0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273
Token Symbol: WFLR
Token Decimal: 18
```

5. Click **"Add Custom Token"**
6. Click **"Import Tokens"**

### Step 3: See Your Balance!

You should now see **40 WFLR** in your MetaMask wallet! 🎉

## Alternative: Quick Import Link

If your MetaMask supports it, you can also add the token by visiting:
```
https://coston2-explorer.flare.network/token/0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273
```

Then click "Add to MetaMask" button on the token page.

## Verify Your Balance

You can always verify your WFLR balance on-chain:

```bash
cast call 0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273 "balanceOf(address)(uint256)" YOUR_ADDRESS --rpc-url https://coston2-api.flare.network/ext/C/rpc
```

Or check on the block explorer:
```
https://coston2-explorer.flare.network/address/0x3C343AD077983371b29fee386bdBC8a92E934C51
```

## Your Current Balance

- **WFLR Balance**: 40 WFLR ✅
- **Token Address**: 0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273
- **Network**: Coston2 Testnet (Chain ID: 114)

## Next Steps

Now that you have WFLR tokens:

1. ✅ Add WFLR to MetaMask (follow steps above)
2. ✅ Open http://localhost:3000
3. ✅ Connect your wallet
4. ✅ Add liquidity to FlareShield!
5. ✅ Purchase insurance policies
6. ✅ Test the protocol

## Troubleshooting

**Still not showing?**
- Make sure you're on Coston2 network (Chain ID: 114)
- Double-check the contract address
- Try refreshing MetaMask
- Check your address on the block explorer to confirm

**Wrong balance?**
- Refresh the page
- Switch networks back and forth
- Clear MetaMask cache

---

**Your WFLR is safe on-chain!** MetaMask just needs to be told to display it.
