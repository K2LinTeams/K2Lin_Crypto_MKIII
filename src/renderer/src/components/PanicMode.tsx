import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Monitor, Globe, Bell, FileText, ChevronRight } from 'lucide-react'

// Mock Genshin Impact Launch Screen
export default function PanicMode({ onExit }: { onExit: () => void }) {
  const [showLauncher] = useState(true)
  const [showPinInput, setShowPinInput] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

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
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans text-white select-none">
      {/* Background Layer - Mimic the sky/landscape */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)' // Fallback sky
        }}
      >
        {/* We use a CSS gradient to simulate a generic anime landscape backdrop if no image */}
        <div className="absolute inset-0 bg-[url('https://upload-os-bbs.hoyolab.com/upload/2021/09/01/100044/f9854b41a9d1d93208537c768925565f_1196160166299863765.jpg')] bg-cover bg-center opacity-100 blur-[0px]"></div>

        {/* Overlay Gradient for UI readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Launcher Interface */}
      <AnimatePresence>
        {showLauncher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col justify-between p-8 md:p-12"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                {/* Mock Logo */}
                <div className="w-12 h-12 bg-[#F4D8A8] rounded-full flex items-center justify-center text-[#3D4252] font-serif font-bold text-2xl shadow-lg border-2 border-white/50">
                  G
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wider drop-shadow-md text-white font-serif">
                    Genshin Impact
                  </h1>
                  <p className="text-[10px] text-white/80 tracking-[0.2em] uppercase font-bold">
                    Version 4.5.0
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
                <span className="hover:text-[#FFC107] cursor-pointer transition-colors duration-300 drop-shadow-sm">
                  OFFICIAL SITE
                </span>
                <span className="hover:text-[#FFC107] cursor-pointer transition-colors duration-300 drop-shadow-sm">
                  COMMUNITY
                </span>
                <span className="hover:text-[#FFC107] cursor-pointer transition-colors duration-300 drop-shadow-sm">
                  SUPPORT
                </span>
                <div className="w-px h-4 bg-white/50"></div>
                <div className="flex gap-4">
                  <Monitor
                    size={20}
                    className="hover:text-[#FFC107] cursor-pointer transition-colors"
                  />
                  <Globe
                    size={20}
                    className="hover:text-[#FFC107] cursor-pointer transition-colors"
                  />
                </div>
                <button
                  className="hover:bg-white/10 p-2 rounded-full transition-colors"
                  onClick={() => window.close()}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content Area - News Feed */}
            <div className="flex-1 flex flex-col justify-center items-start gap-8 z-0">
              {/* Carousel / Banner Mock */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 w-[450px]">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 bg-[#FFC107] text-[#3D4252] px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider shadow-lg">
                    <Bell size={12} fill="currentColor" />
                    New Event
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black drop-shadow-xl leading-[1.1] font-serif text-white">
                    Step into a<br />
                    <span className="text-[#FFC107]">Vast Magical World</span>
                  </h2>
                  <p className="text-lg text-white/90 drop-shadow-md leading-relaxed font-light">
                    Experience an immersive single-player adventure. As a traveler from another
                    world, you will embark on a journey to reunite with your lost sibling.
                  </p>
                </motion.div>

                {/* Mock News List */}
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-white/70 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">
                    <span>Latest News</span>
                    <ChevronRight size={14} />
                  </div>
                  {[
                    "Version 4.5 'Blades Weaving Betwixt Brocade' Now Available!",
                    "Event Wish 'Oath of the Rose' - Boosted Drop Rate for...",
                    "Character Teaser - Chiori: 'Thousand Threads of Brilliance'"
                  ].map((news, i) => (
                    <div key={i} className="flex items-start gap-3 group cursor-pointer">
                      <FileText
                        size={16}
                        className="text-[#FFC107] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform"
                      />
                      <span className="text-sm text-white/90 group-hover:text-[#FFC107] transition-colors line-clamp-1">
                        {news}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar / Play Button */}
            <div className="flex justify-between items-end z-10">
              <div className="flex flex-col gap-2">
                <div className="flex gap-4 text-xs text-white/50 font-medium tracking-wide">
                  <span className="hover:text-white cursor-pointer transition-colors">
                    Agreements
                  </span>
                  <span
                    className="hover:text-white cursor-pointer transition-colors"
                    onClick={handleExitAttempt}
                  >
                    Privacy Policy
                  </span>
                  <span className="hover:text-white cursor-pointer transition-colors">
                    Terms of Service
                  </span>
                </div>
                <span className="text-[10px] text-white/30">
                  © COGNOSPHERE. All Rights Reserved.
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-white/70 uppercase tracking-widest font-bold mb-1">
                    Server
                  </div>
                  <div className="text-lg font-bold text-[#FFC107] flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#4ade80]"></div>
                    America
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group bg-[#FFC107] hover:bg-[#FFD54F] text-[#3E2723] w-72 h-20 rounded-lg flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(255,193,7,0.4)] transition-all overflow-hidden border-2 border-[#FFE082]"
                >
                  <span className="relative z-10 flex items-center gap-3 tracking-wide">
                    Launch
                  </span>
                  <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12 origin-bottom-left"></div>
                  <div className="absolute inset-0 border-t-2 border-white/50 rounded-lg"></div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PIN Input Modal */}
      <AnimatePresence>
        {showPinInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.form
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onSubmit={handlePinSubmit}
              className="bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-6 w-80"
            >
               <h3 className="text-xl font-bold text-white tracking-wider">SECURITY CHECK</h3>
               <div className="w-full relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoFocus
                    placeholder="Enter PIN"
                    className={`w-full bg-black/40 border ${error ? 'border-red-500 animate-pulse' : 'border-white/10'} rounded-lg px-4 py-3 text-center text-white placeholder-white/30 focus:outline-none focus:border-[#FFC107] transition-colors`}
                  />
                  {error && (
                    <span className="absolute -bottom-6 left-0 w-full text-center text-xs text-red-500 font-bold uppercase">
                      Access Denied
                    </span>
                  )}
               </div>

               <div className="flex gap-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                        setShowPinInput(false)
                        setError(false)
                        setPin('')
                    }}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors text-sm font-bold"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-[#FFC107] hover:bg-[#FFD54F] text-[#3D4252] transition-colors text-sm font-bold shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                  >
                    UNLOCK
                  </button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
