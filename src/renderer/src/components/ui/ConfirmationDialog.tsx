import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, GlassButton } from './GlassComponents'
import { AlertTriangle, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  const { t } = useTranslation(['common'])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md relative z-10 pointer-events-none" // pointer-events-none for wrapper, auto for content
          >
            <div className="pointer-events-auto">
              <GlassCard className={`border ${variant === 'danger' ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-accent-primary/30 shadow-[0_0_30px_rgba(var(--accent-primary),0.15)]'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-accent-primary/10 text-accent-primary'}`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${variant === 'danger' ? 'text-red-500' : 'text-white'}`}>
                        {title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    {message}
                  </p>

                  <div className="flex gap-3 mt-2 justify-end">
                    <GlassButton
                      variant="secondary"
                      size="md"
                      onClick={onCancel}
                      icon={<X size={16} />}
                    >
                      {cancelLabel || t('cancel', 'Cancel')}
                    </GlassButton>
                    <GlassButton
                      variant={variant}
                      size="md"
                      onClick={onConfirm}
                      icon={<Check size={16} />}
                    >
                      {confirmLabel || t('confirm', 'Confirm')}
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
