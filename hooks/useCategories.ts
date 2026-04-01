'use client'

import { useState, useEffect } from 'react'
import { subscribeCategories } from '@/lib/firestore'
import { Category } from '@/types'

export function useCategories(uid: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeCategories(uid, setCategories)
    return unsub
  }, [uid])

  return categories
}
