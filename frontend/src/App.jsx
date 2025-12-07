import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Shield, 
  TrendingDown, 
  Droplets, 
  Wallet, 
  Activity,
  AlertTriangle,
  ChevronRight,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  BarChart3,
  Coins,
  FileCheck
} from 'lucide-react';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import PolicyCard from './components/PolicyCard';
import BuyPolicyModal from './components/BuyPolicyModal';
import LiquidityModal from './components/LiquidityModal';
import PriceOracle from './components/PriceOracle';
import UserPolicies from './components/UserPolicies';
import ParticleBackground from './components/ParticleBackground';

// Hooks
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';

// Policy Types Configuration
const POLICY_TYPES = [
  {
    id: 0,
    name: 'Depeg Protection',
    icon: Droplets,
    description: 'Protect against stablecoin depegging events',
    color: 'cyber-blue',
    assets: ['USDC', 'USDT'],
    riskLevel: 'Low',
    baseRate: '2.0%'
  },
  {
    id: 1,
    name: 'Price Drop',
    icon: TrendingDown,
    description: 'Insurance against sudden price crashes',
    color: 'cyber-pink',
    assets: ['BTC', 'ETH', 'XRP', 'FLR'],
    riskLevel: 'Medium',
    baseRate: '3.0%'
  },
  {
    id: 2,
    name: 'FAsset Collateral',
    icon: Lock,
    description: 'Coverage for FAsset under-collateralization',
    color: 'cyber-purple',
    assets: ['FBTC', 'FXRP', 'FDOGE'],
    riskLevel: 'Medium',
    baseRate: '2.5%'
  },
  {
    id: 3,
    name: 'Bridge Protection',
    icon: Globe,
    description: 'Cross-chain bridge failure insurance',
    color: 'cyber-orange',
    assets: ['Any Bridge TX'],
    riskLevel: 'High',
    baseRate: '3.75%'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('policies');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    account, 
    chainId, 
    isConnected, 
    connect, 
    disconnect,
    balance 
  } = useWallet();

  const {
    poolStats,
    userPolicies,
    liquidityPosition,
    prices,
    purchasePolicy,
    claimPolicy,
    addLiquidity,
    removeLiquidity,
    claimRewards,
    refreshData
  } = useContract(account);

  // Handle policy purchase
  const handleBuyPolicy = (policyType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSelectedPolicyType(policyType);
    setShowBuyModal(true);
  };

  // Handle liquidity action
  const handleLiquidity = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setShowLiquidityModal(true);
  };

  return (
    <div className="min-h-screen bg-flare-darker relative overflow-hidden">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Gradient Overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-purple/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none opacity-50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header 
          isConnected={isConnected}
          account={account}
          balance={balance}
          chainId={chainId}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {/* Hero Section */}
        <Hero onGetStarted={() => setActiveTab('policies')} />

        {/* Stats Bar */}
        <StatsBar 
          poolStats={poolStats}
          prices={prices}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'policies', label: 'Buy Protection', icon: Shield },
              { id: 'my-policies', label: 'My Policies', icon: FileCheck },
              { id: 'liquidity', label: 'Provide Liquidity', icon: Coins },
              { id: 'oracle', label: 'Price Oracle', icon: Activity }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyber-pink to-cyber-purple text-white shadow-neon-pink'
                    : 'bg-glass-light text-white/70 hover:bg-glass-medium hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'policies' && (
              <motion.div
                key="policies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {POLICY_TYPES.map((policy, index) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    index={index}
                    onBuy={() => handleBuyPolicy(policy)}
                    isConnected={isConnected}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'my-policies' && (
              <motion.div
                key="my-policies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <UserPolicies 
                  policies={userPolicies}
                  onClaim={claimPolicy}
                  isConnected={isConnected}
                  prices={prices}
                />
              </motion.div>
            )}

            {activeTab === 'liquidity' && (
              <motion.div
                key="liquidity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pool Stats */}
                  <div className="lg:col-span-2 glass-card p-8">
                    <h3 className="font-display text-2xl font-bold mb-6 text-white">
                      Insurance Pool
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-flare-dark/50 rounded-xl p-4 border border-white/5">
                        <div className="text-white/50 text-sm mb-1">Total Liquidity</div>
                        <div className="font-display text-xl font-bold text-cyber-blue">
                          {poolStats.totalLiquidity || '0'} WFLR
                        </div>
                      </div>
                      <div className="bg-flare-dark/50 rounded-xl p-4 border border-white/5">
                        <div className="text-white/50 text-sm mb-1">Active Coverage</div>
                        <div className="font-display text-xl font-bold text-cyber-pink">
                          {poolStats.totalCoverage || '0'} WFLR
                        </div>
                      </div>
                      <div className="bg-flare-dark/50 rounded-xl p-4 border border-white/5">
                        <div className="text-white/50 text-sm mb-1">Available</div>
                        <div className="font-display text-xl font-bold text-cyber-green">
                          {poolStats.availableLiquidity || '0'} WFLR
                        </div>
                      </div>
                      <div className="bg-flare-dark/50 rounded-xl p-4 border border-white/5">
                        <div className="text-white/50 text-sm mb-1">Utilization</div>
                        <div className="font-display text-xl font-bold text-cyber-yellow">
                          {poolStats.utilizationRate || '0'}%
                        </div>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/50">Pool Utilization</span>
                        <span className="text-cyber-pink font-mono">{poolStats.utilizationRate || 0}%</span>
                      </div>
                      <div className="h-3 bg-flare-dark rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyber-green via-cyber-yellow to-cyber-pink rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${poolStats.utilizationRate || 0}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* APY Info */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyber-green/10 to-transparent rounded-xl border border-cyber-green/20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center">
                          <Percent className="w-6 h-6 text-cyber-green" />
                        </div>
                        <div>
                          <div className="text-white/50 text-sm">Current APY</div>
                          <div className="font-display text-2xl font-bold text-cyber-green">15.00%</div>
                        </div>
                      </div>
                      <motion.button
                        onClick={handleLiquidity}
                        className="btn-neon"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add Liquidity
                      </motion.button>
                    </div>
                  </div>

                  {/* Your Position */}
                  <div className="glass-card p-8">
                    <h3 className="font-display text-xl font-bold mb-6 text-white">
                      Your Position
                    </h3>

                    {isConnected ? (
                      <>
                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-center py-3 border-b border-white/10">
                            <span className="text-white/50">Deposited</span>
                            <span className="font-display font-bold text-white">
                              {liquidityPosition.amount || '0'} WFLR
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-white/10">
                            <span className="text-white/50">Pending Rewards</span>
                            <span className="font-display font-bold text-cyber-green">
                              {liquidityPosition.pendingRewards || '0'} WFLR
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-white/50">Total Earned</span>
                            <span className="font-display font-bold text-cyber-yellow">
                              {liquidityPosition.totalEarned || '0'} WFLR
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <motion.button
                            onClick={() => claimRewards()}
                            className="w-full btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!liquidityPosition.pendingRewards || liquidityPosition.pendingRewards === '0'}
                          >
                            Claim Rewards
                          </motion.button>
                          <motion.button
                            onClick={handleLiquidity}
                            className="w-full py-3 border border-white/10 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Manage Position
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Wallet className="w-12 h-12 mx-auto mb-4 text-white/30" />
                        <p className="text-white/50 mb-4">Connect wallet to view your position</p>
                        <motion.button
                          onClick={connect}
                          className="btn-neon"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Connect Wallet
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'oracle' && (
              <motion.div
                key="oracle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PriceOracle prices={prices} onRefresh={refreshData} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyber-pink" />
                <span className="font-display text-xl font-bold">FlareShield</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span>Built on Flare Network</span>
                <span>•</span>
                <span>Powered by FTSO & FDC</span>
                <span>•</span>
                <span>Hackathon 2024</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBuyModal && (
          <BuyPolicyModal
            policyType={selectedPolicyType}
            prices={prices}
            onClose={() => setShowBuyModal(false)}
            onPurchase={purchasePolicy}
          />
        )}
        {showLiquidityModal && (
          <LiquidityModal
            position={liquidityPosition}
            poolStats={poolStats}
            onClose={() => setShowLiquidityModal(false)}
            onAddLiquidity={addLiquidity}
            onRemoveLiquidity={removeLiquidity}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255, 45, 146, 0.3)',
          },
          success: {
            iconTheme: { primary: '#00FF88', secondary: '#1a1a2e' },
          },
          error: {
            iconTheme: { primary: '#FF2D92', secondary: '#1a1a2e' },
          },
        }}
      />
    </div>
  );
}

export default App;
