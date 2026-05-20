import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

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

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const onFocus = (e) => (e.target.style.borderColor = '#10b981')
  const onBlur  = (e) => (e.target.style.borderColor = '#e2e8f0')

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
            Reset your password
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>
                Check your inbox
              </p>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                style={{ fontSize: 14, color: '#10b981', fontWeight: 600, textDecoration: 'none' }}
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
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.5 }}>
                  Enter the email you used during signup. We'll send a reset link.
                </p>
              </div>

              {error && (
                <p style={{ color: '#dc2626', fontSize: 13, margin: '10px 0' }}>
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
                  marginTop: 16,
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
                <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
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
