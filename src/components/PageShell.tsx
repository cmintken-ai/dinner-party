import BottomNav from './BottomNav'

interface Props {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export default function PageShell({ title, action, children }: Props) {
  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 80 }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(15,15,15,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #2c2c2e',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        paddingTop: 'calc(14px + env(safe-area-inset-top))',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h1>
        {action}
      </header>

      {/* Content */}
      <main style={{ padding: '0 0 16px' }}>
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
