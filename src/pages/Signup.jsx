import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

function formatPhone(digits) {
  if (digits.length <= 5) return digits
  return digits.slice(0, 5) + ' ' + digits.slice(5, 10)
}

const BIZ_TYPES = [
  { value: 'healthcare / clinic',    label: 'Healthcare / Clinic' },
  { value: 'salon / beauty parlour', label: 'Salon / Beauty Parlour' },
  { value: 'gym / fitness / yoga',   label: 'Gym / Fitness / Yoga' },
  { value: 'restaurant / cafe',      label: 'Restaurant / Cafe' },
  { value: 'coaching / tuition',     label: 'Coaching / Tuition' },
  { value: 'ca / law firm',          label: 'CA / Law Firm' },
  { value: 'auto / repair service',  label: 'Auto / Repair Service' },
  { value: 'real estate',            label: 'Real Estate' },
  { value: 'other',                  label: 'Other' },
]

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid var(--line)',
  borderRadius: 8,
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
  background: 'var(--surface)',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--ink-2)',
  marginBottom: 6,
}

export default function Signup() {
  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    email: '',
    password: '',
    business_type: 'other',
    city: '',
  })
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const onFocus = (e) => (e.target.style.borderColor = 'var(--primary)')
  const onBlur  = (e) => (e.target.style.borderColor = 'var(--line)')

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authService.signup({ ...form, phone: '+91' + form.phone })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF7C4F, #FF5B2E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 20, fontWeight: 800, flexShrink: 0,
              }}
            >
              P
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--ink)',
                fontFamily: "'Plus Jakarta Sans', system-ui",
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              Praisly
            </h1>
          </div>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>
            Start collecting 5-star reviews
          </p>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--line)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                required
                placeholder="Looks Salon"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone number</label>
              <div
                style={{
                  display: 'flex',
                  border: `1.5px solid ${phoneFocused ? 'var(--primary)' : 'var(--line)'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                  background: 'var(--surface)',
                }}
              >
                <span
                  style={{
                    padding: '11px 12px',
                    fontSize: 14,
                    color: 'var(--ink-3)',
                    background: 'var(--surface-tint)',
                    borderRight: '1.5px solid var(--line)',
                    fontWeight: 600,
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  value={formatPhone(form.phone)}
                  onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  placeholder="98765 43210"
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: 'var(--ink)',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    minWidth: 0,
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
                placeholder="min. 6 characters"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
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

            <div style={{ marginBottom: 8 }}>
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

            {error && (
              <div
                style={{
                  background: 'var(--danger-soft)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 12,
                  marginTop: 8,
                }}
              >
                <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.15s',
                marginTop: 12,
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--ink-4)', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
              By signing up you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--ink-3)', textDecoration: 'underline' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--ink-3)', textDecoration: 'underline' }}>Privacy Policy</Link>
            </p>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-ink)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
