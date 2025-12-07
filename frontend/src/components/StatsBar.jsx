import { motion } from 'framer-motion';
import { DollarSign, Shield, TrendingUp, Users } from 'lucide-react';

export default function StatsBar({ poolStats, prices }) {
  const stats = [
    {
      label: 'Total Value Locked',
      value: poolStats?.totalLiquidity || '50,000',
      suffix: 'WFLR',
      icon: DollarSign,
      color: 'cyber-blue',
      change: '+12.5%'
    },
    {
      label: 'Active Policies',
      value: poolStats?.activePolicies || '24',
      suffix: '',
      icon: Shield,
      color: 'cyber-pink',
      change: '+5 today'
    },
    {
      label: 'Claims Paid',
      value: poolStats?.claimsPaid || '15,420',
      suffix: 'WFLR',
      icon: TrendingUp,
      color: 'cyber-green',
      change: '100% rate'
    },
    {
      label: 'LP Providers',
      value: poolStats?.lpProviders || '156',
      suffix: '',
      icon: Users,
      color: 'cyber-purple',
      change: '+8 this week'
    }
  ];

  return (
    <div className="border-y border-white/5 bg-flare-dark/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 border border-${stat.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider font-mono mb-1">
                    {stat.label}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm text-white/50 font-mono">{stat.suffix}</span>
                    )}
                  </div>
                  <div className={`text-xs text-${stat.color} font-mono mt-1`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
