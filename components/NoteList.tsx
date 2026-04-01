'use client'

import { Note } from '@/types'

interface Props {
  notes: Note[]
  selectedNoteId: string | null
  onSelect: (id: string) => void
  onNewNote: () => void
  categoryName: string
}

function formatDate(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts || typeof ts.toDate !== 'function') return ''
  const d = ts.toDate()
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '방금'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
  if (diff < 604800000) return d.toLocaleDateString('ko-KR', { weekday: 'short' })
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~>\[\]!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 100)
}

export function NoteList({ notes, selectedNoteId, onSelect, onNewNote, categoryName }: Props) {
  const pinned = notes.filter((n) => n.isPinned)
  const rest = notes.filter((n) => !n.isPinned)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f7f6f4' }}>

      {/* 리스트 헤더 */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        borderBottom: '2px solid #d8d5d0', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555', letterSpacing: '-0.1px' }}>
          {categoryName}
        </span>
        <span style={{ fontSize: 11, color: '#bbb' }}>{notes.length}개</span>
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notes.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 10,
          }}>
            <p style={{ fontSize: 12, color: '#ccc' }}>메모가 없습니다</p>
            <button
              onClick={onNewNote}
              style={{
                fontSize: 12, color: '#999', background: 'none',
                border: '1px solid #e8e8e8', borderRadius: 6,
                padding: '5px 12px', cursor: 'pointer',
              }}
            >
              + 새 메모
            </button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <SectionLabel>고정됨</SectionLabel>
                {pinned.map((n) => (
                  <NoteCard key={n.id} note={n} selected={selectedNoteId === n.id} onSelect={onSelect} />
                ))}
              </>
            )}
            {rest.length > 0 && (
              <>
                {pinned.length > 0 && <SectionLabel>메모</SectionLabel>}
                {rest.map((n) => (
                  <NoteCard key={n.id} note={n} selected={selectedNoteId === n.id} onSelect={onSelect} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      padding: '10px 16px 4px',
      fontSize: 10, fontWeight: 600, color: '#bbb',
      letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function NoteCard({ note, selected, onSelect }: {
  note: Note
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(note.id)}
      style={{
        width: '100%', padding: '11px 16px', textAlign: 'left',
        background: selected ? '#ece9e5' : '#f7f6f4',
        border: 'none', borderBottom: '1px solid #ede9e4',
        cursor: 'pointer', display: 'block', transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f0ede9' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#f7f6f4' }}
    >
      {/* 제목 행 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
        <span style={{
          fontSize: 13.5, fontWeight: selected ? 600 : 500,
          color: note.isDone ? '#bbb' : '#111',
          textDecoration: note.isDone ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', flex: 1,
        }}>
          {note.isDone && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 13, height: 13, borderRadius: 3,
              background: '#4caf50', color: '#fff',
              fontSize: 9, fontWeight: 700,
              marginRight: 5, verticalAlign: 'middle',
              flexShrink: 0,
            }}>✓</span>
          )}
          {note.isPinned && <span style={{ fontSize: 11, marginRight: 4 }}>📌</span>}
          {note.title || '제목 없음'}
        </span>
        <span style={{ fontSize: 10.5, color: '#bbb', flexShrink: 0 }}>
          {formatDate(note.updatedAt)}
        </span>
      </div>
      {/* 내용 미리보기 */}
      <span style={{
        fontSize: 12, color: '#999', display: 'block',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {stripMarkdown(note.content) || '내용 없음'}
      </span>
    </button>
  )
}
