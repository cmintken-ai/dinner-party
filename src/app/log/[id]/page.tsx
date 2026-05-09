'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
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
  const router = useRouter()

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
        .eq('id', id)
        .single()
      setDinner(data)
      setLoading(false)
    }
    load()
  }, [id, supabase])

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
  )
  if (!dinner) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Not found.</div>
  )

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{
        position: 'sticky', top: 0,
        background: 'rgba(15,15,15,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #2c2c2e',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        zIndex: 50,
        paddingTop: 'calc(14px + env(safe-area-inset-top))',
      }}>
        <Link href="/log" style={{ color: 'var(--accent)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{dinner.restaurant?.name}</h1>
      </header>

      <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Restaurant info */}
        <div style={{
          background: '#1c1c1e', borderRadius: 14, padding: 16,
          border: '1px solid #2c2c2e',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14, marginBottom: 10 }}>
            <MapPin size={14} />
            <span>{dinner.restaurant?.neighborhood} · {dinner.restaurant?.cuisine}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14, marginBottom: 14 }}>
            <Calendar size={14} />
            <span>{format(new Date(dinner.date), 'MMMM d, yyyy')}</span>
          </div>
          <ThumbRating value={dinner.thumb} readonly />
        </div>

        {/* Attendees */}
        {(dinner.attendees?.length ?? 0) > 0 && (
          <section>
            <h2 style={sectionHeadStyle}>Who was there</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dinner.attendees?.map(a => (
                <span key={a.id} style={{
                  background: '#2c2c2e', borderRadius: 20,
                  padding: '6px 14px', fontSize: 14,
                }}>
                  {a.profile?.full_name ?? 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Dishes */}
        {(dinner.dishes?.length ?? 0) > 0 && (
          <section>
            <h2 style={sectionHeadStyle}>Dishes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dinner.dishes?.map(dish => (
                <div key={dish.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#1c1c1e', borderRadius: 12, padding: '12px 14px',
                  border: '1px solid #2c2c2e',
                }}>
                  <span style={{ fontSize: 15 }}>{dish.name}</span>
                  <StarRating value={dish.rating} readonly size={18} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cocktails */}
        {(dinner.cocktails?.length ?? 0) > 0 && (
          <section>
            <h2 style={sectionHeadStyle}>Cocktails</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dinner.cocktails?.map(c => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#1c1c1e', borderRadius: 12, padding: '12px 14px',
                  border: '1px solid #2c2c2e',
                }}>
                  <span style={{ fontSize: 15 }}>{c.name}</span>
                  <StarRating value={c.rating} readonly size={18} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {dinner.notes && (
          <section>
            <h2 style={sectionHeadStyle}>Notes</h2>
            <p style={{
              background: '#1c1c1e', borderRadius: 12, padding: 14,
              fontSize: 15, lineHeight: 1.6, color: '#d1d1d6',
              border: '1px solid #2c2c2e',
            }}>
              {dinner.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600,
  color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: 10,
}
