import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase'
import { sanitizeUrl } from '../utils/security'
import { SAMPLE_MARKETPLACE_WORKS } from '../data/marketplacePrompts'

const COLLECTION_NAME = 'works'

/**
 * Creates a new prompt work entry in Firestore with input sanitization and ownership metadata.
 */
export async function createWork(form, user) {
  if (!user || !user.uid) {
    throw new Error('Authentication required. Please sign in to post your work.')
  }

  if (!form.title || !form.title.trim()) {
    throw new Error('Title is required.')
  }

  if (!form.prompt || !form.prompt.trim()) {
    throw new Error('Master prompt text is required.')
  }

  if (form.title.trim().length > 150) {
    throw new Error('Title must be 150 characters or less.')
  }

  if (form.prompt.trim().length > 5000) {
    throw new Error('Prompt must be 5000 characters or less.')
  }

  const workType = form.workType || 'code'
  const imageUrl = sanitizeUrl(form.imageUrl, '')
  const inputImageUrl = sanitizeUrl(form.inputImageUrl, '')
  const videoUrl = sanitizeUrl(form.videoUrl, '')

  const payload = {
    title: form.title.trim(),
    category: form.category || 'UI & Web Code',
    aiTool: form.aiTool ? form.aiTool.trim() : 'AI Model',
    prompt: form.prompt.trim(),
    workType,
    authorId: user.uid,
    authorName: user.displayName || user.email.split('@')[0] || 'Anonymous',
    createdAt: serverTimestamp(),
    copiesCount: 0,
    likesCount: 0,
    likedBy: [],
  }

  if (imageUrl) payload.imageUrl = imageUrl
  if (inputImageUrl) payload.inputImageUrl = inputImageUrl
  if (videoUrl) payload.videoUrl = videoUrl
  if (form.code) payload.code = form.code
  if (form.textOutput) payload.textOutput = form.textOutput.trim()

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload)
  return docRef.id
}

/**
 * Subscribes to real-time updates for prompt works, seamlessly merging sample defaults.
 */
export function subscribeToWorks(category = 'All', searchQuery = '', callback) {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const fetchedWorks = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))

      // Filter by Category and Search query
      const filtered = fetchedWorks.filter((work) => {
        const matchesCategory =
          category === 'All' ||
          category === 'Discover' ||
          !work.category ||
          (work.category && work.category.toLowerCase().includes(category.toLowerCase())) ||
          (category === 'UI & Web Code' &&
            (work.category?.toLowerCase().includes('web') ||
              work.category?.toLowerCase().includes('component') ||
              work.code))

        const qLower = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !qLower ||
          work.title?.toLowerCase().includes(qLower) ||
          work.prompt?.toLowerCase().includes(qLower) ||
          work.aiTool?.toLowerCase().includes(qLower) ||
          work.authorName?.toLowerCase().includes(qLower)

        return matchesCategory && matchesSearch
      })

      callback(filtered)
    },
    (error) => {
      console.warn('Firestore subscription error:', error)
      callback([])
    }
  )
}

/**
 * Fetches a single work item by ID with real-time snapshot subscription.
 */
export function subscribeToWorkById(id, callback) {
  const docRef = doc(db, COLLECTION_NAME, id)

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() })
      } else {
        callback(null)
      }
    },
    (error) => {
      console.warn('Firestore fetch error for ID:', id, error)
      callback(null)
    }
  )
}

/**
 * Atomically increments prompt copy counter in Firestore.
 */
export async function incrementCopyCount(workId) {
  if (!workId || workId.startsWith('sample-')) return

  try {
    const docRef = doc(db, COLLECTION_NAME, workId)
    await updateDoc(docRef, {
      copiesCount: increment(1),
    })
  } catch (err) {
    console.warn('Failed to increment copy counter:', err)
  }
}

/**
 * Toggles like / favorite status for a prompt work document.
 */
export async function toggleLikeWork(workId, user) {
  if (!user || !user.uid) {
    throw new Error('Please sign in to like prompts.')
  }
  if (!workId || workId.startsWith('sample-')) return

  const docRef = doc(db, COLLECTION_NAME, workId)
  const snap = await getDoc(docRef)

  if (!snap.exists()) return

  const data = snap.data()
  const likedBy = data.likedBy || []
  const hasLiked = likedBy.includes(user.uid)

  if (hasLiked) {
    await updateDoc(docRef, {
      likesCount: increment(-1),
      likedBy: arrayRemove(user.uid),
    })
  } else {
    await updateDoc(docRef, {
      likesCount: increment(1),
      likedBy: arrayUnion(user.uid),
    })
  }
}

/**
 * Deletes a work item if the user is the original author.
 */
export async function deleteWork(workId, user) {
  if (!user || !user.uid) {
    throw new Error('Authentication required to delete.')
  }

  const docRef = doc(db, COLLECTION_NAME, workId)
  const snap = await getDoc(docRef)

  if (!snap.exists()) {
    throw new Error('Work document not found.')
  }

  const data = snap.data()
  if (data.authorId !== user.uid) {
    throw new Error('Permission denied. You can only delete your own creations.')
  }

  await deleteDoc(docRef)
}
