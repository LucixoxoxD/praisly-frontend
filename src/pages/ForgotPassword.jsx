import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

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

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const onFocus = (e) => (e.target.style.borderColor = 'var(--primary)')
  const onBlur  = (e) => (e.target.style.borderColor = 'var(--line)')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email })
    } catch {
      // Intentionally swallow — don't reveal whether email exists
    } finally {
      setLoading(false)
      setSent(true)
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
            Reset your password
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>
                Check your inbox
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 24px', lineHeight: 1.6 }}>
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                style={{ fontSize: 14, color: 'var(--primary-ink)', fontWeight: 600, textDecoration: 'none' }}
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 6 }}>
                <label style={labelStyle}>Email address</label>
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
                <p style={{ fontSize: 12, color: 'var(--ink-4)', margin: '6px 0 0', lineHeight: 1.5 }}>
                  Enter the email you used during signup. We'll send a reset link.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: 'var(--danger-soft)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    margin: '10px 0',
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
                  marginTop: 16,
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
                <Link
                  to="/login"
                  style={{ color: 'var(--primary-ink)', fontWeight: 600, textDecoration: 'none' }}
                >
                  ← Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
