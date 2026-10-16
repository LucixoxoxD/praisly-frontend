import { useState, useEffect, useRef, useMemo } from 'react'
import QRCodeStyling from 'qr-code-styling'
import html2canvas from 'html2canvas'
import api from '../services/api'
import { useToast } from '../components/Toast'
import PrintableReviewCard from '../components/PrintableReviewCard'

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
  const qrRef = useRef(null)
  const qrInstance = useRef(null)

  const [reviewUrl, setReviewUrl] = useState('')
  const [bizName, setBizName]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [reviewStats, setReviewStats] = useState(null)
  const [reviewsPage, setReviewsPage] = useState(null)
  const [recentCutoff] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  // Create QR instance once on mount
  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      width: 220,
      height: 220,
      type: 'svg',
      margin: 32,
      data: 'https://placeholder.com',
      dotsOptions: { color: '#1a1a1a', type: 'rounded' },
      cornersSquareOptions: { type: 'extra-rounded', color: '#1a1a1a' },
      cornersDotOptions: { color: '#1a1a1a' },
      backgroundOptions: { color: '#ffffff' },
    })
  }, [])

  // Append QR to DOM once the card is visible (after loading flips false)
  useEffect(() => {
    if (!loading && qrRef.current && qrInstance.current) {
      qrRef.current.innerHTML = ''
      qrInstance.current.append(qrRef.current)
      if (reviewUrl) qrInstance.current.update({ data: reviewUrl })
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep QR data in sync when URL changes
  useEffect(() => {
    if (reviewUrl && qrInstance.current) {
      qrInstance.current.update({ data: reviewUrl })
    }
  }, [reviewUrl])

  useEffect(() => {
    api.get('/api/qr/info')
      .then(res => {
        setReviewUrl(res.data.review_url)
        setBizName(res.data.business_name)
      })
      .catch(() => setError('Failed to load QR code. Please try again.'))
      .finally(() => setLoading(false))

    api.get('/api/reviews/stats')
      .then(r => setReviewStats(r.data))
      .catch(err => console.warn('[QRCode] reviews/stats failed:', err?.response?.status, err?.message))

    api.get('/api/reviews/list?limit=50&page=1')
      .then(r => setReviewsPage(r.data))
      .catch(err => console.warn('[QRCode] reviews/list failed:', err?.response?.status, err?.message))
  }, [])

  const qrMetrics = useMemo(() => {
    const totalReviews = reviewsPage?.total ?? reviewsPage?.reviews?.length ?? 0
    const dist = reviewStats?.rating_distribution || {}
    const positive = Number(dist['4'] || 0) + Number(dist['5'] || 0)
    const reviews = reviewsPage?.reviews || []
    const privateCount = reviews.filter(r => r.status === 'private').length
    const scans = totalReviews
    const convPct = scans > 0 ? Math.round(totalReviews / scans * 100) : 0
    const scansThisWeek = reviews.filter(r => r.created_at && r.created_at >= recentCutoff).length
    return { scans, totalReviews, positive, privateCount, convPct, scansThisWeek }
  }, [reviewStats, reviewsPage, recentCutoff])

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
    if (!cardRef.current || !reviewUrl || downloading) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
        // Capture the same print layout on phones and desktops.
        windowWidth: 1280,
        onclone: (_document, card) => {
          card.style.width = '420px'
          card.style.maxWidth = 'none'
          card.style.padding = '30px 24px 24px'
        },
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
        <div style={{
          width: 32, height: 32,
          border: '3px solid #e2e8f0',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
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

      <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
        QR Code
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 24px' }}>
        Track and manage your review collection touchpoint.
      </p>

      {/* Performance stats */}
      <div className="qr-stats-grid">
        <div className="qr-stat-card">
          <div className="qr-stat-icon" style={{ background: '#EFF6FF' }}>📷</div>
          <div className="qr-stat-label">Total scans</div>
          <div className="qr-stat-sub">Customers who scanned your QR</div>
          <div className="qr-stat-val">{qrMetrics.scans.toLocaleString('en-IN')}</div>
          {qrMetrics.scansThisWeek > 0
            ? <p className="qr-stat-trend positive">↑ {qrMetrics.scansThisWeek} this week</p>
            : <p className="qr-stat-trend">No scans this week</p>}
        </div>
        <div className="qr-stat-card">
          <div className="qr-stat-icon" style={{ background: 'var(--gold-soft)' }}>⭐</div>
          <div className="qr-stat-label">Reviews collected</div>
          <div className="qr-stat-sub">Completed the review flow</div>
          <div className="qr-stat-val">{qrMetrics.totalReviews.toLocaleString('en-IN')}</div>
          <p className="qr-stat-trend">{qrMetrics.positive} positive &middot; {qrMetrics.privateCount} private</p>
        </div>
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

      {/* Card + controls + right panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* Left column: printable card + action buttons */}
        <div>
          <PrintableReviewCard businessName={bizName} cardRef={cardRef} qrRef={qrRef} />

          <p style={{ fontSize: 13, color: '#64748b', margin: '12px 0 4px', lineHeight: 1.5 }}>
            Download and print for your counter, reception desk or tables. Keep the white space around the code and test a scan before printing in bulk.
          </p>

          {/* URL row */}
          <div style={{
            background: '#f8fafc',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            margin: '12px 0',
            border: '1px solid #e2e8f0',
          }}>
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
                flex: '1 1 130px',
                minHeight: 44,
                whiteSpace: 'nowrap',
                padding: '11px',
                background: '#242720',
                color: '#fffdf5',
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
              ) : '↓ Download'}
            </button>

            <button
              onClick={handleWhatsApp}
              style={{
                flex: '1 1 130px',
                minHeight: 44,
                whiteSpace: 'nowrap',
                padding: '11px',
                background: '#e4e8d8',
                color: '#35402d',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              WhatsApp
            </button>

            <button
              onClick={handleCopy}
              style={{
                flex: '1 1 130px',
                minHeight: 44,
                whiteSpace: 'nowrap',
                padding: '11px',
                background: '#242720',
                color: '#fffdf5',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          </div>
        </div>

        {/* Right panel: how it works + pro tip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e2e8f0',
          }}>
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
                <div style={{
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
                }}>
                  {n}
                </div>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 16,
            padding: 24,
            color: 'white',
          }}>
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
