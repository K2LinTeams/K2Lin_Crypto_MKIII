import { useState, useEffect } from 'react'
import { Lock, Send, Copy, Trash2 } from 'lucide-react'
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassComponents'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '../../useApi'

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

  const handleProcess = async (): Promise<void> => {
    if (!secretKey) return

    try {
      if (isEncrypted) {
        // Decrypt
        let encryptedObj = encryptedPackage

        if (!encryptedObj) {
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
        // Encrypt
        const result = await api.crypto.encrypt(inputData, secretKey)
        setEncryptedPackage(result)
        setIsEncrypted(true)
        setInputData('')
        formatOutput(result, currentFormat)
      }
    } catch (error) {
      console.error(error)
      alert('Operation failed: ' + (error as Error).message)
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

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto h-full">
      <GlassCard className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
           <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Lock size={14} /> Session Key
          </h3>
          <button className="text-xs text-accent-primary hover:text-accent-secondary underline">
            Generate Random
          </button>
        </div>
        <GlassInput
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="Enter pre-shared key or password..."
        />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Area */}
        <GlassCard className="flex flex-col gap-2 min-h-[300px]">
          <label className="text-xs text-text-secondary font-bold uppercase">Raw Data (Plaintext)</label>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            disabled={isEncrypted}
            placeholder="Enter message to encrypt..."
            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-text-primary placeholder-text-secondary/30 font-mono text-sm"
          ></textarea>
        </GlassCard>

        {/* Action Button (Centered Overlay for Desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
           <div className="pointer-events-auto">
             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={handleProcess}
               className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white p-4 rounded-full shadow-[0_0_20px_rgba(var(--accent-primary),0.4)]"
             >
               <Send size={24} className={isEncrypted ? 'rotate-180 transition-transform' : ''} />
             </motion.button>
           </div>
        </div>
        {/* Mobile Action Button */}
        <div className="lg:hidden flex justify-center py-2">
           <GlassButton onClick={handleProcess} variant="primary" icon={<Send />}>
             {isEncrypted ? 'Decrypt' : 'Encrypt'}
           </GlassButton>
        </div>


        {/* Output Area */}
        <GlassCard className="flex flex-col gap-2 min-h-[300px] relative group">
          <div className="flex justify-between items-center">
            <label className="text-xs text-text-secondary font-bold uppercase">Encrypted Payload</label>
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(outputData)} className="p-1 hover:text-accent-primary text-text-secondary">
                <Copy size={14} />
              </button>
              <button onClick={() => { setOutputData(''); setEncryptedPackage(null); setIsEncrypted(false); }} className="p-1 hover:text-danger text-text-secondary">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              {outputData ? (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-accent-primary break-all font-mono leading-relaxed"
                >
                  {outputData}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full text-text-secondary/30 text-sm italic"
                >
                  Waiting for data...
                </motion.div>
              )}
            </AnimatePresence>
             {outputData && (
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/20 shadow-[0_0_15px_rgba(var(--accent-primary),0.5)] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
             )}
          </div>
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
