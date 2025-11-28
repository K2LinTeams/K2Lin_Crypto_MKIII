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
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary/5 border border-accent-primary/10 text-accent-primary shadow-[0_0_10px_rgba(var(--accent-primary),0.1)]">
        {icon || <Terminal size={16} />}
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 font-mono">
          {title}
        </h3>
        {subtitle && <span className="text-xs text-text-secondary uppercase tracking-widest font-mono opacity-70">{subtitle}</span>}
      </div>
      {/* Decorative Line */}
      <div className="flex-1 h-px bg-gradient-to-r from-accent-primary/30 to-transparent ml-4 opacity-50" />
      {/* End Cap */}
      <div className="w-1.5 h-1.5 bg-accent-primary/30 rotate-45" />
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
    <div className={cn('flex p-1 bg-black/10 backdrop-blur-md rounded-xl border border-glass-border', className)}>
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
                className="absolute inset-0 bg-accent-primary/10 border border-accent-primary/20 rounded-lg"
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
  /** @deprecated Floating effect is removed in favor of unified entry animation */
  floating?: boolean
}

export function GlassCard({ children, className, gradient = false, floating = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.4 }}
      className={cn(
        'glass-panel rounded-2xl p-6 relative overflow-hidden group border border-white/5 shadow-2xl backdrop-blur-xl bg-black/20',
        gradient &&
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent-primary/5 before:to-transparent before:pointer-events-none',
        className
      )}
      {...props}
    >
      {/* Subtle sheen effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
      'bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/30 shadow-[0_0_15px_rgba(var(--accent-primary),0.2)]',
    secondary:
      'bg-white/5 hover:bg-white/10 text-text-secondary border border-white/10',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20',
    ghost: 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
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
          'glass-input w-full rounded-xl px-3 py-2 text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary/30 focus:ring-1 focus:ring-accent-primary/30 transition-all font-mono text-sm bg-black/20 border border-white/5',
          error && 'border-danger/50 focus:border-danger focus:ring-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
