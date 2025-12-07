import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Shield } from 'lucide-react';

export default function PolicyCard({ policy, index, onBuy, isConnected }) {
  const colorClasses = {
    'cyber-blue': {
      bg: 'from-cyber-blue/20 to-transparent',
      border: 'border-cyber-blue/30 hover:border-cyber-blue/50',
      icon: 'bg-cyber-blue/20 text-cyber-blue',
      badge: 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30',
      glow: 'group-hover:shadow-neon-blue'
    },
    'cyber-pink': {
      bg: 'from-cyber-pink/20 to-transparent',
      border: 'border-cyber-pink/30 hover:border-cyber-pink/50',
      icon: 'bg-cyber-pink/20 text-cyber-pink',
      badge: 'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/30',
      glow: 'group-hover:shadow-neon-pink'
    },
    'cyber-purple': {
      bg: 'from-cyber-purple/20 to-transparent',
      border: 'border-cyber-purple/30 hover:border-cyber-purple/50',
      icon: 'bg-cyber-purple/20 text-cyber-purple',
      badge: 'bg-cyber-purple/10 text-cyber-purple border-cyber-purple/30',
      glow: 'group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
    },
    'cyber-orange': {
      bg: 'from-cyber-orange/20 to-transparent',
      border: 'border-cyber-orange/30 hover:border-cyber-orange/50',
      icon: 'bg-cyber-orange/20 text-cyber-orange',
      badge: 'bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30',
      glow: 'group-hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]'
    }
  };

  const colors = colorClasses[policy.color] || colorClasses['cyber-pink'];

  const riskColors = {
    'Low': 'text-cyber-green',
    'Medium': 'text-cyber-yellow',
    'High': 'text-cyber-orange'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`group relative glass-card overflow-hidden ${colors.border} ${colors.glow} transition-all duration-500`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Scan Line Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <policy.icon className="w-7 h-7" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${riskColors[policy.riskLevel]}`}>
              {policy.riskLevel} Risk
            </span>
            <div className={`w-2 h-2 rounded-full ${
              policy.riskLevel === 'Low' ? 'bg-cyber-green' :
              policy.riskLevel === 'Medium' ? 'bg-cyber-yellow' : 'bg-cyber-orange'
            }`} />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-glow transition-all">
          {policy.name}
        </h3>
        <p className="text-white/50 text-sm mb-6 font-body leading-relaxed">
          {policy.description}
        </p>

        {/* Assets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {policy.assets.map((asset) => (
            <span
              key={asset}
              className={`px-3 py-1 text-xs font-mono rounded-full border ${colors.badge}`}
            >
              {asset}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-flare-dark/50 rounded-xl">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Base Rate</div>
            <div className="font-display text-lg font-bold text-white">{policy.baseRate}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Coverage Time</div>
            <div className="font-display text-lg font-bold text-white">1-365 days</div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={onBuy}
          className={`w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
            isConnected 
              ? 'bg-gradient-to-r from-cyber-pink to-cyber-purple text-white hover:shadow-neon-pink'
              : 'bg-glass-medium text-white/50 cursor-not-allowed'
          }`}
          whileHover={isConnected ? { scale: 1.02 } : {}}
          whileTap={isConnected ? { scale: 0.98 } : {}}
          disabled={!isConnected}
        >
          <span className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            {isConnected ? 'Get Protection' : 'Connect Wallet First'}
            {isConnected && <ArrowRight className="w-4 h-4" />}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
