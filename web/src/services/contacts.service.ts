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
import { sanitizeField, validateContactName, validatePhone, checkRateLimit } from '@/lib/security'
import type { Contact } from '@/types'

const COLLECTION = 'contacts'

export const createContact = async (
  userId: string,
  connectionId: string,
  name: string,
  phone: string
): Promise<void> => {
  if (!checkRateLimit('create-contact', 20, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  const nameValidation = validateContactName(name)
  if (!nameValidation.valid) throw new Error(nameValidation.error)

  const phoneValidation = validatePhone(phone)
  if (!phoneValidation.valid) throw new Error(phoneValidation.error)

  await addDoc(collection(db, COLLECTION), {
    userId,
    connectionId,
    name: sanitizeField(name),
    phone: sanitizeField(phone),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateContact = async (id: string, name: string, phone: string): Promise<void> => {
  if (!checkRateLimit('update-contact', 20, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  const nameValidation = validateContactName(name)
  if (!nameValidation.valid) throw new Error(nameValidation.error)

  const phoneValidation = validatePhone(phone)
  if (!phoneValidation.valid) throw new Error(phoneValidation.error)

  await updateDoc(doc(db, COLLECTION, id), {
    name: sanitizeField(name),
    phone: sanitizeField(phone),
    updatedAt: serverTimestamp(),
  })
}

export const deleteContact = async (id: string): Promise<void> => {
  if (!checkRateLimit('delete-contact', 20, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  await deleteDoc(doc(db, COLLECTION, id))
}

export const subscribeToContacts = (
  userId: string,
  connectionId: string,
  onData: (contacts: Contact[]) => void,
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
      const contacts: Contact[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          userId: data.userId,
          connectionId: data.connectionId,
          name: data.name,
          phone: data.phone,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        }
      })
      onData(contacts)
    },
    onError
  )
}
