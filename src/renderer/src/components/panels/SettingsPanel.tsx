import { GlassCard, GlassButton } from '../ui/GlassComponents'
import { useTheme } from '../ThemeContext'
import { Moon, Sun, Monitor, AlertTriangle, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation('settings')

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="max-w-3xl mx-auto h-full p-4">
      <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-glass-border pb-4">
        {t('title')}
      </h2>

      <div className="space-y-6">
        {/* Language Selection */}
        <GlassCard>
          <h3 className="text-lg font-medium text-text-primary mb-4">{t('language')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <GlassButton
              variant={i18n.language.startsWith('en') ? 'primary' : 'secondary'}
              onClick={() => changeLanguage('en')}
              icon={<Languages size={16} />}
            >
              English
            </GlassButton>
            <GlassButton
              variant={i18n.language.startsWith('zh') ? 'primary' : 'secondary'}
              onClick={() => changeLanguage('zh')}
              icon={<Languages size={16} />}
            >
              中文
            </GlassButton>
          </div>
        </GlassCard>

        {/* Theme Selection */}
        <GlassCard>
          <h3 className="text-lg font-medium text-text-primary mb-4">{t('interfaceTheme')}</h3>
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
          </div>
        </GlassCard>

        {/* General Settings */}
        <GlassCard className="flex items-center justify-between">
          <div>
            <div className="text-text-primary font-bold">{t('clipboardMonitor')}</div>
            <div className="text-text-secondary text-xs mt-1">{t('clipboardMonitorDesc')}</div>
          </div>
          <div className="w-12 h-6 bg-bg-secondary rounded-full relative cursor-pointer border border-glass-border">
            <div className="absolute right-1 top-1 w-4 h-4 bg-accent-primary rounded-full shadow-lg shadow-accent-primary/50"></div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <div className="text-text-primary font-bold">{t('panicModePin')}</div>
            <div className="text-text-secondary text-xs mt-1">{t('panicModePinDesc')}</div>
          </div>
          <GlassButton size="sm" variant="secondary">
            {t('configure')}
          </GlassButton>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="text-red-500 font-bold">{t('emergencyWipe')}</div>
                <div className="text-red-400/60 text-xs mt-1">{t('emergencyWipeDesc')}</div>
              </div>
            </div>
            <GlassButton variant="danger" size="sm">
              {t('execute')}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
