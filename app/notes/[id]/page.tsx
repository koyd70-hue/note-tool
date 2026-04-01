'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, onSnapshot } from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { AuthGuard } from '@/components/AuthGuard'
import { NoteEditor } from '@/components/NoteEditor'
import { Note } from '@/types'

export default function NoteDetailPage() {
  return (
    <AuthGuard>
      <NoteDetailContent />
    </AuthGuard>
  )
}

function NoteDetailContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  const [note, setNote] = useState<Note | null>(null)
  const [notFound, setNotFound] = useState(false)
  const categories = useCategories(user?.uid)

  useEffect(() => {
    if (!user) return
    const ref = doc(firebaseDb(), 'users', user.uid, 'notes', noteId)
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setNotFound(true)
        return
      }
      setNote({ id: snap.id, ...snap.data() } as Note)
    })
    return unsub
  }, [user, noteId])

  if (notFound) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-gray-400">
        <p>메모를 찾을 수 없습니다.</p>
        <Link href="/notes" className="text-sm text-blue-500 hover:underline">목록으로</Link>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        로딩 중...
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <Link
          href="/notes"
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ← 목록
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <NoteEditor
          uid={user!.uid}
          note={note}
          categories={categories}
          onDeleted={() => router.replace('/notes')}
        />
      </div>
    </div>
  )
}
