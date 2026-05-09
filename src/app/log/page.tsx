'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/PageShell'
import StarRating from '@/components/StarRating'
import Link from 'next/link'
import { Plus, ThumbsUp, ThumbsDown, MapPin, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { Dinner } from '@/types'

export default function LogPage() {
  const [dinners, setDinners] = useState<Dinner[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dinners')
        .select(`
          *,
          restaurant:restaurants(*),
          dishes(*),
          cocktails(*),
          attendees:dinner_attendees(*, profile:profiles(full_name))
        `)
        .order('date', { ascending: false })
      setDinners(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  return (
    <PageShell
      title="Dinner Log"
      action={
        <Link href="/log/new" style={{
          background: 'var(--accent)',
          color: 'white',
          borderRadius: 20,
          padding: '7px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 600,
          textDecoration: 'none',
        }}>
          <Plus size={16} /> Add
        </Link>
      }
    >
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
      ) : dinners.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>No dinners logged yet.</p>
          <Link href="/log/new" style={{
            color: 'var(--accent)', fontWeight: 600, textDecoration: 'none',
          }}>Log your first dinner →</Link>
        </div>
      ) : (
        <div>
          {dinners.map(dinner => (
            <Link key={dinner.id} href={`/log/${dinner.id}`} style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderBottom: '1px solid #2c2c2e',
              padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>
                      {dinner.restaurant?.name}
                    </span>
                    {dinner.thumb === 'up' && <ThumbsUp size={14} color="#30d158" />}
                    {dinner.thumb === 'down' && <ThumbsDown size={14} color="#ff453a" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13 }}>
                    <MapPin size={12} />
                    <span>{dinner.restaurant?.neighborhood}</span>
                    <span>·</span>
                    <span>{dinner.restaurant?.cuisine}</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {dinner.dishes?.slice(0, 2).map(d => (
                      <span key={d.id} style={{
                        background: '#2c2c2e', borderRadius: 6,
                        padding: '3px 8px', fontSize: 12, color: 'var(--muted)',
                      }}>
                        {d.name}
                      </span>
                    ))}
                    {(dinner.dishes?.length ?? 0) > 2 && (
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        +{(dinner.dishes?.length ?? 0) - 2} more
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {format(new Date(dinner.date), 'MMM d')}
                  </span>
                  <ChevronRight size={16} color="#3a3a3c" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
