import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './config'

const postsCollection = collection(db, 'posts')

export async function createPost({ caption, user, typeOfPost = 'Unchanged', customType = '', subtopics = [] }) {
  await addDoc(postsCollection, {
    caption,
    typeOfPost,
    customType,
    subtopics,
    userId: user.uid,
    userEmail: user.email,
    createdAt: serverTimestamp(),
    updatedAt: null,
    likes: [],
  })
}

export function subscribeToPosts(callback) {
  const q = query(postsCollection, orderBy('createdAt', 'desc'))

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(posts)
  })
}

export async function updatePost(postId, postData) {
  const postRef = doc(db, 'posts', postId)

  await updateDoc(postRef, {
    ...postData,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePost(postId) {
  const postRef = doc(db, 'posts', postId)
  await deleteDoc(postRef)
}

export async function likePost(postId, userId) {
  const postRef = doc(db, 'posts', postId)

  await updateDoc(postRef, {
    likes: arrayUnion(userId),
  })
}

export async function unlikePost(postId, userId) {
  const postRef = doc(db, 'posts', postId)

  await updateDoc(postRef, {
    likes: arrayRemove(userId),
  })
}

export async function addComment(postId, text, user) {
  const commentsRef = collection(db, 'posts', postId, 'comments')

  await addDoc(commentsRef, {
    text,
    userId: user.uid,
    userEmail: user.email,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToComments(postId, callback) {
  const commentsRef = collection(db, 'posts', postId, 'comments')

  const q = query(commentsRef, orderBy('createdAt', 'asc'))

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(comments)
  })
}

export async function deleteComment(postId, commentId) {
  const commentRef = doc(db, 'posts', postId, 'comments', commentId)
  await deleteDoc(commentRef)
}
