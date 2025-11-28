import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Sparkles, Terminal } from 'lucide-react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* -------------------------------------------------------------------------- */
/*                                 Tech Header                                */
/* -------------------------------------------------------------------------- */

interface TechHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export function TechHeader({ title, subtitle, icon, className }: TechHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3 mb-4 select-none', className)}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary shadow-[0_0_10px_rgba(var(--accent-primary),0.2)]">
        {icon || <Terminal size={16} />}
        {/* Decorative corner bits */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-accent-primary/50" />
        <div className="absolute bottom-0 right-0 w-1 h-1 bg-accent-primary/50" />
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 font-mono">
          {title}
        </h3>
        {subtitle && <span className="text-[10px] text-text-secondary uppercase tracking-widest font-mono opacity-70">{subtitle}</span>}
      </div>
      {/* Decorative Line */}
      <div className="flex-1 h-px bg-gradient-to-r from-accent-primary/50 to-transparent ml-4" />
      {/* End Cap */}
      <div className="w-1.5 h-1.5 bg-accent-primary/50 rotate-45" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Mobile Tab Switcher                             */
/* -------------------------------------------------------------------------- */

interface MobileTabSwitcherProps<T extends string> {
  tabs: { id: T; label: string; icon?: React.ReactNode }[]
  activeTab: T
  onTabChange: (id: T) => void
  className?: string
}

export function MobileTabSwitcher<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className
}: MobileTabSwitcherProps<T>) {
  return (
    <div className={cn('flex p-1 bg-black/20 backdrop-blur-md rounded-xl border border-glass-border', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative',
              isActive ? 'text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary/80'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-accent-primary/20 border border-accent-primary/30 rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Glass Card                                 */
/* -------------------------------------------------------------------------- */

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  gradient?: boolean
}

export function GlassCard({ children, className, gradient = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass-panel rounded-2xl p-6 relative overflow-hidden group',
        gradient &&
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent-primary/5 before:to-transparent before:pointer-events-none',
        className
      )}
      {...props}
    >
       {/* Tech Deco: Corner accents that appear on hover or always slightly visible */}
       <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-accent-primary/0 group-hover:border-accent-primary/30 transition-colors rounded-tl-lg pointer-events-none" />
       <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-accent-primary/0 group-hover:border-accent-primary/30 transition-colors rounded-br-lg pointer-events-none" />

      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Glass Button                                */
/* -------------------------------------------------------------------------- */

type MotionButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export function GlassButton({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...props
}: MotionButtonProps) {
  const variants = {
    primary:
      'bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/50 shadow-[0_0_15px_rgba(var(--accent-primary),0.3)]',
    secondary:
      'bg-bg-secondary/50 hover:bg-bg-secondary/70 text-text-secondary border border-glass-border',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30',
    ghost: 'hover:bg-glass-highlight text-text-secondary hover:text-text-primary'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-xl flex items-center justify-center gap-2 transition-all font-medium backdrop-blur-sm relative overflow-hidden',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Shimmer effect for primary buttons */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
      )}

      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children as React.ReactNode}
    </motion.button>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Glass Input                                */
/* -------------------------------------------------------------------------- */

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function GlassInput({ className, label, error, ...props }: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
           <Sparkles size={10} className="text-accent-primary" />
          {label}
        </label>
      )}
      <input
        className={cn(
          'glass-input w-full rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all font-mono text-sm',
          error && 'border-danger/50 focus:border-danger focus:ring-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
