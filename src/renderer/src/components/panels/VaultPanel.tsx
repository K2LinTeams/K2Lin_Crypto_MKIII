import { useState, useEffect } from 'react'
import { Eye, Copy, Trash2, Key, Unlock, Send, Image as ImageIcon, Keyboard, Code, Shield } from 'lucide-react'
import { GlassCard, GlassButton, GlassInput, TechHeader, MobileTabSwitcher } from '../ui/GlassComponents'
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
  secretKey: string
  setSecretKey: (key: string) => void
  onSwitchToStego: () => void
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
  setCurrentFormat,
  secretKey,
  setSecretKey,
  onSwitchToStego
}: VaultPanelProps) {
  const [showKey, setShowKey] = useState(false)
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input')
  const [highlightOutput, setHighlightOutput] = useState(false)
  const api = useApi()
  const { t, i18n } = useTranslation('vault')

  useEffect(() => {
    if (isEncrypted) {
      setActiveTab('output')
      setHighlightOutput(true)
      const timer = setTimeout(() => setHighlightOutput(false), 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isEncrypted])

  const handleProcess = async (mode: 'encrypt' | 'decrypt'): Promise<void> => {
    if (!secretKey) return

    try {
      if (mode === 'decrypt') {
        // Decrypt Logic
        let encryptedObj = encryptedPackage

        if (!encryptedObj && outputData) {
          // Try to parse outputData if encryptedPackage is null (e.g. pasted data)
          if (currentFormat === 'Natural Text (Markov)') {
            const decodedBytes = await api.nlp.decode(outputData, i18n.language)
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
          alert(t('noDataToDecrypt'))
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
        setActiveTab('input') // Switch to input to see result
      } else {
        // Encrypt Logic
        if (!inputData) return
        const result = await api.crypto.encrypt(inputData, secretKey)
        setEncryptedPackage(result)
        setIsEncrypted(true)
        setInputData('') // Clear input for security
        formatOutput(result, currentFormat)
        // Tab switch handled by useEffect now
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
      const buffer = new TextEncoder().encode(jsonString)
      const hex = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setOutputData(hex)
    } else if (format === 'Natural Text (Markov)') {
      const buffer = new TextEncoder().encode(jsonString)
      const text = await api.nlp.encode(buffer.buffer, i18n.language)
      setOutputData(text)
    }
    return Promise.resolve()
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
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    const key = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
    setSecretKey(key)
  }

  const handleShowKey = () => {
    setShowKey(true)
    setTimeout(() => setShowKey(false), 3000)
  }

  const handleClear = () => {
    setInputData('')
    setOutputData('')
    setEncryptedPackage(null)
    setIsEncrypted(false)
    setActiveTab('input')
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-4 px-2 lg:px-4 h-full overflow-hidden">
      {/* Top Section: Key Management */}
      <GlassCard className="flex flex-col gap-4 flex-shrink-0" gradient>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <TechHeader
            title={t('sessionKey')}
            subtitle={t('subtitle')}
            icon={<Shield size={18} />}
            className="mb-0 flex-1 w-full"
          />
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-text-secondary hover:text-accent-primary transition-colors rounded-lg hover:bg-glass-highlight"
              onClick={generateRandomKey}
              title={t('generateRandom')}
            >
              <Key size={16} />
            </button>
          </div>
        </div>

        <div className="relative">
          <GlassInput
            type={showKey ? 'text' : 'password'}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder={t('enterKeyShort')}
            className="pr-16 font-mono text-sm tracking-wide text-center"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <button
              className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-glass-highlight"
              onClick={handleShowKey}
              title={showKey ? t('common:hide') : t('common:show')}
            >
              <Eye size={16} className={showKey ? 'text-accent-primary' : ''} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button
              className="p-2 text-text-secondary hover:text-accent-primary transition-colors rounded-lg hover:bg-glass-highlight"
              onClick={() => copyToClipboard(secretKey)}
              disabled={!secretKey}
              title={t('copy')}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex-shrink-0">
        <MobileTabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'input', label: t('rawData'), icon: <Keyboard size={16} /> },
            { id: 'output', label: t('encryptedPayload'), icon: <Code size={16} /> }
          ]}
        />
      </div>

      {/* Main Split Layout - Centered and Constrained */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 w-full max-w-full items-start">

          {/* Left: Input Area */}
          <div className={`flex flex-col ${activeTab === 'input' ? 'flex' : 'hidden lg:flex'}`}>
            <GlassCard
              className="flex-1 flex flex-col min-h-[350px] lg:h-[450px]"
            >
              <div className="flex justify-between items-center mb-4">
                <TechHeader title={t('rawData')} icon={<Keyboard size={18} />} className="mb-0" />
                {isEncrypted && (
                  <button
                    onClick={handleClear}
                    className="px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded hover:bg-accent-primary/20 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    {t('clear')}
                  </button>
                )}
              </div>

              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                disabled={isEncrypted}
                placeholder={t('enterMessageShort')}
                className="flex-1 bg-transparent border-none resize-none focus:outline-none text-text-primary placeholder-text-secondary/30 font-mono text-sm leading-relaxed p-2"
              ></textarea>

              {/* Mobile Actions embedded at bottom of input card */}
              <div className="lg:hidden mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <GlassButton
                    onClick={() => handleProcess('encrypt')}
                    variant="primary"
                    icon={<Send size={16}/>}
                    className="flex-1"
                    disabled={isEncrypted}
                  >
                    {t('encrypt')}
                  </GlassButton>
                  <GlassButton
                    onClick={() => setInputData('')}
                    variant="ghost"
                    icon={<Trash2 size={16}/>}
                  />
              </div>
            </GlassCard>
          </div>

          {/* Center: Action Buttons (Desktop Only) */}
          <div className="hidden lg:flex flex-col justify-center gap-6 z-10 self-center">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <button
                onClick={() => handleProcess('encrypt')}
                disabled={isEncrypted}
                className={`w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${
                  isEncrypted
                  ? 'bg-bg-secondary/50 text-text-secondary cursor-not-allowed opacity-50 border border-white/5'
                  : 'bg-accent-primary text-white shadow-[0_0_30px_rgba(var(--accent-primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--accent-primary),0.5)]'
                }`}
                title={t('encrypt')}
              >
                <Send size={24} />
              </button>
            </motion.div>

            <div className="h-24 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-auto"></div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <button
                onClick={() => handleProcess('decrypt')}
                className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 text-text-secondary hover:text-white hover:border-accent-primary/50 transition-all shadow-xl backdrop-blur-md flex items-center justify-center"
                title={t('decrypt')}
              >
                <Unlock size={24} />
              </button>
            </motion.div>
          </div>

          {/* Right: Output Area */}
          <div className={`flex flex-col ${activeTab === 'output' ? 'flex' : 'hidden lg:flex'}`}>
            <GlassCard
              floating={isEncrypted && window.innerWidth >= 1024}
              className={`flex-1 flex flex-col min-h-[350px] lg:h-[450px] relative group transition-all duration-500 ${
                highlightOutput ? 'ring-1 ring-accent-primary/50 shadow-[0_0_30px_rgba(var(--accent-primary),0.2)]' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                  <TechHeader title={t('encryptedPayload')} icon={<Code size={18} />} className="mb-0" />
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyToClipboard(outputData)}
                      className="p-1.5 hover:bg-white/10 rounded-md text-text-secondary hover:text-accent-primary transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={handleClear}
                      className="p-1.5 hover:bg-white/10 rounded-md text-text-secondary hover:text-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
              </div>

              <textarea
                value={outputData}
                onChange={(e) => setOutputData(e.target.value)}
                className="flex-1 bg-transparent border-none resize-none focus:outline-none text-accent-primary placeholder-text-secondary/30 font-mono text-xs break-all leading-relaxed p-2"
                placeholder={t('waitingForData')}
              />

              {outputData && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-primary/50 shadow-[0_0_15px_rgba(var(--accent-primary),0.5)] animate-[scan_3s_linear_infinite] pointer-events-none opacity-50"></div>
              )}

              {/* Mobile Actions embedded at bottom of output card */}
              <div className="lg:hidden mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <GlassButton
                    onClick={() => handleProcess('decrypt')}
                    variant="secondary"
                    icon={<Unlock size={16}/>}
                    className="flex-1"
                  >
                    {t('decrypt')}
                  </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Footer: Format Selection & Stego Switch */}
      <GlassCard className="p-3 lg:p-4 mt-auto flex-shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start w-full lg:w-auto">
             {(['Base64', 'Hex', 'Natural Text (Markov)'] as Format[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setCurrentFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  currentFormat === fmt
                    ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30'
                    : 'bg-transparent text-text-secondary border-transparent hover:bg-white/5'
                }`}
              >
                {fmt === 'Base64' && t('formats.base64')}
                {fmt === 'Hex' && t('formats.hex')}
                {fmt === 'Natural Text (Markov)' && t('formats.markov')}
              </button>
            ))}
          </div>

           <GlassButton
            onClick={onSwitchToStego}
            variant="ghost"
            size="sm"
            icon={<ImageIcon size={16} />}
            className="whitespace-nowrap w-full lg:w-auto"
          >
            Image Stego
          </GlassButton>
        </div>
      </GlassCard>

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
