import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, Calculator, Clock, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FEED_IDS = {
  'BTC': '0x014254432f55534400000000000000000000000000',
  'ETH': '0x014554482f55534400000000000000000000000000',
  'XRP': '0x015852502f55534400000000000000000000000000',
  'FLR': '0x01464c522f55534400000000000000000000000000',
  'USDC': '0x01555344432f555344000000000000000000000000',
  'USDT': '0x01555344542f555344000000000000000000000000',
  'DOGE': '0x01444f47452f555344000000000000000000000000',
  'FBTC': '0x014254432f55534400000000000000000000000000',
  'FXRP': '0x015852502f55534400000000000000000000000000',
  'FDOGE': '0x01444f47452f555344000000000000000000000000',
};

export default function BuyPolicyModal({ policyType, prices, onClose, onPurchase }) {
  const [selectedAsset, setSelectedAsset] = useState(policyType?.assets[0] || 'BTC');
  const [coverage, setCoverage] = useState('1000');
  const [duration, setDuration] = useState('30');
  const [strikePrice, setStrikePrice] = useState('');
  const [premium, setPremium] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate premium
  useEffect(() => {
    const coverageNum = parseFloat(coverage) || 0;
    const durationNum = parseInt(duration) || 30;
    
    // Base premium: 2.5% of coverage
    let basePremium = coverageNum * 0.025;
    
    // Duration multiplier
    const durationMultiplier = Math.max(0.1, durationNum / 365);
    
    // Risk multiplier based on policy type
    const riskMultipliers = {
      0: 0.8,  // DEPEG - low risk
      1: 1.2,  // PRICE_DROP - medium-high
      2: 1.0,  // FASSET - medium
      3: 1.5   // BRIDGE - high risk
    };
    
    const riskMultiplier = riskMultipliers[policyType?.id] || 1;
    
    const calculatedPremium = basePremium * durationMultiplier * riskMultiplier;
    setPremium(calculatedPremium.toFixed(2));
  }, [coverage, duration, policyType]);

  // Get current price for strike price suggestion
  const currentPrice = prices?.[selectedAsset] || 0;

  const handleSubmit = async () => {
    if (!coverage || parseFloat(coverage) < 100) {
      toast.error('Minimum coverage is 100 WFLR');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedId = FEED_IDS[selectedAsset] || FEED_IDS['BTC'];
      const strikePriceValue = strikePrice ? parseFloat(strikePrice) : 0;
      
      await onPurchase({
        coverage: coverage,
        duration: parseInt(duration) * 24 * 60 * 60, // Convert days to seconds
        policyType: policyType.id,
        feedId: feedId,
        strikePrice: strikePriceValue
      });
      
      toast.success('Policy purchased successfully!');
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to purchase policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-flare-darker/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg glass-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyber-pink/20 flex items-center justify-center">
                {policyType && <policyType.icon className="w-6 h-6 text-cyber-pink" />}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  {policyType?.name}
                </h2>
                <p className="text-sm text-white/50">Configure your protection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-glass-light flex items-center justify-center hover:bg-glass-medium transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm text-white/50 mb-2 font-mono">
              Select Asset
            </label>
            <div className="flex flex-wrap gap-2">
              {policyType?.assets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    selectedAsset === asset
                      ? 'bg-cyber-pink text-white'
                      : 'bg-glass-light text-white/70 hover:bg-glass-medium'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          {/* Coverage Amount */}
          <div>
            <label className="block text-sm text-white/50 mb-2 font-mono">
              Coverage Amount (WFLR)
            </label>
            <input
              type="number"
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              placeholder="1000"
              className="input-cyber"
              min="100"
              max="1000000"
            />
            <div className="flex justify-between mt-2 text-xs text-white/30">
              <span>Min: 100 WFLR</span>
              <span>Max: 1,000,000 WFLR</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-white/50 mb-2 font-mono">
              Duration (Days)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['7', '30', '90', '365'].map((days) => (
                <button
                  key={days}
                  onClick={() => setDuration(days)}
                  className={`py-3 rounded-lg font-mono text-sm transition-all ${
                    duration === days
                      ? 'bg-cyber-blue text-white'
                      : 'bg-glass-light text-white/70 hover:bg-glass-medium'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Strike Price (Optional) */}
          <div>
            <label className="block text-sm text-white/50 mb-2 font-mono">
              Strike Price (Optional - USD)
            </label>
            <input
              type="number"
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
              placeholder={`Default: 90% of current price`}
              className="input-cyber"
            />
            {currentPrice > 0 && (
              <p className="text-xs text-white/30 mt-2">
                Current {selectedAsset} price: ${currentPrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Premium Calculation */}
          <div className="p-4 bg-gradient-to-r from-cyber-pink/10 to-cyber-purple/10 rounded-xl border border-cyber-pink/20">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-cyber-pink" />
              <span className="text-sm text-white/70 font-mono">Premium Calculation</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Coverage</span>
                <span className="text-white font-mono">{coverage || '0'} WFLR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Duration</span>
                <span className="text-white font-mono">{duration} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Base Rate</span>
                <span className="text-white font-mono">{policyType?.baseRate}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total Premium</span>
                  <span className="font-display text-xl font-bold text-cyber-pink">
                    {premium} WFLR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-cyber-blue/10 rounded-xl border border-cyber-blue/20">
            <Zap className="w-5 h-5 text-cyber-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/70">
              <p className="font-semibold text-cyber-blue mb-1">Automatic Payouts</p>
              <p>When the trigger condition is met, your payout is processed automatically via FTSO price verification. No claims process needed.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-xl border border-white/10 text-white/70 font-display font-semibold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyber-pink to-cyber-purple text-white font-display font-semibold hover:shadow-neon-pink transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Purchase Policy
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
