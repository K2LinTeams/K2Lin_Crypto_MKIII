import React, { useState, useEffect } from 'react'
import { generateKeyPair, exportKey } from '../../services/rsa'
import { IdentityCardGenerator } from '../IdentityCardGenerator'
import { GlassCard, GlassButton, TechHeader, GlassInput } from '../ui/GlassComponents'
import { User, Shield, Upload, UserPlus, Trash2 } from 'lucide-react'
import { extract } from '../../services/webStego'
import { useTranslation } from 'react-i18next'

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
      const publicKey = textDecoder.decode(data)

      if (publicKey.includes('BEGIN PUBLIC KEY')) {
        const name = prompt(t('enterContactName')) || t('unknownAgent')
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
            <div className="relative">
              <input
                type="file"
                accept="image/png"
                onChange={handleImportContact}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <GlassButton size="sm" icon={<Upload size={14} />}>
                {t('import')}
              </GlassButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2 custom-scrollbar">
            {contacts.length === 0 ? (
              <div className="text-center text-text-secondary/50 py-10 italic">
                {t('noContacts')}
              </div>
            ) : (
              contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="bg-black/20 border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:border-accent-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center text-accent-primary font-bold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{contact.name}</div>
                      <div className="text-[10px] text-text-secondary font-mono">
                        {contact.publicKey.substring(30, 50)}...
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(idx)}
                    className="p-2 text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
