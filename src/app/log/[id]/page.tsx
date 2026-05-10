'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import StarRating from '@/components/StarRating'
import ThumbRating from '@/components/ThumbRating'
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Dinner } from '@/types'

export default function DinnerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [dinner, setDinner] = useState<Dinner | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dinners')
        .select(`*, restaurant:restaurants(*), dishes(*), cocktails(*), attendees:dinner_attendees(*, profile:profiles(full_name))`)
        .eq('id', id)
        .single()
      setDinner(data)
      setLoading(false)
    }
    load()
  }, [id, supabase])

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
  )
  if (!dinner) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Not found.</div>
  )

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 40, position: 'relative', zIndex: 1 }}>
      {/* Subtle top glow matching restaurant */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 200,
        background: 'radial-gradient(ellipse at 50% -20%, rgba(129,140,248,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <header style={{
        position: 'sticky', top: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        zIndex: 50,
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
      }}>
        <Link href="/log" style={{ color: 'var(--accent)', display: 'flex', padding: 4 }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', flex: 1 }}>
          {dinner.restaurant?.name}
        </h1>
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>

        {/* Hero card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '20px',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 12 }}>
            {dinner.restaurant?.name}
          </h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="pill"><MapPin size={10} style={{ marginRight: 3 }} />{dinner.restaurant?.neighborhood}</span>
            <span className="pill">{dinner.restaurant?.cuisine}</span>
            <span className="pill"><Calendar size={10} style={{ marginRight: 3 }} />{format(new Date(dinner.date), 'MMM d, yyyy')}</span>
          </div>
          <ThumbRating value={dinner.thumb} readonly />
        </div>

        {/* Attendees */}
        {(dinner.attendees?.length ?? 0) > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Users size={13} color="var(--muted)" />
              <span style={sectionLabelStyle}>Who was there</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dinner.attendees?.map(a => (
                <span key={a.id} style={{
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.2)',
                  borderRadius: 20, padding: '5px 14px',
                  fontSize: 13, color: 'var(--accent)', fontWeight: 500,
                }}>
                  {a.profile?.full_name ?? 'Unknown'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dishes */}
        {(dinner.dishes?.length ?? 0) > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px',
          }}>
            <span style={{ ...sectionLabelStyle, display: 'block', marginBottom: 12 }}>Dishes</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dinner.dishes?.map((dish, i) => (
                <div key={dish.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < (dinner.dishes?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={{ fontSize: 15, color: 'var(--fg)' }}>{dish.name}</span>
                  <StarRating value={dish.rating} readonly size={16} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cocktails */}
        {(dinner.cocktails?.length ?? 0) > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px',
          }}>
            <span style={{ ...sectionLabelStyle, display: 'block', marginBottom: 12 }}>Cocktails</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dinner.cocktails?.map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < (dinner.cocktails?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={{ fontSize: 15, color: 'var(--fg)' }}>{c.name}</span>
                  <StarRating value={c.rating} readonly size={16} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {dinner.notes && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px',
          }}>
            <span style={{ ...sectionLabelStyle, display: 'block', marginBottom: 10 }}>Notes</span>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--fg-secondary)' }}>
              {dinner.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600,
  color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px',
}
