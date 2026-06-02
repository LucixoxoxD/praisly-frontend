import { useState, useEffect, useRef } from 'react'
import api, { authService } from '../services/api'

export default function LocationSwitcher() {
  const [locations, setLocations] = useState(authService.getLocations())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const current = authService.getBusiness()
  const currentId = current?.id

  // Fetch locations on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/api/locations')
        const locs = res.data?.locations || []
        if (!cancelled) {
          setLocations(locs)
          authService.setLocations(locs)
        }
      } catch {
        // Silently fail — single-location users won't have this endpoint early
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Don't render if single location
  if (locations.length <= 1) return null

  function handleSwitch(loc) {
    if (loc.id === currentId) {
      setOpen(false)
      return
    }
    setLoading(true)
    authService.switchLocation(loc)
    setOpen(false)
    // Reload the page so all dashboard data refreshes for the new location
    window.location.reload()
  }

  return (
    <div ref={ref} style={{ position: 'relative', margin: '0 8px 12px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '8px 10px',
          background: 'var(--surface-tint)', border: '1px solid var(--line)',
          borderRadius: 8, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 8, fontFamily: 'inherit',
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--win)', flexShrink: 0,
        }} />
        <span style={{
          flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--ink)',
          textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {current?.location_label || current?.business_name || 'Location'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100, overflow: 'hidden',
          animation: 'dropIn 0.15s ease both',
        }}>
          {locations.filter(l => l.is_active !== false).map(loc => (
            <button
              key={loc.id}
              onClick={() => handleSwitch(loc)}
              disabled={loading}
              style={{
                width: '100%', padding: '10px 12px',
                background: loc.id === currentId ? 'var(--primary-soft)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--line)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'inherit', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (loc.id !== currentId) e.currentTarget.style.background = 'var(--surface-tint)' }}
              onMouseLeave={e => { if (loc.id !== currentId) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: loc.id === currentId ? 'var(--primary-ink)' : 'var(--ink-4)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: loc.id === currentId ? 700 : 500,
                  color: loc.id === currentId ? 'var(--primary-ink)' : 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {loc.location_label || loc.business_name}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>
                  {loc.city || ''}{loc.business_type ? ` · ${loc.business_type}` : ''}
                </div>
              </div>
              {loc.id === currentId && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
