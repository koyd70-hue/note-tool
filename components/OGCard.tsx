'use client'

import { OGCard as OGCardType } from '@/types'

interface Props {
  card: OGCardType
  onRemove?: () => void
}

export function OGCard({ card, onRemove }: Props) {
  return (
    <div style={{ position: 'relative' }} className="group">
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', gap: 12, padding: '10px 12px',
          border: '1px solid #ebebeb', borderRadius: 8,
          background: '#fff', textDecoration: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#ddd'
          e.currentTarget.style.background = '#fafafa'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#ebebeb'
          e.currentTarget.style.background = '#fff'
        }}
      >
        {card.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image}
            alt=""
            style={{
              width: 64, height: 48, objectFit: 'cover',
              borderRadius: 5, flexShrink: 0,
            }}
          />
        )}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
          <p style={{
            fontSize: 13, fontWeight: 500, color: '#111',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
          }}>
            {card.title || card.url}
          </p>
          {card.description && (
            <p style={{
              fontSize: 11.5, color: '#888', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {card.description}
            </p>
          )}
          <p style={{ fontSize: 11, color: '#aaa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {card.url}
          </p>
        </div>
      </a>

      {onRemove && (
        <button
          onClick={onRemove}
          className="group-hover:flex"
          style={{
            display: 'none', position: 'absolute', top: 6, right: 6,
            background: '#f0f0f0', border: 'none', borderRadius: '50%',
            width: 20, height: 20, fontSize: 13, color: '#999',
            cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}
          title="삭제"
        >
          ×
        </button>
      )}
    </div>
  )
}
