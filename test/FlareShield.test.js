const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlareShield", function () {
  let flareShield;
  let mockFtso;
  let mockFdc;
  let mockWflr;
  let owner;
  let user1;
  let user2;
  let liquidityProvider;

  // Feed IDs
  const BTC_USD_FEED = "0x014254432f55534400000000000000000000000000";
  const USDC_USD_FEED = "0x01555344432f555344000000000000000000000000";
  const XRP_USD_FEED = "0x015852502f55534400000000000000000000000000";

  beforeEach(async function () {
    [owner, user1, user2, liquidityProvider] = await ethers.getSigners();

    // Deploy mocks
    const MockFtsoV2 = await ethers.getContractFactory("MockFtsoV2");
    mockFtso = await MockFtsoV2.deploy();

    const MockFdcHub = await ethers.getContractFactory("MockFdcHub");
    mockFdc = await MockFdcHub.deploy();

    const MockWFLR = await ethers.getContractFactory("MockWFLR");
    mockWflr = await MockWFLR.deploy();

    // Deploy FlareShield
    const FlareShield = await ethers.getContractFactory("FlareShield");
    flareShield = await FlareShield.deploy(
      await mockFtso.getAddress(),
      await mockFdc.getAddress(),
      await mockWflr.getAddress()
    );

    // Distribute tokens
    await mockWflr.mint(user1.address, ethers.parseEther("10000"));
    await mockWflr.mint(user2.address, ethers.parseEther("10000"));
    await mockWflr.mint(liquidityProvider.address, ethers.parseEther("100000"));

    // Approve spending
    await mockWflr.connect(user1).approve(await flareShield.getAddress(), ethers.MaxUint256);
    await mockWflr.connect(user2).approve(await flareShield.getAddress(), ethers.MaxUint256);
    await mockWflr.connect(liquidityProvider).approve(await flareShield.getAddress(), ethers.MaxUint256);
  });

  describe("Liquidity Management", function () {
    it("Should allow adding liquidity", async function () {
      const amount = ethers.parseEther("50000");
      
      await expect(flareShield.connect(liquidityProvider).addLiquidity(amount))
        .to.emit(flareShield, "LiquidityAdded")
        .withArgs(liquidityProvider.address, amount);

      const [totalLiquidity, , availableLiquidity] = await flareShield.getPoolStats();
      expect(totalLiquidity).to.equal(amount);
      expect(availableLiquidity).to.equal(amount);
    });

    it("Should allow removing liquidity when available", async function () {
      const depositAmount = ethers.parseEther("50000");
      const withdrawAmount = ethers.parseEther("25000");

      await flareShield.connect(liquidityProvider).addLiquidity(depositAmount);
      
      await expect(flareShield.connect(liquidityProvider).removeLiquidity(withdrawAmount))
        .to.emit(flareShield, "LiquidityRemoved")
        .withArgs(liquidityProvider.address, withdrawAmount);

      const position = await flareShield.getLiquidityPosition(liquidityProvider.address);
      expect(position[0]).to.equal(depositAmount - withdrawAmount);
    });

    it("Should calculate rewards over time", async function () {
      const amount = ethers.parseEther("10000");
      await flareShield.connect(liquidityProvider).addLiquidity(amount);

      // Fast forward 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const position = await flareShield.getLiquidityPosition(liquidityProvider.address);
      const pendingRewards = position[3];
      
      // Should have accumulated some rewards (15% APY over ~30 days)
      expect(pendingRewards).to.be.gt(0);
    });
  });

  describe("Policy Purchase", function () {
    beforeEach(async function () {
      // Add liquidity to pool
      await flareShield.connect(liquidityProvider).addLiquidity(ethers.parseEther("50000"));
    });

    it("Should allow purchasing a price drop policy", async function () {
      const coverage = ethers.parseEther("1000");
      const duration = 30 * 24 * 60 * 60; // 30 days
      const policyType = 1; // PRICE_DROP
      const strikePrice = 0; // Use default (90% of current)

      await expect(flareShield.connect(user1).purchasePolicy(
        coverage,
        duration,
        policyType,
        BTC_USD_FEED,
        strikePrice
      )).to.emit(flareShield, "PolicyCreated");

      const userPolicies = await flareShield.getUserPolicies(user1.address);
      expect(userPolicies.length).to.equal(1);
    });

    it("Should calculate correct premium", async function () {
      const coverage = ethers.parseEther("1000");
      const duration = 365 * 24 * 60 * 60; // 1 year
      const policyType = 1; // PRICE_DROP

      const premium = await flareShield.calculatePremium(coverage, duration, policyType);
      
      // Premium should be ~3% for 1 year PRICE_DROP (2.5% base * 1.2 risk * 1.0 duration)
      expect(premium).to.be.gt(ethers.parseEther("25")); // Greater than 2.5%
      expect(premium).to.be.lt(ethers.parseEther("50")); // Less than 5%
    });

    it("Should reject policy if insufficient liquidity", async function () {
      const coverage = ethers.parseEther("100000"); // More than pool has

      await expect(flareShield.connect(user1).purchasePolicy(
        coverage,
        30 * 24 * 60 * 60,
        1,
        BTC_USD_FEED,
        0
      )).to.be.revertedWith("Insufficient pool liquidity");
    });

    it("Should reject policy with coverage too low", async function () {
      const coverage = ethers.parseEther("10"); // Below minimum

      await expect(flareShield.connect(user1).purchasePolicy(
        coverage,
        30 * 24 * 60 * 60,
        1,
        BTC_USD_FEED,
        0
      )).to.be.revertedWith("Coverage too low");
    });
  });

  describe("Policy Claims", function () {
    let policyId;

    beforeEach(async function () {
      // Add liquidity
      await flareShield.connect(liquidityProvider).addLiquidity(ethers.parseEther("50000"));

      // Purchase policy
      const tx = await flareShield.connect(user1).purchasePolicy(
        ethers.parseEther("1000"),
        30 * 24 * 60 * 60,
        1, // PRICE_DROP
        BTC_USD_FEED,
        9000000000 // Strike at $90,000 (with 5 decimals)
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return flareShield.interface.parseLog(log)?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      
      policyId = flareShield.interface.parseLog(event).args[0];
    });

    it("Should allow claiming when trigger condition met", async function () {
      // Simulate BTC crash to $80,000 (below $90,000 strike)
      await mockFtso.setPrice(BTC_USD_FEED, 8000000000); // $80,000 with 5 decimals

      const balanceBefore = await mockWflr.balanceOf(user1.address);

      await expect(flareShield.connect(user1).claimPolicy(policyId))
        .to.emit(flareShield, "PolicyClaimed");

      const balanceAfter = await mockWflr.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should reject claim when trigger not met", async function () {
      // Price is still at $105,000 (above $90,000 strike)
      await expect(flareShield.connect(user1).claimPolicy(policyId))
        .to.be.revertedWith("Trigger condition not met");
    });

    it("Should reject claim from non-holder", async function () {
      await mockFtso.setPrice(BTC_USD_FEED, 8000000000);

      await expect(flareShield.connect(user2).claimPolicy(policyId))
        .to.be.revertedWith("Not policy holder");
    });

    it("Should not allow double claims", async function () {
      await mockFtso.setPrice(BTC_USD_FEED, 8000000000);
      await flareShield.connect(user1).claimPolicy(policyId);

      // After claiming, policy is marked as inactive, so it will revert with "Policy not active"
      await expect(flareShield.connect(user1).claimPolicy(policyId))
        .to.be.revertedWith("Policy not active");
    });
  });

  describe("Depeg Protection", function () {
    let policyId;

    beforeEach(async function () {
      await flareShield.connect(liquidityProvider).addLiquidity(ethers.parseEther("50000"));

      const tx = await flareShield.connect(user1).purchasePolicy(
        ethers.parseEther("5000"),
        30 * 24 * 60 * 60,
        0, // DEPEG_PROTECTION
        USDC_USD_FEED,
        95000 // Strike at $0.95 (5% depeg)
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return flareShield.interface.parseLog(log)?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      policyId = flareShield.interface.parseLog(event).args[0];
    });

    it("Should trigger on stablecoin depeg", async function () {
      // Simulate USDC depeg to $0.85
      await mockFtso.simulateDepeg(USDC_USD_FEED);

      const [canClaim, reason] = await flareShield.canClaim(policyId);
      expect(canClaim).to.be.true;
      expect(reason).to.equal("Trigger condition met");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await flareShield.connect(liquidityProvider).addLiquidity(ethers.parseEther("50000"));
    });

    it("Should return correct pool stats", async function () {
      const [totalLiq, totalCov, availLiq, utilRate] = await flareShield.getPoolStats();
      
      expect(totalLiq).to.equal(ethers.parseEther("50000"));
      expect(totalCov).to.equal(0);
      expect(availLiq).to.equal(ethers.parseEther("50000"));
      expect(utilRate).to.equal(0);
    });

    it("Should return current price from FTSO", async function () {
      const [price, decimals, timestamp] = await flareShield.getCurrentPrice(BTC_USD_FEED);
      
      expect(price).to.equal(10500000000n); // $105,000 with 5 decimals
      expect(decimals).to.equal(5);
      expect(timestamp).to.be.gt(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update reward rate", async function () {
      await flareShield.setRewardRate(2000); // 20% APY
      
      const pool = await flareShield.insurancePool();
      expect(pool.rewardRate).to.equal(2000);
    });

    it("Should reject non-owner admin calls", async function () {
      await expect(flareShield.connect(user1).setRewardRate(2000))
        .to.be.revertedWithCustomError(flareShield, "OwnableUnauthorizedAccount");
    });

    it("Should reject excessive reward rate", async function () {
      await expect(flareShield.setRewardRate(6000)) // 60% APY
        .to.be.revertedWith("Rate too high");
    });
  });
});
