import { useState, useEffect, useRef, useMemo } from 'react'
import html2canvas from 'html2canvas'
import api from '../services/api'
import { useToast } from '../components/Toast'

const PAGE_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .qr-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  .qr-stat-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 20px;
  }
  .qr-stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: grid; place-items: center; font-size: 18px;
    margin-bottom: 12px; flex-shrink: 0;
  }
  .qr-stat-label { font-size: 13px; font-weight: 600; color: var(--ink); margin: 0 0 2px; }
  .qr-stat-sub { font-size: 11px; color: var(--ink-4); margin: 0 0 10px; line-height: 1.4; }
  .qr-stat-val { font-size: 32px; font-weight: 800; color: var(--ink); line-height: 1; margin-bottom: 12px; }
  .qr-stat-trend { font-size: 12px; color: var(--ink-4); margin: 0; }
  .qr-stat-trend.positive { color: var(--win); }
  .qr-bar-track { width: 100%; height: 4px; background: var(--line); border-radius: 2px; overflow: hidden; }
  .qr-bar-fill { height: 4px; border-radius: 2px; background: var(--primary); }
  @media (max-width: 768px) {
    .qr-stats-grid { grid-template-columns: 1fr; }
  }
`

export default function QRCode() {
  const toast = useToast()
  const cardRef = useRef(null)
  const [qrObjectUrl, setQrObjectUrl] = useState(null)
  const [reviewUrl, setReviewUrl]     = useState('')
  const [bizName, setBizName]         = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [copied, setCopied]           = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [praislyReviews, setPraislyReviews] = useState([])
  const [scanCount, setScanCount]           = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/qr/generate', { responseType: 'blob' }),
      api.get('/api/qr/info'),
    ])
      .then(([imgRes, infoRes]) => {
        setQrObjectUrl(URL.createObjectURL(imgRes.data))
        setReviewUrl(infoRes.data.review_url)
        setBizName(infoRes.data.business_name)
        console.log('[QRCode] qr/info:', infoRes.data)
        // Use scan_count if the endpoint returns it
        if (typeof infoRes.data.scan_count === 'number') {
          setScanCount(infoRes.data.scan_count)
        }
      })
      .catch(() => setError('Failed to load QR code. Please try again.'))
      .finally(() => setLoading(false))

    // Praisly-only reviews (not Google all-time count)
    // TODO: separate scan tracking from review tracking — scan_count should come from review_requests table
    api.get('/api/reviews/list?limit=500&page=1')
      .then(r => {
        const reviews = r.data?.reviews || r.data || []
        console.log('[QRCode] praisly reviews sample:', reviews[0], 'total:', reviews.length)
        setPraislyReviews(reviews)
        // Use total field from response if available (authoritative count)
        if (typeof r.data?.total === 'number') {
          setScanCount(prev => prev !== null ? prev : r.data.total)
        }
      })
      .catch(() => {})

    return () => {
      if (qrObjectUrl) URL.revokeObjectURL(qrObjectUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const qrMetrics = useMemo(() => {
    const totalReviews = praislyReviews.length
    const positive = praislyReviews.filter(r => Number(r.rating) >= 4).length
    const privateCount = praislyReviews.filter(r => r.status === 'private').length
    // TODO: separate scan tracking from review tracking
    // scanCount will equal totalReviews until a dedicated scan_count endpoint exists
    const scans = scanCount !== null ? scanCount : totalReviews
    const convPct = scans > 0 ? Math.round(totalReviews / scans * 100) : 0
    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const scansThisWeek = praislyReviews.filter(r => r.created_at && r.created_at >= recentCutoff).length
    console.log('[QRCode] metrics:', { totalReviews, positive, privateCount, scans, convPct, scansThisWeek })
    return { scans, totalReviews, positive, privateCount, convPct, scansThisWeek }
  }, [praislyReviews, scanCount])

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
      a.download = `${(bizName || 'business').replace(/\s+/g, '-')}-QR-Praisly.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast('QR Code downloaded!')
    } catch {
      toast('Download failed', 'error')
    } finally {
      setDownloading(false)
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(`Check out ${bizName}! Leave a review here: ${reviewUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <style>{PAGE_CSS}</style>
        <div
          style={{
            width: 32, height: 32,
            border: '3px solid #e2e8f0',
            borderTopColor: 'var(--primary)',
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
        <style>{PAGE_CSS}</style>
        <p style={{ fontSize: 32, marginBottom: 12 }}>😕</p>
        <p style={{ color: '#64748b' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="fade-up">
      <style>{PAGE_CSS}</style>

      {/* Page title */}
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
        QR Code
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 24px' }}>
        Track and manage your review collection touchpoint.
      </p>

      {/* ── Performance stats ── */}
      <div className="qr-stats-grid">

        {/* Card 1: Total scans */}
        <div className="qr-stat-card">
          <div className="qr-stat-icon" style={{ background: '#EFF6FF' }}>📷</div>
          <div className="qr-stat-label">Total scans</div>
          <div className="qr-stat-sub">Customers who scanned your QR</div>
          <div className="qr-stat-val">{qrMetrics.scans.toLocaleString('en-IN')}</div>
          {qrMetrics.scansThisWeek > 0
            ? <p className="qr-stat-trend positive">↑ {qrMetrics.scansThisWeek} this week</p>
            : <p className="qr-stat-trend">No scans this week</p>
          }
        </div>

        {/* Card 2: Reviews collected */}
        <div className="qr-stat-card">
          <div className="qr-stat-icon" style={{ background: 'var(--gold-soft)' }}>⭐</div>
          <div className="qr-stat-label">Reviews collected</div>
          <div className="qr-stat-sub">Completed the review flow</div>
          <div className="qr-stat-val">{qrMetrics.totalReviews.toLocaleString('en-IN')}</div>
          <p className="qr-stat-trend">
            {qrMetrics.positive} positive &middot; {qrMetrics.privateCount} private
          </p>
        </div>

        {/* Card 3: Conversion rate */}
        <div className="qr-stat-card">
          <div className="qr-stat-icon" style={{ background: 'var(--win-soft)' }}>📈</div>
          <div className="qr-stat-label">Scan → Review rate</div>
          <div className="qr-stat-sub">How many scans become reviews</div>
          <div className="qr-stat-val">{qrMetrics.convPct}%</div>
          <div className="qr-bar-track">
            <div className="qr-bar-fill" style={{ width: `${Math.min(qrMetrics.convPct, 100)}%` }} />
          </div>
        </div>

      </div>

      {/* ── QR card (unchanged) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Left column: card + controls */}
        <div>

          {/* White margin wrapper — captured by html2canvas for print-ready PNG */}
          <div
            ref={cardRef}
            style={{
              background: 'white',
              padding: 20,
              display: 'inline-block',
              width: '100%',
              maxWidth: 380,
              boxSizing: 'border-box',
            }}
          >
            {/* Branded card */}
            <div
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                textAlign: 'center',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  background: 'var(--primary)',
                  padding: '20px 24px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui",
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'white',
                    margin: '0 0 6px',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {bizName}
                </p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Share your experience with us
                </p>
              </div>

              {/* QR area */}
              <div style={{ background: 'white', padding: '32px 32px 24px' }}>
                <img
                  src={qrObjectUrl}
                  alt="Review QR Code"
                  style={{
                    width: 220,
                    height: 220,
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
                <div style={{ borderTop: '1.5px dashed #d1d5db', margin: '20px 0 16px' }} />
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                  📱 Scan with your phone camera
                </p>
              </div>

              {/* Branding footer */}
              <div
                style={{
                  background: '#f8fafc',
                  borderTop: '1px solid #e5e7eb',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11, color: '#9ca3af' }}>Powered by</span>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui",
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    letterSpacing: '-0.2px',
                  }}
                >
                  Praisly ⭐
                </span>
              </div>
            </div>
          </div>

          {/* Print instruction */}
          <p style={{ fontSize: 13, color: '#64748b', margin: '12px 0 4px', lineHeight: 1.5 }}>
            💡 Print this and place it at your checkout counter, reception desk, or dining table
          </p>

          {/* URL row */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              margin: '12px 0',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ color: '#64748b', fontSize: 12, wordBreak: 'break-all', textAlign: 'left', flex: 1 }}>
              {reviewUrl}
            </span>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0,
                padding: '5px 10px',
                background: copied ? 'var(--primary-soft)' : '#f1f5f9',
                color: copied ? 'var(--primary-ink)' : '#374151',
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                flex: 1,
                padding: '11px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: downloading ? 'not-allowed' : 'pointer',
                opacity: downloading ? 0.7 : 1,
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {downloading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Saving…
                </>
              ) : (
                '↓ Download'
              )}
            </button>

            <button
              onClick={handleWhatsApp}
              style={{
                flex: 1,
                padding: '11px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              WhatsApp
            </button>

            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '11px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
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
                    width: 24, height: 24,
                    borderRadius: '50%',
                    background: 'var(--primary-soft)',
                    color: 'var(--primary-ink)',
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
