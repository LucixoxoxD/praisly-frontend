import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import api from '../../services/api'

const STEP_CSS = `
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  .ob-complete-card {
    animation: popIn 0.3s ease forwards;
  }
`

function CheckCircle() {
  return (
    <div style={{
      width: 64, height: 64,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px',
      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}

export default function StepComplete({ biz, data }) {
  const cardRef = useRef(null)
  const [qrObjectUrl, setQrObjectUrl] = useState(null)
  const [reviewUrl, setReviewUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/qr/generate', { responseType: 'blob' }),
      api.get('/api/qr/info'),
    ])
      .then(([imgRes, infoRes]) => {
        setQrObjectUrl(URL.createObjectURL(imgRes.data))
        const base = import.meta.env.VITE_APP_URL || window.location.origin
        setReviewUrl(`${base}/review/${infoRes.data.business_id}`)
      })
      .catch(() => {})
      .finally(() => setQrLoading(false))

    return () => {
      if (qrObjectUrl) URL.revokeObjectURL(qrObjectUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* ignore */ }
  }

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `${biz?.business_name || 'review'}-qr.png`
      a.click()
    } catch { /* ignore */ } finally {
      setDownloading(false)
    }
  }

  const langLabel = { hindi: 'Hindi', english: 'English', both: 'Hindi & English' }

  return (
    <div className="ob-complete-card">
      <style>{STEP_CSS}</style>

      <CheckCircle />

      <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', textAlign: 'center' }}>
        You're all set!
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 28px', textAlign: 'center', lineHeight: 1.5 }}>
        Your review collection is ready to go.
      </p>

      {/* Summary card */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
        <Row icon="🏢" label="Business" value={biz?.business_name} />
        <Row icon="👤" label="Owner" value={data.ownerName} />
        <Row icon="📱" label="WhatsApp" value={`+91 ${data.phone}`} />
        <Row icon="🌐" label="Reviews in" value={langLabel[data.preferredLanguage] || 'Hindi & English'} last />
      </div>

      {/* QR code section */}
      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 10px' }}>
        Your QR code
      </p>

      {qrLoading ? (
        <div style={{ height: 160, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, border: '2px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : qrObjectUrl ? (
        <>
          {/* Branded card (captured for download) */}
          <div
            ref={cardRef}
            style={{
              background: 'white',
              borderRadius: 12,
              border: '1.5px solid #e2e8f0',
              padding: '16px',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {biz?.business_name}
            </p>
            <img src={qrObjectUrl} alt="QR" style={{ width: 140, height: 140, display: 'block', margin: '0 auto' }} />
            <p style={{ margin: '10px 0 0', fontSize: 11, color: '#64748b' }}>
              Scan to share your experience
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                flex: 1, padding: '10px', background: '#0f172a', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {downloading ? 'Saving…' : 'Download QR'}
            </button>
            <button
              onClick={handleCopy}
              style={{
                flex: 1, padding: '10px',
                background: copied ? '#f0fdf4' : 'white',
                color: copied ? '#10b981' : '#374151',
                border: `1.5px solid ${copied ? '#10b981' : '#e2e8f0'}`,
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      ) : null}

      {/* Go to dashboard */}
      <a
        href="/dashboard"
        style={{
          display: 'block', width: '100%', padding: '13px',
          background: '#10b981', color: 'white',
          border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
          textDecoration: 'none', boxSizing: 'border-box',
        }}
      >
        Go to Dashboard &rarr;
      </a>
    </div>
  )
}

function Row({ icon, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingBottom: last ? 0 : 10, marginBottom: last ? 0 : 10,
      borderBottom: last ? 'none' : '1px solid #e2e8f0',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#64748b', minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1 }}>{value || '—'}</span>
    </div>
  )
}
