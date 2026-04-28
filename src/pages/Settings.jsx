import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { authService } from '../services/api'
import { useToast } from '../components/Toast'

const BIZ_TYPES = [
  { value: 'dentist',    label: 'Dentist' },
  { value: 'salon',      label: 'Salon / Beauty Parlour' },
  { value: 'gym',        label: 'Gym / Fitness Center' },
  { value: 'restaurant', label: 'Restaurant / Cafe' },
  { value: 'coaching',   label: 'Coaching / Tuition' },
  { value: 'ca_firm',    label: 'CA / Accountant Firm' },
  { value: 'other',      label: 'Other' },
]

const PLAN_LIMITS = { free: 10, starter: 100, pro: Infinity, agency: Infinity }

const PAGE_STYLE = `@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
  background: 'white',
  fontFamily: 'inherit',
}

export default function Settings() {
  const toast   = useToast()
  const stored  = authService.getBusiness()

  const [form, setForm] = useState({
    business_name: stored?.business_name || '',
    business_type: stored?.business_type || 'other',
    city:          stored?.city          || '',
    phone:         stored?.phone         || '',
    email:         stored?.email         || '',
  })
  const [saving, setSaving] = useState(false)

  const plan  = stored?.plan  || 'free'
  const used  = stored?.monthly_request_count || 0
  const limit = PLAN_LIMITS[plan] ?? 10
  const pct   = isFinite(limit) ? Math.min(100, Math.round((used / limit) * 100)) : 0

  const set     = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const onFocus = (e) => (e.target.style.borderColor = '#10b981')
  const onBlur  = (e) => (e.target.style.borderColor = '#e2e8f0')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/api/business/update', form)
      authService.setBusiness({ ...stored, ...res.data })
      toast('Settings saved!')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <style>{PAGE_STYLE}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 22,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 24,
        }}
      >
        Settings
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Business Profile form */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 28,
            border: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
            Business Profile
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                required
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Business Type</label>
              <select
                value={form.business_type}
                onChange={(e) => set('business_type', e.target.value)}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                {BIZ_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Noida"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {stored?.google_business_url && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Google Review URL</label>
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    color: '#64748b',
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                  }}
                >
                  {stored.google_business_url}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Set via Google Places search
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '11px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Plan & Usage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 28,
              border: '1px solid #e2e8f0',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
              Plan &amp; Usage
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Current plan</span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  background: plan === 'free' ? '#f1f5f9' : '#d1fae5',
                  color: plan === 'free' ? '#475569' : '#065f46',
                  textTransform: 'capitalize',
                }}
              >
                {plan}
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>
              Review requests this month
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#0f172a',
                  fontFamily: "'Plus Jakarta Sans', system-ui",
                  lineHeight: 1,
                }}
              >
                {used}
              </span>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>
                {isFinite(limit) ? `of ${limit}` : '∞ unlimited'}
              </span>
            </div>

            {isFinite(limit) && (
              <>
                <div
                  style={{
                    background: '#f1f5f9',
                    borderRadius: 6,
                    height: 8,
                    overflow: 'hidden',
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: pct >= 90 ? '#f59e0b' : '#10b981',
                      borderRadius: 6,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: pct >= 90 ? '#f59e0b' : '#94a3b8',
                    margin: '0 0 20px',
                  }}
                >
                  {pct >= 90 ? `⚠️ Only ${limit - used} left this month` : `${limit - used} remaining`}
                </p>
              </>
            )}

            <Link
              to="/billing"
              style={{
                display: 'block',
                width: '100%',
                padding: '11px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
                transition: 'opacity 0.15s',
              }}
            >
              View Plans &amp; Upgrade
            </Link>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 16,
              padding: 24,
              color: 'white',
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>🚀 Need more?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
              Upgrade to Starter or Pro for more review requests, WhatsApp integration, and priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
