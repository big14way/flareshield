import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Percent, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LiquidityModal({ position, poolStats, onClose, onAddLiquidity, onRemoveLiquidity }) {
  const [activeTab, setActiveTab] = useState('add');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (activeTab === 'add') {
        await onAddLiquidity(amount);
        toast.success('Liquidity added successfully!');
      } else {
        await onRemoveLiquidity(amount);
        toast.success('Liquidity removed successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Liquidity error:', error);
      toast.error(error.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    if (activeTab === 'add') {
      setAmount('10000'); // User's wallet balance would go here
    } else {
      setAmount(position?.amount || '0');
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
        className="relative w-full max-w-md glass-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">
              Manage Liquidity
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-glass-light flex items-center justify-center hover:bg-glass-medium transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-4 font-display text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'add'
                ? 'text-cyber-green border-b-2 border-cyber-green bg-cyber-green/5'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add
          </button>
          <button
            onClick={() => setActiveTab('remove')}
            className={`flex-1 py-4 font-display text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'remove'
                ? 'text-cyber-pink border-b-2 border-cyber-pink bg-cyber-pink/5'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Minus className="w-4 h-4 inline mr-2" />
            Remove
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current Position */}
          <div className="p-4 bg-flare-dark/50 rounded-xl">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Your Position</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-white">
                {position?.amount || '0'}
              </span>
              <span className="text-white/50 font-mono">WFLR</span>
            </div>
            {position?.pendingRewards && parseFloat(position.pendingRewards) > 0 && (
              <div className="mt-2 text-sm text-cyber-green">
                +{position.pendingRewards} WFLR pending rewards
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/50 font-mono">
                Amount (WFLR)
              </label>
              <button
                onClick={setMaxAmount}
                className="text-sm text-cyber-blue hover:text-cyber-blue/80 font-mono"
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-cyber text-xl font-mono"
            />
          </div>

          {/* Pool Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Pool APY</span>
              <span className="text-cyber-green font-mono">15.00%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Pool Utilization</span>
              <span className="text-white font-mono">{poolStats?.utilizationRate || '0'}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Available Liquidity</span>
              <span className="text-white font-mono">{poolStats?.availableLiquidity || '0'} WFLR</span>
            </div>
          </div>

          {/* Info Box */}
          {activeTab === 'remove' && (
            <div className="flex items-start gap-3 p-4 bg-cyber-yellow/10 rounded-xl border border-cyber-yellow/20">
              <Info className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/70">
                You can only withdraw liquidity that is not currently backing active policies.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-xl font-display font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-cyber-green to-cyber-blue text-white hover:shadow-neon-green'
                : 'bg-gradient-to-r from-cyber-pink to-cyber-orange text-white hover:shadow-neon-pink'
            }`}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : activeTab === 'add' ? (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Liquidity
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Minus className="w-5 h-5" />
                Remove Liquidity
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
