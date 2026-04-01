'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { updateNote, deleteNote } from '@/lib/firestore'
import { Note, Category } from '@/types'

interface Props {
  uid: string
  note: Note
  categories: Category[]
  onDeleted: () => void
}

export function NoteEditor({ uid, note, categories, onDeleted }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(false)
  }, [note.id])

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus()
    }
  }, [isEditing])

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

  function handleInsertLink() {
    const textarea = textareaRef.current
    let start = 0
    let end = 0

    if (isEditing && textarea) {
      start = textarea.selectionStart
      end = textarea.selectionEnd
    }

    const url = prompt('링크 URL을 입력하세요:')
    if (!url) {
      setIsEditing(true)
      return
    }

    const selected = content.slice(start, end)
    const linkText = selected || '링크'
    const insertion = `[${linkText}](${url})`
    const newContent = content.slice(0, start) + insertion + content.slice(end)

    handleContentChange(newContent)
    setIsEditing(true)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const cursorPos = start + insertion.length
        textareaRef.current.setSelectionRange(cursorPos, cursorPos)
      }
    }, 50)
  }

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

        {/* 링크 삽입 */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleInsertLink}
          title="하이퍼링크 삽입"
          style={{
            background: 'none', border: '1px solid #e8e8e8', cursor: 'pointer',
            fontSize: 12, color: '#888', padding: '3px 8px', borderRadius: 5,
            transition: 'all 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.color = '#444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888' }}
        >
          🔗 링크
        </button>

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

      {/* ── 본문 ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* 편집 모드 */}
        {isEditing && (
          <textarea
            ref={textareaRef}
            className="note-textarea"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder="내용을 입력하세요…"
          />
        )}

        {/* 렌더링 모드 (클릭 시 편집 전환) */}
        {!isEditing && (
          <div
            onClick={() => setIsEditing(true)}
            style={{ height: '100%', overflowY: 'auto', padding: '20px 24px', cursor: 'text' }}
          >
            {content.trim() ? (
              <div className="prose">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: '#ccc' }}>내용을 입력하세요…</p>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
