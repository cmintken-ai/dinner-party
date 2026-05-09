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

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const startPad = getDay(startOfMonth(currentMonth))

  return (
    <PageShell title="Availability">
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
      ) : (
        <div style={{ padding: '16px 12px' }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px' }}>
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              style={{ background: 'none', border: 'none', color: 'var(--fg)', padding: 8 }}>
              <ChevronLeft size={22} />
            </button>
            <span style={{ fontSize: 17, fontWeight: 700 }}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              style={{ background: 'none', border: 'none', color: 'var(--fg)', padding: 8 }}>
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 8 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayAvail = availability.filter(a => a.date === dateStr)
              const isMine = dayAvail.some(a => a.user_id === userId)
              const count = dayAvail.length
              const today = isToday(day)

              return (
                <button
                  key={dateStr}
                  onClick={() => toggleDay(day)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: today ? '2px solid var(--accent)' : '1.5px solid #2c2c2e',
                    background: isMine ? 'rgba(232,93,38,0.18)' : count > 0 ? 'rgba(48,209,88,0.08)' : '#1c1c1e',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 2, padding: 2,
                    cursor: isSameMonth(day, currentMonth) ? 'pointer' : 'default',
                  }}
                >
                  <span style={{
                    fontSize: 14, fontWeight: today ? 700 : 400,
                    color: isMine ? 'var(--accent)' : 'var(--fg)',
                  }}>
                    {format(day, 'd')}
                  </span>
                  {count > 0 && (
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayAvail.slice(0, 4).map((a, i) => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: a.user_id === userId ? 'var(--accent)' : 'var(--success)',
                        }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap', padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
              You
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
              Others available
            </div>
          </div>

          {/* Who's available this month */}
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, padding: '0 4px' }}>
              Who's marked availability
            </h2>
            {profiles.map(profile => {
              const myDays = availability
                .filter(a => a.user_id === profile.id && a.date.startsWith(format(currentMonth, 'yyyy-MM')))
              if (myDays.length === 0) return null
              return (
                <div key={profile.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 4px', borderBottom: '1px solid #2c2c2e',
                }}>
                  <span style={{ fontSize: 15 }}>{profile.full_name}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {myDays.length} day{myDays.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </PageShell>
  )
}
