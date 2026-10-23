import { useLocation } from 'react-router-dom'

// Stand-in for portal sections that aren't built yet.
export default function Placeholder() {
  const { pathname } = useLocation()
  const title = pathname.split('/').pop().replace(/-/g, ' ')

  return (
    <div style={{ padding: '72px 48px' }}>
      <h1 style={{ fontSize: 40, fontWeight: 600, textTransform: 'capitalize' }}>{title}</h1>
      <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>This section is coming soon.</p>
    </div>
  )
}
