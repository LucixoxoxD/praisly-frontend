import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

function formatPhone(digits) {
  if (digits.length <= 5) return digits
  return digits.slice(0, 5) + ' ' + digits.slice(5, 10)
}

const BIZ_TYPES = [
  { value: 'healthcare / clinic',   label: 'Healthcare / Clinic' },
  { value: 'salon / beauty parlour', label: 'Salon / Beauty Parlour' },
  { value: 'gym / fitness / yoga',  label: 'Gym / Fitness / Yoga' },
  { value: 'restaurant / cafe',     label: 'Restaurant / Cafe' },
  { value: 'coaching / tuition',    label: 'Coaching / Tuition' },
  { value: 'ca / law firm',         label: 'CA / Law Firm' },
  { value: 'auto / repair service', label: 'Auto / Repair Service' },
  { value: 'real estate',           label: 'Real Estate' },
  { value: 'other',                 label: 'Other' },
]

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
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

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
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
  const onFocus = (e) => (e.target.style.borderColor = '#10b981')
  const onBlur  = (e) => (e.target.style.borderColor = '#e2e8f0')

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
        background: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: "'Plus Jakarta Sans', system-ui",
              letterSpacing: '-1px',
              margin: 0,
            }}
          >
            Praisly
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            Start collecting 5-star reviews
          </p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1px solid #e2e8f0',
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

            <div style={{ marginBottom: 14 }}>
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

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone number</label>
              <div
                style={{
                  display: 'flex',
                  border: `1.5px solid ${phoneFocused ? '#10b981' : '#e2e8f0'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                  background: 'white',
                }}
              >
                <span
                  style={{
                    padding: '11px 12px',
                    fontSize: 14,
                    color: '#64748b',
                    background: '#f8fafc',
                    borderRight: '1.5px solid #e2e8f0',
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
                    color: '#0f172a',
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

            <div style={{ marginBottom: 8 }}>
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

            {error && (
              <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, marginTop: 8 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
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

            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
              By signing up you agree to our{' '}
              <Link to="/terms" style={{ color: '#64748b', textDecoration: 'underline' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'underline' }}>Privacy Policy</Link>
            </p>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
