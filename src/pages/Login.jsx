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
  color: 'var(--ink-2)',
  marginBottom: 6,
}

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
  fontFamily: 'inherit',
  background: 'var(--surface)',
}

export default function Login() {
  const [tab, setTab] = useState('phone')
  const [phone, setPhone] = useState('')
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [incompleteAccount, setIncompleteAccount] = useState(false)
  const navigate = useNavigate()

  const onFocus = (e) => (e.target.style.borderColor = 'var(--primary)')
  const onBlur  = (e) => (e.target.style.borderColor = 'var(--line)')

  async function handleSubmit(e) {
    e.preventDefault()
    if (tab === 'phone' && phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    setError('')
    setIncompleteAccount(false)
    try {
      const creds = tab === 'phone'
        ? { phone: '+91' + phone, password }
        : { email, password }
      const data = await authService.login(creds)
      const dest = data.business?.onboarding_completed === false ? '/onboarding' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.response?.status === 409) {
        setIncompleteAccount(true)
      } else {
        setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
      }
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
      <div style={{ width: '100%', maxWidth: 400 }}>
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
            Sign in to your dashboard
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
          {/* Tab toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-tint)',
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
                  color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
                  background: tab === t ? 'var(--surface)' : 'transparent',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
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
                style={{ fontSize: 12, color: 'var(--primary-ink)', fontWeight: 500, textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--danger-soft)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 12,
                }}
              >
                <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            {incompleteAccount && (
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 12,
                }}
              >
                <p style={{ color: '#92400e', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>
                  Account setup was incomplete
                </p>
                <p style={{ color: '#78350f', fontSize: 13, margin: '0 0 8px' }}>
                  Please sign up again or contact us on WhatsApp for help.
                </p>
                <a
                  href="https://wa.me/917977188651?text=Hi%2C+my+Praisly+account+setup+was+incomplete+and+I+need+help+logging+in."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#25D366',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: 6,
                    textDecoration: 'none',
                  }}
                >
                  WhatsApp Support
                </a>
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
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-3)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-ink)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
