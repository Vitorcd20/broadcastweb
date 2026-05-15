import { useEffect, useState } from 'react'
import { subscribeToContacts } from '@/services/contacts.service'
import type { Contact } from '@/types'

export const useContacts = (userId: string | undefined, connectionId: string | undefined) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !connectionId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToContacts(
      userId,
      connectionId,
      (data) => {
        setContacts(data)
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

  return { contacts, loading, error }
}
