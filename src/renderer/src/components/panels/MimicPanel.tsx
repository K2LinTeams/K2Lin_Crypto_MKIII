import React, { useRef, useState, useEffect } from 'react'
import { Image, FileWarning, Download, Upload, ArrowRight, Settings, Eye } from 'lucide-react'
import { GlassCard, GlassButton, TechHeader, MobileTabSwitcher } from '../ui/GlassComponents'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '../../useApi'
import { useTranslation } from 'react-i18next'
import { useNotification } from '../NotificationContext'
import { useAchievements } from '../../hooks/useAchievements'

interface MimicPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encryptedPackage: any
  isEncrypted: boolean
  onExtract: (data: string) => void
}

export default function MimicPanel({ encryptedPackage, isEncrypted, onExtract }: MimicPanelProps) {
  const [stegoImage, setStegoImage] = useState<string | null>(null)
  const [stegoStatus, setStegoStatus] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [activeTab, setActiveTab] = useState<'setup' | 'preview'>('setup')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const api = useApi()
  const { t } = useTranslation('mimic')
  const { addNotification } = useNotification()
  const { unlock } = useAchievements()

  // Auto-switch to preview when image is ready
  useEffect(() => {
    if (stegoImage) {
      setActiveTab('preview')
    }
  }, [stegoImage])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    const arrayBuffer = await file.arrayBuffer()
    const embeddingMode = (isEncrypted && encryptedPackage) || (manualMode && manualInput)

    if (embeddingMode) {
      // Embedding mode
      setStegoStatus(t('embedding'))
      try {
        let payload = ''
        if (manualMode) {
          payload = manualInput
        } else {
          payload = JSON.stringify(encryptedPackage)
        }

        const payloadBuffer = new TextEncoder().encode(payload)
        const pngBuffer = await api.stego.embed(arrayBuffer, payloadBuffer.buffer)
        const blob = new Blob([pngBuffer as unknown as BlobPart], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        setStegoImage(url)
        setStegoStatus(t('encryptionComplete'))
        addNotification('success', t('encryptionComplete'))
        unlock('stego_unlocked')
      } catch (err) {
        const errMsg = 'Error: ' + (err as Error).message
        setStegoStatus(errMsg)
        addNotification('error', errMsg)
      }
    } else {
      // Extraction mode
      setStegoStatus(t('scanning'))
      try {
        const payloadBuffer = await api.stego.extract(arrayBuffer)
        const payloadStr = new TextDecoder().decode(payloadBuffer)
        onExtract(payloadStr)
        setStegoStatus(t('dataFound'))
        addNotification('success', t('dataFound'))
      } catch {
        setStegoStatus(t('noDataFound'))
        addNotification('error', t('noDataFound'))
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full px-2 lg:px-4">

      {/* Header Info */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
               <Image size={24} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-text-primary uppercase tracking-wide">{t('title')}</h2>
               <p className="text-xs text-text-secondary">{t('description')}</p>
            </div>
         </div>
         <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20 max-w-md">
             <FileWarning size={16} className="flex-shrink-0" />
             <span>{t('warningText')}</span>
         </div>
      </GlassCard>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden">
        <MobileTabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'setup', label: t('config'), icon: <Settings size={16} /> },
            { id: 'preview', label: t('outputPreview'), icon: <Eye size={16} /> }
          ]}
        />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">

        {/* Left Column: Configuration & Upload */}
        <div className={`h-full flex flex-col gap-6 ${activeTab === 'setup' ? 'flex' : 'hidden lg:flex'}`}>
           <GlassCard className="flex-1 flex flex-col">
              <TechHeader title={t('config')} icon={<Settings size={18} />} />

              {/* Mode Toggle */}
              {!isEncrypted && (
                <div className="flex p-1 bg-black/20 rounded-lg border border-glass-border mb-6">
                  <button
                    onClick={() => setManualMode(false)}
                    aria-label={t('extraction')}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wide rounded-md transition-all ${!manualMode ? 'bg-accent-primary/20 text-accent-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {t('extraction')}
                  </button>
                  <button
                    onClick={() => setManualMode(true)}
                    aria-label={t('manualEmbed')}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wide rounded-md transition-all ${manualMode ? 'bg-accent-primary/20 text-accent-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {t('manualEmbed')}
                  </button>
                </div>
              )}

              {/* Manual Input Area */}
              <AnimatePresence mode="wait">
                {manualMode && !isEncrypted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <label className="text-xs text-text-secondary font-bold uppercase mb-2 block">{t('secretPayload')}</label>
                    <textarea
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={t('enterPayload')}
                      className="w-full h-32 bg-black/20 rounded-xl border border-glass-border focus:border-accent-primary outline-none resize-none text-sm p-2 font-mono"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Indicator */}
              {(isEncrypted || (manualMode && manualInput)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 text-accent-primary bg-accent-primary/10 px-4 py-3 rounded-xl text-xs font-mono border border-accent-primary/20"
                >
                  <ArrowRight size={14} />
                  <span>{t('payloadReady')}</span>
                </motion.div>
              )}

              {/* Upload Area */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex-1 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[200px] ${
                  isEncrypted || (manualMode && manualInput)
                    ? 'border-accent-primary/50 bg-accent-primary/5 hover:bg-accent-primary/10'
                    : 'border-glass-border hover:border-accent-primary/50 hover:bg-glass-bg'
                }`}
                onClick={() => {
                  if (manualMode && !manualInput) {
                      addNotification('error', t('enterEmbedText'))
                    return
                  }
                  fileInputRef.current?.click()
                }}
              >
                <div className={`p-4 rounded-full ${isEncrypted || (manualMode && manualInput) ? 'bg-accent-primary/20' : 'bg-bg-secondary'}`}>
                  {isEncrypted || (manualMode && manualInput) ? (
                    <Upload size={32} className="text-accent-primary" />
                  ) : (
                    <Download size={32} className="text-text-secondary" />
                  )}
                </div>
                <div className="text-center">
                   <div className={
                      isEncrypted || (manualMode && manualInput)
                        ? 'text-accent-primary font-bold font-mono text-sm'
                        : 'text-text-secondary group-hover:text-accent-primary font-bold font-mono text-sm'
                    }>
                      {isEncrypted || (manualMode && manualInput) ? t('clickToEmbed') : t('uploadToExtract')}
                   </div>
                   <div className="text-xs text-text-secondary mt-1">{t('supports')}</div>
                </div>
              </motion.div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
           </GlassCard>
        </div>

        {/* Right Column: Preview & Output */}
        <div className={`h-full flex flex-col ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
           <GlassCard className="flex-1 flex flex-col items-center justify-center relative bg-black/20">
              <div className="absolute top-6 left-6 right-6">
                 <TechHeader title={t('outputPreview')} icon={<Eye size={18} />} />
              </div>

              {stegoImage ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 w-full mt-12"
                >
                  <div className="relative group rounded-xl overflow-hidden border border-glass-border shadow-2xl max-w-full max-h-[400px]">
                     <img src={stegoImage} alt="Stego Output" className="max-w-full max-h-[400px] object-contain" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <span className="text-white text-xs font-mono">{t('stegoEncoded')}</span>
                     </div>
                  </div>

                  <GlassButton
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = stegoImage
                      link.download = 'crypto3_stego_output.png'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    variant="primary"
                    icon={<Download size={18} />}
                    className="w-full max-w-xs"
                  >
                    {t('downloadResult')}
                  </GlassButton>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-text-secondary/30 gap-4">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                      <Image size={32} />
                   </div>
                   <span className="font-mono text-xs uppercase tracking-widest">{t('noOutput')}</span>
                </div>
              )}

              {/* Status Log Area */}
              <div className="absolute bottom-6 left-6 right-6">
                 {stegoStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-mono text-accent-primary bg-accent-primary/5 border-l-2 border-accent-primary pl-3 py-2"
                    >
                      <span className="opacity-50 mr-2">{new Date().toLocaleTimeString()}</span>
                      {stegoStatus}
                    </motion.div>
                 )}
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  )
}
