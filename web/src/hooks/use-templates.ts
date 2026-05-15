import { useEffect, useState } from 'react'
import { subscribeToTemplates } from '@/services/templates.service'
import type { Template } from '@/types'

export const useTemplates = (userId: string | undefined) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToTemplates(
      userId,
      (data) => {
        setTemplates(data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  return { templates, loading, error }
}