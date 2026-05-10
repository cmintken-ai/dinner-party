'use client'

import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: number
}

export default function StarRating({ value, onChange, readonly = false, size = 22 }: Props) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => !readonly && onChange?.(n)}
          style={{
            background: 'none',
            border: 'none',
            padding: 2,
            cursor: readonly ? 'default' : 'pointer',
            transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onMouseDown={e => {
            if (!readonly) (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)'
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          }}
          onTouchStart={e => {
            if (!readonly) (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)'
          }}
          onTouchEnd={e => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          }}
        >
          <Star
            size={size}
            fill={n <= value ? '#fbbf24' : 'none'}
            color={n <= value ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
