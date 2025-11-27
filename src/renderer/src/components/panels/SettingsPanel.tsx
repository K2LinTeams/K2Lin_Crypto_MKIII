import { GlassCard, GlassButton } from '../ui/GlassComponents'
import { useTheme } from '../ThemeContext'
import { Moon, Sun, Monitor, AlertTriangle } from 'lucide-react'

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-3xl mx-auto h-full p-4">
      <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-glass-border pb-4">
        System Configuration
      </h2>

      <div className="space-y-6">

        {/* Theme Selection */}
        <GlassCard>
            <h3 className="text-lg font-medium text-text-primary mb-4">Interface Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassButton
                    variant={theme === 'cyberpunk' ? 'primary' : 'secondary'}
                    onClick={() => setTheme('cyberpunk')}
                    className="justify-start"
                    icon={<Monitor size={16}/>}
                >
                    Cyberpunk (Default)
                </GlassButton>
                <GlassButton
                    variant={theme === 'light' ? 'primary' : 'secondary'}
                    onClick={() => setTheme('light')}
                    className="justify-start"
                    icon={<Sun size={16}/>}
                >
                    SaaS / Light
                </GlassButton>
                <GlassButton
                    variant={theme === 'midnight' ? 'primary' : 'secondary'}
                    onClick={() => setTheme('midnight')}
                    className="justify-start"
                    icon={<Moon size={16}/>}
                >
                    Deep Space
                </GlassButton>
            </div>
        </GlassCard>

        {/* General Settings */}
        <GlassCard className="flex items-center justify-between">
            <div>
                <div className="text-text-primary font-bold">Clipboard Monitor</div>
                <div className="text-text-secondary text-xs mt-1">
                  Auto-detect "Crypto3" formatted data
                </div>
            </div>
            <div className="w-12 h-6 bg-bg-secondary rounded-full relative cursor-pointer border border-glass-border">
                <div className="absolute right-1 top-1 w-4 h-4 bg-accent-primary rounded-full shadow-lg shadow-accent-primary/50"></div>
            </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
             <div>
                <div className="text-text-primary font-bold">Panic Mode Pin</div>
                <div className="text-text-secondary text-xs mt-1">
                   Require PIN to exit camouflage mode
                </div>
            </div>
            <GlassButton size="sm" variant="secondary">Configure</GlassButton>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="border-red-500/20 bg-red-500/5">
             <div className="flex items-center justify-between">
                <div className="flex gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <div className="text-red-500 font-bold">Emergency Wipe</div>
                        <div className="text-red-400/60 text-xs mt-1">
                        Destroy all local keys and cache immediately
                        </div>
                    </div>
                </div>
                <GlassButton variant="danger" size="sm">Execute</GlassButton>
            </div>
        </GlassCard>
      </div>
    </div>
  )
}
