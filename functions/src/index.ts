import { onSchedule } from 'firebase-functions/v2/scheduler'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'


initializeApp()

const db = getFirestore()

/**
 * Runs every minute and transitions messages whose scheduledAt
 * has passed from 'scheduled' → 'sent'.
 *
 * Uses a flat collection (no subcollections) as required.
 */
export const dispatchScheduledMessages = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const now = Timestamp.now()

    const snapshot = await db
      .collection('messages')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', now)
      .get()

    if (snapshot.empty) {
      logger.info('No scheduled messages to dispatch.')
      return
    }

    const batch = db.batch()

    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        status: 'sent',
        sentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()

    logger.info(`Dispatched ${snapshot.size} message(s).`)
  }
)
