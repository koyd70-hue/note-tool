'use client'

import { useState } from 'react'
import { OGCard } from '@/types'

interface Props {
  onAdd: (card: OGCard) => void
}

export function LinkPreviewButton({ onAdd }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  async function handleFetch() {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(trimmed)}`)
      if (!res.ok) throw new Error()
      const data: OGCard = await res.json()
      onAdd(data)
      setUrl('')
      setOpen(false)
    } catch {
      setError('링크를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#bbb', background: 'none',
          border: '1px dashed #e0e0e0', borderRadius: 6,
          padding: '6px 12px', cursor: 'pointer',
          transition: 'color 0.1s, border-color 0.1s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#888'
          e.currentTarget.style.borderColor = '#ccc'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#bbb'
          e.currentTarget.style.borderColor = '#e0e0e0'
        }}
      >
        🔗 링크 미리보기 추가
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          autoFocus
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleFetch()
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="https://example.com"
          style={{
            flex: 1, border: '1px solid #e0e0e0', borderRadius: 6,
            padding: '7px 10px', fontSize: 12, color: '#333', outline: 'none',
            background: '#fafafa',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#aaa')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          style={{
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 6, padding: '7px 14px', fontSize: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '…' : '추가'}
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'none', color: '#aaa', border: '1px solid #e8e8e8',
            borderRadius: 6, padding: '7px 10px', fontSize: 12, cursor: 'pointer',
          }}
        >
          취소
        </button>
      </div>
      {error && <p style={{ fontSize: 11.5, color: '#e55', margin: 0 }}>{error}</p>}
    </div>
  )
}
