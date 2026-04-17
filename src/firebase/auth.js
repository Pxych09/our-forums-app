import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from './config'

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  return signOut(auth)
}