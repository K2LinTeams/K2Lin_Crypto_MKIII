import { GlassCard, GlassButton, TechHeader } from '../ui/GlassComponents'
import { useTheme } from '../ThemeContext'
import { Moon, Sun, Monitor, AlertTriangle, Languages, Sliders, Shield, Zap, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation('settings')

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
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
           <GlassCard className="flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                   <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                      <Zap size={20} />
                   </div>
                   <div>
                      <div className="text-text-primary font-bold font-mono text-sm">{t('clipboardMonitor')}</div>
                      <div className="text-text-secondary text-xs mt-1">{t('clipboardMonitorDesc')}</div>
                   </div>
                </div>
                <div className="w-10 h-5 bg-bg-secondary rounded-full relative cursor-pointer border border-glass-border">
                  <div className="absolute right-1 top-0.5 w-3.5 h-3.5 bg-accent-primary rounded-full shadow-lg shadow-accent-primary/50"></div>
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
                      <div className="text-text-secondary text-xs mt-1">{t('panicModePinDesc')}</div>
                   </div>
                </div>
              </div>
              <GlassButton size="sm" variant="secondary" className="self-end w-full">
                {t('configure')}
              </GlassButton>
           </GlassCard>
        </div>

        {/* Danger Zone */}
        <GlassCard className="border-red-500/20 bg-red-500/5">
          <TechHeader title={t('dangerZone')} icon={<AlertTriangle size={18} />} className="text-red-500" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-red-400/80 text-xs leading-relaxed">
              {t('emergencyWipeDesc')}
            </div>
            <GlassButton variant="danger" size="sm" className="whitespace-nowrap w-full md:w-auto">
              {t('execute')}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
