import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'onboarding'

export const getOnboardingCompleted = async (userId: string): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, userId))
    if (snap.exists() && snap.data()?.completed === true) return true

    const connectionsSnap = await getDocs(
      query(collection(db, 'connections'), where('userId', '==', userId))
    )
    if (!connectionsSnap.empty) {
      await setDoc(doc(db, COLLECTION, userId), {
        userId,
        completed: true,
        completedAt: serverTimestamp(),
      })
      return true
    }

    return false
  } catch {
    return false
  }
}

export const completeOnboarding = async (userId: string): Promise<void> => {
  await setDoc(doc(db, COLLECTION, userId), {
    userId,
    completed: true,
    completedAt: serverTimestamp(),
  })
}