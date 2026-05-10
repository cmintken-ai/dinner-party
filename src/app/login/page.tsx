'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UtensilsCrossed } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/log')
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) setError(error.message)
      else if (data.user && !data.session) setMessage('Check your email to confirm your account.')
      else router.push('/log')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%',
        transform: 'translateX(-50%)',
        width: 280, height: 280,
        background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(129,140,248,0.3)',
          }}>
            <UtensilsCrossed size={32} color="white" strokeWidth={1.8} />
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px',
            background: 'linear-gradient(135deg, #f1f1f3 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Dinner Party
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14, letterSpacing: '0.1px' }}>
            Seattle nights, remembered.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '28px 24px',
          backdropFilter: 'blur(12px)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px',
                color: '#f87171', fontSize: 13, textAlign: 'center',
              }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 10, padding: '10px 14px',
                color: '#34d399', fontSize: 13, textAlign: 'center',
              }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '14px', fontSize: 15, fontWeight: 600,
              marginTop: 4, opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 16px rgba(129,140,248,0.25)',
              transition: 'opacity 0.2s',
            }}>
              {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
          style={{
            background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: 14,
            textAlign: 'center', padding: '4px',
          }}
        >
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </button>
      </div>
    </div>
  )
}
