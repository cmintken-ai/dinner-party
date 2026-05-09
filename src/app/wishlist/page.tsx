'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/PageShell'
import { Plus, MapPin, ChevronUp, X } from 'lucide-react'
import type { WishlistItem } from '@/types'

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

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Form state
  const [name, setName] = useState('')
  const [area, setArea] = useState<'seattle' | 'snohomish'>('seattle')
  const [neighborhood, setNeighborhood] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      const { data } = await supabase
        .from('wishlist')
        .select('*, restaurant:restaurants(*), upvotes:wishlist_upvotes(*)')
        .order('created_at', { ascending: false })
      setItems(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !neighborhood || !cuisine) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurant } = await supabase
      .from('restaurants')
      .upsert({ name, neighborhood, cuisine, area, added_by: user.id }, { onConflict: 'name' })
      .select().single()

    if (restaurant) {
      const { data: item } = await supabase
        .from('wishlist')
        .insert({ restaurant_id: restaurant.id, added_by: user.id })
        .select('*, restaurant:restaurants(*), upvotes:wishlist_upvotes(*)')
        .single()
      if (item) setItems(prev => [item, ...prev])
    }

    setName(''); setNeighborhood(''); setCuisine(''); setAdding(false)
    setSaving(false)
  }

  async function toggleUpvote(item: WishlistItem) {
    if (!userId) return
    const hasUpvoted = item.upvotes?.some(u => u.user_id === userId)
    if (hasUpvoted) {
      await supabase.from('wishlist_upvotes').delete()
        .eq('wishlist_id', item.id).eq('user_id', userId)
      setItems(prev => prev.map(x => x.id === item.id
        ? { ...x, upvotes: x.upvotes?.filter(u => u.user_id !== userId) }
        : x))
    } else {
      await supabase.from('wishlist_upvotes')
        .insert({ wishlist_id: item.id, user_id: userId })
      setItems(prev => prev.map(x => x.id === item.id
        ? { ...x, upvotes: [...(x.upvotes ?? []), { id: '', wishlist_id: item.id, user_id: userId! }] }
        : x))
    }
  }

  const neighborhoods = area === 'seattle' ? SEATTLE_NEIGHBORHOODS : SNOHOMISH_AREAS

  return (
    <PageShell
      title="Wishlist"
      action={
        <button onClick={() => setAdding(true)} style={{
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 20, padding: '7px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 600,
        }}>
          <Plus size={16} /> Add
        </button>
      }
    >
      {/* Add sheet */}
      {adding && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 200, display: 'flex', alignItems: 'flex-end',
        }} onClick={e => e.target === e.currentTarget && setAdding(false)}>
          <div style={{
            background: '#1c1c1e', width: '100%', maxWidth: 480,
            margin: '0 auto', borderRadius: '20px 20px 0 0',
            padding: '20px 18px 40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add to Wishlist</h2>
              <button onClick={() => setAdding(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Restaurant name" value={name} onChange={e => setName(e.target.value)} required />
              <div style={{ display: 'flex', gap: 8 }}>
                {(['seattle', 'snohomish'] as const).map(a => (
                  <button key={a} type="button" onClick={() => { setArea(a); setNeighborhood('') }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10,
                      border: `1.5px solid ${area === a ? 'var(--accent)' : '#3a3a3c'}`,
                      background: area === a ? 'rgba(232,93,38,0.12)' : 'transparent',
                      color: area === a ? 'var(--accent)' : 'var(--muted)',
                      fontWeight: 600, fontSize: 13,
                    }}>
                    {a === 'seattle' ? 'Seattle' : 'Snohomish Co.'}
                  </button>
                ))}
              </div>
              <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required>
                <option value="">Neighborhood...</option>
                {neighborhoods.map(n => <option key={n}>{n}</option>)}
              </select>
              <select value={cuisine} onChange={e => setCuisine(e.target.value)} required>
                <option value="">Cuisine...</option>
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
              <button type="submit" disabled={saving} style={{
                background: 'var(--accent)', color: 'white', border: 'none',
                borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700,
                marginTop: 4, opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Saving...' : 'Add to Wishlist'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
          No restaurants on the wishlist yet.
        </div>
      ) : (
        <div>
          {items.map(item => {
            const upvoteCount = item.upvotes?.length ?? 0
            const hasUpvoted = item.upvotes?.some(u => u.user_id === userId)
            return (
              <div key={item.id} style={{
                padding: '16px 18px',
                borderBottom: '1px solid #2c2c2e',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {item.restaurant?.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13 }}>
                    <MapPin size={12} />
                    <span>{item.restaurant?.neighborhood}</span>
                    <span>·</span>
                    <span>{item.restaurant?.cuisine}</span>
                  </div>
                </div>
                <button onClick={() => toggleUpvote(item)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 2, background: 'none', border: 'none', padding: 8,
                  color: hasUpvoted ? 'var(--accent)' : 'var(--muted)',
                }}>
                  <ChevronUp size={20} strokeWidth={hasUpvoted ? 2.5 : 1.8} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{upvoteCount}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
