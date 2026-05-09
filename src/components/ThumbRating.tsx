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
    <div style={{ display: 'flex', gap: 12 }}>
      <button type="button" onClick={() => toggle('up')} style={{
        background: value === 'up' ? 'rgba(48,209,88,0.15)' : 'transparent',
        border: `1.5px solid ${value === 'up' ? '#30d158' : '#3a3a3c'}`,
        borderRadius: 10,
        padding: '8px 18px',
        color: value === 'up' ? '#30d158' : '#8e8e93',
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 14, fontWeight: 500,
        transition: 'all 0.15s',
      }}>
        <ThumbsUp size={18} /> Would go back
      </button>
      <button type="button" onClick={() => toggle('down')} style={{
        background: value === 'down' ? 'rgba(255,69,58,0.15)' : 'transparent',
        border: `1.5px solid ${value === 'down' ? '#ff453a' : '#3a3a3c'}`,
        borderRadius: 10,
        padding: '8px 18px',
        color: value === 'down' ? '#ff453a' : '#8e8e93',
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 14, fontWeight: 500,
        transition: 'all 0.15s',
      }}>
        <ThumbsDown size={18} /> Pass
      </button>
    </div>
  )
}
