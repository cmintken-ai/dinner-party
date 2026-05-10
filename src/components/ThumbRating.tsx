'use client'

import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface Props {
  value: 'up' | 'down' | null
  onChange?: (v: 'up' | 'down' | null) => void
  readonly?: boolean
}

export default function ThumbRating({ value, onChange, readonly = false }: Props) {
  const toggle = (picked: 'up' | 'down') => {
    if (readonly) return
    onChange?.(value === picked ? null : picked)
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button type="button" onClick={() => toggle('up')} style={{
        flex: 1,
        background: value === 'up' ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value === 'up' ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12,
        padding: '10px 16px',
        color: value === 'up' ? '#34d399' : 'rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontSize: 13, fontWeight: 500,
        transition: 'all 0.2s',
        cursor: readonly ? 'default' : 'pointer',
      }}>
        <ThumbsUp size={16} strokeWidth={value === 'up' ? 2.2 : 1.8} />
        Would go back
      </button>
      <button type="button" onClick={() => toggle('down')} style={{
        flex: 1,
        background: value === 'down' ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value === 'down' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12,
        padding: '10px 16px',
        color: value === 'down' ? '#f87171' : 'rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontSize: 13, fontWeight: 500,
        transition: 'all 0.2s',
        cursor: readonly ? 'default' : 'pointer',
      }}>
        <ThumbsDown size={16} strokeWidth={value === 'down' ? 2.2 : 1.8} />
        Pass
      </button>
    </div>
  )
}
