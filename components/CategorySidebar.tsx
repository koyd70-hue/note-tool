'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/lib/firestore'
import { Category } from '@/types'

interface Props {
  uid: string
  categories: Category[]
  selectedCategoryId: string | null
  onSelect: (id: string | null) => void
  onNewNote: () => void
}

export function CategorySidebar({ uid, categories, selectedCategoryId, onSelect, onNewNote }: Props) {
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    await createCategory(uid, name)
    setNewName('')
    setAdding(false)
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  async function handleEditSave() {
    const name = editingName.trim()
    if (name && editingId) {
      await updateCategory(uid, editingId, name)
    }
    setEditingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f0efed' }}>

      {/* 새 메모 버튼 */}
      <div style={{ padding: '12px 12px 8px' }}>
        <button
          onClick={onNewNote}
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13,
            fontWeight: 500, color: '#fff', background: '#111',
            border: 'none', borderRadius: 7, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> 새 메모
        </button>
      </div>

      <div style={{ height: 2, background: '#d8d6d2', margin: '4px 12px' }} />

      {/* 카테고리 목록 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>

        {/* 전체 메모 */}
        <button
          onClick={() => onSelect(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '7px 12px', fontSize: 13,
            fontWeight: selectedCategoryId === null ? 500 : 400,
            color: selectedCategoryId === null ? '#111' : '#555',
            background: selectedCategoryId === null ? '#e2e0dd' : 'none',
            border: 'none', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 15 }}>🗂</span>
          전체 메모
        </button>

        {categories.length > 0 && (
          <div style={{ margin: '8px 4px 4px', fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            카테고리
          </div>
        )}

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id
          const isHovered = hoveredId === cat.id
          const isEditing = editingId === cat.id

          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 2,
                borderRadius: 6,
                background: isSelected ? '#e2e0dd' : isHovered ? '#e8e6e3' : 'none',
                padding: '2px 4px',
              }}
            >
              {isEditing ? (
                /* 인라인 편집 */
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onBlur={handleEditSave}
                  style={{
                    flex: 1, border: '1px solid #ddd', borderRadius: 5,
                    padding: '4px 7px', fontSize: 12, color: '#333',
                    outline: 'none', background: '#fff', margin: '2px 0',
                  }}
                />
              ) : (
                /* 카테고리명 버튼 */
                <button
                  onClick={() => onSelect(cat.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 8px', fontSize: 13,
                    fontWeight: isSelected ? 500 : 400,
                    color: isSelected ? '#111' : '#555',
                    background: 'none', border: 'none',
                    borderRadius: 5, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>📁</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </span>
                </button>
              )}

              {/* 수정 / 삭제 버튼 — hover 시 표시 */}
              {!isEditing && isHovered && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(cat) }}
                    title="이름 수정"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: '#aaa', padding: '2px 4px', lineHeight: 1,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCategory(uid, cat.id) }}
                    title="삭제"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 15, color: '#aaa', padding: '2px 4px', lineHeight: 1,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e44')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 카테고리 추가 */}
      <div style={{ borderTop: '2px solid #d8d6d2', padding: '8px 10px' }}>
        {adding ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
              placeholder="카테고리 이름"
              style={{
                flex: 1, border: '1px solid #ddd', borderRadius: 5,
                padding: '5px 8px', fontSize: 12, color: '#333',
                outline: 'none', background: '#fff',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                background: '#111', color: '#fff', border: 'none',
                borderRadius: 5, padding: '5px 10px', fontSize: 12, cursor: 'pointer',
              }}
            >
              추가
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: '100%', background: 'none', border: 'none',
              fontSize: 12, color: '#bbb', cursor: 'pointer',
              padding: '5px 4px', textAlign: 'left', display: 'flex',
              alignItems: 'center', gap: 5,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}
          >
            + 카테고리 추가
          </button>
        )}
      </div>
    </div>
  )
}
