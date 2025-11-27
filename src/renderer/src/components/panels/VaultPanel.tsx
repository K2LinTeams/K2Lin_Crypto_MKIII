import { useState, useEffect } from 'react'
import { Lock, Send, Copy, Trash2, Key, Unlock } from 'lucide-react'
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassComponents'
import { motion } from 'framer-motion'
import { useApi } from '../../useApi'
import { useTranslation } from 'react-i18next'

type Format = 'Base64' | 'Hex' | 'Natural Text (Markov)'

interface VaultPanelProps {
  inputData: string
  setInputData: (data: string) => void
  outputData: string
  setOutputData: (data: string) => void
  isEncrypted: boolean
  setIsEncrypted: (val: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encryptedPackage: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEncryptedPackage: (pkg: any) => void
  currentFormat: Format
  setCurrentFormat: (fmt: Format) => void
}

export default function VaultPanel({
  inputData,
  setInputData,
  outputData,
  setOutputData,
  isEncrypted,
  setIsEncrypted,
  encryptedPackage,
  setEncryptedPackage,
  currentFormat,
  setCurrentFormat
}: VaultPanelProps) {
  const [secretKey, setSecretKey] = useState('')
  const api = useApi()
  const { t } = useTranslation('vault')

  const handleProcess = async (mode: 'encrypt' | 'decrypt'): Promise<void> => {
    if (!secretKey) return

    try {
      if (mode === 'decrypt') {
        // Decrypt Logic
        let encryptedObj = encryptedPackage

        if (!encryptedObj && outputData) {
            // Try to parse outputData if encryptedPackage is null (e.g. pasted data)
             if (currentFormat === 'Natural Text (Markov)') {
                const decodedBytes = await api.nlp.decode(outputData)
                const jsonString = new TextDecoder().decode(decodedBytes)
                encryptedObj = JSON.parse(jsonString)
              } else {
                try {
                  encryptedObj = JSON.parse(atob(outputData))
                } catch {
                  encryptedObj = JSON.parse(outputData)
                }
              }
        }

        if (!encryptedObj) {
            alert('No encrypted data found to decrypt.')
            return
        }

        const result = await api.crypto.decrypt(
          encryptedObj.ciphertext,
          encryptedObj.iv,
          encryptedObj.salt,
          encryptedObj.tag,
          secretKey
        )

        setInputData(result)
        setIsEncrypted(false)
        setOutputData('')
        setEncryptedPackage(null)
      } else {
        // Encrypt Logic
        if (!inputData) return
        const result = await api.crypto.encrypt(inputData, secretKey)
        setEncryptedPackage(result)
        setIsEncrypted(true)
        setInputData('') // Clear input for security
        formatOutput(result, currentFormat)
      }
    } catch (error) {
      console.error(error)
      alert(t('operationFailed') + ': ' + (error as Error).message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatOutput = async (data: any, format: Format): Promise<void> => {
    const jsonString = JSON.stringify(data)

    if (format === 'Base64') {
      setOutputData(btoa(jsonString))
    } else if (format === 'Hex') {
      setOutputData(Buffer.from(jsonString).toString('hex'))
    } else if (format === 'Natural Text (Markov)') {
      const buffer = new TextEncoder().encode(jsonString)
      const text = await api.nlp.encode(buffer.buffer)
      setOutputData(text)
    }
  }

  useEffect(() => {
    if (isEncrypted && encryptedPackage) {
      formatOutput(encryptedPackage, currentFormat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormat])

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
  }

  const generateRandomKey = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const key = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    setSecretKey(key);
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto h-full">
      <GlassCard className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
           <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Lock size={14} /> {t('sessionKey')}
          </h3>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={generateRandomKey}
            icon={<Key size={14} />}
            className="text-xs"
          >
            {t('generateRandom')}
          </GlassButton>
        </div>
        <GlassInput
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder={t('enterKey')}
        />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Area */}
        <GlassCard className="flex flex-col gap-2 min-h-[300px]">
          <label className="text-xs text-text-secondary font-bold uppercase">{t('rawData')}</label>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            disabled={isEncrypted}
            placeholder={t('enterMessage')}
            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-text-primary placeholder-text-secondary/30 font-mono text-sm"
          ></textarea>
        </GlassCard>

        {/* Action Button (Centered Overlay for Desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none gap-4">
           <div className="pointer-events-auto flex flex-col gap-2">
             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleProcess('encrypt')}
               className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white p-4 rounded-full shadow-[0_0_20px_rgba(var(--accent-primary),0.4)] flex items-center justify-center"
               title={t('encrypt')}
               disabled={isEncrypted}
             >
               <Send size={24} />
             </motion.button>

             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleProcess('decrypt')}
               className="bg-bg-secondary border border-glass-border text-text-secondary hover:text-white p-3 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm"
               title={t('decrypt')}
             >
               <Unlock size={20} />
             </motion.button>
           </div>
        </div>
        {/* Mobile Action Button */}
        <div className="lg:hidden flex justify-center gap-4 py-2">
           <GlassButton onClick={() => handleProcess('encrypt')} variant="primary" icon={<Send />}>
             {t('encrypt')}
           </GlassButton>
           <GlassButton onClick={() => handleProcess('decrypt')} variant="secondary" icon={<Unlock />}>
             {t('decrypt')}
           </GlassButton>
        </div>


        {/* Output Area */}
        <GlassCard className="flex flex-col gap-2 min-h-[300px] relative group">
          <div className="flex justify-between items-center">
            <label className="text-xs text-text-secondary font-bold uppercase">{t('encryptedPayload')}</label>
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(outputData)} className="p-1 hover:text-accent-primary text-text-secondary">
                <Copy size={14} />
              </button>
              <button onClick={() => { setOutputData(''); setEncryptedPackage(null); setIsEncrypted(false); }} className="p-1 hover:text-danger text-text-secondary">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <textarea
            value={outputData}
            onChange={(e) => setOutputData(e.target.value)}
            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-accent-primary placeholder-text-secondary/30 font-mono text-sm text-xs break-all leading-relaxed"
            placeholder={t('waitingForData')}
          />

          {outputData && (
             <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/20 shadow-[0_0_15px_rgba(var(--accent-primary),0.5)] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
          )}
        </GlassCard>
      </div>

       <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {(['Base64', 'Hex', 'Natural Text (Markov)'] as Format[]).map((fmt) => (
          <GlassButton
            key={fmt}
            onClick={() => setCurrentFormat(fmt)}
            variant={currentFormat === fmt ? 'primary' : 'secondary'}
            size="sm"
            className="whitespace-nowrap"
          >
            {fmt}
          </GlassButton>
        ))}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
