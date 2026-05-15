import { useEffect, useState } from 'react'
import { subscribeToConnections } from '@/services/connections.service'
import type { Connection } from '@/types'

export const useConnections = (userId: string | undefined) => {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToConnections(
      userId,
      (data) => {
        setConnections(data)
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

  return { connections, loading, error }
}
