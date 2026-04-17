import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './config'

export async function getProfile(userId) {
  const profileRef = doc(db, 'profiles', userId)
  const snapshot = await getDoc(profileRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

export async function saveProfile(userId, profileData) {
  const profileRef = doc(db, 'profiles', userId)

  await setDoc(
    profileRef,
    {
      ...profileData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function subscribeToProfiles(callback) {
  const profilesRef = collection(db, 'profiles')

  return onSnapshot(profilesRef, (snapshot) => {
    const profiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(profiles)
  })
}