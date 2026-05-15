import { useEffect, useState } from 'react'
import { subscribeToMessages } from '@/services/messages.service'
import type { Message, MessageStatus } from '@/types'

export const useMessages = (userId: string | undefined, connectionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !connectionId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToMessages(
      userId,
      connectionId,
      (data) => {
        setMessages(data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId, connectionId])

  const filteredMessages = (status: MessageStatus | 'all') =>
    status === 'all' ? messages : messages.filter((m) => m.status === status)

  return { messages, filteredMessages, loading, error }
}
