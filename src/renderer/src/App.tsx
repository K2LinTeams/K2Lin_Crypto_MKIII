import React, { useState } from 'react'
import { Shield, Lock, Image as ImageIcon, Settings, EyeOff, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

// Panels
import VaultPanel from './components/panels/VaultPanel'
import MimicPanel from './components/panels/MimicPanel'
import SettingsPanel from './components/panels/SettingsPanel'
import IdentityPanel from './components/panels/IdentityPanel' // Import new panel
import SplashScreen from './components/SplashScreen'
import TutorialModal from './components/TutorialModal'
import { ThemeProvider } from './components/ThemeContext'
import { NotificationProvider } from './components/NotificationContext'
import { NotificationSystem } from './components/ui/NotificationSystem'
import PanicMode from './components/PanicMode'
import { useTranslation } from 'react-i18next'
import './i18n' // Import i18n config
import { useAchievements } from './hooks/useAchievements'

// --- Main App Layout ---
type Tab = 'vault' | 'mimic' | 'settings' | 'identity'
type Format = 'Base64' | 'Hex' | 'Natural Text (Markov)'

function AppLayout(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('vault')
  const [panicMode, setPanicMode] = useState(false)

  // Splash and Tutorial States
  const [showSplash, setShowSplash] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)

  const { t, i18n } = useTranslation('common')
  const { unlock } = useAchievements()

  // Update HTML lang attribute when language changes
  React.useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  // Shared state lifted from panels
  const [inputData, setInputData] = useState('')
  const [outputData, setOutputData] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [encryptedPackage, setEncryptedPackage] = useState<any>(null)
  const [currentFormat, setCurrentFormat] = useState<Format>('Base64')
  const [secretKey, setSecretKey] = useState('')

  const handleExtract = (data: string) => {
    setOutputData(data)
    setIsEncrypted(true)
    // We try to parse it to check if it's a valid package
    try {
      const pkg = JSON.parse(data)
      setEncryptedPackage(pkg)
    } catch {
      // If it's not JSON, it might be raw text or something else
      setEncryptedPackage(null)
    }
    setActiveTab('vault')
  }

  const handleSplashComplete = () => {
    setShowSplash(false)
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTutorial', 'true')
  }

  const handleReplayTutorial = () => {
    setShowTutorial(true)
  }

  if (panicMode) {
    return <PanicMode onExit={() => setPanicMode(false)} />
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-accent-primary/30 selection:text-text-primary flex overflow-hidden">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      <AnimatePresence>
        {showTutorial && <TutorialModal onComplete={handleTutorialComplete} onSkip={handleTutorialComplete} />}
      </AnimatePresence>

      {/* Sidebar Navigation - Desktop */}
      <nav className="hidden md:flex w-20 bg-black/10 border-r border-white/5 flex-col items-center py-6 gap-8 z-50 backdrop-blur-xl">
        <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center border border-accent-primary/20 shadow-[0_0_15px_rgba(var(--accent-primary),0.2)]">
          <Shield size={24} className="text-accent-primary" />
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full items-center justify-center">
          {[
            { id: 'vault', icon: Lock, label: t('vault') },
            { id: 'mimic', icon: ImageIcon, label: 'Mimic' },
            { id: 'identity', icon: User, label: 'ID' },
            { id: 'settings', icon: Settings, label: 'Config' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              title={item.label}
              aria-label={item.label}
              className={clsx(
                'relative p-3 rounded-xl transition-all group flex items-center justify-center',
                activeTab === item.id
                  ? 'bg-accent-primary/20 text-accent-primary shadow-[0_0_15px_rgba(var(--accent-primary),0.2)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <item.icon size={22} className="relative z-10" />
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute right-0 w-1 h-8 bg-accent-primary rounded-l-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ right: '-17px', top: 'calc(50% - 16px)' }}
                />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            unlock('panic_mode')
            setPanicMode(true)
          }}
          className="p-3 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mb-4"
          title={t('panicMode')}
          aria-label={t('panicMode')}
        >
          <EyeOff size={22} />
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden pb-16 md:pb-0">
        {/* Animated Background Blobs & Grid */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMCAwTDQwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent-primary/10 blur-[150px] rounded-full animate-[pulse_8s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-accent-secondary/5 blur-[120px] rounded-full animate-[pulse_10s_ease-in-out_infinite]"></div>
        </div>

        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 backdrop-blur-sm z-40 bg-black/10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
              CRYPTO<span className="font-light">3</span>
            </h1>
            <span className="text-[10px] bg-white/5 text-text-secondary px-2 py-0.5 rounded border border-white/5">
              v1.0.3
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <Shield size={14} className="md:hidden" />
          </div>
        </header>

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-0 md:p-6 overflow-hidden z-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full overflow-y-auto"
            >
              {activeTab === 'vault' && (
                <VaultPanel
                  inputData={inputData}
                  setInputData={setInputData}
                  outputData={outputData}
                  setOutputData={setOutputData}
                  isEncrypted={isEncrypted}
                  setIsEncrypted={setIsEncrypted}
                  encryptedPackage={encryptedPackage}
                  setEncryptedPackage={setEncryptedPackage}
                  currentFormat={currentFormat}
                  setCurrentFormat={setCurrentFormat}
                  secretKey={secretKey}
                  setSecretKey={setSecretKey}
                  onSwitchToStego={() => setActiveTab('mimic')}
                />
              )}
              {activeTab === 'mimic' && (
                <MimicPanel
                  encryptedPackage={encryptedPackage}
                  isEncrypted={isEncrypted}
                  onExtract={handleExtract}
                />
              )}
              {activeTab === 'identity' && <IdentityPanel />}
              {activeTab === 'settings' && <SettingsPanel onReplayTutorial={handleReplayTutorial} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/20 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2">
          {[
            { id: 'vault', icon: Lock, label: t('vault') },
            { id: 'mimic', icon: ImageIcon, label: t('mimic') },
            { id: 'identity', icon: User, label: 'ID' },
            { id: 'settings', icon: Settings, label: t('config') }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                activeTab === item.id
                  ? 'text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <div
                className={clsx(
                  'p-1.5 rounded-lg transition-all',
                  activeTab === item.id
                    ? 'bg-accent-primary/20 shadow-[0_0_10px_rgba(var(--accent-primary),0.2)]'
                    : ''
                )}
              >
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              unlock('panic_mode')
              setPanicMode(true)
            }}
            className="flex flex-col items-center gap-1 p-2 text-red-500/70 hover:text-red-400"
          >
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <EyeOff size={20} />
            </div>
            <span className="text-[10px] font-medium">{t('panic')}</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <NotificationSystem />
        <AppLayout />
      </NotificationProvider>
    </ThemeProvider>
  )
}
