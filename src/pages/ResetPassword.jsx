import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.put('/api/auth/reset-password', { password })
      // Clear recovery tokens after successful reset
      localStorage.removeItem('praisly_token')
      localStorage.removeItem('praisly_refresh_token')
      navigate('/login', { state: { message: 'Password updated. Please log in.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f8f7f4', padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '2rem',
        width: '100%', maxWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Set new password
          </h1>
          <p style={{ color: '#666', marginTop: 6, fontSize: '0.9rem' }}>
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
              style={{
                width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Re-enter password"
              style={{
                width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.75rem', background: '#C4831A',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
