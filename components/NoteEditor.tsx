'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { updateNote, deleteNote } from '@/lib/firestore'
import { Note, OGCard, Category } from '@/types'
import { OGCard as OGCardComponent } from './OGCard'
import { LinkPreviewButton } from './LinkPreviewButton'

type Mode = 'write' | 'preview'

interface Props {
  uid: string
  note: Note
  categories: Category[]
  onDeleted: () => void
}

export function NoteEditor({ uid, note, categories, onDeleted }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [mode, setMode] = useState<Mode>('write')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.id])

  function scheduleAutosave(patch: { title?: string; content?: string }) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      await updateNote(uid, note.id, patch)
      setSaving(false)
    }, 800)
  }

  function handleTitleChange(v: string) {
    setTitle(v)
    scheduleAutosave({ title: v, content })
  }

  function handleContentChange(v: string) {
    setContent(v)
    scheduleAutosave({ title, content: v })
  }

  async function handlePinToggle() {
    await updateNote(uid, note.id, { isPinned: !note.isPinned })
  }

  async function handleCategoryChange(catId: string) {
    await updateNote(uid, note.id, { categoryId: catId === '' ? null : catId })
  }

  async function handleDelete() {
    if (!confirm('이 메모를 삭제할까요?')) return
    await deleteNote(uid, note.id)
    onDeleted()
  }

  async function handleAddOGCard(card: OGCard) {
    await updateNote(uid, note.id, { ogCards: [...note.ogCards, card] })
  }

  async function handleRemoveOGCard(idx: number) {
    await updateNote(uid, note.id, { ogCards: note.ogCards.filter((_, i) => i !== idx) })
  }

  // 탭 버튼 스타일
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: active ? 500 : 400,
    color: active ? '#111' : '#aaa',
    background: active ? '#f0f0f0' : 'none',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    transition: 'all 0.1s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fafafa' }}>

      {/* ── 메타 바 ── */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center',
        gap: 8, padding: '0 20px',
        borderBottom: '2px solid #d8d8d8', flexShrink: 0,
      }}>

        {/* 핀 */}
        <button
          onClick={handlePinToggle}
          title={note.isPinned ? '핀 해제' : '핀 고정'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 15, opacity: note.isPinned ? 1 : 0.25,
            padding: '4px', borderRadius: 4, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = note.isPinned ? '1' : '0.25')}
        >
          📌
        </button>

        {/* 카테고리 */}
        <select
          value={note.categoryId ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{
            fontSize: 12, color: '#555', background: '#f8f8f8',
            border: '1px solid #e8e8e8', borderRadius: 5,
            padding: '4px 8px', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">카테고리 없음</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* 탭: 작성 / 미리보기 */}
        <div style={{
          display: 'flex', gap: 2, marginLeft: 8,
          background: '#f8f8f8', borderRadius: 7, padding: 3,
        }}>
          <button style={tabStyle(mode === 'write')} onClick={() => setMode('write')}>작성</button>
          <button style={tabStyle(mode === 'preview')} onClick={() => setMode('preview')}>미리보기</button>
        </div>

        {/* 저장 상태 */}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#ccc' }}>
          {saving ? '저장 중…' : '저장됨'}
        </span>

        {/* 삭제 */}
        <button
          onClick={handleDelete}
          title="메모 삭제"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 15, color: '#ccc', padding: '4px', borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e55')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}
        >
          🗑
        </button>
      </div>

      {/* ── 제목 ── */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="제목"
        style={{
          flexShrink: 0, width: '100%', border: 'none', outline: 'none',
          padding: '20px 24px 16px',
          fontSize: 22, fontWeight: 700, color: '#111',
          background: '#fafafa', borderBottom: '1px solid #e4e4e4',
          letterSpacing: '-0.3px',
        }}
      />

      {/* ── 편집 / 미리보기 영역 ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* 작성 모드 */}
        {mode === 'write' && (
          <textarea
            className="note-textarea"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="내용을 입력하세요…"
            autoFocus
          />
        )}

        {/* 미리보기 모드 */}
        {mode === 'preview' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '20px 24px' }}>
            {content.trim() ? (
              <div className="prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#ccc' }}>내용 없음</p>
            )}
          </div>
        )}
      </div>

      {/* ── OG 카드 + 링크 추가 ── */}
      <div style={{
        flexShrink: 0, borderTop: '2px solid #d8d8d8',
        background: '#fafafa', padding: '12px 20px',
      }}>
        {note.ogCards.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {note.ogCards.map((card, i) => (
              <OGCardComponent key={i} card={card} onRemove={() => handleRemoveOGCard(i)} />
            ))}
          </div>
        )}
        <LinkPreviewButton onAdd={handleAddOGCard} />
      </div>

    </div>
  )
}
