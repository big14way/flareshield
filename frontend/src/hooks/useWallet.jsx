import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Network configurations
const NETWORKS = {
  114: {
    chainId: '0x72',
    chainName: 'Flare Coston2 Testnet',
    nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
    rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
    blockExplorerUrls: ['https://coston2-explorer.flare.network/'],
  },
  14: {
    chainId: '0xe',
    chainName: 'Flare Mainnet',
    nativeCurrency: { name: 'Flare', symbol: 'FLR', decimals: 18 },
    rpcUrls: ['https://flare-api.flare.network/ext/C/rpc'],
    blockExplorerUrls: ['https://flare-explorer.flare.network/'],
  },
  31337: {
    chainId: '0x7a69',
    chainName: 'Localhost',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
};

const TARGET_NETWORK = 114; // Coston2 by default

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Get balance
  const updateBalance = useCallback(async (address, provider) => {
    if (!address || !provider) return;
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  // Switch to target network
  const switchNetwork = async () => {
    if (!window.ethereum) return;

    const network = NETWORKS[TARGET_NETWORK];
    if (!network) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError) {
      // Network not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add Flare network');
        }
      } else {
        console.error('Error switching network:', switchError);
      }
    }
  };

  // Connect wallet
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to use this app');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      // Switch network if needed
      if (currentChainId !== TARGET_NETWORK && currentChainId !== 31337) {
        await switchNetwork();
      }

      const signer = await browserProvider.getSigner();
      
      setAccount(accounts[0]);
      setChainId(currentChainId);
      setIsConnected(true);
      setProvider(browserProvider);
      setSigner(signer);

      await updateBalance(accounts[0], browserProvider);
      
      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setBalance('0');
    setProvider(null);
    setSigner(null);
    toast.success('Wallet disconnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        if (provider) {
          await updateBalance(accounts[0], provider);
        }
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      
      // Reload provider
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        
        browserProvider.getSigner().then(setSigner);
        
        if (account) {
          updateBalance(account, browserProvider);
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts.length > 0) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await browserProvider.getNetwork();
        const signer = await browserProvider.getSigner();

        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        setProvider(browserProvider);
        setSigner(signer);
        await updateBalance(accounts[0], browserProvider);
      }
    });

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, provider, updateBalance]);

  return {
    account,
    chainId,
    isConnected,
    balance,
    provider,
    signer,
    connect,
    disconnect,
    switchNetwork,
  };
}
