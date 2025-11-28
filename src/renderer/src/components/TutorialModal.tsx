import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { GlassCard, GlassButton } from './ui/GlassComponents'
import { Shield, Lock, Image as ImageIcon, User, ArrowRight, X, Check, Key, Unlock, UserPlus, RefreshCw } from 'lucide-react'

interface TutorialModalProps {
  onComplete: () => void
  onSkip: () => void
}

export default function TutorialModal({ onComplete, onSkip }: TutorialModalProps) {
  const { t } = useTranslation(['tutorial', 'vault', 'identity'])
  const [step, setStep] = useState(0)

  const steps = [
    // 1. Welcome
    {
      id: 'welcome',
      title: t('welcomeTitle', 'Welcome to Crypto3! 👋'),
      description: t('welcomeDesc', 'Your ultimate tool for secure communication and digital camouflage.'),
      icon: <Shield size={48} className="text-accent-primary" />,
    },
    // 2. RSA Step 1: Generate Identity
    {
      id: 'rsa-step1',
      title: t('rsaStep1Title', 'Start with RSA: Your Identity 🪪'),
      description: t('rsaStep1Desc', 'First, go to the ID panel and generate your Identity Card.'),
      icon: <User size={48} className="text-accent-secondary" />,
      extraContent: (
         <div className="mt-4 flex flex-col items-center gap-2 w-full">
            <div className="w-48 h-24 bg-gradient-to-br from-black/60 to-accent-primary/10 rounded-xl border border-accent-primary/30 relative overflow-hidden flex flex-col p-3 shadow-lg">
               <div className="flex justify-between items-start">
                   <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                       <User size={16} className="text-accent-primary" />
                   </div>
                   <div className="text-[10px] text-accent-primary font-mono opacity-70">CRYPTO3 ID</div>
               </div>
               <div className="mt-auto">
                   <div className="h-1.5 w-2/3 bg-white/10 rounded mb-1"></div>
                   <div className="h-1.5 w-1/2 bg-white/10 rounded"></div>
               </div>
               {/* Shine effect */}
               <motion.div
                  className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  animate={{ left: ['100%', '-100%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }}
               />
            </div>
            <p className="text-[10px] text-text-secondary opacity-70">{t('identity:title', 'Digital Identity')}</p>
         </div>
      )
    },
    // 3. RSA Step 2: Exchange
    {
      id: 'rsa-step2',
      title: t('rsaStep2Title', 'Exchange Identity Cards 🤝'),
      description: t('rsaStep2Desc', 'Send your card to a friend. Import theirs to verifying them.'),
      icon: <UserPlus size={48} className="text-green-400" />,
      extraContent: (
         <div className="mt-6 flex items-center justify-center gap-6 w-full relative h-16">
            {/* Card Left */}
            <motion.div
               className="w-12 h-16 bg-white/5 border border-white/10 rounded flex items-center justify-center absolute left-10"
               animate={{ x: [0, 60, 0], opacity: [1, 0, 1] }}
               transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 1] }}
            >
               <User size={20} className="text-accent-primary" />
            </motion.div>

            {/* Card Right */}
             <motion.div
               className="w-12 h-16 bg-white/5 border border-white/10 rounded flex items-center justify-center absolute right-10"
               animate={{ x: [0, -60, 0], opacity: [1, 0, 1] }}
               transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 1], delay: 1.5 }}
            >
               <User size={20} className="text-accent-secondary" />
            </motion.div>

            <RefreshCw size={20} className="text-text-secondary animate-spin-slow opacity-30" />
         </div>
      )
    },
    // 4. RSA Step 3: Encrypt
    {
      id: 'rsa-step3',
      title: t('rsaStep3Title', 'Encrypt for a Friend 🔒'),
      description: t('rsaStep3Desc', 'Select "Asymmetric (RSA)" in Vault and pick your friend.'),
      icon: <Lock size={48} className="text-accent-secondary" />,
      extraContent: (
         <div className="mt-4 w-full px-6">
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/40 border border-white/10">
               <div className="flex justify-between items-center text-xs text-text-secondary mb-1">
                  <span>{t('vault:targetRecipient', 'Target Recipient')}</span>
               </div>
               <div className="h-8 bg-white/5 rounded border border-white/10 flex items-center px-3 gap-2 text-sm text-accent-primary">
                  <User size={14} />
                  <span>Alice (Verified)</span>
                  <Check size={12} className="ml-auto text-green-400" />
               </div>
            </div>
         </div>
      )
    },
    // 5. AES Step 1: Shared Password
    {
      id: 'aes-step1',
      title: t('aesStep1Title', 'Simple Encryption (AES) 🔑'),
      description: t('aesStep1Desc', 'Agree on a password with your friend.'),
      icon: <Key size={48} className="text-yellow-400" />,
       extraContent: (
         <div className="mt-4 w-full px-6">
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/40 border border-white/10">
               <div className="flex justify-between items-center text-xs text-text-secondary mb-1">
                  <span>{t('vault:enterKeyShort', 'Enter key...')}</span>
               </div>
               <div className="h-8 bg-white/5 rounded border border-white/10 flex items-center px-3 text-sm tracking-widest text-text-primary">
                  ••••••••••••
               </div>
               <div className="text-[10px] text-text-secondary text-right">
                  AES-256-GCM
               </div>
            </div>
         </div>
      )
    },
    // 6. AES Step 2: Decrypt
    {
      id: 'aes-step2',
      title: t('aesStep2Title', 'Decrypting with AES 🔓'),
      description: t('aesStep2Desc', 'The recipient must enter the exact same password.'),
      icon: <Unlock size={48} className="text-yellow-400" />,
    },
    // 7. Stego
    {
      id: 'stego',
      title: t('stegoTitle', 'Invisible Ink 🖼️'),
      description: t('stegoDesc', 'Hide data inside images using Steganography.'),
      icon: <ImageIcon size={48} className="text-blue-400" />,
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="relative overflow-hidden border-accent-primary/30 shadow-[0_0_50px_rgba(var(--accent-primary),0.15)]">

            {/* Background Blob for visual flair */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-primary/20 blur-[60px] rounded-full pointer-events-none" />

            {/* Close / Skip Button */}
            <div className="absolute top-4 right-4 z-10">
                 <button
                    onClick={onSkip}
                    className="p-2 text-text-secondary hover:text-white transition-colors"
                    title={t('skip', 'Skip Intro')}
                 >
                    <X size={20} />
                 </button>
            </div>

            <div className="flex flex-col items-center text-center pt-8 pb-4 px-2">

                {/* Content Transition */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center gap-6 w-full min-h-[220px]"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                            {steps[step].icon}
                        </div>

                        <div className="space-y-2 w-full">
                            <h2 className="text-xl font-bold text-white">
                                {steps[step].title}
                            </h2>
                            <p className="text-sm text-text-secondary leading-relaxed px-4">
                                {steps[step].description}
                            </p>

                            {/* Render Extra Content if available */}
                            {/* @ts-ignore */}
                            {steps[step].extraContent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex justify-center"
                                >
                                    {/* @ts-ignore */}
                                    {steps[step].extraContent}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex gap-1.5 mt-8 mb-6">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                i === step ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/10'
                            }`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="w-full">
                    <GlassButton
                        variant="primary"
                        size="lg"
                        className="w-full justify-center group"
                        onClick={handleNext}
                    >
                        {step === steps.length - 1 ? (
                            <>
                                {t('finish', 'Let\'s Rock! 🚀')}
                                <Check size={18} className="ml-2" />
                            </>
                        ) : (
                            <>
                                {t('next', 'Next')}
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </GlassButton>
                </div>
            </div>

        </GlassCard>
      </motion.div>
    </div>
  )
}
