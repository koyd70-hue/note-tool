import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore'
import { firebaseDb } from './firebase'
import { Note, Category } from '@/types'

// ─── Notes ───────────────────────────────────────────────────────────────────

export function subscribeNotes(
  uid: string,
  callback: (notes: Note[]) => void
): Unsubscribe {
  const db = firebaseDb()
  const q = query(
    collection(db, 'users', uid, 'notes'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note))
    notes.sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0
      return a.isPinned ? -1 : 1
    })
    callback(notes)
  })
}

export async function createNote(uid: string): Promise<string> {
  const db = firebaseDb()
  const ref = await addDoc(collection(db, 'users', uid, 'notes'), {
    title: '',
    content: '',
    categoryId: null,
    isPinned: false,
    ogCards: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateNote(
  uid: string,
  noteId: string,
  data: Partial<Pick<Note, 'title' | 'content' | 'categoryId' | 'isPinned' | 'ogCards'>>
): Promise<void> {
  const db = firebaseDb()
  await updateDoc(doc(db, 'users', uid, 'notes', noteId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteNote(uid: string, noteId: string): Promise<void> {
  const db = firebaseDb()
  await deleteDoc(doc(db, 'users', uid, 'notes', noteId))
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function subscribeCategories(
  uid: string,
  callback: (categories: Category[]) => void
): Unsubscribe {
  const db = firebaseDb()
  const q = query(
    collection(db, 'users', uid, 'categories'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category))
    callback(cats)
  })
}

export async function createCategory(uid: string, name: string): Promise<void> {
  const db = firebaseDb()
  await addDoc(collection(db, 'users', uid, 'categories'), {
    name,
    createdAt: serverTimestamp(),
  })
}

export async function updateCategory(uid: string, catId: string, name: string): Promise<void> {
  const db = firebaseDb()
  await updateDoc(doc(db, 'users', uid, 'categories', catId), { name })
}

export async function deleteCategory(uid: string, catId: string): Promise<void> {
  const db = firebaseDb()
  await deleteDoc(doc(db, 'users', uid, 'categories', catId))
}
