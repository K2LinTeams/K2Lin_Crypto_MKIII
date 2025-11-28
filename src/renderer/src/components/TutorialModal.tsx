import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { GlassCard, GlassButton } from './ui/GlassComponents'
import { Shield, Lock, Image as ImageIcon, User, ArrowRight, X, Check, ArrowLeft } from 'lucide-react'

interface TutorialModalProps {
  onComplete: () => void
  onSkip: () => void
}

export default function TutorialModal({ onComplete, onSkip }: TutorialModalProps) {
  const { t } = useTranslation('common')
  const [step, setStep] = useState(0)

  const steps = [
    {
      id: 'welcome',
      title: t('tutorial.welcomeTitle', 'Welcome to Crypto3! 👋'),
      description: t('tutorial.welcomeDesc', 'Your ultimate tool for secure communication and digital camouflage.'),
      icon: <Shield size={48} className="text-accent-primary" />,
    },
    {
      id: 'rsa-aes',
      title: t('tutorial.rsaAesTitle', 'Hybrid Encryption 🛡️'),
      description: t('tutorial.rsaAesDesc', 'We combine AES speed with RSA security.'),
      icon: <Lock size={48} className="text-accent-secondary" />,
      // Extra content for RSA/AES specific view
      extraContent: (
        <div className="mt-4 w-full flex flex-col items-center gap-4">
           {/* Mock Toggle Switch */}
           <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-text-secondary uppercase tracking-wider">{t('tutorial.lookFor', 'Look for this switch:')}</span>
              <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 relative">
                 <div className="px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary text-xs font-bold border border-accent-primary/30 shadow-[0_0_10px_rgba(var(--accent-primary),0.2)]">
                    {t('vault.symmetricAES', 'Symmetric (AES)')}
                 </div>
                 <div className="px-3 py-1.5 rounded-lg text-text-secondary/50 text-xs font-medium">
                    {t('vault.asymmetricRSA', 'Asymmetric (RSA)')}
                 </div>
                 {/* Animated Pointer */}
                 <motion.div
                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-accent-primary"
                    animate={{ x: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                 >
                    <ArrowLeft size={24} />
                 </motion.div>
              </div>
           </div>

           {/* Pro Tip Box */}
           <div className="bg-accent-secondary/5 border border-accent-secondary/10 rounded-lg p-3 text-left w-full">
              <p className="text-xs text-text-secondary leading-relaxed">
                 {t('tutorial.rsaAesTip', 'Pro Tip: AES for personal files, RSA for sharing secrets.')}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'stego',
      title: t('tutorial.stegoTitle', 'Invisible Ink 🖼️'),
      description: t('tutorial.stegoDesc', 'Hide data inside images using Steganography.'),
      icon: <ImageIcon size={48} className="text-blue-400" />,
    },
    {
      id: 'identity',
      title: t('tutorial.identityTitle', 'Identity Cards 🪪'),
      description: t('tutorial.identityDesc', 'Create and verify digital identities.'),
      icon: <User size={48} className="text-purple-400" />,
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
                    title={t('tutorial.skip', 'Skip Intro')}
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
                        className="flex flex-col items-center gap-6 w-full"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                            {steps[step].icon}
                        </div>

                        <div className="space-y-2 w-full">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                {steps[step].title}
                            </h2>
                            <p className="text-text-secondary leading-relaxed">
                                {steps[step].description}
                            </p>

                            {/* Render Extra Content if available (e.g. for RSA/AES) */}
                            {/* @ts-ignore */}
                            {steps[step].extraContent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {/* @ts-ignore */}
                                    {steps[step].extraContent}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex gap-2 mt-8 mb-6">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
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
                                {t('tutorial.finish', 'Let\'s Rock! 🚀')}
                                <Check size={18} className="ml-2" />
                            </>
                        ) : (
                            <>
                                {t('tutorial.next', 'Next ➡')}
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
