import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingDown,
  Droplets,
  Lock,
  Globe,
  Zap,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const POLICY_TYPE_INFO = {
  0: { name: 'Depeg Protection', icon: Droplets, color: 'cyber-blue' },
  1: { name: 'Price Drop', icon: TrendingDown, color: 'cyber-pink' },
  2: { name: 'FAsset Collateral', icon: Lock, color: 'cyber-purple' },
  3: { name: 'Bridge Protection', icon: Globe, color: 'cyber-orange' },
};

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'cyber-green',
    icon: CheckCircle2,
    bg: 'bg-cyber-green/10',
    border: 'border-cyber-green/30'
  },
  claimable: {
    label: 'Claimable!',
    color: 'cyber-yellow',
    icon: Zap,
    bg: 'bg-cyber-yellow/10',
    border: 'border-cyber-yellow/30'
  },
  claimed: {
    label: 'Claimed',
    color: 'cyber-blue',
    icon: CheckCircle2,
    bg: 'bg-cyber-blue/10',
    border: 'border-cyber-blue/30'
  },
  expired: {
    label: 'Expired',
    color: 'white/40',
    icon: XCircle,
    bg: 'bg-white/5',
    border: 'border-white/10'
  }
};

// Mock policies for demo
const mockPolicies = [
  {
    id: 0,
    policyType: 1,
    coverage: '5000',
    premium: '125',
    strikePrice: '95000',
    asset: 'BTC',
    startTime: Date.now() / 1000 - 86400 * 5,
    endTime: Date.now() / 1000 + 86400 * 25,
    isActive: true,
    isClaimed: false,
    currentPrice: 105000,
    status: 'active'
  },
  {
    id: 1,
    policyType: 0,
    coverage: '10000',
    premium: '200',
    strikePrice: '0.95',
    asset: 'USDC',
    startTime: Date.now() / 1000 - 86400 * 10,
    endTime: Date.now() / 1000 + 86400 * 20,
    isActive: true,
    isClaimed: false,
    currentPrice: 0.85,
    status: 'claimable'
  }
];

export default function UserPolicies({ policies, onClaim, isConnected, prices }) {
  const displayPolicies = policies && policies.length > 0 ? policies : mockPolicies;

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endTime) => {
    const now = Date.now() / 1000;
    const remaining = Math.ceil((endTime - now) / 86400);
    return remaining > 0 ? remaining : 0;
  };

  const handleClaim = async (policyId) => {
    try {
      await onClaim(policyId);
      toast.success('Policy claimed successfully! Payout sent to your wallet.');
    } catch (error) {
      toast.error(error.message || 'Failed to claim policy');
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-card p-12 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-white/20" />
        <h3 className="font-display text-xl font-bold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-white/50 mb-6">
          Connect your wallet to view your insurance policies
        </p>
      </div>
    );
  }

  if (displayPolicies.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-white/20" />
        <h3 className="font-display text-xl font-bold text-white mb-2">
          No Policies Yet
        </h3>
        <p className="text-white/50 mb-6">
          You haven't purchased any insurance policies yet.
          Get protected against price crashes, depegs, and more.
        </p>
        <motion.button
          className="btn-neon"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Browse Protection Options
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="text-sm text-white/50 mb-1">Active Policies</div>
          <div className="font-display text-3xl font-bold text-cyber-green">
            {displayPolicies.filter(p => p.isActive && !p.isClaimed).length}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-white/50 mb-1">Total Coverage</div>
          <div className="font-display text-3xl font-bold text-cyber-blue">
            {displayPolicies.reduce((sum, p) => sum + parseFloat(p.coverage), 0).toLocaleString()} WFLR
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-white/50 mb-1">Claimable Now</div>
          <div className="font-display text-3xl font-bold text-cyber-yellow">
            {displayPolicies.filter(p => p.status === 'claimable').length}
          </div>
        </div>
      </div>

      {/* Policy List */}
      <div className="space-y-4">
        {displayPolicies.map((policy, index) => {
          const typeInfo = POLICY_TYPE_INFO[policy.policyType] || POLICY_TYPE_INFO[1];
          const statusConfig = STATUS_CONFIG[policy.status] || STATUS_CONFIG.active;
          const daysRemaining = getDaysRemaining(policy.endTime);
          const Icon = typeInfo.icon;
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card overflow-hidden ${
                policy.status === 'claimable' ? 'border-cyber-yellow/50 animate-pulse' : ''
              }`}
            >
              {/* Claimable Banner */}
              {policy.status === 'claimable' && (
                <div className="bg-gradient-to-r from-cyber-yellow/20 to-cyber-orange/20 px-6 py-3 border-b border-cyber-yellow/30">
                  <div className="flex items-center gap-2 text-cyber-yellow">
                    <Zap className="w-5 h-5" />
                    <span className="font-display font-bold">Trigger Condition Met!</span>
                    <span className="text-sm opacity-80">- Claim your payout now</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Policy Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-${typeInfo.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 text-${typeInfo.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-lg font-bold text-white">
                          {typeInfo.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${statusConfig.bg} ${statusConfig.border} border text-${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>Policy #{policy.id}</span>
                        <span>•</span>
                        <span>{policy.asset}</span>
                        <span>•</span>
                        <span>Strike: ${parseFloat(policy.strikePrice).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coverage & Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Stats */}
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Coverage</div>
                        <div className="font-display text-xl font-bold text-white">
                          {parseFloat(policy.coverage).toLocaleString()}
                          <span className="text-sm text-white/50 ml-1">WFLR</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Price</div>
                        <div className={`font-display text-xl font-bold ${
                          policy.currentPrice < parseFloat(policy.strikePrice) ? 'text-cyber-pink' : 'text-cyber-green'
                        }`}>
                          ${policy.currentPrice?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Time Left</div>
                        <div className="font-display text-xl font-bold text-white flex items-center gap-1">
                          <Clock className="w-4 h-4 text-white/50" />
                          {daysRemaining}d
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {policy.status === 'claimable' && (
                      <motion.button
                        onClick={() => handleClaim(policy.id)}
                        className="px-6 py-3 bg-gradient-to-r from-cyber-yellow to-cyber-orange text-flare-darker font-display font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,230,0,0.3)] transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Zap className="w-4 h-4 inline mr-2" />
                        Claim {policy.coverage} WFLR
                      </motion.button>
                    )}
                    
                    {policy.status === 'active' && (
                      <div className="px-6 py-3 bg-glass-light rounded-xl text-center">
                        <div className="text-xs text-white/40 mb-1">Monitoring</div>
                        <div className="flex items-center gap-2 text-cyber-green">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
                          </span>
                          <span className="font-mono text-sm">FTSO Active</span>
                        </div>
                      </div>
                    )}

                    {policy.status === 'claimed' && (
                      <a
                        href={`https://coston2-explorer.flare.network/tx/${policy.claimTxHash || ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-glass-light rounded-xl text-cyber-blue hover:bg-glass-medium transition-colors flex items-center gap-2"
                      >
                        View Transaction
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Active Policies */}
                {policy.isActive && !policy.isClaimed && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs text-white/40 mb-2">
                      <span>Started: {formatDate(policy.startTime)}</span>
                      <span>Expires: {formatDate(policy.endTime)}</span>
                    </div>
                    <div className="h-2 bg-flare-dark rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyber-pink to-cyber-purple rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(100, ((Date.now()/1000 - policy.startTime) / (policy.endTime - policy.startTime)) * 100)}%` 
                        }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
