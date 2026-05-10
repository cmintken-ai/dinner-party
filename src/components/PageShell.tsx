import BottomNav from './BottomNav'

interface Props {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export default function PageShell({ title, action, children }: Props) {
  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 96, position: 'relative', zIndex: 1 }}>
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
      }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #f1f1f3 0%, #a0a0b0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {title}
        </h1>
        {action}
      </header>
      <main style={{ padding: '0 0 16px', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
