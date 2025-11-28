import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification, Notification } from '../NotificationContext'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'

const NotificationItem: React.FC<{ notification: Notification; onClose: () => void }> = ({
  notification,
  onClose
}) => {
  const icons = {
    success: <CheckCircle size={20} className="text-accent-primary" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />
  }

  const borderColors = {
    success: 'border-accent-primary/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20'
  }

  const bgColors = {
    success: 'bg-accent-primary/5',
    error: 'bg-red-500/5',
    info: 'bg-blue-500/5'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={clsx(
        'relative flex items-center gap-3 w-full max-w-sm p-4 rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto',
        borderColors[notification.type],
        bgColors[notification.type],
        // Glass effect base
        'bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
      )}
    >
      <div className="flex-shrink-0">{icons[notification.type]}</div>
      <div className="flex-1 text-sm font-medium text-text-primary break-words">
        {notification.message}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
      >
        <X size={16} />
      </button>

      {/* Progress Bar for Auto-dismiss (Optional Visual) */}
      {notification.duration && notification.duration > 0 && (
         <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: notification.duration / 1000, ease: 'linear' }}
            className={clsx(
                "absolute bottom-0 left-0 h-0.5",
                notification.type === 'success' ? 'bg-accent-primary/50' :
                notification.type === 'error' ? 'bg-red-500/50' : 'bg-blue-500/50'
            )}
         />
      )}
    </motion.div>
  )
}

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none p-4 w-full max-w-sm items-end">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
