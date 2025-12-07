const hre = require("hardhat");

async function main() {
  const network = hre.network.name;

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║              💰 Add Liquidity to FlareShield 💰              ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`📍 Network: ${network}`);

  // Get signer
  let signer;
  try {
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
      console.error("❌ No signer available. Make sure PRIVATE_KEY is set.");
      process.exit(1);
    }
    signer = signers[0];
  } catch (error) {
    console.error("❌ Error getting signer:", error.message);
    process.exit(1);
  }

  console.log(`👤 Account: ${signer.address}`);
  console.log();

  // Load deployment info
  const deploymentPath = `./deployments/${network}.json`;
  let deployment;
  try {
    deployment = require(`../${deploymentPath}`);
  } catch (error) {
    console.error(`❌ No deployment found for ${network}`);
    console.error(`   Expected file: ${deploymentPath}`);
    process.exit(1);
  }

  const flareShieldAddress = deployment.contracts.FlareShield;
  const wflrAddress = deployment.contracts.WFLR;

  console.log(`🛡️  FlareShield: ${flareShieldAddress}`);
  console.log(`🪙 WFLR: ${wflrAddress}`);
  console.log();

  // Get contracts
  const wflr = await hre.ethers.getContractAt("MockWFLR", wflrAddress);
  const flareShield = await hre.ethers.getContractAt("FlareShield", flareShieldAddress);

  // Check WFLR balance
  const wflrBalance = await wflr.balanceOf(signer.address);
  console.log(`💰 Your WFLR Balance: ${hre.ethers.formatEther(wflrBalance)}`);

  // Get amount from environment or default to 20
  const amount = process.env.LIQUIDITY_AMOUNT || "20";
  const amountWei = hre.ethers.parseEther(amount);

  if (amountWei > wflrBalance) {
    console.error(`❌ Insufficient WFLR. You have ${hre.ethers.formatEther(wflrBalance)} but trying to add ${amount}`);
    process.exit(1);
  }

  console.log(`📊 Adding ${amount} WFLR to liquidity pool...`);
  console.log();

  try {
    // Check allowance
    const allowance = await wflr.allowance(signer.address, flareShieldAddress);

    if (allowance < amountWei) {
      console.log("🔓 Approving WFLR spending...");
      const approveTx = await wflr.approve(flareShieldAddress, hre.ethers.MaxUint256);
      console.log(`   Transaction: ${approveTx.hash}`);
      await approveTx.wait();
      console.log("   ✅ Approved!");
      console.log();
    }

    // Add liquidity
    console.log("💧 Adding liquidity...");
    const tx = await flareShield.addLiquidity(amountWei);
    console.log(`   Transaction: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`   ✅ Liquidity added in block ${receipt.blockNumber}`);
    console.log();

    // Get pool stats
    const [totalLiq, totalCov, availLiq, utilRate] = await flareShield.getPoolStats();

    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                  ✅ Success! ✅                               ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log();
    console.log("📊 Pool Statistics:");
    console.log(`   Total Liquidity: ${hre.ethers.formatEther(totalLiq)} WFLR`);
    console.log(`   Available: ${hre.ethers.formatEther(availLiq)} WFLR`);
    console.log(`   Total Coverage: ${hre.ethers.formatEther(totalCov)} WFLR`);
    console.log(`   Utilization: ${Number(utilRate) / 100}%`);
    console.log();

    // Get your position
    const [lpAmount, depositTime, rewardsEarned, pendingRewards] =
      await flareShield.getLiquidityPosition(signer.address);

    console.log("💼 Your Liquidity Position:");
    console.log(`   Amount: ${hre.ethers.formatEther(lpAmount)} WFLR`);
    console.log(`   Rewards Earned: ${hre.ethers.formatEther(rewardsEarned)} WFLR`);
    console.log(`   Pending Rewards: ${hre.ethers.formatEther(pendingRewards)} WFLR`);
    console.log();

    console.log("🎉 You can now purchase insurance policies!");
    console.log("   Visit: http://localhost:3000");

  } catch (error) {
    console.error("❌ Error adding liquidity:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
