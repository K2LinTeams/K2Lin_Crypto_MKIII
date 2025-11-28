import { useState, useEffect } from 'react'
import { Eye, Copy, Trash2, Key, Unlock, Send, Image as ImageIcon, Keyboard, Code, Shield, User } from 'lucide-react'
import { GlassCard, GlassButton, GlassInput, TechHeader, MobileTabSwitcher } from '../ui/GlassComponents'
import { GlassDropdown } from '../ui/GlassDropdown'
import { motion } from 'framer-motion'
import { useApi } from '../../useApi'
import { useTranslation } from 'react-i18next'
import { encryptAsymmetric, decryptAsymmetric, importKey } from '../../services/rsa'
import { useNotification } from '../NotificationContext'

type Format = 'Base64' | 'Hex' | 'Natural Text (Markov)'

interface CryptoPackage {
  c3_type?: 'identity' | 'data'
  c3_alg?: 'RSA-OAEP' | 'AES-GCM'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}

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
  const [detectedAlg, setDetectedAlg] = useState<string | null>(null)

  // Asymmetric Encryption State
  const [useAsymmetric, setUseAsymmetric] = useState(false)
  const [contacts, setContacts] = useState<{name: string, publicKey: string}[]>([])
  const [selectedContact, setSelectedContact] = useState<string>('') // Public Key string

  const api = useApi()
  const { t, i18n } = useTranslation('vault')
  const { addNotification } = useNotification()

  useEffect(() => {
    if (isEncrypted) {
      setActiveTab('output')
      setHighlightOutput(true)
      const timer = setTimeout(() => setHighlightOutput(false), 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isEncrypted])

  // Load contacts
  useEffect(() => {
    const saved = localStorage.getItem('contacts')
    if (saved) {
      setContacts(JSON.parse(saved))
    }
  }, [])

  // Auto-detect algorithm from outputData
  useEffect(() => {
    const detect = async () => {
      if (!outputData) {
        setDetectedAlg(null)
        return
      }
      try {
        let decodedStr = outputData
        if (currentFormat === 'Natural Text (Markov)') {
          const bytes = await api.nlp.decode(outputData, i18n.language)
          decodedStr = new TextDecoder().decode(bytes)
        } else if (currentFormat === 'Hex') {
          const pairs = outputData.match(/.{1,2}/g)
          if (pairs) {
            const bytes = new Uint8Array(pairs.map((byte) => parseInt(byte, 16)))
            decodedStr = new TextDecoder().decode(bytes)
          }
        } else if (currentFormat === 'Base64') {
          // It's already likely base64 of the JSON, so decode once to get JSON string
          // Note: formatOutput does btoa(contentString). So we verify if it is Base64.
          try {
            decodedStr = atob(outputData)
          } catch {
            // Not base64
          }
        }

        try {
          const obj = JSON.parse(decodedStr)
          if (obj && obj.c3_alg) {
            setDetectedAlg(obj.c3_alg)
            return
          }
        } catch {
          /* Not a JSON package */
        }
      } catch {
        /* Decoding failed */
      }
      setDetectedAlg(null)
    }
    detect()
  }, [outputData, currentFormat, api.nlp, i18n.language])

  const handleProcess = async (mode: 'encrypt' | 'decrypt'): Promise<void> => {
    try {
      if (mode === 'decrypt') {
        let decrypted = ''
        let success = false

        // 1. Decode current format to get the underlying string/object
        let rawPackageStr = outputData
        if (currentFormat === 'Natural Text (Markov)') {
          const decodedBytes = await api.nlp.decode(outputData, i18n.language)
          rawPackageStr = new TextDecoder().decode(decodedBytes)
        } else if (currentFormat === 'Hex') {
          const pairs = outputData.match(/.{1,2}/g)
          if (pairs) {
            const bytes = new Uint8Array(pairs.map((byte) => parseInt(byte, 16)))
            rawPackageStr = new TextDecoder().decode(bytes)
          }
        } else if (currentFormat === 'Base64') {
          // Try to decode base64
          try {
            rawPackageStr = atob(outputData)
          } catch {
            /* Keep as is if failed, might be raw */
          }
        }

        // 2. Parse Package
        let pkg: CryptoPackage | null = null
        try {
          pkg = JSON.parse(rawPackageStr)
        } catch {
          // Not a JSON package, might be legacy raw data
        }

        // 3. Auto-Detect and Decrypt based on package
        if (pkg && pkg.c3_type === 'identity') {
             // Identity Card Detected!
             // We do NOT decrypt this. We offer to import it.
             const confirmImport = window.confirm(`Identity Card Detected: ${pkg.payload.name || 'Unknown'}\n\nDo you want to import this contact?`)

             if (confirmImport) {
                const newContact = {
                   name: pkg.payload.name || 'Agent',
                   publicKey: pkg.payload.publicKey,
                   addedAt: Date.now()
                }

                // Add to Local Storage
                const savedContacts = localStorage.getItem('contacts')
                const currentContacts = savedContacts ? JSON.parse(savedContacts) : []

                // Simple deduplication by Public Key
                const exists = currentContacts.some(c => c.publicKey === newContact.publicKey)

                if (!exists) {
                    const updatedContacts = [...currentContacts, newContact]
                    localStorage.setItem('contacts', JSON.stringify(updatedContacts))
                    setContacts(updatedContacts) // Update local state so it appears in dropdown immediately
                    addNotification('success', 'Contact imported successfully.')
                } else {
                    addNotification('info', 'Contact already exists.')
                }

                // Clear the UI as the "decryption" action (processing) is done
                handleClear()
                return // Exit handleProcess
             } else {
                 return // User cancelled
             }
        } else if (pkg && pkg.c3_alg === 'RSA-OAEP') {
          // Asymmetric Auto-Detect
          const myPrivateKeyPem = localStorage.getItem('my_private_key')
          if (myPrivateKeyPem) {
            const privateKey = await importKey(myPrivateKeyPem, 'private')
            // Payload is Base64 ciphertext string
            decrypted = await decryptAsymmetric(pkg.payload, privateKey)
            success = true
          } else {
            throw new Error(t('identity.noIdentityCard') || 'No Identity Card found')
          }
        } else if (pkg && pkg.c3_alg === 'AES-GCM') {
          // Symmetric Auto-Detect
          if (secretKey) {
            decrypted = await api.crypto.decrypt(
              pkg.payload.ciphertext,
              pkg.payload.iv,
              pkg.payload.salt,
              pkg.payload.tag,
              secretKey
            )
            success = true
          }
        } else {
          // Fallback / Legacy Logic
          console.warn('Unknown package format, trying legacy methods...')

          // Legacy Asymmetric Check (User must have selected Asymmetric mode or we try blindly)
          // If we are here, it's not a tagged package.
          // Try Asymmetric first if it looks like Base64 and we have a key?
          const myPrivateKeyPem = localStorage.getItem('my_private_key')
          if (myPrivateKeyPem && !success) {
            try {
              const privateKey = await importKey(myPrivateKeyPem, 'private')
              // rawPackageStr should be the Base64 ciphertext if it was just Base64'd
              decrypted = await decryptAsymmetric(rawPackageStr, privateKey)
              success = true
            } catch {
              /* Not asymmetric */
            }
          }

          // Legacy Symmetric Check
          if (!success) {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             let legacyObj: any = null
             try { legacyObj = JSON.parse(rawPackageStr) } catch { /* ignore */ }

             // If legacyObj has ciphertext/iv etc.
             if (legacyObj && legacyObj.ciphertext && secretKey) {
                decrypted = await api.crypto.decrypt(
                    legacyObj.ciphertext,
                    legacyObj.iv,
                    legacyObj.salt,
                    legacyObj.tag,
                    secretKey
                )
                success = true
             }
          }
        }

        if (success) {
          setInputData(decrypted)
          setIsEncrypted(false)
          setOutputData('')
          setEncryptedPackage(null)
          setActiveTab('input')
          addNotification('success', t('decryptionComplete'))
        } else {
          addNotification('error', t('noDataToDecrypt') + ' or Key Invalid')
        }
      } else {
        // --- Encrypt Logic ---
        if (!inputData) return

        let finalPackage: CryptoPackage

        if (useAsymmetric && selectedContact) {
          // Asymmetric Encryption
          const publicKey = await importKey(selectedContact, 'public')
          const ciphertextBase64 = await encryptAsymmetric(inputData, publicKey)

          finalPackage = {
            c3_alg: 'RSA-OAEP',
            payload: ciphertextBase64
          }
        } else {
          // Symmetric Encryption (Standard)
          if (!secretKey) {
            addNotification('error', 'Please enter a Session Key')
            return
          }
          const result = await api.crypto.encrypt(inputData, secretKey)

          finalPackage = {
            c3_alg: 'AES-GCM',
            payload: result
          }
        }

        setEncryptedPackage(finalPackage)
        setIsEncrypted(true)
        setInputData('') // Clear input for security
        formatOutput(finalPackage, currentFormat)
        addNotification('success', t('encryptionComplete'))
      }
    } catch (error) {
      console.error(error)
      addNotification('error', t('operationFailed') + ': ' + (error as Error).message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatOutput = async (data: any, format: Format): Promise<void> => {
    // If data is a string (Asymmetric result), use it directly.
    // If it's an object (Symmetric package), stringify it.
    const contentString = typeof data === 'string' ? data : JSON.stringify(data)

    if (format === 'Base64') {
      // If it's already Base64 (Asymmetric), we double encode?
      // If data is object -> JSON -> Base64.
      // If data is string (Base64) -> Base64(Base64).
      // This ensures consistent decoding.
      setOutputData(btoa(contentString))
    } else if (format === 'Hex') {
      const buffer = new TextEncoder().encode(contentString)
      const hex = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setOutputData(hex)
    } else if (format === 'Natural Text (Markov)') {
      const buffer = new TextEncoder().encode(contentString)
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
      {/* Top Section: Encryption Settings */}
      <GlassCard className="flex flex-col gap-4 flex-shrink-0" gradient>
        <div className="flex flex-col md:flex-row items-center gap-4">

          {/* Toggle Mode */}
          <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
            <button
                onClick={() => setUseAsymmetric(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!useAsymmetric ? 'bg-accent-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
            >
                {t('symmetricAES')}
            </button>
            <button
                onClick={() => setUseAsymmetric(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${useAsymmetric ? 'bg-accent-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
            >
                {t('asymmetricRSA')}
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block"></div>

          {/* Configuration based on Mode */}
          {useAsymmetric ? (
             <div className="flex-1 w-full flex items-center gap-3">
                <TechHeader
                    title={t('targetRecipient')}
                    icon={<User size={18} />}
                    className="mb-0 hidden md:flex"
                />
                <GlassDropdown
                  className="flex-1"
                  value={selectedContact}
                  onChange={setSelectedContact}
                  placeholder={t('selectContact') || 'Select a contact...'}
                  options={contacts.map((c) => ({
                    label: c.name,
                    value: c.publicKey,
                    subLabel: `...${c.publicKey.slice(-8)}`
                  }))}
                />
             </div>
          ) : (
             <div className="flex-1 w-full flex items-center gap-3">
                <TechHeader
                    title={t('sessionKey')}
                    icon={<Shield size={18} />}
                    className="mb-0 hidden md:flex"
                />
                <div className="relative flex-1">
                    <GlassInput
                        type={showKey ? 'text' : 'password'}
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder={t('enterKeyShort')}
                        className="pr-20 font-mono text-sm tracking-wide text-center"
                    />
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button onClick={handleShowKey} className="p-1.5 text-text-secondary hover:text-white"><Eye size={14} /></button>
                        <button onClick={generateRandomKey} className="p-1.5 text-text-secondary hover:text-accent-primary"><Key size={14} /></button>
                     </div>
                </div>
             </div>
          )}

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
              className={`flex-1 flex flex-col min-h-[350px] lg:h-[450px] relative group transition-all duration-500 ${
                highlightOutput ? 'ring-1 ring-accent-primary/50 shadow-[0_0_30px_rgba(var(--accent-primary),0.2)]' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <TechHeader title={t('encryptedPayload')} icon={<Code size={18} />} className="mb-0" />
                    {detectedAlg && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-primary text-black shadow-[0_0_10px_rgba(var(--accent-primary),0.5)] animate-pulse">
                        {detectedAlg}
                      </span>
                    )}
                  </div>
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
                <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-primary/50 shadow-[0_0_15px_rgba(var(--accent-primary),0.5)] animate-[scan_2s_ease-in-out_forwards] pointer-events-none opacity-50"></div>
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
