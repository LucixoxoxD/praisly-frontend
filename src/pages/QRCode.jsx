import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'

const PAGE_STYLE = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes spin   { to { transform: rotate(360deg); } }
`

export default function QRCode() {
  const toast = useToast()
  const [qrObjectUrl, setQrObjectUrl] = useState(null)
  const [reviewUrl, setReviewUrl]     = useState('')
  const [bizName, setBizName]         = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [copied, setCopied]           = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/qr/generate', { responseType: 'blob' }),
      api.get('/api/qr/info'),
    ])
      .then(([imgRes, infoRes]) => {
        setQrObjectUrl(URL.createObjectURL(imgRes.data))
        setReviewUrl(infoRes.data.review_url)
        setBizName(infoRes.data.business_name)
      })
      .catch(() => setError('Failed to load QR code. Please try again.'))
      .finally(() => setLoading(false))

    return () => {
      if (qrObjectUrl) URL.revokeObjectURL(qrObjectUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      toast('Link copied to clipboard!')
    } catch {
      toast('Could not copy — please copy manually', 'error')
    }
  }

  function handleDownload() {
    api.get('/api/qr/download', { responseType: 'blob' })
      .then((res) => {
        const url = URL.createObjectURL(res.data)
        const a = document.createElement('a')
        a.href = url
        a.download = `${bizName.replace(/\s+/g, '_')}_qr.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast('QR Code downloaded!')
      })
      .catch(() => toast('Download failed', 'error'))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <style>{PAGE_STYLE}</style>
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <style>{PAGE_STYLE}</style>
        <p style={{ fontSize: 32, marginBottom: 12 }}>😕</p>
        <p style={{ color: '#64748b' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <style>{PAGE_STYLE}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 22,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 24,
        }}
      >
        QR Code
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* QR card */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <img
            src={qrObjectUrl}
            alt="Review QR Code"
            style={{
              width: 220,
              height: 220,
              display: 'block',
              margin: '0 auto 20px',
              borderRadius: 8,
              border: '1px solid #f1f5f9',
            }}
          />

          <p style={{ color: '#374151', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>
            {bizName}
          </p>

          {/* URL row */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <span
              style={{
                color: '#64748b',
                fontSize: 12,
                wordBreak: 'break-all',
                textAlign: 'left',
                flex: 1,
              }}
            >
              {reviewUrl}
            </span>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0,
                padding: '5px 10px',
                background: copied ? '#d1fae5' : '#f1f5f9',
                color: copied ? '#065f46' : '#374151',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: '11px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              ↓ Download
            </button>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '11px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          </div>
        </div>

        {/* Right panel: instructions + tip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #e2e8f0',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>
              📋 How it works
            </h3>
            {[
              ['1', 'Print the QR code and place it at your counter'],
              ['2', 'Customer scans it with their phone camera'],
              ['3', 'They rate and select what they enjoyed'],
              ['4', 'AI generates a personalised review draft'],
              ['5', 'Customer posts it directly to Google'],
            ].map(([n, text]) => (
              <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#d1fae5',
                    color: '#065f46',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {n}
                </div>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 16,
              padding: 24,
              color: 'white',
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>💡 Pro tip</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
              Place the QR code where customers naturally pause — near the checkout counter, on the dining
              table, or at the reception desk. Easier to scan = more reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
