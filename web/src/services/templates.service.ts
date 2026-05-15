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
import { sanitizeField, checkRateLimit } from '@/lib/security'
import type { Template } from '@/types'

const COLLECTION = 'templates'

export const createTemplate = async (
  userId: string,
  name: string,
  content: string
): Promise<void> => {
  if (!checkRateLimit('create-template', 20, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  if (!name.trim()) throw new Error('O nome é obrigatório.')
  if (!content.trim()) throw new Error('O conteúdo é obrigatório.')

  await addDoc(collection(db, COLLECTION), {
    userId,
    name: sanitizeField(name),
    content: sanitizeField(content),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateTemplate = async (
  id: string,
  name: string,
  content: string
): Promise<void> => {
  if (!checkRateLimit('update-template', 20, 60_000))
    throw new Error('Muitas requisições. Aguarde um momento.')

  await updateDoc(doc(db, COLLECTION, id), {
    name: sanitizeField(name),
    content: sanitizeField(content),
    updatedAt: serverTimestamp(),
  })
}

export const deleteTemplate = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id))
}

export const subscribeToTemplates = (
  userId: string,
  onData: (templates: Template[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))

  return onSnapshot(
    q,
    (snapshot) => {
      const templates: Template[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          content: data.content,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        }
      })
      onData(templates)
    },
    onError
  )
}

export const applyTemplate = (
  content: string,
  contactName: string,
  contactPhone: string
): string =>
  content
    .replace(/\{\{nome\}\}/gi, contactName)
    .replace(/\{\{telefone\}\}/gi, contactPhone)