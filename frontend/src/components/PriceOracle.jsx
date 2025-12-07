import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', color: 'cyber-orange' },
  { symbol: 'ETH', name: 'Ethereum', color: 'cyber-purple' },
  { symbol: 'XRP', name: 'Ripple', color: 'cyber-blue' },
  { symbol: 'FLR', name: 'Flare', color: 'cyber-pink' },
  { symbol: 'DOGE', name: 'Dogecoin', color: 'cyber-yellow' },
  { symbol: 'USDC', name: 'USD Coin', color: 'cyber-green' },
  { symbol: 'USDT', name: 'Tether', color: 'cyber-green' },
];

// Mock price data (in production, this comes from FTSO)
const mockPrices = {
  BTC: { price: 105000, change: 2.34 },
  ETH: { price: 4000, change: 1.56 },
  XRP: { price: 2.50, change: -0.89 },
  FLR: { price: 0.025, change: 5.67 },
  DOGE: { price: 0.45, change: 3.21 },
  USDC: { price: 1.00, change: 0.01 },
  USDT: { price: 1.00, change: -0.02 },
};

export default function PriceOracle({ prices, onRefresh }) {
  const displayPrices = prices && Object.keys(prices).length > 0 ? prices : mockPrices;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            FTSO Price Oracle
          </h2>
          <p className="text-white/50">
            Real-time decentralized price feeds powered by Flare Time Series Oracle
          </p>
        </div>
        <motion.button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-glass-light rounded-lg border border-white/10 hover:bg-glass-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4 text-cyber-blue" />
          <span className="text-sm font-mono">Refresh</span>
        </motion.button>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-6 border-l-4 border-l-cyber-blue">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyber-blue/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-cyber-blue" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Decentralized Price Feeds
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              FlareShield uses Flare's native FTSO (Flare Time Series Oracle) for all price data. 
              FTSO aggregates prices from 100+ independent data providers, ensuring highly accurate 
              and manipulation-resistant price feeds for parametric insurance triggers.
            </p>
          </div>
        </div>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASSETS.map((asset, index) => {
          const priceData = displayPrices[asset.symbol] || { price: 0, change: 0 };
          const isPositive = priceData.change >= 0;
          
          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${asset.color}/20 flex items-center justify-center`}>
                    <span className={`font-display font-bold text-${asset.color}`}>
                      {asset.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-white">{asset.symbol}</div>
                    <div className="text-xs text-white/40">{asset.name}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono ${
                  isPositive ? 'bg-cyber-green/10 text-cyber-green' : 'bg-cyber-pink/10 text-cyber-pink'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(priceData.change).toFixed(2)}%
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-white">
                  ${priceData.price.toLocaleString(undefined, { 
                    minimumFractionDigits: priceData.price < 1 ? 4 : 2,
                    maximumFractionDigits: priceData.price < 1 ? 4 : 2
                  })}
                </span>
                <span className="text-white/40 text-sm">USD</span>
              </div>

              {/* Mini Chart Placeholder */}
              <div className="mt-4 h-12 flex items-end gap-0.5">
                {[...Array(20)].map((_, i) => {
                  const height = 20 + Math.random() * 80;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t bg-gradient-to-t ${
                        isPositive ? 'from-cyber-green/20 to-cyber-green/60' : 'from-cyber-pink/20 to-cyber-pink/60'
                      } opacity-50 group-hover:opacity-100 transition-opacity`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Technical Details */}
      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyber-purple" />
          Oracle Technical Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-flare-dark/50 rounded-xl">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Update Frequency</div>
            <div className="font-display text-lg font-bold text-white">~90 sec</div>
          </div>
          <div className="p-4 bg-flare-dark/50 rounded-xl">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Data Providers</div>
            <div className="font-display text-lg font-bold text-white">100+</div>
          </div>
          <div className="p-4 bg-flare-dark/50 rounded-xl">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Price Pairs</div>
            <div className="font-display text-lg font-bold text-white">1000+</div>
          </div>
          <div className="p-4 bg-flare-dark/50 rounded-xl">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Decimals</div>
            <div className="font-display text-lg font-bold text-white">5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
