import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Lock, Key, Image as ImageIcon, Shield, Zap, User } from 'lucide-react'

interface EncyclopediaProps {
  initialTopic: string
  onBack: () => void
}

export default function Encyclopedia({ initialTopic, onBack }: EncyclopediaProps) {
  const { t } = useTranslation(['encyclopedia', 'tutorial'])
  // Map initial topic 'rsa-step1' etc to simple keys
  const getTabFromTopic = (topic: string) => {
    if (topic.includes('rsa')) return 'rsa'
    if (topic.includes('aes')) return 'aes'
    if (topic.includes('stego')) return 'stego'
    return 'rsa'
  }

  const [activeTab, setActiveTab] = useState(getTabFromTopic(initialTopic))

  const tabs = [
    { id: 'rsa', label: t('tabs.rsa') },
    { id: 'aes', label: t('tabs.aes') },
    { id: 'stego', label: t('tabs.stego') },
    { id: 'diff', label: t('tabs.diff') },
  ]

  return (
    <div className="flex flex-col h-full w-full max-h-[600px]">
      {/* Header & Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(var(--accent-primary),0.4)]'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden rounded-xl bg-black/20 border border-white/5 p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar"
          >
            {activeTab === 'rsa' && <RSABlock t={t} />}
            {activeTab === 'aes' && <AESBlock t={t} />}
            {activeTab === 'stego' && <StegoBlock t={t} />}
            {activeTab === 'diff' && <DiffBlock t={t} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* --- Content Blocks --- */

function RSABlock({ t }: { t: any }) {
  return (
    <>
      <h2 className="text-xl font-bold text-accent-secondary flex items-center gap-2">
        <Shield size={24} /> {t('rsa.title')}
      </h2>

      {/* Animation: Mailbox */}
      <div className="w-full h-40 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10 my-2">
         {/* Mailbox Body */}
         <div className="relative">
            <motion.div
               className="w-16 h-20 bg-white/10 rounded-t-full border-2 border-white/20 flex items-center justify-center"
            >
               <div className="w-12 h-1 bg-black/50 mt-4 rounded-full" />
            </motion.div>

            {/* Letter (Public Input) */}
            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 45, 45, 0], opacity: [0, 1, 0, 0], scale: [1, 0.5, 0, 0] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.2, 0.3, 1] }}
            >
               <div className="w-8 h-6 bg-accent-primary rounded flex items-center justify-center text-[8px] text-black font-bold">MSG</div>
            </motion.div>

            {/* Lock (Public Key) */}
            <motion.div
               className="absolute -right-8 top-0 text-accent-secondary"
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
               transition={{ repeat: Infinity, duration: 2 }}
            >
               <Lock size={16} />
               <span className="text-[8px] block text-center">Pub</span>
            </motion.div>

             {/* Key (Private Key) */}
             <motion.div
               className="absolute -left-8 bottom-0 text-accent-primary"
               animate={{ rotate: [0, -45, 0], x: [0, 5, 0] }}
               transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            >
               <Key size={16} />
               <span className="text-[8px] block text-center">Priv</span>
            </motion.div>
         </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-accent-secondary">
          <h3 className="text-sm font-bold text-white mb-1">{t('rsa.analogyTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{t('rsa.analogy')}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-white/20">
          <h3 className="text-sm font-bold text-white mb-1">{t('rsa.techTitle')}</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">{t('rsa.tech')}</p>
        </div>
      </div>
    </>
  )
}

function AESBlock({ t }: { t: any }) {
  return (
    <>
      <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
        <Lock size={24} /> {t('aes.title')}
      </h2>

      {/* Animation: Safe */}
      <div className="w-full h-40 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10 my-2">
         <div className="flex items-center gap-8">
            {/* Person A */}
            <div className="flex flex-col items-center gap-2">
               <User size={20} className="text-white/50" />
               <motion.div
                  animate={{ x: [0, 40, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
               >
                  <Key size={20} className="text-yellow-400" />
               </motion.div>
            </div>

            {/* The Safe */}
            <div className="w-16 h-16 border-2 border-white/20 rounded bg-white/5 flex items-center justify-center relative">
               <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3, times: [0.4, 0.5, 0.6] }}
               >
                  <Lock size={24} className="text-yellow-400/80" />
               </motion.div>
            </div>

             {/* Person B */}
             <div className="flex flex-col items-center gap-2">
               <User size={20} className="text-white/50" />
               <motion.div
                  animate={{ x: [0, -40, 0], opacity: [0, 1, 0] }} // Key appears when it arrives? Analogy is shared key
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }}
               >
                  <Key size={20} className="text-yellow-400" />
               </motion.div>
            </div>
         </div>
         <div className="absolute bottom-2 text-[10px] text-yellow-400/50 font-mono tracking-widest">SAME KEY</div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-yellow-400">
          <h3 className="text-sm font-bold text-white mb-1">{t('aes.analogyTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{t('aes.analogy')}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-white/20">
          <h3 className="text-sm font-bold text-white mb-1">{t('aes.techTitle')}</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">{t('aes.tech')}</p>
        </div>
      </div>
    </>
  )
}

function StegoBlock({ t }: { t: any }) {
  // Generate a small grid of pixels
  const pixels = Array.from({ length: 16 }).map((_, i) => i)

  return (
    <>
      <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
        <ImageIcon size={24} /> {t('stego.title')}
      </h2>

      {/* Animation: Pixel Grid */}
      <div className="w-full h-40 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10 my-2 flex-col gap-2">

         <div className="grid grid-cols-8 gap-1">
            {pixels.map(i => (
               <motion.div
                  key={i}
                  className="w-3 h-3 rounded-[1px] bg-blue-500/40"
                  animate={{
                     backgroundColor: ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.4)']
                  }}
                  transition={{
                     duration: 2,
                     delay: i * 0.1,
                     repeat: Infinity,
                     repeatDelay: 2
                  }}
               />
            ))}
         </div>

         <div className="flex items-center gap-2 text-[10px] font-mono text-blue-300/80">
            <span>R: 255</span>
            <ArrowLeft size={10} />
            <span className="text-white">1111111<span className="text-red-400 font-bold">1</span></span>
            <span>-&gt;</span>
            <span className="text-white">1111111<span className="text-green-400 font-bold">0</span></span>
         </div>

      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-blue-400">
          <h3 className="text-sm font-bold text-white mb-1">{t('stego.analogyTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{t('stego.analogy')}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-white/20">
          <h3 className="text-sm font-bold text-white mb-1">{t('stego.techTitle')}</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">{t('stego.tech')}</p>
        </div>
      </div>
    </>
  )
}

function DiffBlock({ t }: { t: any }) {
  return (
    <>
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
        <Zap size={24} className="text-yellow-400" />
        <span className="text-white">{t('diff.title')}</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 h-full">
         {/* RSA Column */}
         <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col items-center text-center gap-3">
            <h3 className="font-bold text-accent-secondary">RSA</h3>
            <Shield size={32} className="text-accent-secondary" />

            <div className="w-full bg-black/20 rounded p-2 text-xs">
               <div className="text-white/50 mb-1">{t('diff.speed')}</div>
               <div className="text-red-300 font-mono">{t('diff.speedRsa')}</div>
            </div>

            <div className="w-full bg-black/20 rounded p-2 text-xs">
               <div className="text-white/50 mb-1">{t('diff.keys')}</div>
               <div className="text-accent-secondary font-mono flex justify-center gap-2">
                  <Key size={12} /><Key size={12} className="text-accent-primary" />
               </div>
               <div className="text-white/80 mt-1">{t('diff.keysRsa')}</div>
            </div>

            <div className="mt-auto text-[10px] text-text-secondary">
               {t('diff.useCaseRsa')}
            </div>
         </div>

         {/* AES Column */}
         <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col items-center text-center gap-3">
            <h3 className="font-bold text-yellow-400">AES</h3>
            <Lock size={32} className="text-yellow-400" />

            <div className="w-full bg-black/20 rounded p-2 text-xs">
               <div className="text-white/50 mb-1">{t('diff.speed')}</div>
               <div className="text-green-300 font-mono">{t('diff.speedAes')}</div>
            </div>

            <div className="w-full bg-black/20 rounded p-2 text-xs">
               <div className="text-white/50 mb-1">{t('diff.keys')}</div>
               <div className="text-yellow-400 font-mono flex justify-center gap-2">
                  <Key size={12} />
               </div>
               <div className="text-white/80 mt-1">{t('diff.keysAes')}</div>
            </div>

            <div className="mt-auto text-[10px] text-text-secondary">
               {t('diff.useCaseAes')}
            </div>
         </div>
      </div>
    </>
  )
}
