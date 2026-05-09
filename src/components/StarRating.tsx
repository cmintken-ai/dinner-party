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
    <div style={{ display: 'flex', gap: 4 }}>
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
          }}
        >
          <Star
            size={size}
            fill={n <= value ? '#ffd60a' : 'none'}
            color={n <= value ? '#ffd60a' : '#3a3a3c'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
