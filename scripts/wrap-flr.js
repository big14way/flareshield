const hre = require("hardhat");

async function main() {
  const network = hre.network.name;

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                 💰 Wrap FLR to WFLR 💰                       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`📍 Network: ${network}`);

  // Get signer
  let signer;
  try {
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
      console.error("❌ No signer available. Make sure PRIVATE_KEY is set in environment.");
      console.error("   Run: PRIVATE_KEY=<your-key> npm run wrap:coston2");
      process.exit(1);
    }
    signer = signers[0];
  } catch (error) {
    console.error("❌ Error getting signer:", error.message);
    console.error("   Make sure PRIVATE_KEY is set in environment.");
    process.exit(1);
  }

  console.log(`👤 Account: ${signer.address}`);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`💰 C2FLR Balance: ${hre.ethers.formatEther(balance)}`);
  console.log();

  // WFLR address on Coston2
  const wflrAddress = "0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273";

  // WFLR ABI (just the deposit function)
  const wflrAbi = [
    "function deposit() payable",
    "function balanceOf(address) view returns (uint256)",
    "function withdraw(uint256) external"
  ];

  const wflr = new hre.ethers.Contract(wflrAddress, wflrAbi, signer);

  // Check current WFLR balance
  const wflrBalance = await wflr.balanceOf(signer.address);
  console.log(`🪙 Current WFLR Balance: ${hre.ethers.formatEther(wflrBalance)}`);
  console.log();

  // Amount to wrap (default 10 FLR, from environment variable or default)
  const amountToWrap = process.env.WRAP_AMOUNT || "10";
  const amountWei = hre.ethers.parseEther(amountToWrap);

  if (amountWei > balance) {
    console.error(`❌ Insufficient balance. You have ${hre.ethers.formatEther(balance)} FLR but trying to wrap ${amountToWrap} FLR`);
    process.exit(1);
  }

  console.log(`🔄 Wrapping ${amountToWrap} C2FLR to WFLR...`);

  try {
    const tx = await wflr.deposit({ value: amountWei });
    console.log(`📝 Transaction hash: ${tx.hash}`);

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log();

    // Check new balances
    const newBalance = await hre.ethers.provider.getBalance(signer.address);
    const newWflrBalance = await wflr.balanceOf(signer.address);

    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                    ✅ Success! ✅                             ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log();
    console.log("📊 New Balances:");
    console.log(`   C2FLR: ${hre.ethers.formatEther(newBalance)}`);
    console.log(`   WFLR:  ${hre.ethers.formatEther(newWflrBalance)}`);
    console.log();
    console.log("🎉 You can now add liquidity to FlareShield!");

  } catch (error) {
    console.error("❌ Error wrapping FLR:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
