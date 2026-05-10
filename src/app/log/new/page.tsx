'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StarRating from '@/components/StarRating'
import ThumbRating from '@/components/ThumbRating'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const SEATTLE_NEIGHBORHOODS = [
  'Capitol Hill','Ballard','Fremont','Queen Anne','South Lake Union',
  'Pioneer Square','Belltown','First Hill','Madison Park','Madrona',
  'Columbia City','West Seattle','Georgetown','Eastlake','Wallingford',
  'Green Lake','Phinney Ridge','Ravenna','University District','Montlake',
]
const SNOHOMISH_AREAS = ['Edmonds','Everett','Mukilteo','Snohomish','Bothell','Kenmore','Mill Creek']
const CUISINES = [
  'American','Italian','Japanese','Mexican','Thai','Chinese','Korean',
  'French','Mediterranean','Indian','Vietnamese','Spanish','Seafood',
  'Steakhouse','Pizza','Sushi','Ramen','Cocktail Bar','Wine Bar','Other',
]

interface DishEntry { name: string; rating: number }

export default function NewDinnerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [restaurantName, setRestaurantName] = useState('')
  const [area, setArea] = useState<'seattle' | 'snohomish'>('seattle')
  const [neighborhood, setNeighborhood] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [thumb, setThumb] = useState<'up' | 'down' | null>(null)
  const [notes, setNotes] = useState('')
  const [dishes, setDishes] = useState<DishEntry[]>([{ name: '', rating: 0 }])
  const [cocktails, setCocktails] = useState<DishEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const neighborhoods = area === 'seattle' ? SEATTLE_NEIGHBORHOODS : SNOHOMISH_AREAS

  function addDish() { setDishes(d => [...d, { name: '', rating: 0 }]) }
  function removeDish(i: number) { setDishes(d => d.filter((_, idx) => idx !== i)) }
  function updateDish(i: number, field: keyof DishEntry, val: string | number) {
    setDishes(d => d.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  }
  function addCocktail() { setCocktails(c => [...c, { name: '', rating: 0 }]) }
  function removeCocktail(i: number) { setCocktails(c => c.filter((_, idx) => idx !== i)) }
  function updateCocktail(i: number, field: keyof DishEntry, val: string | number) {
    setCocktails(c => c.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!restaurantName || !neighborhood || !cuisine) {
      setError('Please fill in restaurant name, neighborhood, and cuisine.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: restaurant, error: rErr } = await supabase
      .from('restaurants')
      .upsert({ name: restaurantName, neighborhood, cuisine, area, added_by: user.id }, { onConflict: 'name' })
      .select().single()

    if (rErr || !restaurant) { setError('Could not save restaurant.'); setLoading(false); return }

    const { data: dinner, error: dErr } = await supabase
      .from('dinners')
      .insert({ restaurant_id: restaurant.id, date, thumb, notes, added_by: user.id })
      .select().single()

    if (dErr || !dinner) { setError('Could not save dinner.'); setLoading(false); return }

    await supabase.from('dinner_attendees').insert({ dinner_id: dinner.id, user_id: user.id })

    const validDishes = dishes.filter(d => d.name.trim())
    if (validDishes.length) {
      await supabase.from('dishes').insert(
        validDishes.map(d => ({ dinner_id: dinner.id, name: d.name, rating: d.rating || 3, added_by: user.id }))
      )
    }

    const validCocktails = cocktails.filter(c => c.name.trim())
    if (validCocktails.length) {
      await supabase.from('cocktails').insert(
        validCocktails.map(c => ({ dinner_id: dinner.id, name: c.name, rating: c.rating || 3, added_by: user.id }))
      )
    }

    router.push('/log')
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 40, position: 'relative', zIndex: 1 }}>
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
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Log a Dinner</h1>
      </header>

      <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        <section>
          <label style={labelStyle}>Restaurant</label>
          <input placeholder="Restaurant name" value={restaurantName}
            onChange={e => setRestaurantName(e.target.value)} required />
        </section>

        <section>
          <label style={labelStyle}>Area</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['seattle', 'snohomish'] as const).map(a => (
              <button key={a} type="button"
                onClick={() => { setArea(a); setNeighborhood('') }}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12,
                  border: `1px solid ${area === a ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: area === a ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.03)',
                  color: area === a ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                }}>
                {a === 'seattle' ? 'Seattle' : 'Snohomish Co.'}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label style={labelStyle}>Neighborhood</label>
          <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required>
            <option value="">Select neighborhood...</option>
            {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </section>

        <section>
          <label style={labelStyle}>Cuisine</label>
          <select value={cuisine} onChange={e => setCuisine(e.target.value)} required>
            <option value="">Select cuisine...</option>
            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        <section>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </section>

        <section>
          <label style={labelStyle}>Would you go back?</label>
          <ThumbRating value={thumb} onChange={setThumb} />
        </section>

        {/* Dishes */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <label style={labelStyle}>Dishes</label>
            <button type="button" onClick={addDish} style={addBtnStyle}>
              <Plus size={13} strokeWidth={2.5} /> Add dish
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dishes.map((dish, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '10px 12px',
              }}>
                <input placeholder={`Dish ${i + 1}`} value={dish.name}
                  onChange={e => updateDish(i, 'name', e.target.value)}
                  style={{ flex: 1, background: 'none', border: 'none', padding: '0', fontSize: 15 }} />
                <StarRating value={dish.rating} onChange={v => updateDish(i, 'rating', v)} size={19} />
                {dishes.length > 1 && (
                  <button type="button" onClick={() => removeDish(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', padding: 2, flexShrink: 0 }}>
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cocktails */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <label style={labelStyle}>
              Cocktails <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
            </label>
            <button type="button" onClick={addCocktail} style={addBtnStyle}>
              <Plus size={13} strokeWidth={2.5} /> Add
            </button>
          </div>
          {cocktails.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cocktails.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '10px 12px',
                }}>
                  <input placeholder={`Cocktail ${i + 1}`} value={c.name}
                    onChange={e => updateCocktail(i, 'name', e.target.value)}
                    style={{ flex: 1, background: 'none', border: 'none', padding: '0', fontSize: 15 }} />
                  <StarRating value={c.rating} onChange={v => updateCocktail(i, 'rating', v)} size={19} />
                  <button type="button" onClick={() => removeCocktail(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', padding: 2, flexShrink: 0 }}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <label style={labelStyle}>
            Notes <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
          </label>
          <textarea placeholder="Memorable moments, must-orders, things to skip..."
            value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} style={{ resize: 'none' }} />
        </section>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
          color: 'white', border: 'none', borderRadius: 14,
          padding: '15px', fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1,
          boxShadow: '0 4px 20px rgba(129,140,248,0.3)',
          transition: 'opacity 0.2s',
        }}>
          {loading ? 'Saving...' : 'Save Dinner'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '0.8px', marginBottom: 10,
}

const addBtnStyle: React.CSSProperties = {
  background: 'rgba(129,140,248,0.1)',
  border: '1px solid rgba(129,140,248,0.2)',
  borderRadius: 8, padding: '5px 12px',
  color: 'var(--accent)', fontSize: 12, fontWeight: 600,
  display: 'flex', alignItems: 'center', gap: 4,
}
