'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/PageShell'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
      }
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
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
      ) : (
        <div style={{ padding: '24px 18px' }}>
          {/* Avatar placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={36} color="var(--muted)" />
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Phone <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(for future SMS)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 206 555 0100"
                inputMode="tel"
              />
            </div>

            {message && (
              <p style={{ color: 'var(--success)', fontSize: 14, textAlign: 'center' }}>{message}</p>
            )}

            <button type="submit" disabled={saving} style={{
              background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 12,
              padding: '14px', fontSize: 16, fontWeight: 700,
              opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <button onClick={handleSignOut} style={{
            marginTop: 32, width: '100%',
            background: 'none', border: '1.5px solid #3a3a3c',
            borderRadius: 12, padding: '13px',
            color: 'var(--error)', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}
    </PageShell>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: 8,
}
