import { useMemo } from 'react'
import type { Connection } from '@/types'
import { useContacts } from './use-contacts'
import { useMessages } from './use-messages'

interface ConnectionStats {
  connectionId: string
  contactCount: number
  scheduledCount: number
  sentCount: number
}

const useConnectionStats = (userId: string, connectionId: string): ConnectionStats => {
  const { contacts } = useContacts(userId, connectionId)
  const { messages } = useMessages(userId, connectionId)

  return useMemo(() => ({
    connectionId,
    contactCount: contacts.length,
    scheduledCount: messages.filter((m) => m.status === 'scheduled').length,
    sentCount: messages.filter((m) => m.status === 'sent').length,
  }), [connectionId, contacts, messages])
}

interface DashboardStats {
  totalConnections: number
  totalContacts: number
  totalScheduled: number
  totalSent: number
  statsByConnection: ConnectionStats[]
}

export const useDashboardStats = (
  userId: string,
  connections: Connection[]
): DashboardStats => {
  const c0 = useConnectionStats(userId, connections[0]?.id ?? '')
  const c1 = useConnectionStats(userId, connections[1]?.id ?? '')
  const c2 = useConnectionStats(userId, connections[2]?.id ?? '')
  const c3 = useConnectionStats(userId, connections[3]?.id ?? '')
  const c4 = useConnectionStats(userId, connections[4]?.id ?? '')
  const c5 = useConnectionStats(userId, connections[5]?.id ?? '')
  const c6 = useConnectionStats(userId, connections[6]?.id ?? '')
  const c7 = useConnectionStats(userId, connections[7]?.id ?? '')
  const c8 = useConnectionStats(userId, connections[8]?.id ?? '')
  const c9 = useConnectionStats(userId, connections[9]?.id ?? '')

  const allStats = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9]
  const statsByConnection = allStats.slice(0, connections.length)

  return useMemo(() => ({
    totalConnections: connections.length,
    totalContacts: statsByConnection.reduce((acc, s) => acc + s.contactCount, 0),
    totalScheduled: statsByConnection.reduce((acc, s) => acc + s.scheduledCount, 0),
    totalSent: statsByConnection.reduce((acc, s) => acc + s.sentCount, 0),
    statsByConnection,
  }), [connections.length, statsByConnection])
}
