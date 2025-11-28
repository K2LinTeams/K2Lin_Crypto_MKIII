import React, { useState, useEffect, useRef } from 'react'
import { generateKeyPair, exportKey } from '../../services/rsa'
import { IdentityCardGenerator } from '../IdentityCardGenerator'
import { GlassCard, GlassButton, TechHeader, GlassInput } from '../ui/GlassComponents'
import { User, Shield, Upload, UserPlus, Trash2 } from 'lucide-react'
import { extract } from '../../services/webStego'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

interface Contact {
  name: string
  publicKey: string
  addedAt: number
}

export default function IdentityPanel() {
  const { t } = useTranslation('identity')
  const [, setMyKeys] = useState<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>(null)
  const [myPublicKeyPem, setMyPublicKeyPem] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New state for user name
  const [myName, setMyName] = useState<string>('')

  // Load contacts/keys/name from local storage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('contacts')
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    }

    const savedName = localStorage.getItem('my_identity_name')
    if (savedName) {
      setMyName(savedName)
    }

    const pub = localStorage.getItem('my_public_key')
    if (pub) {
      setMyPublicKeyPem(pub)
    }
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setMyName(newName)
    localStorage.setItem('my_identity_name', newName)
  }

  const handleGenerateKeys = async () => {
    const keys = await generateKeyPair()
    setMyKeys(keys)
    const pubPem = await exportKey(keys.publicKey)
    setMyPublicKeyPem(pubPem)

    // Save Private Key to LocalStorage
    const privPem = await exportKey(keys.privateKey)
    localStorage.setItem('my_private_key', privPem)
    localStorage.setItem('my_public_key', pubPem)
  }

  const handleImportContact = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const data = await extract(buffer)
      const textDecoder = new TextDecoder()
      const decodedString = textDecoder.decode(data)

      let name = ''
      let publicKey = ''

      try {
        // Try parsing as JSON (New Format)
        const jsonPayload = JSON.parse(decodedString)
        if (jsonPayload.publicKey && jsonPayload.name) {
          name = jsonPayload.name
          publicKey = jsonPayload.publicKey
        } else {
          throw new Error('Invalid JSON structure')
        }
      } catch {
        // Fallback to Raw String (Legacy Format)
        if (decodedString.includes('BEGIN PUBLIC KEY')) {
          publicKey = decodedString
          name = prompt(t('enterContactName')) || t('unknownAgent')
        }
      }

      if (publicKey && publicKey.includes('BEGIN PUBLIC KEY')) {
        const newContact: Contact = { name, publicKey, addedAt: Date.now() }
        const newContacts = [...contacts, newContact]
        setContacts(newContacts)
        localStorage.setItem('contacts', JSON.stringify(newContacts))
        alert(t('importSuccess'))
      } else {
        alert(t('importInvalid'))
      }
    } catch (err) {
      console.error(err)
      alert(t('importFailed'))
    } finally {
      // Reset input so same file can be selected again
      if (e.target) e.target.value = ''
    }
  }

  const handleDeleteContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index)
    setContacts(newContacts)
    localStorage.setItem('contacts', JSON.stringify(newContacts))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
          {t('title')}
        </h2>
        <p className="text-text-secondary">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Identity Section */}
        <GlassCard className="space-y-6">
          <TechHeader title={t('myIdentity')} icon={<User size={18} />} />

          {myPublicKeyPem ? (
            <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">{t('name')}</label>
                 <GlassInput
                    value={myName}
                    onChange={handleNameChange}
                    placeholder={t('enterName')}
                    className="w-full text-center font-bold text-lg"
                 />
               </div>

               <IdentityCardGenerator
                publicKey={myPublicKeyPem}
                username={myName || 'AGENT'}
                onRegenerate={handleGenerateKeys}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-white/10 rounded-xl gap-4">
              <Shield size={48} className="text-white/20" />
              <p className="text-text-secondary text-center max-w-xs">
                {t('noIdentity')}
              </p>
              <GlassButton onClick={handleGenerateKeys} icon={<Shield size={16} />}>
                {t('generate')}
              </GlassButton>
            </div>
          )}
        </GlassCard>

        {/* Contacts Section */}
        <GlassCard className="space-y-6 flex flex-col h-full">
          <div className="flex justify-between items-center">
            <TechHeader title={t('knownAssociates')} icon={<UserPlus size={18} />} />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                onChange={handleImportContact}
                className="hidden"
              />
              <GlassButton
                size="sm"
                icon={<Upload size={14} />}
                onClick={() => fileInputRef.current?.click()}
              >
                {t('import')}
              </GlassButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-visible pt-4 pl-4 pr-4 pb-10 min-h-[400px] custom-scrollbar flex flex-col items-center">
            {contacts.length === 0 ? (
              <div className="text-center text-text-secondary/50 py-10 italic w-full">
                {t('noContacts')}
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {contacts.map((contact, idx) => (
                  <motion.div
                    key={`${contact.name}-${contact.addedAt}`}
                    className="relative w-full max-w-sm"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    style={{
                      marginTop: idx === 0 ? 0 : -60, // Stack overlap
                      zIndex: idx,
                    }}
                    whileHover={{
                      y: -70, // Pull card up significantly on hover
                      zIndex: 100, // Bring to front
                      scale: 1.05,
                      rotateX: 10,
                      transition: { type: 'spring', stiffness: 300, damping: 20 }
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  >
                    <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl overflow-hidden">
                      {/* Gradient Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 opacity-50 group-hover:opacity-100 transition-opacity" />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/20">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-white drop-shadow-sm">{contact.name}</div>
                            <div className="text-[10px] text-white/60 font-mono tracking-wider">
                              {contact.publicKey.substring(30, 46)}...{contact.publicKey.substring(contact.publicKey.length - 8)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteContact(idx)
                          }}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-full transition-all"
                          title={t('delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -bottom-4 -right-4 text-white/5 rotate-12">
                         <Shield size={100} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
