'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/PageShell'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, getDay, addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Availability, Profile } from '@/types'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<Availability[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      const [{ data: avail }, { data: prof }] = await Promise.all([
        supabase.from('availability').select('*, profile:profiles(*)'),
        supabase.from('profiles').select('*'),
      ])
      setAvailability(avail ?? [])
      setProfiles(prof ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function toggleDay(date: Date) {
    if (!userId) return
    const dateStr = format(date, 'yyyy-MM-dd')
    const existing = availability.find(a => a.user_id === userId && a.date === dateStr)
    if (existing) {
      await supabase.from('availability').delete().eq('id', existing.id)
      setAvailability(prev => prev.filter(a => a.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('availability')
        .insert({ user_id: userId, date: dateStr, available: true })
        .select('*, profile:profiles(*)')
        .single()
      if (data) setAvailability(prev => [...prev, data])
    }
  }

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startPad = getDay(startOfMonth(currentMonth))

  return (
    <PageShell title="Availability">
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
      ) : (
        <div style={{ padding: '16px' }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px', color: 'var(--fg)', display: 'flex',
            }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px', color: 'var(--fg)', display: 'flex',
            }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 8 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 600, padding: '4px 0', letterSpacing: '0.5px' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayAvail = availability.filter(a => a.date === dateStr)
              const isMine = dayAvail.some(a => a.user_id === userId)
              const othersCount = dayAvail.filter(a => a.user_id !== userId).length
              const today = isToday(day)

              return (
                <button key={dateStr} onClick={() => toggleDay(day)} style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  border: today
                    ? '1.5px solid rgba(129,140,248,0.6)'
                    : isMine
                    ? '1px solid rgba(129,140,248,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: isMine
                    ? 'rgba(129,140,248,0.15)'
                    : dayAvail.length > 0
                    ? 'rgba(52,211,153,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 3, padding: 2,
                  transition: 'all 0.15s',
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: today ? 700 : 400,
                    color: isMine ? 'var(--accent)' : today ? 'var(--accent)' : 'var(--fg)',
                  }}>
                    {format(day, 'd')}
                  </span>
                  {othersCount > 0 && (
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--success)',
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 20, display: 'flex', gap: 16, padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(129,140,248,0.3)', border: '1px solid rgba(129,140,248,0.4)' }} />
              You
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              Others available
            </div>
          </div>

          {/* Who's available */}
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
              This month
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {profiles.map(profile => {
                const myDays = availability.filter(
                  a => a.user_id === profile.id && a.date.startsWith(format(currentMonth, 'yyyy-MM'))
                )
                if (myDays.length === 0) return null
                return (
                  <div key={profile.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '12px 14px',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{profile.full_name}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                      background: 'rgba(129,140,248,0.1)',
                      padding: '3px 10px', borderRadius: 20,
                    }}>
                      {myDays.length} day{myDays.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
