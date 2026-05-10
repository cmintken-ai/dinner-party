'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, BookHeart, CalendarDays, User } from 'lucide-react'

const tabs = [
  { href: '/log',      Icon: UtensilsCrossed },
  { href: '/wishlist', Icon: BookHeart },
  { href: '/calendar', Icon: CalendarDays },
  { href: '/profile',  Icon: User },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      padding: '0 20px',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      <nav style={{
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 8px',
        pointerEvents: 'all',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
      }}>
        {tabs.map(({ href, Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 40,
              borderRadius: 20,
              background: active ? 'rgba(129,140,248,0.15)' : 'transparent',
              color: active ? '#818cf8' : '#4a4a60',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
