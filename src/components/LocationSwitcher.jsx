import { useState, useEffect, useRef } from 'react'
import api, { authService } from '../services/api'

const VALID_TYPES = [
  'healthcare / clinic', 'salon / beauty parlour', 'gym / fitness / yoga',
  'restaurant / cafe', 'coaching / tuition', 'ca / law firm',
  'auto / repair service', 'real estate', 'other',
]

function AddLocationModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ business_name: '', business_type: '', city: '', phone: '', location_label: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.business_name || !form.business_type || !form.city || !form.phone) {
      setError('All fields are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/api/locations', {
        ...form,
        location_label: form.location_label || form.city,
      })
      onAdded(res.data.location)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add location')
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit',
    background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: 16, padding: '28px 24px',
        width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
          Add a new location
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ink-3)' }}>
          Each location gets its own QR code, reviews, and Google tracking.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Business name</label>
            <input style={inputStyle} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="e.g. Looks Salon - Sector 18" />
          </div>
          <div>
            <label style={labelStyle}>Business type</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.business_type} onChange={e => set('business_type', e.target.value)}>
              <option value="">Select type</option>
              {VALID_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Noida" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit number" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Location label <span style={{ fontWeight: 400, color: 'var(--ink-4)' }}>(optional)</span></label>
            <input style={inputStyle} value={form.location_label} onChange={e => set('location_label', e.target.value)} placeholder="e.g. Sector 18 branch" />
          </div>

          {error && <div style={{ fontSize: 13, color: '#c5221f', background: '#fce8e6', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--line)',
              background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: 'var(--ink)', color: 'var(--primary)', fontSize: 13.5, fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Adding...' : 'Add location'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LocationSwitcher() {
  const [locations, setLocations] = useState(authService.getLocations())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
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
        // If endpoint not available yet, show current business as only location
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

  function handleSwitch(loc) {
    if (loc.id === currentId) {
      setOpen(false)
      return
    }
    setLoading(true)
    authService.switchLocation(loc)
    setOpen(false)
    window.location.reload()
  }

  function handleAdded(newLoc) {
    const updated = [...locations, newLoc]
    setLocations(updated)
    authService.setLocations(updated)
    setShowAdd(false)
    // Switch to the new location so user can onboard it
    authService.switchLocation(newLoc)
    window.location.href = '/onboarding'
  }

  const activeLocations = locations.filter(l => l.is_active !== false)

  return (
    <>
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
            {current?.location_label || current?.city || current?.business_name || 'Location'}
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
            {activeLocations.map(loc => (
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

            {/* Add location button */}
            <button
              onClick={() => { setOpen(false); setShowAdd(true) }}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'transparent', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'inherit', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-tint)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary-soft)', color: 'var(--primary-ink)',
                display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
              }}>+</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary-ink)' }}>
                Add location
              </span>
            </button>
          </div>
        )}
      </div>

      {showAdd && (
        <AddLocationModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}
    </>
  )
}
