'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/PageShell'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setFullName(data.full_name ?? ''); setPhone(data.phone ?? '') }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, phone })
    setMessage('Saved!')
    setSaving(false)
    setTimeout(() => setMessage(''), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <PageShell title="Profile">
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
      ) : (
        <div style={{ padding: '24px 20px' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(129,140,248,0.3), rgba(99,102,241,0.15))',
              border: '1px solid rgba(129,140,248,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(129,140,248,0.15)',
            }}>
              {fullName ? (
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                  {fullName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={32} color="var(--accent)" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* Email display */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            fontSize: 14, color: 'var(--muted)',
            textAlign: 'center',
          }}>
            {email}
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required />
            </div>
            <div>
              <label style={labelStyle}>Phone <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 206 555 0100" inputMode="tel" />
            </div>

            {message && (
              <div style={{
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 10, padding: '10px 14px',
                color: '#34d399', fontSize: 13, textAlign: 'center',
              }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={saving} style={{
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '14px', fontSize: 15, fontWeight: 700,
              opacity: saving ? 0.6 : 1,
              boxShadow: '0 4px 16px rgba(129,140,248,0.25)',
              transition: 'opacity 0.2s',
            }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <button onClick={handleSignOut} style={{
            marginTop: 24, width: '100%',
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.15)',
            borderRadius: 12, padding: '13px',
            color: '#f87171', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}>
            <LogOut size={16} strokeWidth={2} /> Sign Out
          </button>
        </div>
      )}
    </PageShell>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '0.8px', marginBottom: 10,
}
