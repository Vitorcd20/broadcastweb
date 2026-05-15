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
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sanitizeField, validateConnectionName, checkRateLimit } from '@/lib/security'
import type { Connection } from '@/types'

const COLLECTION = 'connections'

export const createConnection = async (userId: string, name: string): Promise<void> => {
  if (!checkRateLimit('create-connection', 10, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  const validation = validateConnectionName(name)
  if (!validation.valid) throw new Error(validation.error)

  await addDoc(collection(db, COLLECTION), {
    userId,
    name: sanitizeField(name),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateConnection = async (id: string, name: string): Promise<void> => {
  if (!checkRateLimit('update-connection', 10, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  const validation = validateConnectionName(name)
  if (!validation.valid) throw new Error(validation.error)

  await updateDoc(doc(db, COLLECTION, id), {
    name: sanitizeField(name),
    updatedAt: serverTimestamp(),
  })
}

export const deleteConnection = async (id: string): Promise<void> => {
  if (!checkRateLimit('delete-connection', 10, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  await deleteDoc(doc(db, COLLECTION, id))
}

export const subscribeToConnections = (
  userId: string,
  onData: (connections: Connection[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))

  return onSnapshot(
    q,
    (snapshot) => {
      const connections: Connection[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        }
      })
      onData(connections)
    },
    onError
  )
}
