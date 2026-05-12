import { useState } from 'react'
import { authService } from '../services/api'

const PAGE_CSS = `
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
  .send-input:focus { border-color: #25D366; }
`

const WA_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function SendRequest() {
  const [phone, setPhone]   = useState('')
  const [copied, setCopied] = useState(false)

  const biz        = authService.getBusiness()
  const bizName    = biz?.business_name || 'our business'
  const bizId      = biz?.id || ''
  const base       = import.meta.env.VITE_APP_URL || window.location.origin
  const reviewLink = bizId ? `${base}/review/${bizId}` : ''

  const cleanPhone  = phone.trim().replace(/\D/g, '')
  const canOpen     = cleanPhone.length === 10 && reviewLink

  function handleOpenWhatsApp() {
    if (!canOpen) return
    const waPhone = `91${cleanPhone}`
    const text = `Hi! Thank you for visiting ${bizName} 🙏\n\nWe'd love your feedback. It takes just 30 seconds:\n👉 ${reviewLink}\n\nYour review helps us improve!`
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function handleCopyLink() {
    if (!reviewLink) return
    try {
      await navigator.clipboard.writeText(reviewLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API not available — silent fail
    }
  }

  return (
    <div className="fade-up">
      <style>{PAGE_CSS}</style>

      <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
        Send via WhatsApp
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
        Enter a customer's number — WhatsApp will open with your review link ready to send.
      </p>

      <div style={{ maxWidth: 480 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0' }}>

          {/* Phone input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Customer Phone Number
            </label>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#475569', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', userSelect: 'none' }}>
                +91
              </div>
              <input
                type="tel"
                className="send-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                style={{ borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
              />
            </div>
          </div>

          {/* Preview of message */}
          {reviewLink && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#166534', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 12, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Message preview</p>
              <p style={{ margin: 0 }}>
                Hi! Thank you for visiting <strong>{bizName}</strong> 🙏<br />
                We'd love your feedback. It takes just 30 seconds:<br />
                👉 <span style={{ wordBreak: 'break-all', color: '#047857' }}>{reviewLink}</span><br />
                Your review helps us improve!
              </p>
            </div>
          )}

          {/* Open WhatsApp button */}
          <button
            onClick={handleOpenWhatsApp}
            disabled={!canOpen}
            style={{
              width: '100%', padding: '13px 16px',
              background: canOpen ? '#25D366' : '#94a3b8',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: canOpen ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={(e) => { if (canOpen) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            {WA_ICON}
            Open in WhatsApp →
          </button>

          {/* Disclaimer */}
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
            This will open WhatsApp on your phone. The message is sent from your number.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '20px 0' }} />

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            disabled={!reviewLink}
            style={{
              width: '100%', padding: '11px 16px',
              background: 'white', color: copied ? '#10b981' : '#374151',
              border: `1.5px solid ${copied ? '#10b981' : '#e2e8f0'}`,
              borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: reviewLink ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Review Link'}
          </button>
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
            Paste in SMS, email, or any other app.
          </p>

        </div>
      </div>
    </div>
  )
}
