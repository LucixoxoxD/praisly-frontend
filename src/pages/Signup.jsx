import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

const BIZ_TYPES = [
  { value: 'dentist',    label: 'Dentist' },
  { value: 'salon',      label: 'Salon / Beauty Parlour' },
  { value: 'gym',        label: 'Gym / Fitness Center' },
  { value: 'restaurant', label: 'Restaurant / Cafe' },
  { value: 'coaching',   label: 'Coaching / Tuition' },
  { value: 'ca_firm',    label: 'CA / Accountant Firm' },
  { value: 'other',      label: 'Other' },
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
    email: '',
    password: '',
    business_type: 'other',
    city: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const onFocus = (e) => (e.target.style.borderColor = '#10b981')
  const onBlur  = (e) => (e.target.style.borderColor = '#e2e8f0')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.signup(form)
      navigate('/dashboard', { replace: true })
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
