import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { Sparkles } from 'lucide-react'

interface Option {
  label: string
  value: string
  subLabel?: string
}

interface GlassDropdownProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function GlassDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  className
}: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={clsx('flex flex-col gap-1.5 w-full relative', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={10} className="text-accent-primary" />
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'glass-input w-full rounded-xl px-3 py-2 text-left flex items-center justify-between',
          'bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all',
          'focus:outline-none focus:ring-1 focus:ring-accent-primary/30',
          isOpen && 'border-accent-primary/30 ring-1 ring-accent-primary/30'
        )}
      >
        <div className="flex flex-col overflow-hidden">
          <span className={clsx('text-sm font-mono truncate', !selectedOption && 'text-text-secondary/50')}>
            {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
          </span>
          {selectedOption?.subLabel && (
             <span className="text-[10px] text-text-secondary font-mono truncate opacity-70">
                {selectedOption.subLabel}
             </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={clsx('text-text-secondary transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl flex flex-col max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-secondary italic">
                    No options available
                </div>
            ) : (
                options.map((option) => {
                const isSelected = option.value === value
                return (
                    <button
                    key={option.value}
                    onClick={() => {
                        onChange(option.value)
                        setIsOpen(false)
                    }}
                    className={clsx(
                        'flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-mono transition-colors border-b border-white/5 last:border-none',
                        isSelected ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-primary hover:bg-white/10'
                    )}
                    >
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-bold">{option.label}</span>
                        {option.subLabel && <span className="text-[10px] opacity-60 truncate">{option.subLabel}</span>}
                    </div>
                    {isSelected && <Check size={14} className="flex-shrink-0 ml-2" />}
                    </button>
                )
                })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
