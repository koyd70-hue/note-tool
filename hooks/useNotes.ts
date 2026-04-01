'use client'

import { useState, useEffect } from 'react'
import { subscribeNotes } from '@/lib/firestore'
import { Note } from '@/types'

export function useNotes(uid: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeNotes(uid, setNotes)
    return unsub
  }, [uid])

  return notes
}
