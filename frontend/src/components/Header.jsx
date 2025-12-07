import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wallet, ChevronDown, ExternalLink, Copy, Check, LogOut } from 'lucide-react';

export default function Header({ isConnected, account, balance, chainId, onConnect, onDisconnect }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNetworkName = (id) => {
    const networks = {
      114: 'Coston2',
      14: 'Flare',
      16: 'Coston',
      19: 'Songbird',
      31337: 'Localhost'
    };
    return networks[id] || 'Unknown';
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-flare-darker/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-pink/30 blur-xl rounded-full" />
              <Shield className="relative w-10 h-10 text-cyber-pink" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                <span className="text-white">Flare</span>
                <span className="text-cyber-pink">Shield</span>
              </h1>
              <p className="text-xs text-white/40 font-mono">Parametric Insurance</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors font-body">
              Documentation
            </a>
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors font-body">
              GitHub
            </a>
            <a href="https://faucet.flare.network/coston2" target="_blank" rel="noopener" className="text-sm text-white/60 hover:text-white transition-colors font-body flex items-center gap-1">
              Faucet <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Wallet Section */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-4 py-2 bg-glass-light rounded-xl border border-white/10 hover:border-cyber-pink/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Network Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                    <span className="text-xs text-white/50 font-mono">{getNetworkName(chainId)}</span>
                  </div>
                  
                  <div className="h-4 w-px bg-white/10" />
                  
                  {/* Address */}
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-cyber-pink" />
                    <span className="font-mono text-sm">{truncateAddress(account)}</span>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 glass-card p-4 border border-white/10"
                    >
                      {/* Balance */}
                      <div className="mb-4 p-3 bg-flare-dark/50 rounded-lg">
                        <div className="text-xs text-white/50 mb-1">Balance</div>
                        <div className="font-display text-xl font-bold text-cyber-blue">
                          {parseFloat(balance || 0).toFixed(4)} FLR
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={copyAddress}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-cyber-green" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/50" />
                          )}
                          <span className="text-sm">{copied ? 'Copied!' : 'Copy Address'}</span>
                        </button>

                        <a
                          href={`https://coston2-explorer.flare.network/address/${account}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-white/50" />
                          <span className="text-sm">View on Explorer</span>
                        </a>

                        <button
                          onClick={() => {
                            onDisconnect();
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-pink/10 text-cyber-pink transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Disconnect</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={onConnect}
                className="btn-neon"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-4 h-4 mr-2 inline" />
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
