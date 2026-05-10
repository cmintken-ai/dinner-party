'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/PageShell'
import StarRating from '@/components/StarRating'
import Link from 'next/link'
import { Plus, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react'
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
        .select(`*, restaurant:restaurants(*), dishes(*), cocktails(*), attendees:dinner_attendees(*, profile:profiles(full_name))`)
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
          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
          color: 'white', borderRadius: 20, padding: '7px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(129,140,248,0.3)',
        }}>
          <Plus size={15} strokeWidth={2.5} /> Add
        </Link>
      }
    >
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
      ) : dinners.length === 0 ? (
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🍽️</div>
          <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 15 }}>No dinners logged yet.</p>
          <Link href="/log/new" style={{
            color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: 15,
          }}>
            Log your first dinner →
          </Link>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dinners.map(dinner => (
            <Link key={dinner.id} href={`/log/${dinner.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '16px',
                transition: 'background 0.2s, border-color 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + thumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px' }}>
                        {dinner.restaurant?.name}
                      </span>
                      {dinner.thumb === 'up' && (
                        <ThumbsUp size={13} color="#34d399" fill="rgba(52,211,153,0.2)" />
                      )}
                      {dinner.thumb === 'down' && (
                        <ThumbsDown size={13} color="#f87171" fill="rgba(248,113,113,0.2)" />
                      )}
                    </div>

                    {/* Pills */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span className="pill">{dinner.restaurant?.neighborhood}</span>
                      <span className="pill">{dinner.restaurant?.cuisine}</span>
                    </div>

                    {/* Top dish preview */}
                    {(dinner.dishes?.length ?? 0) > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {dinner.dishes?.slice(0, 2).map(d => (
                          <span key={d.id} style={{
                            fontSize: 12, color: 'var(--fg-secondary)',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: 6, padding: '2px 8px',
                          }}>
                            {d.name}
                          </span>
                        ))}
                        {(dinner.dishes?.length ?? 0) > 2 && (
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                            +{(dinner.dishes?.length ?? 0) - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right side */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                      {format(new Date(dinner.date), 'MMM d')}
                    </span>
                    <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
