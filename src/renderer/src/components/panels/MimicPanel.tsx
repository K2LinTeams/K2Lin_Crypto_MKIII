import React, { useRef, useState } from 'react'
import { Image, FileWarning, Download, Upload, ArrowRight } from 'lucide-react'
import { GlassCard } from '../ui/GlassComponents'
import { motion } from 'framer-motion'
import { useApi } from '../../useApi'
import { useTranslation } from 'react-i18next'

interface MimicPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encryptedPackage: any
  isEncrypted: boolean
  onExtract: (data: string) => void
}

export default function MimicPanel({ encryptedPackage, isEncrypted, onExtract }: MimicPanelProps) {
  const [stegoImage, setStegoImage] = useState<string | null>(null)
  const [stegoStatus, setStegoStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const api = useApi()
  const { t } = useTranslation('mimic')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    const arrayBuffer = await file.arrayBuffer()

    if (isEncrypted && encryptedPackage) {
      // Embedding mode
      setStegoStatus(t('embedding'))
      try {
        const payload = JSON.stringify(encryptedPackage)
        const payloadBuffer = new TextEncoder().encode(payload)

        const pngBuffer = await api.stego.embed(arrayBuffer, payloadBuffer.buffer)

        // Fix: Explicitly cast to any or check type to satisfy TS strictness about ArrayBufferView
        const blob = new Blob([pngBuffer as unknown as BlobPart], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        setStegoImage(url)
        setStegoStatus(t('encryptionComplete'))
      } catch (err) {
        setStegoStatus('Error: ' + (err as Error).message)
      }
    } else {
      // Extraction mode
      setStegoStatus(t('scanning'))
      try {
        const payloadBuffer = await api.stego.extract(arrayBuffer)
        const payloadStr = new TextDecoder().decode(payloadBuffer)

        // Callback to parent to handle the extracted data
        onExtract(payloadStr)
        setStegoStatus(t('dataFound'))
      } catch {
        setStegoStatus(t('noDataFound'))
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex p-6 rounded-full bg-bg-secondary/50 border border-glass-border mb-6"
        >
          <Image size={48} className="text-text-secondary" />
        </motion.div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">{t('title')}</h2>
        <p className="text-text-secondary">{t('description')}</p>
      </div>

      <GlassCard className="w-full max-w-2xl bg-orange-500/5 border-orange-500/20 mb-8">
        <div className="flex gap-4">
            <FileWarning className="text-orange-500 flex-shrink-0" />
            <div className="text-xs text-orange-200/80">
              <strong>{t('warning')}:</strong> {t('warningText')}
            </div>
        </div>
      </GlassCard>

      <div className="flex flex-col items-center gap-4 w-full max-w-xl">
        {isEncrypted && (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-accent-primary bg-accent-primary/10 px-4 py-2 rounded-full text-sm border border-accent-primary/20"
             >
                <ArrowRight size={16} /> Encrypted Payload Ready for Embedding
             </motion.div>
        )}

        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                isEncrypted
                ? 'border-accent-primary/50 bg-accent-primary/5 hover:bg-accent-primary/10'
                : 'border-glass-border hover:border-accent-primary/50 hover:bg-glass-bg'
            }`}
            onClick={() => fileInputRef.current?.click()}
        >
            <div className={`p-4 rounded-full ${isEncrypted ? 'bg-accent-primary/20' : 'bg-bg-secondary'}`}>
                {isEncrypted ? <Upload size={32} className="text-accent-primary"/> : <Download size={32} className="text-text-secondary"/>}
            </div>
            <div className={isEncrypted ? 'text-accent-primary font-bold' : 'text-text-secondary group-hover:text-accent-primary font-bold'}>
            {isEncrypted ? t('clickToEmbed') : t('uploadToExtract')}
            </div>
            <div className="text-xs text-text-secondary">{t('supports')}</div>
        </motion.div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="h-8 mt-6">
        {stegoStatus && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-accent-primary animate-pulse">
                {stegoStatus}
            </motion.div>
        )}
      </div>

      {stegoImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center">
          <h3 className="text-sm text-text-secondary mb-4">{t('outputGenerated')}</h3>
          <a
            href={stegoImage}
            download="crypto3_stego_output.png"
            className="group relative block overflow-hidden rounded-xl border border-glass-border hover:border-accent-primary transition-all"
          >
            <img
              src={stegoImage}
              alt="Stego Output"
              className="max-w-xs rounded-xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Download size={32} className="text-white" />
            </div>
          </a>
        </motion.div>
      )}
    </div>
  )
}
