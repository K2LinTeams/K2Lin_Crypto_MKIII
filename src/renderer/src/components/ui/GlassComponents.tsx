import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
        'glass-panel rounded-2xl p-6 relative overflow-hidden',
        gradient && 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent-primary/5 before:to-transparent before:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type MotionButtonProps = HTMLMotionProps<'button'> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
}

export function GlassButton({ className, variant = 'primary', size = 'md', icon, children, ...props }: MotionButtonProps) {
  const variants = {
    primary: 'bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/50 shadow-[0_0_15px_rgba(var(--accent-primary),0.3)]',
    secondary: 'bg-bg-secondary/50 hover:bg-bg-secondary/70 text-text-secondary border border-glass-border',
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
        'rounded-xl flex items-center justify-center gap-2 transition-all font-medium backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children as React.ReactNode}
    </motion.button>
  )
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function GlassInput({ className, label, error, ...props }: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</label>}
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
