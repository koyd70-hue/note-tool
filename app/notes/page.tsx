'use client'

import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { createNote } from '@/lib/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { AuthGuard } from '@/components/AuthGuard'
import { CategorySidebar } from '@/components/CategorySidebar'
import { NoteList } from '@/components/NoteList'
import { NoteEditor } from '@/components/NoteEditor'

export default function NotesPage() {
  return (
    <AuthGuard>
      <NotesContent />
    </AuthGuard>
  )
}

function NotesContent() {
  const { user } = useAuth()
  const notes = useNotes(user?.uid)
  const categories = useCategories(user?.uid)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const filteredNotes = selectedCategoryId === null
    ? notes
    : notes.filter((n) => n.categoryId === selectedCategoryId)

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null

  async function handleNewNote() {
    if (!user) return
    const id = await createNote(user.uid)
    setSelectedNoteId(id)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: '#e8e8e8' }}>

      {/* ── 헤더 ── */}
      <header style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '2px solid #d0d0d0',
        background: '#f4f4f4',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.3px', color: '#111' }}>
          Note Tool
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#999' }}>{user?.displayName}</span>
          <button
            onClick={() => signOut(firebaseAuth())}
            style={{
              fontSize: 12, color: '#999', background: 'none',
              border: 'none', cursor: 'pointer', padding: '4px 8px',
              borderRadius: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#555')}
            onMouseLeave={e => (e.currentTarget.style.color = '#999')}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* ── 3-패널 ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* 패널 1 — 카테고리 */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '2px solid #d0d0d0', background: '#f0efed' }}>
          <CategorySidebar
            uid={user!.uid}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            onNewNote={handleNewNote}
          />
        </div>

        {/* 패널 2 — 메모 리스트 */}
        <div style={{ width: 260, flexShrink: 0, borderRight: '2px solid #d0d0d0', display: 'flex', flexDirection: 'column', background: '#f7f6f4' }}>
          <NoteList
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelect={setSelectedNoteId}
            onNewNote={handleNewNote}
            categoryName={
              selectedCategoryId
                ? (categories.find((c) => c.id === selectedCategoryId)?.name ?? '카테고리')
                : '전체 메모'
            }
          />
        </div>

        {/* 패널 3 — 에디터 */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
          {selectedNote ? (
            <NoteEditor
              uid={user!.uid}
              note={selectedNote}
              categories={categories}
              onDeleted={() => setSelectedNoteId(null)}
            />
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <p style={{ fontSize: 13, color: '#bbb' }}>메모를 선택하거나 새로 만드세요</p>
              <button
                onClick={handleNewNote}
                style={{
                  fontSize: 12, color: '#888', background: 'none',
                  border: '1px solid #e0e0e0', borderRadius: 6,
                  padding: '6px 14px', cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                + 새 메모 만들기
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
