import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotification } from '../components/NotificationContext'

export interface Achievement {
  id: string
  unlockedAt: number
}

const ACHIEVEMENT_IDS = [
  'tutorial_complete',
  'identity_created',
  'stego_unlocked',
  'first_encrypt',
  'contact_imported',
  'panic_mode',
  'theme_changed',
  'encyclopedia_read',
  'sanity_zero',
  'lone_trail_found'
] as const

export type AchievementId = typeof ACHIEVEMENT_IDS[number]

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const { t } = useTranslation('achievements')
  const { addNotification } = useNotification()

  useEffect(() => {
    const saved = localStorage.getItem('crypto3_achievements')
    if (saved) {
      try {
        setAchievements(JSON.parse(saved))
      } catch {
        setAchievements([])
      }
    }
  }, [])

  const unlock = (id: AchievementId) => {
    const saved = localStorage.getItem('crypto3_achievements')
    const currentList: Achievement[] = saved ? JSON.parse(saved) : []

    if (!currentList.some((a) => a.id === id)) {
      const newAchievement = { id, unlockedAt: Date.now() }
      const updatedList = [...currentList, newAchievement]

      setAchievements(updatedList)
      localStorage.setItem('crypto3_achievements', JSON.stringify(updatedList))

      // Notify user
      const title = t(`list.${id}.title`, 'Achievement Unlocked')
      addNotification('success', `🎖️ ${t('unlocked')}: ${title}`)
    }
  }

  const isUnlocked = (id: AchievementId) => {
      return achievements.some(a => a.id === id)
  }

  return {
    achievements,
    unlock,
    isUnlocked,
    allIds: ACHIEVEMENT_IDS
  }
}
