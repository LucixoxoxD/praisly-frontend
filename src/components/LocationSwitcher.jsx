import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import api, { authService } from '../services/api'

const VALID_TYPES = [
  'healthcare / clinic', 'salon / beauty parlour', 'gym / fitness / yoga',
  'restaurant / cafe', 'coaching / tuition', 'ca / law firm',
  'auto / repair service', 'real estate', 'other',
]

const PRICE_PER_LOCATION = 999
export const PENDING_LOCATION_KEY = 'praisly_pending_location'
export const PENDING_ADDON_QTY_KEY = 'praisly_pending_addon_qty'

// Hoisted to module scope so it keeps a stable identity across renders —
// defining it inside AddLocationModal would remount the form on every keystroke.
function ModalShell({ onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: 16, padding: '28px 24px',
        width: '100%', maxWidth: 420, maxHeight: '88vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {children}
      </div>
    </div>
  )
}

function AddLocationModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ business_name: '', business_type: '', city: '', phone: '', location_label: '' })
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [quota, setQuota] = useState(null)   // null = loading
  const [quotaError, setQuotaError] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api.get('/api/locations/quota')
      .then(r => setQuota(r.data))
      .catch(() => setQuotaError(true))
  }, [])

  function validateForm() {
    if (!form.business_name || !form.business_type || !form.city || !form.phone) {
      setError('All fields are required')
      return false
    }
    return true
  }

  // Slot already paid for — create the location directly
  async function handleAddDirect(e) {
    e.preventDefault()
    if (!validateForm()) return
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

  // No slot available — purchase via Razorpay, then resume on return
  async function handlePurchase(e) {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/api/locations/purchase', { quantity })
      // Stash the form + quantity so we can finish after the Razorpay redirect
      localStorage.setItem(PENDING_LOCATION_KEY, JSON.stringify({
        ...form,
        location_label: form.location_label || form.city,
      }))
      localStorage.setItem(PENDING_ADDON_QTY_KEY, String(quantity))
      window.location.href = res.data.short_url
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not start payment. Please try again.')
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--line)', fontSize: 13.5, fontFamily: 'inherit',
    background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4, display: 'block' }

  const isPaid = quota?.is_paid
  const slotsAvailable = quota?.slots_available ?? 0
  const needsPurchase = isPaid && slotsAvailable <= 0
  const total = PRICE_PER_LOCATION * quantity

  // ── Loading quota ──
  if (quota === null && !quotaError) {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          Loading…
        </div>
      </ModalShell>
    )
  }

  // ── Not on a paid base plan → upsell ──
  if (!quotaError && !isPaid) {
    return (
      <ModalShell onClose={onClose}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
          Add another location
        </h3>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Multiple locations are available on a paid plan. Subscribe to your base plan first,
          then add extra locations for <strong>₹{PRICE_PER_LOCATION}/location per month</strong>.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid var(--line)',
            background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <a href="/billing" style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
            background: 'var(--primary)', color: 'white', fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', textDecoration: 'none',
          }}>View plans →</a>
        </div>
      </ModalShell>
    )
  }

  // ── Paid plan: show the form (+ purchase block if no free slot) ──
  return (
    <ModalShell onClose={onClose}>
      <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
        Add a new location
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ink-3)' }}>
        Each location gets its own QR code, reviews, and Google tracking.
      </p>

      <form onSubmit={needsPurchase ? handlePurchase : handleAddDirect} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

        {/* Slot available — no payment needed */}
        {!needsPurchase && (
          <div style={{ fontSize: 12.5, color: 'var(--win)', background: 'var(--primary-soft)', padding: '8px 12px', borderRadius: 8 }}>
            ✓ You have {slotsAvailable} paid location slot{slotsAvailable !== 1 ? 's' : ''} available.
          </div>
        )}

        {/* No slot — purchase block */}
        {needsPurchase && (
          <div style={{ background: 'var(--surface-tint)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
            <label style={{ ...labelStyle, marginBottom: 8 }}>How many locations do you want to add?</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={qtyBtnStyle}>−</button>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', minWidth: 24, textAlign: 'center' }}>{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => Math.min(10, q + 1))} style={qtyBtnStyle}>+</button>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>
                ₹{PRICE_PER_LOCATION}/location · monthly
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>₹{total.toLocaleString('en-IN')}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)' }}>/month</span></span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: '8px 0 0', lineHeight: 1.4 }}>
              You'll set up this location now; any extra slots can be added later. Billed monthly via Razorpay.
            </p>
          </div>
        )}

        {error && <div style={{ fontSize: 13, color: '#c5221f', background: '#fce8e6', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid var(--line)',
            background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button type="submit" disabled={saving} style={{
            flex: 1.4, padding: '11px 0', borderRadius: 10, border: 'none',
            background: needsPurchase ? 'var(--primary)' : 'var(--ink)',
            color: needsPurchase ? 'white' : 'var(--primary)', fontSize: 13.5, fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
          }}>
            {saving
              ? (needsPurchase ? 'Redirecting…' : 'Adding…')
              : (needsPurchase ? `Pay ₹${total.toLocaleString('en-IN')} & continue →` : 'Add location')}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

const qtyBtnStyle = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)',
  background: 'var(--surface)', color: 'var(--ink)', fontSize: 18, fontWeight: 700,
  cursor: 'pointer', display: 'grid', placeItems: 'center', fontFamily: 'inherit', lineHeight: 1,
}

export default function LocationSwitcher({ variant = 'sidebar' }) {
  const isTopbar = variant === 'topbar'
  const [locations, setLocations] = useState(authService.getLocations())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
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

  async function handleDelete(loc, e) {
    e.stopPropagation()
    const label = loc.location_label || loc.business_name || 'this location'
    if (!window.confirm(`Remove "${label}"? Its review history is kept but it will be hidden from your dashboard.`)) {
      return
    }
    setDeletingId(loc.id)
    try {
      await api.delete(`/api/locations/${loc.id}`)
      const updated = locations.filter(l => l.id !== loc.id)
      setLocations(updated)
      authService.setLocations(updated)
      // If we just deleted the active location, switch to the primary/first remaining one
      if (loc.id === currentId) {
        const fallback = updated.find(l => l.is_primary) || updated[0]
        if (fallback) {
          authService.switchLocation(fallback)
          window.location.reload()
        }
      }
    } catch (err) {
      window.alert(err.response?.data?.detail || 'Could not remove location')
    } finally {
      setDeletingId(null)
    }
  }

  const activeLocations = locations.filter(l => l.is_active !== false)

  return (
    <>
      <div ref={ref} style={{ position: 'relative', ...(isTopbar ? { minWidth: 0, maxWidth: '62vw' } : { margin: '0 8px 12px' }) }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={isTopbar ? {
            maxWidth: '100%', padding: '6px 9px 6px 11px',
            background: 'var(--surface-tint)', border: '1px solid var(--line)',
            borderRadius: 999, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 7, fontFamily: 'inherit',
          } : {
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
            flex: 1, minWidth: 0, fontSize: isTopbar ? 14 : 12.5,
            fontWeight: isTopbar ? 700 : 600, color: 'var(--ink)',
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
            position: 'absolute', top: 'calc(100% + 6px)',
            ...(isTopbar ? { left: 0, width: 'min(300px, calc(100vw - 24px))' } : { left: 0, right: 0 }),
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100, overflow: 'hidden',
            animation: 'dropIn 0.15s ease both',
            display: 'flex', flexDirection: 'column', maxHeight: '70vh',
          }}>
            <div style={{ overflowY: 'auto', flex: 1 }}>
            {activeLocations.map(loc => (
              <div
                key={loc.id}
                style={{
                  width: '100%',
                  background: loc.id === currentId ? 'var(--primary-soft)' : 'transparent',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (loc.id !== currentId) e.currentTarget.style.background = 'var(--surface-tint)' }}
                onMouseLeave={e => { if (loc.id !== currentId) e.currentTarget.style.background = 'transparent' }}
              >
                <button
                  onClick={() => handleSwitch(loc)}
                  disabled={loading || deletingId === loc.id}
                  style={{
                    flex: 1, minWidth: 0, padding: '10px 4px 10px 12px',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit', textAlign: 'left',
                  }}
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
                {/* Delete — allowed as long as more than one location exists */}
                {activeLocations.length > 1 && (
                  <button
                    onClick={e => handleDelete(loc, e)}
                    disabled={deletingId === loc.id}
                    title="Remove location"
                    style={{
                      flexShrink: 0, padding: '8px 10px', marginRight: 2,
                      background: 'transparent', border: 'none',
                      cursor: deletingId === loc.id ? 'wait' : 'pointer',
                      display: 'grid', placeItems: 'center', borderRadius: 6,
                      color: 'var(--ink-4)', opacity: deletingId === loc.id ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#c5221f'; e.currentTarget.style.background = 'rgba(197,34,31,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            </div>

            {/* Add location — pinned CTA, always visible at the bottom of the dropdown */}
            <button
              onClick={() => { setOpen(false); setShowAdd(true) }}
              style={{
                width: '100%', padding: '12px', flexShrink: 0,
                background: 'var(--primary-soft)', border: 'none',
                borderTop: '1px solid var(--line)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary-ink)', color: 'var(--surface)',
                display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
              }}>+</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-ink)' }}>
                Add location
              </span>
            </button>
          </div>
        )}
      </div>

      {showAdd && createPortal(
        <AddLocationModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />,
        document.body
      )}
    </>
  )
}
