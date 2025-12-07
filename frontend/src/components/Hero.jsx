import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Activity, ArrowRight } from 'lucide-react';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Animated Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        <motion.div
          className="absolute inset-0 bg-cyber-pink/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-pink/10 border border-cyber-pink/30 rounded-full mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span className="text-sm font-mono text-cyber-pink">Live on Flare Coston2 Testnet</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Protect Your </span>
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue">
                Crypto Assets
              </span>
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-30 blur-xl"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
            <br />
            <span className="text-white">With </span>
            <span className="text-cyber-pink text-glow">Parametric Insurance</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-3xl mx-auto mb-12 font-body leading-relaxed"
          >
            Automatic payouts powered by Flare's native <span className="text-cyber-blue">FTSO oracle</span> and 
            <span className="text-cyber-green"> FDC verification</span>. No claims process. 
            No disputes. Just instant protection.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <motion.button
              onClick={onGetStarted}
              className="btn-neon group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Protected
              <ArrowRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Provide Liquidity
            </motion.button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Shield, text: 'FAssets Coverage', color: 'cyber-pink' },
              { icon: Zap, text: 'FTSO Price Feeds', color: 'cyber-blue' },
              { icon: Lock, text: 'FDC Verification', color: 'cyber-green' },
              { icon: Activity, text: 'Smart Accounts', color: 'cyber-purple' },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-glass-light rounded-full border border-white/10"
              >
                <feature.icon className={`w-4 h-4 text-${feature.color}`} />
                <span className="text-sm font-body text-white/80">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute -left-20 top-1/4 w-40 h-40 border border-cyber-pink/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -right-10 top-1/3 w-24 h-24 border border-cyber-blue/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </section>
  );
}
