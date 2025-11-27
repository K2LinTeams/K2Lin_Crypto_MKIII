import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Monitor, Globe } from 'lucide-react'

// Mock Genshin Impact Launch Screen
export default function PanicMode({ onExit }: { onExit: () => void }) {
  const [showLauncher] = useState(true)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans text-white select-none">
      {/* Background Layer - Mimic the sky/landscape */}
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
           style={{
             backgroundImage: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)', // Fallback sky
           }}
      >
        {/* We use a CSS gradient to simulate a generic anime landscape backdrop if no image */}
        <div className="absolute inset-0 bg-[url('https://upload-os-bbs.hoyolab.com/upload/2021/09/01/100044/f9854b41a9d1d93208537c768925565f_1196160166299863765.jpg')] bg-cover bg-center opacity-100 blur-[0px]"></div>

        {/* Overlay Gradient for UI readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
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
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg">
                       G
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider drop-shadow-md">Genshin Impact</h1>
                        <p className="text-xs text-white/80 tracking-widest uppercase">Version 4.5.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
                    <span className="hover:text-yellow-400 cursor-pointer transition-colors">OFFICIAL SITE</span>
                    <span className="hover:text-yellow-400 cursor-pointer transition-colors">COMMUNITY</span>
                    <span className="hover:text-yellow-400 cursor-pointer transition-colors">SUPPORT</span>
                    <div className="w-px h-4 bg-white/50"></div>
                    <div className="flex gap-2">
                        <Monitor size={20} className="hover:text-yellow-400 cursor-pointer"/>
                        <Globe size={20} className="hover:text-yellow-400 cursor-pointer"/>
                    </div>
                    <button className="hover:bg-white/10 p-1 rounded-full" onClick={() => window.close()}>
                        <X size={24} />
                    </button>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 flex flex-col justify-center items-start pl-12 gap-6">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-xl space-y-4"
                >
                    <div className="inline-block bg-yellow-500 text-black px-2 py-1 text-xs font-bold rounded uppercase">
                        New Event
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black drop-shadow-xl leading-tight">
                        Step into a<br/>Vast Magical World
                    </h2>
                    <p className="text-lg text-white/90 drop-shadow-md leading-relaxed">
                        Experience an immersive single-player adventure. As a traveler from another world, you will embark on a journey to reunite with your lost sibling and unravel the mysteries of Teyvat.
                    </p>
                </motion.div>
             </div>

             {/* Bottom Bar / Play Button */}
             <div className="flex justify-between items-end">
                 <div className="flex gap-4 text-xs text-white/60">
                     <span>© COGNOSPHERE. All Rights Reserved.</span>
                     <span className="cursor-pointer hover:text-white" onClick={onExit}>Privacy Policy</span>
                 </div>

                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group bg-yellow-400 hover:bg-yellow-300 text-amber-900 w-64 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(250,204,21,0.6)] transition-all overflow-hidden"
                 >
                    <span className="relative z-10 flex items-center gap-2">
                        <Play fill="currentColor" /> Launch Game
                    </span>
                    <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12 origin-bottom-left"></div>
                 </motion.button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
