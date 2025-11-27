import React, { useState, useEffect } from 'react'
import { Shield, Lock, Image as ImageIcon, Settings, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

// Panels
import VaultPanel from './components/panels/VaultPanel'
import MimicPanel from './components/panels/MimicPanel'
import SettingsPanel from './components/panels/SettingsPanel'
import { ThemeProvider } from './components/ThemeContext'
import { Plus, CheckCircle, Trash2 } from 'lucide-react' // For Panic Mode
import { useApi } from './useApi'

// --- Panic Mode Component (Self-contained for clean separation) ---
const PanicMode = ({ onExit }: { onExit: () => void }) => {
  const [todos, setTodos] = useState<{ id: number; text: string; done: boolean }[]>([])
  const api = useApi()

  // Load Panic Mode Todos
  useEffect(() => {
    async function loadTodos(): Promise<void> {
      const storedTodos = await api.store.get('todos')
      if (storedTodos) {
        setTodos(storedTodos)
      }
    }
    loadTodos()
  }, [])

  // Save Panic Mode Todos
  const updateTodos = (newTodos: typeof todos): void => {
    setTodos(newTodos)
    api.store.set('todos', newTodos)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col items-center pt-10 transition-all duration-300">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
            <h1 className="text-xl font-bold">Daily Tasks</h1>
            <button
              onClick={onExit}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div> {/* Hidden Toggle */}
            </button>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a new task..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value
                    if (val) {
                      updateTodos([...todos, { id: Date.now(), text: val, done: false }])
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    const newTodos = todos.map((t) =>
                      t.id === todo.id ? { ...t, done: !t.done } : t
                    )
                    updateTodos(newTodos)
                  }}
                >
                  {todo.done ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={todo.done ? 'line-through text-gray-400' : ''}>{todo.text}</span>
                  <button
                    className="ml-auto text-gray-300 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateTodos(todos.filter((t) => t.id !== todo.id))
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400">SimpleNotes v1.0.2 &copy; 2024</div>
      </div>
  )
}

// --- Main App Layout ---
type Tab = 'vault' | 'mimic' | 'settings'
type Format = 'Base64' | 'Hex' | 'Natural Text (Markov)'

function AppLayout(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('vault')
  const [panicMode, setPanicMode] = useState(false)

  // Shared state lifted from panels
  const [inputData, setInputData] = useState('')
  const [outputData, setOutputData] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [encryptedPackage, setEncryptedPackage] = useState<any>(null)
  const [currentFormat, setCurrentFormat] = useState<Format>('Base64')

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

  if (panicMode) {
    return <PanicMode onExit={() => setPanicMode(false)} />
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-accent-primary/30 selection:text-text-primary flex overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 bg-bg-secondary/50 border-r border-glass-border flex flex-col items-center py-6 gap-8 z-50 backdrop-blur-xl">
        <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center border border-accent-primary/20 shadow-[0_0_15px_rgba(var(--accent-primary),0.2)]">
          <Shield size={24} className="text-accent-primary" />
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          {[
            { id: 'vault', icon: Lock, label: 'Vault' },
            { id: 'mimic', icon: ImageIcon, label: 'Mimic' },
            { id: 'settings', icon: Settings, label: 'Config' }
          ].map((item) => (
             <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={clsx(
                'p-3 rounded-xl transition-all relative group',
                activeTab === item.id
                  ? 'bg-accent-primary/20 text-accent-primary shadow-[0_0_15px_rgba(var(--accent-primary),0.2)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-glass-highlight'
              )}
            >
              <item.icon size={22} />
              {activeTab === item.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-primary rounded-r-full"
                  />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPanicMode(true)}
          className="p-3 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mb-4"
          title="Enable Panic Mode"
        >
          <EyeOff size={22} />
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent-secondary/10 blur-[100px] rounded-full"></div>
        </div>

        {/* Top Bar */}
        <header className="h-16 border-b border-glass-border flex items-center justify-between px-8 backdrop-blur-sm z-40 bg-bg-primary/30">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
              CRYPTO<span className="font-light">3</span>
            </h1>
            <span className="text-[10px] bg-bg-secondary text-text-secondary px-2 py-0.5 rounded border border-glass-border">
              v0.2.0-beta
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-success">
             <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
             <span>System Secure</span>
          </div>
        </header>

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-6 overflow-hidden z-10">
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
                  />
                )}
                {activeTab === 'mimic' && (
                  <MimicPanel
                    encryptedPackage={encryptedPackage}
                    isEncrypted={isEncrypted}
                    onExtract={handleExtract}
                  />
                )}
                {activeTab === 'settings' && <SettingsPanel />}
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  )
}
