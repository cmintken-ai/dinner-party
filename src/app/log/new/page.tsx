'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StarRating from '@/components/StarRating'
import ThumbRating from '@/components/ThumbRating'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const SEATTLE_NEIGHBORHOODS = [
  'Capitol Hill', 'Ballard', 'Fremont', 'Queen Anne', 'South Lake Union',
  'Pioneer Square', 'Belltown', 'First Hill', 'Madison Park', 'Madrona',
  'Columbia City', 'West Seattle', 'Georgetown', 'Eastlake', 'Wallingford',
  'Green Lake', 'Phinney Ridge', 'Ravenna', 'University District', 'Montlake',
]

const SNOHOMISH_AREAS = ['Edmonds', 'Everett', 'Mukilteo', 'Snohomish', 'Bothell', 'Kenmore', 'Mill Creek']

const CUISINES = [
  'American', 'Italian', 'Japanese', 'Mexican', 'Thai', 'Chinese', 'Korean',
  'French', 'Mediterranean', 'Indian', 'Vietnamese', 'Spanish', 'Seafood',
  'Steakhouse', 'Pizza', 'Sushi', 'Ramen', 'Cocktail Bar', 'Wine Bar', 'Other',
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

    // Upsert restaurant
    const { data: restaurant, error: rErr } = await supabase
      .from('restaurants')
      .upsert({ name: restaurantName, neighborhood, cuisine, area, added_by: user.id }, { onConflict: 'name' })
      .select()
      .single()

    if (rErr || !restaurant) { setError('Could not save restaurant.'); setLoading(false); return }

    // Create dinner
    const { data: dinner, error: dErr } = await supabase
      .from('dinners')
      .insert({ restaurant_id: restaurant.id, date, thumb, notes, added_by: user.id })
      .select()
      .single()

    if (dErr || !dinner) { setError('Could not save dinner.'); setLoading(false); return }

    // Add self as attendee
    await supabase.from('dinner_attendees').insert({ dinner_id: dinner.id, user_id: user.id })

    // Save dishes
    const validDishes = dishes.filter(d => d.name.trim())
    if (validDishes.length) {
      await supabase.from('dishes').insert(
        validDishes.map(d => ({ dinner_id: dinner.id, name: d.name, rating: d.rating || 3, added_by: user.id }))
      )
    }

    // Save cocktails
    const validCocktails = cocktails.filter(c => c.name.trim())
    if (validCocktails.length) {
      await supabase.from('cocktails').insert(
        validCocktails.map(c => ({ dinner_id: dinner.id, name: c.name, rating: c.rating || 3, added_by: user.id }))
      )
    }

    router.push('/log')
  }

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
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Log a Dinner</h1>
      </header>

      <form onSubmit={handleSubmit} style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Restaurant */}
        <section>
          <label style={labelStyle}>Restaurant</label>
          <input
            placeholder="Restaurant name"
            value={restaurantName}
            onChange={e => setRestaurantName(e.target.value)}
            required
          />
        </section>

        {/* Area toggle */}
        <section>
          <label style={labelStyle}>Area</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['seattle', 'snohomish'] as const).map(a => (
              <button key={a} type="button" onClick={() => { setArea(a); setNeighborhood('') }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: `1.5px solid ${area === a ? 'var(--accent)' : '#3a3a3c'}`,
                  background: area === a ? 'rgba(232,93,38,0.12)' : 'transparent',
                  color: area === a ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: 600, fontSize: 14, textTransform: 'capitalize',
                }}>
                {a === 'seattle' ? 'Seattle' : 'Snohomish Co.'}
              </button>
            ))}
          </div>
        </section>

        {/* Neighborhood */}
        <section>
          <label style={labelStyle}>Neighborhood</label>
          <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required>
            <option value="">Select neighborhood...</option>
            {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </section>

        {/* Cuisine */}
        <section>
          <label style={labelStyle}>Cuisine</label>
          <select value={cuisine} onChange={e => setCuisine(e.target.value)} required>
            <option value="">Select cuisine...</option>
            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        {/* Date */}
        <section>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </section>

        {/* Overall verdict */}
        <section>
          <label style={labelStyle}>Would you go back?</label>
          <ThumbRating value={thumb} onChange={setThumb} />
        </section>

        {/* Dishes */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={labelStyle}>Dishes</label>
            <button type="button" onClick={addDish} style={addBtnStyle}>
              <Plus size={14} /> Add dish
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dishes.map((dish, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    placeholder={`Dish ${i + 1}`}
                    value={dish.name}
                    onChange={e => updateDish(i, 'name', e.target.value)}
                  />
                </div>
                <StarRating value={dish.rating} onChange={v => updateDish(i, 'rating', v)} size={20} />
                {dishes.length > 1 && (
                  <button type="button" onClick={() => removeDish(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', padding: 4 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cocktails */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={labelStyle}>Cocktails <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <button type="button" onClick={addCocktail} style={addBtnStyle}>
              <Plus size={14} /> Add
            </button>
          </div>
          {cocktails.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cocktails.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      placeholder={`Cocktail ${i + 1}`}
                      value={c.name}
                      onChange={e => updateCocktail(i, 'name', e.target.value)}
                    />
                  </div>
                  <StarRating value={c.rating} onChange={v => updateCocktail(i, 'rating', v)} size={20} />
                  <button type="button" onClick={() => removeCocktail(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        <section>
          <label style={labelStyle}>Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            placeholder="Any memorable moments, must-orders, or things to skip..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ resize: 'none' }}
          />
        </section>

        {error && <p style={{ color: 'var(--error)', fontSize: 14 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 12,
          padding: '15px', fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Saving...' : 'Save Dinner'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: 8,
}

const addBtnStyle: React.CSSProperties = {
  background: 'none', border: '1.5px solid #3a3a3c',
  borderRadius: 8, padding: '5px 10px',
  color: 'var(--muted)', fontSize: 13,
  display: 'flex', alignItems: 'center', gap: 4,
}
