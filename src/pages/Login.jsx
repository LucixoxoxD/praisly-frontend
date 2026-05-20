import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

function formatPhone(digits) {
  if (digits.length <= 5) return digits
  return digits.slice(0, 5) + ' ' + digits.slice(5, 10)
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

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
  fontFamily: 'inherit',
}

export default function Login() {
  const [tab, setTab] = useState('phone')
  const [phone, setPhone] = useState('')
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onFocus = (e) => (e.target.style.borderColor = '#10b981')
  const onBlur  = (e) => (e.target.style.borderColor = '#e2e8f0')

  async function handleSubmit(e) {
    e.preventDefault()
    if (tab === 'phone' && phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const creds = tab === 'phone'
        ? { phone: '+91' + phone, password }
        : { email, password }
      const data = await authService.login(creds)
      const dest = data.business?.onboarding_completed === false ? '/onboarding' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
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
      <div style={{ width: '100%', maxWidth: 400 }}>
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
            Sign in to your dashboard
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
          {/* Tab toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 10,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {['phone', 'email'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: tab === t ? 600 : 500,
                  color: tab === t ? '#0f172a' : '#64748b',
                  background: tab === t ? 'white' : 'transparent',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {t === 'phone' ? 'Phone' : 'Email'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {tab === 'phone' ? (
              <div style={{ marginBottom: 16 }}>
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
                    value={formatPhone(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            )}

            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: 6, marginBottom: 14 }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: 12, color: '#64748b', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
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
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
