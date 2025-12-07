const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║           🛡️  FlareShield Deployment Script 🛡️               ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`📍 Network: ${network}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} FLR/ETH`);
  console.log();

  // Contract addresses for different networks
  const networkConfig = {
    coston2: {
      ftsoV2: "0x3d893C53D9e8056135C26C8c638B76C8b60Df726", // FTSOv2 on Coston2
      fdcHub: "0xa37E5beA20c8B47377cfD87E8Fd8e8C6c5F8a52f", // FDC Hub on Coston2
      wflr: "0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273", // Wrapped FLR on Coston2
    },
    flare: {
      ftsoV2: "0x1000000000000000000000000000000000000003", // FTSOv2 on Flare Mainnet
      fdcHub: "0x1000000000000000000000000000000000000005", // FDC Hub on Flare Mainnet
      wflr: "0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d", // WFLR on Flare Mainnet
    },
    hardhat: {
      // Will deploy mocks
      ftsoV2: null,
      fdcHub: null,
      wflr: null,
    },
    localhost: {
      // Will deploy mocks
      ftsoV2: null,
      fdcHub: null,
      wflr: null,
    }
  };

  const config = networkConfig[network] || networkConfig.localhost;
  
  let ftsoV2Address, fdcHubAddress, wflrAddress;
  
  // Deploy mocks for local testing
  if (!config.ftsoV2) {
    console.log("📦 Deploying Mock Contracts for Local Testing...");
    console.log("─".repeat(60));
    
    // Deploy MockFtsoV2
    const MockFtsoV2 = await hre.ethers.getContractFactory("MockFtsoV2");
    const mockFtso = await MockFtsoV2.deploy();
    await mockFtso.waitForDeployment();
    ftsoV2Address = await mockFtso.getAddress();
    console.log(`✅ MockFtsoV2 deployed: ${ftsoV2Address}`);
    
    // Deploy MockFdcHub
    const MockFdcHub = await hre.ethers.getContractFactory("MockFdcHub");
    const mockFdc = await MockFdcHub.deploy();
    await mockFdc.waitForDeployment();
    fdcHubAddress = await mockFdc.getAddress();
    console.log(`✅ MockFdcHub deployed: ${fdcHubAddress}`);
    
    // Deploy MockWFLR
    const MockWFLR = await hre.ethers.getContractFactory("MockWFLR");
    const mockWflr = await MockWFLR.deploy();
    await mockWflr.waitForDeployment();
    wflrAddress = await mockWflr.getAddress();
    console.log(`✅ MockWFLR deployed: ${wflrAddress}`);
    
    console.log();
  } else {
    ftsoV2Address = config.ftsoV2;
    fdcHubAddress = config.fdcHub;
    wflrAddress = config.wflr;
    
    console.log("📍 Using Network Contract Addresses:");
    console.log(`   FTSO v2: ${ftsoV2Address}`);
    console.log(`   FDC Hub: ${fdcHubAddress}`);
    console.log(`   WFLR: ${wflrAddress}`);
    console.log();
  }
  
  // Deploy FlareShield
  console.log("🛡️  Deploying FlareShield Insurance Protocol...");
  console.log("─".repeat(60));
  
  const FlareShield = await hre.ethers.getContractFactory("FlareShield");
  const flareShield = await FlareShield.deploy(
    ftsoV2Address,
    fdcHubAddress,
    wflrAddress
  );
  
  await flareShield.waitForDeployment();
  const flareShieldAddress = await flareShield.getAddress();
  
  console.log(`✅ FlareShield deployed: ${flareShieldAddress}`);
  console.log();
  
  // Save deployment info
  const deploymentInfo = {
    network,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      FlareShield: flareShieldAddress,
      FtsoV2: ftsoV2Address,
      FdcHub: fdcHubAddress,
      WFLR: wflrAddress,
    },
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  
  // Also save to frontend
  const frontendConfigDir = path.join(__dirname, "..", "frontend", "src", "config");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  
  const frontendConfigFile = path.join(frontendConfigDir, "contracts.json");
  fs.writeFileSync(frontendConfigFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Frontend config saved to: ${frontendConfigFile}`);
  
  // For local testing, mint some tokens to deployer
  if (network === "localhost" || network === "hardhat") {
    console.log();
    console.log("🪙 Setting up test tokens...");
    const mockWflr = await hre.ethers.getContractAt("MockWFLR", wflrAddress);
    
    // Mint tokens to deployer
    await mockWflr.mint(deployer.address, hre.ethers.parseEther("100000"));
    console.log(`   Minted 100,000 WFLR to deployer`);
    
    // Approve FlareShield to spend tokens
    await mockWflr.approve(flareShieldAddress, hre.ethers.MaxUint256);
    console.log(`   Approved FlareShield for token spending`);
    
    // Add initial liquidity
    const flareShieldContract = await hre.ethers.getContractAt("FlareShield", flareShieldAddress);
    await flareShieldContract.addLiquidity(hre.ethers.parseEther("50000"));
    console.log(`   Added 50,000 WFLR initial liquidity to pool`);
  }
  
  console.log();
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║               ✅ Deployment Complete! ✅                      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log("📋 Summary:");
  console.log(`   FlareShield: ${flareShieldAddress}`);
  console.log(`   Network: ${network} (Chain ID: ${deploymentInfo.chainId})`);
  console.log();
  
  if (network === "coston2") {
    console.log("🔍 View on Explorer:");
    console.log(`   https://coston2-explorer.flare.network/address/${flareShieldAddress}`);
  }
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
