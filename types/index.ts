import { Timestamp } from 'firebase/firestore'

export interface OGCard {
  url: string
  title: string
  description: string
  image: string
}

export interface Note {
  id: string
  title: string
  content: string
  categoryId: string | null
  isPinned: boolean
  isDone: boolean
  ogCards: OGCard[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Category {
  id: string
  name: string
  createdAt: Timestamp
}
