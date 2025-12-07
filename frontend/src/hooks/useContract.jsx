import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { FLARESHIELD_ABI, MOCKWFLR_ABI, MOCKFTSO_ABI } from '../utils/abis';

// Contract addresses - these will be updated after deployment
const CONTRACT_ADDRESSES = {
  // Localhost defaults (will be overwritten by deployment)
  localhost: {
    FlareShield: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    WFLR: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    FtsoV2: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
  // Coston2 testnet addresses
  coston2: {
    FlareShield: '0xB33EC213C33050F3a0b814dB264985fE69876948', // Deployed FlareShield
    WFLR: '0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273',
    FtsoV2: '0x3d893C53D9e8056135C26C8c638B76C8b60Df726',
    FdcHub: '0xa37E5beA20c8B47377cfD87E8Fd8e8C6c5F8a52f',
  }
};

// Try to load deployed addresses
let deployedAddresses = null;
try {
  deployedAddresses = require('../config/contracts.json');
  console.log('✅ Loaded deployment config:', deployedAddresses);
} catch (e) {
  console.log('⚠️ No deployment config found, using defaults:', e.message);
}

export function useContract(account) {
  const [poolStats, setPoolStats] = useState({
    totalLiquidity: '0',
    totalCoverage: '0',
    availableLiquidity: '0',
    utilizationRate: '0',
    activePolicies: '0',
    claimsPaid: '0',
    lpProviders: '0'
  });
  
  const [userPolicies, setUserPolicies] = useState([]);
  const [liquidityPosition, setLiquidityPosition] = useState({
    amount: '0',
    depositTime: '0',
    rewardsEarned: '0',
    pendingRewards: '0',
    totalEarned: '0'
  });
  
  const [prices, setPrices] = useState({});
  const [contracts, setContracts] = useState({});

  // Get contract addresses based on network
  const getAddresses = useCallback((chainId) => {
    // Use deployed addresses if available and FlareShield is set
    if (deployedAddresses && deployedAddresses.contracts && deployedAddresses.contracts.FlareShield) {
      return {
        FlareShield: deployedAddresses.contracts.FlareShield,
        WFLR: deployedAddresses.contracts.WFLR,
        FtsoV2: deployedAddresses.contracts.FtsoV2,
        FdcHub: deployedAddresses.contracts.FdcHub,
      };
    }

    // Fall back to hardcoded addresses
    if (chainId === 114) return CONTRACT_ADDRESSES.coston2;
    return CONTRACT_ADDRESSES.localhost;
  }, []);

  // Initialize contracts
  const initContracts = useCallback(async (provider, chainId) => {
    if (!provider) return;

    try {
      const addresses = getAddresses(chainId);
      const signer = await provider.getSigner();

      const flareShield = new ethers.Contract(
        addresses.FlareShield,
        FLARESHIELD_ABI,
        signer
      );

      const wflr = new ethers.Contract(
        addresses.WFLR,
        MOCKWFLR_ABI,
        signer
      );

      const ftso = new ethers.Contract(
        addresses.FtsoV2,
        MOCKFTSO_ABI,
        provider
      );

      setContracts({ flareShield, wflr, ftso, addresses });
      
      return { flareShield, wflr, ftso };
    } catch (error) {
      console.error('Error initializing contracts:', error);
      return null;
    }
  }, [getAddresses]);

  // Fetch pool statistics
  const fetchPoolStats = useCallback(async (flareShield) => {
    if (!flareShield) return;

    try {
      const [totalLiq, totalCov, availLiq, utilRate] = await flareShield.getPoolStats();
      
      setPoolStats({
        totalLiquidity: ethers.formatEther(totalLiq),
        totalCoverage: ethers.formatEther(totalCov),
        availableLiquidity: ethers.formatEther(availLiq),
        utilizationRate: (Number(utilRate) / 100).toFixed(2),
        activePolicies: '24', // Mock for demo
        claimsPaid: '15,420',
        lpProviders: '156'
      });
    } catch (error) {
      console.error('Error fetching pool stats:', error);
      // Set mock data for demo
      setPoolStats({
        totalLiquidity: '50,000',
        totalCoverage: '12,500',
        availableLiquidity: '37,500',
        utilizationRate: '25.00',
        activePolicies: '24',
        claimsPaid: '15,420',
        lpProviders: '156'
      });
    }
  }, []);

  // Fetch user policies
  const fetchUserPolicies = useCallback(async (flareShield, userAddress) => {
    if (!flareShield || !userAddress) return;

    try {
      const policyIds = await flareShield.getUserPolicies(userAddress);
      
      const policies = await Promise.all(
        policyIds.map(async (id) => {
          const policy = await flareShield.getPolicy(id);
          const [canClaim, reason] = await flareShield.canClaim(id);
          
          return {
            id: Number(id),
            holder: policy.holder,
            premium: ethers.formatEther(policy.premium),
            coverage: ethers.formatEther(policy.coverage),
            strikePrice: ethers.formatUnits(policy.strikePrice, 5),
            policyType: Number(policy.policyType),
            startTime: Number(policy.startTime),
            endTime: Number(policy.endTime),
            isActive: policy.isActive,
            isClaimed: policy.isClaimed,
            status: canClaim ? 'claimable' : policy.isClaimed ? 'claimed' : policy.isActive ? 'active' : 'expired',
            asset: getAssetFromFeedId(policy.assetFeedId),
            currentPrice: 105000 // Would come from FTSO
          };
        })
      );

      setUserPolicies(policies);
    } catch (error) {
      console.error('Error fetching user policies:', error);
    }
  }, []);

  // Fetch liquidity position
  const fetchLiquidityPosition = useCallback(async (flareShield, userAddress) => {
    if (!flareShield || !userAddress) return;

    try {
      const [amount, depositTime, rewardsEarned, pendingRewards] = 
        await flareShield.getLiquidityPosition(userAddress);

      setLiquidityPosition({
        amount: ethers.formatEther(amount),
        depositTime: Number(depositTime),
        rewardsEarned: ethers.formatEther(rewardsEarned),
        pendingRewards: ethers.formatEther(pendingRewards),
        totalEarned: ethers.formatEther(rewardsEarned)
      });
    } catch (error) {
      console.error('Error fetching liquidity position:', error);
    }
  }, []);

  // Fetch prices from FTSO
  const fetchPrices = useCallback(async (ftso) => {
    if (!ftso) {
      // Return mock prices if no contract
      setPrices({
        BTC: { price: 105000, change: 2.34 },
        ETH: { price: 4000, change: 1.56 },
        XRP: { price: 2.50, change: -0.89 },
        FLR: { price: 0.025, change: 5.67 },
        DOGE: { price: 0.45, change: 3.21 },
        USDC: { price: 1.00, change: 0.01 },
        USDT: { price: 1.00, change: -0.02 },
      });
      return;
    }

    const feedIds = {
      BTC: '0x014254432f55534400000000000000000000000000',
      ETH: '0x014554482f55534400000000000000000000000000',
      XRP: '0x015852502f55534400000000000000000000000000',
      FLR: '0x01464c522f55534400000000000000000000000000',
      DOGE: '0x01444f47452f555344000000000000000000000000',
      USDC: '0x01555344432f555344000000000000000000000000',
      USDT: '0x01555344542f555344000000000000000000000000',
    };

    try {
      const priceData = {};
      
      for (const [symbol, feedId] of Object.entries(feedIds)) {
        try {
          const [value, decimals] = await ftso.getFeedById(feedId);
          const price = Number(value) / Math.pow(10, Math.abs(Number(decimals)));
          priceData[symbol] = { 
            price, 
            change: (Math.random() - 0.5) * 10 // Mock change for demo
          };
        } catch (e) {
          console.log(`Could not fetch price for ${symbol}`);
        }
      }

      if (Object.keys(priceData).length > 0) {
        setPrices(priceData);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }, []);

  // Helper to get asset symbol from feed ID
  const getAssetFromFeedId = (feedId) => {
    const feedMap = {
      '0x014254432f55534400000000000000000000000000': 'BTC',
      '0x014554482f55534400000000000000000000000000': 'ETH',
      '0x015852502f55534400000000000000000000000000': 'XRP',
      '0x01464c522f55534400000000000000000000000000': 'FLR',
      '0x01555344432f555344000000000000000000000000': 'USDC',
      '0x01555344542f555344000000000000000000000000': 'USDT',
    };
    return feedMap[feedId] || 'Unknown';
  };

  // Purchase policy
  const purchasePolicy = async ({ coverage, duration, policyType, feedId, strikePrice }) => {
    if (!contracts.flareShield || !contracts.wflr) {
      throw new Error('Contracts not initialized');
    }

    const coverageWei = ethers.parseEther(coverage.toString());
    const strikePriceScaled = strikePrice ? Math.floor(strikePrice * 100000) : 0;

    // Approve token spending
    const premium = await contracts.flareShield.calculatePremium(coverageWei, duration, policyType);
    
    toast.loading('Approving tokens...', { id: 'approve' });
    const approveTx = await contracts.wflr.approve(contracts.addresses.FlareShield, premium);
    await approveTx.wait();
    toast.success('Tokens approved!', { id: 'approve' });

    // Purchase policy
    toast.loading('Purchasing policy...', { id: 'purchase' });
    const tx = await contracts.flareShield.purchasePolicy(
      coverageWei,
      duration,
      policyType,
      feedId,
      strikePriceScaled
    );
    
    const receipt = await tx.wait();
    toast.success('Policy purchased!', { id: 'purchase' });

    // Refresh data
    await refreshData();
    
    return receipt;
  };

  // Claim policy
  const claimPolicy = async (policyId) => {
    if (!contracts.flareShield) {
      throw new Error('Contract not initialized');
    }

    toast.loading('Processing claim...', { id: 'claim' });
    const tx = await contracts.flareShield.claimPolicy(policyId);
    const receipt = await tx.wait();
    toast.success('Claim successful! Payout sent.', { id: 'claim' });

    await refreshData();
    return receipt;
  };

  // Add liquidity
  const addLiquidity = async (amount) => {
    if (!contracts.flareShield || !contracts.wflr) {
      throw new Error('Contracts not initialized');
    }

    const amountWei = ethers.parseEther(amount.toString());

    toast.loading('Approving tokens...', { id: 'approve' });
    const approveTx = await contracts.wflr.approve(contracts.addresses.FlareShield, amountWei);
    await approveTx.wait();
    toast.success('Tokens approved!', { id: 'approve' });

    toast.loading('Adding liquidity...', { id: 'liquidity' });
    const tx = await contracts.flareShield.addLiquidity(amountWei);
    await tx.wait();
    toast.success('Liquidity added!', { id: 'liquidity' });

    await refreshData();
  };

  // Remove liquidity
  const removeLiquidity = async (amount) => {
    if (!contracts.flareShield) {
      throw new Error('Contract not initialized');
    }

    const amountWei = ethers.parseEther(amount.toString());

    toast.loading('Removing liquidity...', { id: 'liquidity' });
    const tx = await contracts.flareShield.removeLiquidity(amountWei);
    await tx.wait();
    toast.success('Liquidity removed!', { id: 'liquidity' });

    await refreshData();
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!contracts.flareShield) {
      throw new Error('Contract not initialized');
    }

    toast.loading('Claiming rewards...', { id: 'rewards' });
    const tx = await contracts.flareShield.claimRewards();
    await tx.wait();
    toast.success('Rewards claimed!', { id: 'rewards' });

    await refreshData();
  };

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (contracts.flareShield) {
      await fetchPoolStats(contracts.flareShield);
      if (account) {
        await fetchUserPolicies(contracts.flareShield, account);
        await fetchLiquidityPosition(contracts.flareShield, account);
      }
    }
    await fetchPrices(contracts.ftso);
  }, [contracts, account, fetchPoolStats, fetchUserPolicies, fetchLiquidityPosition, fetchPrices]);

  // Initialize on mount
  useEffect(() => {
    // Fetch mock prices initially
    fetchPrices(null);
    
    // Set mock pool stats
    setPoolStats({
      totalLiquidity: '50,000',
      totalCoverage: '12,500',
      availableLiquidity: '37,500',
      utilizationRate: '25.00',
      activePolicies: '24',
      claimsPaid: '15,420',
      lpProviders: '156'
    });
  }, [fetchPrices]);

  // Initialize contracts when account connects
  useEffect(() => {
    const init = async () => {
      if (account && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const result = await initContracts(provider, Number(network.chainId));
        
        if (result) {
          await fetchPoolStats(result.flareShield);
          await fetchUserPolicies(result.flareShield, account);
          await fetchLiquidityPosition(result.flareShield, account);
          await fetchPrices(result.ftso);
        }
      }
    };

    init();
  }, [account, initContracts, fetchPoolStats, fetchUserPolicies, fetchLiquidityPosition, fetchPrices]);

  return {
    poolStats,
    userPolicies,
    liquidityPosition,
    prices,
    purchasePolicy,
    claimPolicy,
    addLiquidity,
    removeLiquidity,
    claimRewards,
    refreshData,
  };
}
