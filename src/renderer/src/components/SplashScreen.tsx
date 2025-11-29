import React from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  // Use a timeout to trigger the onComplete callback after a few seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/80 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 bg-accent-primary/10 rounded-2xl flex items-center justify-center border border-accent-primary/30 shadow-[0_0_30px_rgba(var(--accent-primary),0.3)]">
            <Shield size={48} className="text-accent-primary" />
          </div>
          {/* Scanning Effect */}
          <motion.div
             className="absolute top-0 left-0 w-full h-1 bg-accent-primary/50 blur-[2px]"
             animate={{ top: ['0%', '100%', '0%'] }}
             transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Text Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
            CRYPTO<span className="font-light">3</span>
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.8, duration: 1 }}
            className="h-px bg-white/20 mx-auto my-4"
          />
          <p className="text-sm text-text-secondary tracking-widest uppercase">
            System Initialization...
          </p>
        </motion.div>
      </div>

      {/* Version footer */}
      <div className="absolute bottom-8 text-white/20 text-xs font-mono">
        v1.0.4
      </div>
    </motion.div>
  )
}
