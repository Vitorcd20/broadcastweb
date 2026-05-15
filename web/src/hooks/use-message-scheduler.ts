import { useEffect } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const INTERVAL_MS = 60_000

const dispatchPendingMessages = async (userId: string): Promise<void> => {
  try {
    const now = Timestamp.now()

    const snapshot = await getDocs(
      query(
        collection(db, 'messages'),
        where('userId', '==', userId),
        where('status', '==', 'scheduled')
      )
    )

    if (snapshot.empty) return

    const overdue = snapshot.docs.filter((docSnap) => {
      const scheduledAt = docSnap.data().scheduledAt as Timestamp
      return scheduledAt && scheduledAt.toMillis() <= now.toMillis()
    })

    if (overdue.length === 0) return

    const batch = writeBatch(db)
    overdue.forEach((docSnap) => {
      batch.update(doc(db, 'messages', docSnap.id), {
        status: 'sent',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    await batch.commit()
    console.log(`[Scheduler] ${overdue.length} mensagem(ns) enviada(s)`)
  } catch (err) {
    console.error('[Scheduler] Erro ao disparar mensagens:', err)
  }
}

export const useMessageScheduler = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return

    dispatchPendingMessages(userId)

    const interval = setInterval(() => {
      dispatchPendingMessages(userId)
    }, INTERVAL_MS)

    return () => clearInterval(interval)
  }, [userId])
}
