import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const signUp = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  return user
}

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export const logOut = (): Promise<void> => signOut(auth)

export const onAuthChanged = (callback: (user: FirebaseUser | null) => void) =>
  onAuthStateChanged(auth, callback)
