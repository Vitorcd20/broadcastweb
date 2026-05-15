import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  sanitizeField,
  validateMessageContent,
  validateScheduledAt,
  checkRateLimit,
} from '@/lib/security'
import type { Message, MessageStatus } from '@/types'

const COLLECTION = 'messages'

export const createMessage = async (
  userId: string,
  connectionId: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date
): Promise<void> => {
  if (!checkRateLimit('create-message', 15, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  const contentValidation = validateMessageContent(content)
  if (!contentValidation.valid) throw new Error(contentValidation.error)

  const dateValidation = validateScheduledAt(scheduledAt, false)
  if (!dateValidation.valid) throw new Error(dateValidation.error)

  if (contactIds.length === 0) throw new Error('Selecione ao menos um contato.')
  if (contactIds.length > 500) throw new Error('Máximo de 500 contatos por mensagem.')

  await addDoc(collection(db, COLLECTION), {
    userId,
    connectionId,
    contactIds,
    content: sanitizeField(content),
    status: 'scheduled' as MessageStatus,
    scheduledAt: Timestamp.fromDate(scheduledAt),
    sentAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateMessage = async (
  id: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date
): Promise<void> => {
  if (!checkRateLimit('update-message', 15, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  const contentValidation = validateMessageContent(content)
  if (!contentValidation.valid) throw new Error(contentValidation.error)

  if (contactIds.length === 0) throw new Error('Selecione ao menos um contato.')

  await updateDoc(doc(db, COLLECTION, id), {
    contactIds,
    content: sanitizeField(content),
    scheduledAt: Timestamp.fromDate(scheduledAt),
    updatedAt: serverTimestamp(),
  })
}

export const deleteMessage = async (id: string): Promise<void> => {
  if (!checkRateLimit('delete-message', 15, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  await deleteDoc(doc(db, COLLECTION, id))
}

export const subscribeToMessages = (
  userId: string,
  connectionId: string,
  onData: (messages: Message[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('connectionId', '==', connectionId)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          userId: data.userId,
          connectionId: data.connectionId,
          contactIds: data.contactIds,
          content: data.content,
          status: data.status as MessageStatus,
          scheduledAt: data.scheduledAt?.toDate() ?? new Date(),
          sentAt: data.sentAt?.toDate() ?? null,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        }
      })
      onData(messages)
    },
    onError
  )
}
