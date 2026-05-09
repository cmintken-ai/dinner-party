'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, BookHeart, CalendarDays, User } from 'lucide-react'

const tabs = [
  { href: '/log',       label: 'Log',      Icon: UtensilsCrossed },
  { href: '/wishlist',  label: 'Wishlist',  Icon: BookHeart },
  { href: '/calendar',  label: 'Calendar',  Icon: CalendarDays },
  { href: '/profile',   label: 'Profile',   Icon: User },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: 'rgba(28,28,30,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #2c2c2e',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      {tabs.map(({ href, label, Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 0 6px',
            gap: 3,
            color: active ? 'var(--accent)' : 'var(--muted)',
            textDecoration: 'none',
            fontSize: 10,
            fontWeight: active ? 600 : 400,
            transition: 'color 0.15s',
          }}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
