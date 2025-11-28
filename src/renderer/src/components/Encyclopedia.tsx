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
  // Map initial topic 'ecc-step1' etc to simple keys
  const getTabFromTopic = (topic: string) => {
    if (topic.includes('ecc')) return 'ecc'
    if (topic.includes('aes')) return 'aes'
    if (topic.includes('stego')) return 'stego'
    return 'ecc'
  }

  const [activeTab, setActiveTab] = useState(getTabFromTopic(initialTopic))

  const tabs = [
    { id: 'ecc', label: t('tabs.ecc') },
    { id: 'aes', label: t('tabs.aes') },
    { id: 'stego', label: t('tabs.stego') },
    { id: 'diff', label: t('tabs.diff') },
    { id: 'id', label: t('tabs.id') },
  ]

  return (
    <div className="flex flex-col h-full w-full">
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
            {activeTab === 'ecc' && <ECCBlock t={t} />}
            {activeTab === 'aes' && <AESBlock t={t} />}
            {activeTab === 'stego' && <StegoBlock t={t} />}
            {activeTab === 'diff' && <DiffBlock t={t} />}
            {activeTab === 'id' && <IDBlock t={t} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* --- Content Blocks --- */

function ECCBlock({ t }: { t: any }) {
  return (
    <>
      <h2 className="text-xl font-bold text-accent-secondary flex items-center gap-2">
        <Shield size={24} /> {t('ecc.title')}
      </h2>

      {/* Animation: Color Mixing / ECDH */}
      <div className="w-full h-40 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10 my-2">
         <div className="flex items-center gap-8 relative z-10">
            {/* Alice */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-white/50">Alice (Priv)</span>
                <motion.div
                   className="w-8 h-8 rounded-full bg-red-500 border-2 border-white/20"
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                />
            </div>

            {/* Public Base */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-white/50">Public</span>
                <motion.div
                   className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-white/20"
                />
            </div>

            {/* Bob */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-white/50">Bob (Priv)</span>
                <motion.div
                   className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white/20"
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
            </div>
         </div>

         {/* Mixing Animation Lines */}
         <motion.div
            className="absolute top-1/2 left-1/2 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-50 blur-md"
            style={{ transform: 'translate(-50%, -50%)' }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ repeat: Infinity, duration: 3 }}
         />

         <div className="absolute bottom-4 flex gap-4 text-xs font-mono">
             <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                 <span className="text-purple-300">Shared Secret</span>
             </div>
         </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-accent-secondary">
          <h3 className="text-sm font-bold text-white mb-1">{t('ecc.analogyTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{t('ecc.analogy')}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-white/20">
          <h3 className="text-sm font-bold text-white mb-1">{t('ecc.techTitle')}</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">{t('ecc.tech')}</p>
        </div>
      </div>
    </>
  )
}

function IDBlock({ t }: { t: any }) {
  return (
    <>
      <h2 className="text-xl font-bold text-accent-primary flex items-center gap-2">
        <Shield size={24} /> {t('id.title')}
      </h2>

      {/* Animation: Signing */}
      <div className="w-full h-40 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10 my-2">

        {/* Document */}
        <div className="w-32 h-24 bg-white/10 border border-white/20 rounded p-2 flex flex-col gap-1 relative shadow-lg">
          <div className="w-8 h-8 rounded bg-white/10 mb-2 flex items-center justify-center">
            <User size={16} className="text-white/50" />
          </div>
          <div className="w-full h-1 bg-white/10 rounded"></div>
          <div className="w-2/3 h-1 bg-white/10 rounded"></div>
          <div className="w-3/4 h-1 bg-white/10 rounded"></div>

          {/* Signature Mark */}
          <motion.div
            className="absolute bottom-2 right-2 border-2 border-accent-secondary rounded-full w-8 h-8 flex items-center justify-center rotate-[-12deg]"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
               repeat: Infinity,
               duration: 3,
               delay: 1.5,
               repeatDelay: 0.5
            }}
          >
             <div className="text-[6px] font-bold text-accent-secondary">SIG</div>
          </motion.div>
        </div>

        {/* The Pen / Stamp Tool */}
        <motion.div
           className="absolute"
           animate={{
              x: [20, 0, 20],
              y: [-20, 20, -20],
              opacity: [0, 1, 0]
           }}
           transition={{
              repeat: Infinity,
              duration: 3,
              repeatDelay: 0.5
           }}
        >
           <div className="w-4 h-12 bg-accent-secondary rounded-full shadow-[0_0_10px_rgba(var(--accent-secondary),0.5)] origin-bottom rotate-[30deg]"></div>
        </motion.div>

      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-accent-primary">
          <h3 className="text-sm font-bold text-white mb-1">{t('id.analogyTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{t('id.analogy')}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border-l-2 border-white/20">
          <h3 className="text-sm font-bold text-white mb-1">{t('id.techTitle')}</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">{t('id.tech')}</p>
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
         {/* ECC Column */}
         <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col items-center text-center gap-3">
            <h3 className="font-bold text-accent-secondary">ECC</h3>
            <Shield size={32} className="text-accent-secondary" />

            <div className="w-full bg-black/20 rounded p-2 text-xs">
               <div className="text-white/50 mb-1">{t('diff.speed')}</div>
               <div className="text-red-300 font-mono">{t('diff.speedEcc')}</div>
            </div>

            <div className="w-full bg-black/20 rounded p-2 text-xs">
               <div className="text-white/50 mb-1">{t('diff.keys')}</div>
               <div className="text-accent-secondary font-mono flex justify-center gap-2">
                  <Key size={12} /><Key size={12} className="text-accent-primary" />
               </div>
               <div className="text-white/80 mt-1">{t('diff.keysEcc')}</div>
            </div>

            <div className="mt-auto text-[10px] text-text-secondary">
               {t('diff.useCaseEcc')}
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
