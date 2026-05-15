import { useEffect, useState } from 'react'
import { getOnboardingCompleted, completeOnboarding } from '@/services/onboarding.service'

export const useOnboarding = (userId: string | undefined) => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    getOnboardingCompleted(userId).then((completed) => {
      setShowOnboarding(!completed)
      setLoading(false)
    })
  }, [userId])

  const finishOnboarding = async () => {
    if (!userId) return
    await completeOnboarding(userId)
    setShowOnboarding(false)
  }

  return { showOnboarding, loading, finishOnboarding }
}