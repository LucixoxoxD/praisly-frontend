import { useState } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'

const MAX_CHARS = 160

const PAGE_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .send-input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: white;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .send-input:focus { border-color: #10b981; }
  .send-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: white;
    outline: none;
    transition: border-color 0.15s;
    resize: vertical;
    min-height: 100px;
    box-sizing: border-box;
  }
  .send-textarea:focus { border-color: #10b981; }
`

const DEFAULT_MESSAGE = "Hi! We'd love your feedback. Please take a moment to share your experience with us."

export default function SendRequest() {
  const toast = useToast()
  const [phone, setPhone]     = useState('')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(null) // { phone }

  const charsLeft = MAX_CHARS - message.length
  const overLimit = charsLeft < 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim() || overLimit) return
    setSending(true)
    try {
      await api.post('/api/reviews/request', {
        phone: `91${phone.trim()}`,
        message: message.trim(),
      })
      setSuccess({ phone: phone.trim() })
      toast('Review request sent!')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to send. Please try again.'
      toast(msg, 'error')
    } finally {
      setSending(false)
    }
  }

  function handleReset() {
    setPhone('')
    setMessage(DEFAULT_MESSAGE)
    setSuccess(null)
  }

  return (
    <div className="fade-up">
      <style>{PAGE_CSS}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 22,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 8,
        }}
      >
        Send Review Request
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
        Send a WhatsApp message to a customer asking for their review.
      </p>

      <div style={{ maxWidth: 520 }}>
        {success ? (
          /* ── Success state ── */
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 40,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui",
                fontSize: 20,
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 8px',
              }}
            >
              Review request sent!
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 6px' }}>
              Message sent to
            </p>
            <p style={{ color: '#0f172a', fontSize: 15, fontWeight: 600, margin: '0 0 28px' }}>
              +91 {success.phone}
            </p>
            <button
              onClick={handleReset}
              style={{
                padding: '11px 28px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Send Another
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 28,
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Phone field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Customer Phone Number
              </label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* +91 prefix badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    background: '#f1f5f9',
                    border: '1.5px solid #e2e8f0',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    color: '#475569',
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  className="send-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  required
                  style={{ borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
                />
              </div>
            </div>

            {/* Message field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Custom Message
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="send-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 10,
                    fontSize: 11,
                    color: overLimit ? '#ef4444' : '#94a3b8',
                    fontWeight: overLimit ? 600 : 400,
                    pointerEvents: 'none',
                  }}
                >
                  {message.length} / {MAX_CHARS}
                </span>
              </div>
              {overLimit && (
                <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>
                  Message is too long. Please shorten it.
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={sending || overLimit || !phone.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: sending || overLimit || !phone.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !phone.trim() ? 0.7 : 1,
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {sending ? (
                <>
                  <span
                    style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  Sending...
                </>
              ) : (
                'Send Review Request'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
