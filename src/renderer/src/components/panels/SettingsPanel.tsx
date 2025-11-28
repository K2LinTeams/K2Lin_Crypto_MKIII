import { useState } from 'react'
import { GlassCard, GlassButton, TechHeader, GlassInput } from '../ui/GlassComponents'
import { useTheme } from '../ThemeContext'
import { Moon, Sun, Monitor, AlertTriangle, Languages, Sliders, Shield, Zap, Sparkles, X, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation('settings')
  const [showPinConfig, setShowPinConfig] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [savedPin, setSavedPin] = useState(localStorage.getItem('panicPin') || '')

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleSavePin = () => {
    if (pinInput) {
      localStorage.setItem('panicPin', pinInput)
      setSavedPin(pinInput)
    } else {
      localStorage.removeItem('panicPin')
      setSavedPin('')
    }
    setPinInput('')
    setShowPinConfig(false)
  }

  return (
    <div className="max-w-4xl mx-auto h-full p-2 lg:p-4 overflow-y-auto">
      <div className="mb-6 lg:mb-8">
         <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono uppercase tracking-wider flex items-center gap-3">
            <Sliders className="text-accent-primary" />
            {t('title')}
         </h2>
         <div className="h-px w-full bg-gradient-to-r from-accent-primary/50 to-transparent"></div>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <GlassCard>
          <TechHeader title={t('language')} icon={<Languages size={18} />} />
          <div className="grid grid-cols-2 gap-4">
            <GlassButton
              variant={i18n.language.startsWith('en') ? 'primary' : 'secondary'}
              onClick={() => changeLanguage('en')}
              icon={<span className="font-mono font-bold text-xs">EN</span>}
              className="justify-start"
            >
              English
            </GlassButton>
            <GlassButton
              variant={i18n.language.startsWith('zh') ? 'primary' : 'secondary'}
              onClick={() => changeLanguage('zh')}
              icon={<span className="font-mono font-bold text-xs">CN</span>}
              className="justify-start"
            >
              中文
            </GlassButton>
          </div>
        </GlassCard>

        {/* Theme Selection */}
        <GlassCard>
          <TechHeader title={t('interfaceTheme')} icon={<Monitor size={18} />} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassButton
              variant={theme === 'cyberpunk' ? 'primary' : 'secondary'}
              onClick={() => setTheme('cyberpunk')}
              className="justify-start"
              icon={<Monitor size={16} />}
            >
              {t('themes.cyberpunk')}
            </GlassButton>
            <GlassButton
              variant={theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => setTheme('light')}
              className="justify-start"
              icon={<Sun size={16} />}
            >
              {t('themes.light')}
            </GlassButton>
            <GlassButton
              variant={theme === 'midnight' ? 'primary' : 'secondary'}
              onClick={() => setTheme('midnight')}
              className="justify-start"
              icon={<Moon size={16} />}
            >
              {t('themes.midnight')}
            </GlassButton>
            <GlassButton
              variant={theme === 'sakura' ? 'primary' : 'secondary'}
              onClick={() => setTheme('sakura')}
              className="justify-start"
              icon={<Sparkles size={16} />}
            >
              {t('themes.sakura')}
            </GlassButton>
          </div>
        </GlassCard>

        {/* System Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <GlassCard className="flex flex-col justify-between overflow-hidden relative opacity-60 grayscale-[0.5] pointer-events-none">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                   <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                      <Zap size={20} />
                   </div>
                   <div>
                      <div className="text-text-primary font-bold font-mono text-sm">{t('clipboardMonitor')}</div>
                      <div className="text-text-secondary text-xs mt-1">{t('clipboardMonitorDesc')} (N/A)</div>
                   </div>
                </div>
                {/* Disabled Toggle UI */}
                <div className="w-10 h-5 bg-bg-secondary rounded-full relative border border-glass-border">
                  <div className="absolute left-1 top-0.5 w-3.5 h-3.5 bg-text-secondary/20 rounded-full"></div>
                </div>
              </div>
           </GlassCard>

           <GlassCard className="flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                   <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                      <Shield size={20} />
                   </div>
                   <div>
                      <div className="text-text-primary font-bold font-mono text-sm">{t('panicModePin')}</div>
                      <div className="text-text-secondary text-xs mt-1">
                        {savedPin ? `${t('panicModePinDesc')} (ON)` : t('panicModePinDesc')}
                      </div>
                   </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showPinConfig ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 w-full"
                  >
                     <GlassInput
                        placeholder={t('enterKeyShort')}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        autoFocus
                     />
                     <div className="flex gap-2">
                        <GlassButton
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => setShowPinConfig(false)}
                          icon={<X size={14} />}
                        >
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="primary"
                          className="flex-1"
                          onClick={handleSavePin}
                          icon={<Check size={14} />}
                        >
                        </GlassButton>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <GlassButton
                      size="sm"
                      variant={savedPin ? "primary" : "secondary"}
                      className="self-end w-full"
                      onClick={() => {
                        setPinInput(savedPin)
                        setShowPinConfig(true)
                      }}
                    >
                      {t('configure')}
                    </GlassButton>
                  </motion.div>
                )}
              </AnimatePresence>
           </GlassCard>
        </div>

        {/* Danger Zone */}
        <GlassCard className="border-red-500/20 bg-red-500/5">
          <TechHeader title={t('dangerZone')} icon={<AlertTriangle size={18} />} className="text-red-500" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-red-400/80 text-xs leading-relaxed">
              {t('emergencyWipeDesc')}
            </div>
            <GlassButton
              variant="danger"
              size="sm"
              className="whitespace-nowrap w-full md:w-auto"
              onClick={() => {
                if (window.confirm(t('confirmWipe') || 'Are you sure you want to wipe all data? This cannot be undone.')) {
                   localStorage.clear()
                   window.location.reload()
                }
              }}
            >
              {t('execute')}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
