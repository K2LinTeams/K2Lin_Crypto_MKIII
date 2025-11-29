import { useState } from 'react'
import { GlassCard, GlassButton, TechHeader, GlassInput } from '../ui/GlassComponents'
import { useTheme } from '../ThemeContext'
import { Moon, Sun, Monitor, AlertTriangle, Languages, Sliders, Shield, Zap, Sparkles, X, Check, RotateCcw, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievements } from '../../hooks/useAchievements'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

interface SettingsPanelProps {
  onReplayTutorial?: () => void
}

export default function SettingsPanel({ onReplayTutorial }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation(['settings', 'achievements', 'common'])
  const { achievements, allIds, unlock } = useAchievements()
  const [showPinConfig, setShowPinConfig] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [savedPin, setSavedPin] = useState(localStorage.getItem('panicPin') || '')
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [showWipeModal, setShowWipeModal] = useState(false)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleSetTheme = (newTheme: typeof theme) => {
    setTheme(newTheme)
    unlock('theme_changed')
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
         <h2 className="text-2xl font-bold text-text-primary mb-2 uppercase tracking-wider flex items-center gap-3">
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
              aria-label="Switch to English"
            >
              English
            </GlassButton>
            <GlassButton
              variant={i18n.language.startsWith('zh') ? 'primary' : 'secondary'}
              onClick={() => changeLanguage('zh')}
              icon={<span className="font-mono font-bold text-xs">CN</span>}
              className="justify-start"
              aria-label="切换到中文"
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
              onClick={() => handleSetTheme('cyberpunk')}
              className="justify-start"
              icon={<Monitor size={16} />}
              aria-label={t('themes.cyberpunk')}
            >
              {t('themes.cyberpunk')}
            </GlassButton>
            <GlassButton
              variant={theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => handleSetTheme('light')}
              className="justify-start"
              icon={<Sun size={16} />}
              aria-label={t('themes.light')}
            >
              {t('themes.light')}
            </GlassButton>
            <GlassButton
              variant={theme === 'midnight' ? 'primary' : 'secondary'}
              onClick={() => handleSetTheme('midnight')}
              className="justify-start"
              icon={<Moon size={16} />}
              aria-label={t('themes.midnight')}
            >
              {t('themes.midnight')}
            </GlassButton>
            <GlassButton
              variant={theme === 'sakura' ? 'primary' : 'secondary'}
              onClick={() => handleSetTheme('sakura')}
              className="justify-start"
              icon={<Sparkles size={16} />}
              aria-label={t('themes.sakura')}
            >
              {t('themes.sakura')}
            </GlassButton>
          </div>
        </GlassCard>

        {/* Service Record (Achievements) */}
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <TechHeader title={t('achievements:title', 'Service Record')} icon={<Award size={18} />} className="mb-0" />
            {allIds.length > 4 && (
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={() => setShowAllAchievements(!showAllAchievements)}
                className="text-xs"
              >
                {showAllAchievements ? t('common.hide', 'Hide') : t('common.show', 'Show All')}
              </GlassButton>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(showAllAchievements ? allIds : allIds.slice(0, 4)).map((id) => {
              const isUnlocked = achievements.some((a) => a.id === id)
              return (
                <div
                  key={id}
                  className={`relative p-3 rounded-xl border ${isUnlocked ? 'bg-accent-primary/10 border-accent-primary/30' : 'bg-black/20 border-white/5'} flex flex-col gap-2 overflow-hidden group`}
                >
                  <div className="flex justify-between items-start z-10">
                    <div
                      className={`p-2 rounded-full ${isUnlocked ? 'bg-accent-primary text-black' : 'bg-white/5 text-white/20'}`}
                    >
                      <Award size={16} />
                    </div>
                    {isUnlocked && (
                      <span className="text-[10px] font-mono text-accent-primary opacity-70">AUTH</span>
                    )}
                  </div>

                  <div className="z-10">
                    <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                      {isUnlocked ? t(`achievements:list.${id}.title`) : t('achievements:locked', 'Classified')}
                    </h4>
                    <p
                      className={`text-[10px] leading-tight mt-1 ${isUnlocked ? 'text-text-secondary' : 'text-white/10'}`}
                    >
                      {isUnlocked ? t(`achievements:list.${id}.desc`) : '???'}
                    </p>
                  </div>

                  {/* Background decoration for unlocked */}
                  {isUnlocked && (
                    <div className="absolute -right-4 -bottom-4 text-accent-primary/10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                      <Award size={60} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* System Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <GlassCard className="flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                 <div className="flex gap-3">
                    <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                       <Zap size={20} />
                    </div>
                    <div>
                       <div className="text-text-primary font-bold text-sm">{t('replayTutorial')}</div>
                       <div className="text-text-secondary text-xs mt-1">{t('replayTutorialDesc')}</div>
                    </div>
                 </div>
              </div>
              <GlassButton
                 size="sm"
                 variant="secondary"
                 className="self-end w-full"
                 onClick={onReplayTutorial}
                 icon={<RotateCcw size={14} />}
              >
                 {t('replayTutorial')}
              </GlassButton>
           </GlassCard>

           <GlassCard className="flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                   <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                      <Shield size={20} />
                   </div>
                   <div>
                      <div className="text-text-primary font-bold text-sm">{t('panicModePin')}</div>
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
                          aria-label={t('cancel', { ns: 'common' })}
                        >
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="primary"
                          className="flex-1"
                          onClick={handleSavePin}
                          icon={<Check size={14} />}
                          aria-label={t('confirm', { ns: 'common' })}
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
              onClick={() => setShowWipeModal(true)}
            >
              {t('execute')}
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      <ConfirmationDialog
        isOpen={showWipeModal}
        title={t('dangerZone')}
        message={t('confirmWipe') || 'Are you sure you want to wipe all data? This cannot be undone.'}
        onConfirm={() => {
           localStorage.clear()
           window.location.reload()
        }}
        onCancel={() => setShowWipeModal(false)}
        variant="danger"
        confirmLabel={t('execute')}
      />
    </div>
  )
}
