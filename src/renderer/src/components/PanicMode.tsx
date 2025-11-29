import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Activity, ChevronRight, AlertTriangle } from 'lucide-react'
import rhineBg from '../assets/rhine_lab_bg.jpg'

export default function PanicMode({ onExit }: { onExit: () => void }) {
  const [showPinInput, setShowPinInput] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleExitAttempt = () => {
    const savedPin = localStorage.getItem('panicPin')
    if (savedPin) {
      setShowPinInput(true)
    } else {
      onExit()
    }
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const savedPin = localStorage.getItem('panicPin')
    if (pin === savedPin) {
      onExit()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans select-none bg-gray-900 text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: `url(${rhineBg})` }}
        />
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
      </div>

      {/* Main UI Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-12">

        {/* Header */}
        <header className="flex justify-between items-start border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            {/* Rhine Lab Logo Mock */}
            <div className="w-12 h-12 bg-[#FF6B00] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.5)]">
              <Activity className="text-white" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-widest uppercase font-mono">
                Rhine Lab
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#FF6B00] font-mono tracking-wider">
                <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></span>
                SYSTEM ONLINE // {time.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-white/50 font-mono">SECURE CONNECTION</div>
            <div className="text-xl font-mono font-bold text-white tracking-widest">
              RL-359-BASE
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row gap-12 items-center justify-between py-12">

          {/* Left: Flavor Text / System Logs */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-2xl space-y-8"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-mono font-bold tracking-widest uppercase rounded">
                <AlertTriangle size={12} />
                Priority Alert
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Lone Trail
              </h2>
            </div>

            <div className="bg-black/40 backdrop-blur-md border-l-2 border-[#FF6B00] p-6 space-y-4">
              <p className="text-gray-300 leading-relaxed text-sm md:text-base tracking-wide font-light">
                所有人都知道，359号基地只是一个开始，却没有人料到，克丽斯腾的行动来得如此迅速。
              </p>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base tracking-wide font-light">
                从天而降的“流星”，不知去向的递质，急迫的军方，别有所图的梅兰德，凯尔希与意料之外的访客......一切都预示着有什么即将发生。
              </p>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base tracking-wide font-light">
                没有人看得清，在迷雾的背后究竟隐藏着怎样的秘密，正如没有人料得到，未来离我们如此之近。
              </p>
              <p className="text-white font-medium text-lg pt-2 border-t border-white/10 mt-4">
                试着抬头吧，答案近在眼前。
              </p>
            </div>
          </motion.div>

          {/* Right: Actions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full md:w-auto flex flex-col gap-6"
          >
            <div className="hidden md:block w-64 h-px bg-white/20 self-end"></div>

            <button
              onClick={handleExitAttempt}
              className="group relative flex items-center justify-between w-full md:w-80 bg-white text-black p-6 hover:bg-[#FF6B00] transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,107,0,0.4)]"
            >
              <div className="flex flex-col items-start z-10">
                <span className="text-xs font-mono uppercase tracking-widest opacity-60 group-hover:text-white transition-colors">
                  Identity Verified
                </span>
                <span className="text-xl font-bold font-mono group-hover:text-white transition-colors">
                  ACCESS TERMINAL
                </span>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:text-white group-hover:translate-x-1 transition-all" />

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black group-hover:border-white transition-colors"></div>
            </button>

            <div className="flex justify-end gap-4 text-xs font-mono text-white/40">
              <span>VER: 4.0.1</span>
              <span>//</span>
              <span>STATUS: NORMAL</span>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-end text-[10px] text-white/30 uppercase tracking-widest font-mono">
          <div className="flex flex-col gap-1">
            <span>Rhine Lab Ecological Section</span>
            <span>Scientific Research Center</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-[#FF6B00] cursor-pointer transition-colors">Privacy Protocol</span>
            <span className="hover:text-[#FF6B00] cursor-pointer transition-colors">Term of Service</span>
          </div>
        </footer>
      </div>

      {/* PIN Input Overlay */}
      <AnimatePresence>
        {showPinInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onSubmit={handlePinSubmit}
              className="w-full max-w-sm p-8 flex flex-col items-center gap-8 border border-white/10 bg-black/50 relative overflow-hidden"
            >
              {/* Decorative Scan Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent opacity-50"></div>

              <div className="text-center space-y-2">
                <Shield className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white font-mono tracking-widest uppercase">
                  Security Clearance
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  ENTER PASSCODE TO PROCEED
                </p>
              </div>

              <div className="w-full relative group">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoFocus
                  className={`w-full bg-black/40 border-b-2 ${error ? 'border-red-500 animate-pulse' : 'border-white/20 group-hover:border-[#FF6B00]'} px-4 py-3 text-center text-2xl text-white tracking-[0.5em] focus:outline-none focus:border-[#FF6B00] transition-colors font-mono`}
                />
                <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-mono font-bold flex items-center gap-2"
                >
                  <AlertTriangle size={12} />
                  ACCESS DENIED // RETRY
                </motion.div>
              )}

              <div className="flex gap-4 w-full pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinInput(false)
                    setError(false)
                    setPin('')
                  }}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 text-white/60 transition-colors text-xs font-bold font-mono tracking-widest uppercase"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF6B00] hover:bg-[#FF8533] text-white transition-colors text-xs font-bold font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(255,107,0,0.3)]"
                >
                  Authorize
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
