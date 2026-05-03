import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const CLIENT_TIMEOUT_MS = 8000

const BIZ_EMOJI = {
  dentist: '🦷', salon: '💇', gym: '💪', restaurant: '🍽️',
  coaching: '📚', ca_firm: '📊', other: '⭐',
}

const STAR_REACTIONS = {
  1: { emoji: '😞', label: 'That bad, huh?' },
  2: { emoji: '😕', label: 'Could be better' },
  3: { emoji: '😐', label: 'Just okay?' },
  4: { emoji: '😊', label: 'Glad you liked it!' },
  5: { emoji: '🤩', label: 'Amazing!' },
}

function buildFallbacks(name, tags) {
  const t1 = tags[0] || 'service'
  const t2 = tags[1] || 'staff'
  return {
    hinglish: [],
    english: [
      `Good experience at ${name}. The ${t1} and ${t2} were both solid.`,
      `Visited ${name}. Liked the ${t1} especially. ${t2} was good too. Would return.`,
      `${name} was worth it. ${t1} stood out and ${t2} was also fine.`,
    ],
  }
}

function flatDrafts(drafts) {
  if (!drafts) return []
  return drafts.english || []
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

  @keyframes cr-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes cr-spin { to { transform: rotate(360deg); } }
  @keyframes cr-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes cr-popIn {
    0%   { transform: scale(0.7); opacity: 0; }
    65%  { transform: scale(1.18); }
    100% { transform: scale(1);   opacity: 1; }
  }

  .cr-wrap {
    min-height: 100vh;
    background: #f7f5f0;
    font-family: 'Nunito', system-ui, sans-serif;
    display: flex;
    justify-content: center;
  }
  .cr-shell {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    padding-bottom: 48px;
  }
  .cr-topbar {
    display: flex;
    align-items: center;
    padding: 16px 20px 4px;
    min-height: 56px;
  }
  .cr-back {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1.5px solid #e0ddd8;
    background: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 17px; color: #555;
    flex-shrink: 0;
    transition: background 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .cr-back:active { background: #eee; }

  .cr-dots { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .cr-dot  { height: 8px; border-radius: 4px; transition: all 0.3s; }

  .cr-body { padding: 12px 24px 0; animation: cr-fadeUp 0.28s ease both; }

  .cr-avatar {
    width: 68px; height: 68px; border-radius: 20px;
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px;
    margin: 0 auto 12px;
    box-shadow: 0 6px 20px rgba(37,211,102,0.28);
  }
  .cr-biz-name { font-size: 18px; font-weight: 800; color: #1a1a1a; text-align: center; margin: 0 0 3px; }
  .cr-biz-city { font-size: 13px; color: #999; text-align: center; margin: 0 0 28px; }

  .cr-h1 { font-size: 22px; font-weight: 800; color: #1a1a1a; text-align: center; margin: 0 0 6px; }
  .cr-sub { font-size: 14px; color: #aaa; text-align: center; margin: 0 0 28px; font-weight: 600; }

  .cr-stars { display: flex; justify-content: center; gap: 10px; margin-bottom: 12px; }
  .cr-star {
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 48px; line-height: 1;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.12s;
  }
  .cr-star:active { transform: scale(0.88) !important; }

  .cr-reaction {
    text-align: center; height: 34px; margin-bottom: 22px;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-size: 15px; font-weight: 800; color: #444;
    animation: cr-popIn 0.22s ease both;
  }

  .cr-btn {
    width: 100%; padding: 15px;
    border-radius: 14px; border: none;
    font-size: 16px; font-weight: 800; color: white;
    cursor: pointer; font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
    -webkit-tap-highlight-color: transparent;
    margin-bottom: 10px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cr-btn:active { transform: scale(0.98); }
  .cr-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none !important; }

  .cr-ghost {
    width: 100%; padding: 12px;
    border-radius: 14px; border: none; background: transparent;
    font-size: 14px; font-weight: 700; color: #bbb;
    cursor: pointer; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
  .cr-ghost:active { color: #888; }

  .cr-card {
    background: white; border-radius: 20px; padding: 20px;
    margin-bottom: 14px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 14px rgba(0,0,0,0.05);
  }

  .cr-chip {
    padding: 10px 16px; border-radius: 100px;
    border: 2px solid #e0ddd8; background: white;
    font-size: 14px; font-weight: 700; color: #555;
    cursor: pointer; font-family: inherit;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .cr-chip.on {
    border-color: #25D366; background: #f0fdf4; color: #16a34a;
  }
  .cr-chip:active { transform: scale(0.95); }

  .cr-ai-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1px solid #bbf7d0;
    color: #16a34a; font-size: 12px; font-weight: 800;
    padding: 5px 13px; border-radius: 100px;
  }

  .cr-hint {
    background: #fffbeb; border: 1px solid #fde68a;
    border-radius: 12px; padding: 12px 16px;
    font-size: 13px; color: #92400e; font-weight: 700;
    text-align: center; margin-bottom: 14px;
  }

  .cr-shimmer-bar {
    border-radius: 7px;
    background: linear-gradient(90deg, #ece9e4 25%, #e2dfd9 50%, #ece9e4 75%);
    background-size: 800px 100%;
    animation: cr-shimmer 1.5s infinite;
  }

  .cr-powered {
    text-align: center; font-size: 12px; color: #ccc;
    margin-top: 28px; font-weight: 600;
  }
  .cr-powered b { color: #25D366; }

  .cr-carousel {
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 -24px;
    gap: 0;
  }
  .cr-carousel::-webkit-scrollbar { display: none; }
  .cr-carousel-item {
    min-width: 100%;
    padding: 0 24px;
    box-sizing: border-box;
    scroll-snap-align: center;
  }
  .cr-nav-btn {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid #e0ddd8; background: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; color: #555;
    transition: background 0.15s;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }
  .cr-nav-btn:disabled { opacity: 0.3; cursor: default; }
  .cr-nav-btn:not(:disabled):active { background: #eee; }

  .cr-spinner {
    width: 34px; height: 34px;
    border: 3px solid #e5e5e5;
    border-top-color: #25D366;
    border-radius: 50%;
    animation: cr-spin 0.8s linear infinite;
    margin: 0 auto;
  }
`

function Dots({ step, total }) {
  return (
    <div className="cr-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="cr-dot"
          style={{
            width: i + 1 === step ? 20 : 8,
            background: i < step ? '#25D366' : '#ddd8d0',
          }}
        />
      ))}
    </div>
  )
}

export default function CustomerReview() {
  const { businessId } = useParams()

  const [screen, setScreen]   = useState('loading')
  const [business, setBusiness] = useState(null)
  const [tags, setTags]       = useState([])
  const [error, setError]     = useState(null)

  // Screen 1
  const [rating, setRating]         = useState(0)
  const [hovered, setHovered]       = useState(0)

  // Screen 2
  const [selectedTags, setSelectedTags] = useState([])
  const [customerName, setCustomerName] = useState('')

  // Screen 3
  const [submitting, setSubmitting]       = useState(false)
  const [submitResult, setSubmitResult]   = useState(null)
  const [draftsReady, setDraftsReady]     = useState(false)
  const [showShimmer, setShowShimmer]     = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [copiedIndex, setCopiedIndex]     = useState(-1)
  const [googleClicked, setGoogleClicked] = useState(false)
  const [extraFeedback, setExtraFeedback] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [limitReached, setLimitReached]       = useState(false)

  const fallbackTimer  = useRef(null)
  const shimmerTimer   = useRef(null)
  const carouselRef    = useRef(null)

  useEffect(() => {
    api
      .get(`/api/review/${businessId}`)
      .then((res) => {
        setBusiness(res.data)
        setTags(res.data.tags || [])
        setScreen('s1')
      })
      .catch(() => {
        setError('This review link is not valid or has expired.')
        setScreen('error')
      })
  }, [businessId])

  useEffect(() => () => {
    clearTimeout(fallbackTimer.current)
    clearTimeout(shimmerTimer.current)
  }, [])

  const isPositive = rating >= 4
  const bizEmoji   = BIZ_EMOJI[business?.business_type] || '⭐'
  const bizName    = business?.business_name || ''
  const bizCity    = business?.city || ''

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // ── Submit (called from Screen 2 for positive, Screen 1 for negative) ───────
  async function handleSubmit(tagsToSend) {
    setSubmitting(true)
    setScreen('s3')
    setShowShimmer(true)
    setDraftsReady(false)

    shimmerTimer.current = setTimeout(() => setShowShimmer(false), 1200)

    if (isPositive) {
      fallbackTimer.current = setTimeout(() => {
        setSubmitResult((prev) => {
          if (prev?.drafts) return prev
          return {
            path: 'positive',
            review_id: null,
            google_review_url: business?.google_review_url || null,
            drafts: buildFallbacks(bizName, tagsToSend),
          }
        })
        setDraftsReady(true)
      }, CLIENT_TIMEOUT_MS)
    }

    try {
      const res = await api.post(`/api/review/${businessId}/submit`, {
        rating,
        selected_tags: tagsToSend,
        custom_tag: null,
        customer_name: customerName.trim() || null,
        customer_phone: '',
      })
      clearTimeout(fallbackTimer.current)
      setSubmitResult(res.data)
      setDraftsReady(true)
    } catch (err) {
      clearTimeout(fallbackTimer.current)
      clearTimeout(shimmerTimer.current)
      if (err.response?.status === 403) {
        setLimitReached(true)
        setScreen('done')
        setSubmitting(false)
        return
      }
      if (isPositive) {
        setSubmitResult({
          path: 'positive',
          review_id: null,
          google_review_url: business?.google_review_url || null,
          drafts: buildFallbacks(bizName, tagsToSend),
        })
      } else {
        setSubmitResult({ path: 'negative', review_id: null })
      }
      setDraftsReady(true)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Draft actions ─────────────────────────────────────────────────────────
  const allDrafts    = flatDrafts(submitResult?.drafts)
  const currentDraft = allDrafts[carouselIndex] || ''

  function handleCarouselScroll() {
    if (!carouselRef.current) return
    const el  = carouselRef.current
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setCarouselIndex(Math.max(0, Math.min(idx, allDrafts.length - 1)))
  }

  function scrollToCard(i) {
    if (!carouselRef.current) return
    carouselRef.current.scrollTo({ left: i * carouselRef.current.offsetWidth, behavior: 'smooth' })
    setCarouselIndex(i)
  }

  async function handleCopyCard(draft, idx) {
    try { await navigator.clipboard.writeText(draft) } catch {}
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(-1), 1500)
    try {
      if (submitResult?.review_id) {
        await api.post(`/api/review/${businessId}/select-draft`, {
          review_id: submitResult.review_id,
          selected_draft: draft,
        })
      }
    } catch {}
  }

  function handleOpenGoogle() {
    if (currentDraft) navigator.clipboard.writeText(currentDraft).catch(() => {})
    if (submitResult?.google_review_url) {
      window.open(submitResult.google_review_url, '_blank', 'noopener')
    }
    setGoogleClicked(true)
  }

  async function handleConfirmPosted() {
    try {
      if (submitResult?.review_id) {
        await api.post(`/api/review/${businessId}/confirm-posted`, {
          review_id: submitResult.review_id,
        })
      }
    } catch {}
    setScreen('done')
  }

  async function handleFeedbackSubmit() {
    setSendingFeedback(true)
    try {
      if (submitResult?.review_id) {
        await api.post(`/api/review/${businessId}/private-feedback`, {
          review_id: submitResult.review_id,
          feedback_text: extraFeedback.trim() || '(no additional feedback)',
        })
      }
    } catch {}
    setSendingFeedback(false)
    setScreen('done')
  }

  // ── Star display color ────────────────────────────────────────────────────
  const displayRating = hovered || rating
  function starColor(star) {
    if (star > displayRating) return '#e0ddd8'
    if (displayRating >= 4)   return '#25D366'
    if (displayRating === 3)  return '#f59e0b'
    return '#ef4444'
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="cr-wrap">
        <div className="cr-shell">

          {/* ── LOADING ── */}
          {screen === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 120 }}>
              <div className="cr-spinner" />
            </div>
          )}

          {/* ── ERROR ── */}
          {screen === 'error' && (
            <div style={{ textAlign: 'center', marginTop: 100, padding: '0 28px', animation: 'cr-fadeUp 0.3s ease' }}>
              <p style={{ fontSize: 52, marginBottom: 16 }}>😕</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#555' }}>{error}</p>
            </div>
          )}

          {/* ══ SCREEN 1: STAR RATING ═══════════════════════════════════════════ */}
          {screen === 's1' && (
            <>
              <div className="cr-topbar">
                <div style={{ width: 38 }} />
                <Dots step={1} total={3} />
                <div style={{ width: 38 }} />
              </div>

              <div className="cr-body">
                <div className="cr-avatar">{bizEmoji}</div>
                <p className="cr-biz-name">{bizName}</p>
                {bizCity && <p className="cr-biz-city">📍 {bizCity}</p>}

                <h1 className="cr-h1">How was your experience?</h1>
                <p className="cr-sub">Tap a star to rate your visit</p>

                <div className="cr-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="cr-star"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      style={{ transform: star <= displayRating ? 'scale(1.08)' : 'scale(1)' }}
                    >
                      <span style={{ color: starColor(star), transition: 'color 0.15s' }}>★</span>
                    </button>
                  ))}
                </div>

                {rating > 0 ? (
                  <div className="cr-reaction" key={rating}>
                    <span style={{ fontSize: 24 }}>{STAR_REACTIONS[rating].emoji}</span>
                    {STAR_REACTIONS[rating].label}
                  </div>
                ) : (
                  <div style={{ height: 34, marginBottom: 22 }} />
                )}

                <button
                  className="cr-btn"
                  disabled={rating === 0}
                  style={{
                    background: rating === 0
                      ? '#d0cdc8'
                      : isPositive
                      ? '#25D366'
                      : '#f97316',
                  }}
                  onClick={() => {
                    if (!rating) return
                    if (isPositive) setScreen('s2')
                    else handleSubmit([])
                  }}
                >
                  {rating === 0
                    ? 'Select a rating'
                    : isPositive
                    ? 'Continue →'
                    : 'Share private feedback'}
                </button>

                <button className="cr-ghost" onClick={() => setScreen('done')}>
                  Skip feedback
                </button>

                <p className="cr-powered">Powered by <b>Praisly</b></p>
              </div>
            </>
          )}

          {/* ══ SCREEN 2: SUGGESTION CHIPS ══════════════════════════════════════ */}
          {screen === 's2' && (
            <>
              <div className="cr-topbar">
                <button className="cr-back" onClick={() => setScreen('s1')}>←</button>
                <Dots step={2} total={3} />
                <div style={{ width: 38 }} />
              </div>

              <div className="cr-body">
                <h1 className="cr-h1">Great! What did you love?</h1>
                <p className="cr-sub">Pick everything that stood out</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      className={`cr-chip${selectedTags.includes(tag) ? ' on' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <p style={{
                  fontSize: 13, fontWeight: 800, marginBottom: 18,
                  color: selectedTags.length > 0 ? '#25D366' : '#bbb',
                }}>
                  {selectedTags.length > 0
                    ? `${selectedTags.length} highlight${selectedTags.length !== 1 ? 's' : ''} selected`
                    : 'Select at least one to continue'}
                </p>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: '1.5px solid #e0ddd8', borderRadius: 12,
                    fontSize: 14, fontFamily: 'inherit', color: '#333',
                    background: 'white', outline: 'none', marginBottom: 20,
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  className="cr-btn"
                  disabled={selectedTags.length === 0 || submitting}
                  style={{ background: selectedTags.length > 0 ? '#25D366' : '#d0cdc8' }}
                  onClick={() => handleSubmit(selectedTags)}
                >
                  {submitting ? 'Generating your review…' : 'Continue →'}
                </button>

                <p className="cr-powered">Powered by <b>Praisly</b></p>
              </div>
            </>
          )}

          {/* ══ SCREEN 3: AI REVIEW / NEGATIVE ══════════════════════════════════ */}
          {screen === 's3' && (
            <>
              <div className="cr-topbar">
                <button
                  className="cr-back"
                  onClick={() => setScreen(isPositive ? 's2' : 's1')}
                >
                  ←
                </button>
                <Dots step={isPositive ? 3 : 2} total={isPositive ? 3 : 2} />
                <div style={{ width: 38 }} />
              </div>

              <div className="cr-body">

                {/* ── LOADING STATE ── */}
                {(showShimmer || !draftsReady) && (
                  isPositive ? (
                    /* Shimmer skeleton for positive AI review */
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                        <span className="cr-ai-badge">✨ Personalising your review…</span>
                      </div>
                      <div className="cr-card">
                        <div className="cr-shimmer-bar" style={{ height: 13, width: '88%', marginBottom: 10 }} />
                        <div className="cr-shimmer-bar" style={{ height: 13, width: '72%', marginBottom: 10 }} />
                        <div className="cr-shimmer-bar" style={{ height: 13, width: '52%', marginBottom: 20 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid #f0ede8' }}>
                          <div className="cr-shimmer-bar" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div className="cr-shimmer-bar" style={{ height: 10, width: 80, marginBottom: 6 }} />
                            <div className="cr-shimmer-bar" style={{ height: 10, width: 50 }} />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Simple spinner for negative path */
                    <div style={{ textAlign: 'center', paddingTop: 56 }}>
                      <div className="cr-spinner" />
                    </div>
                  )
                )}

                {/* ── POSITIVE CONTENT ── */}
                {!showShimmer && draftsReady && submitResult?.path === 'positive' && (
                  <div style={{ animation: 'cr-fadeUp 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <span className="cr-ai-badge">✨ 3 AI-drafted reviews — pick your favourite</span>
                    </div>

                    {/* ── Carousel ── */}
                    <div
                      className="cr-carousel"
                      ref={carouselRef}
                      onScroll={handleCarouselScroll}
                    >
                      {allDrafts.map((draft, i) => {
                        const isCopied = copiedIndex === i
                        return (
                          <div key={i} className="cr-carousel-item">
                            <div
                              className="cr-card"
                              onClick={() => handleCopyCard(draft, i)}
                              style={{
                                position: 'relative', marginBottom: 0,
                                cursor: 'pointer',
                                border: isCopied ? '2px solid #25D366' : '1px solid rgba(0,0,0,0.06)',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                boxShadow: isCopied ? '0 0 0 4px rgba(37,211,102,0.12)' : '0 2px 14px rgba(0,0,0,0.05)',
                              }}
                            >
                              {/* Option label + copied indicator */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#25D366', letterSpacing: 0.5 }}>
                                  OPTION {i + 1}
                                </span>
                                {isCopied && (
                                  <span style={{
                                    fontSize: 12, fontWeight: 800, color: '#16a34a',
                                    background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                                    borderRadius: 8, padding: '4px 10px',
                                    animation: 'cr-fadeUp 0.15s ease',
                                  }}>
                                    ✓ Copied!
                                  </span>
                                )}
                              </div>

                              <p style={{ fontSize: 14, color: '#2d2d2d', lineHeight: 1.75, marginBottom: 16 }}>
                                {draft}
                              </p>

                              {/* Reviewer row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f0ede8', paddingTop: 14 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 15, color: 'white', fontWeight: 900,
                                }}>
                                  {customerName ? customerName[0].toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
                                    {customerName || 'Anonymous'}
                                  </p>
                                  <div style={{ display: 'flex', gap: 1, marginTop: 3 }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <span key={s} style={{ fontSize: 12, color: s <= rating ? '#25D366' : '#e0ddd8' }}>★</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Tap hint */}
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', fontWeight: 700, margin: '10px 0 2px' }}>
                      Tap a review to copy it
                    </p>

                    {/* Dots + arrows */}
                    {allDrafts.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '14px 0 4px' }}>
                        <button
                          className="cr-nav-btn"
                          disabled={carouselIndex === 0}
                          onClick={() => scrollToCard(carouselIndex - 1)}
                        >‹</button>
                        {allDrafts.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => scrollToCard(i)}
                            style={{
                              width: i === carouselIndex ? 20 : 8, height: 8,
                              borderRadius: 4, border: 'none', padding: 0,
                              background: i === carouselIndex ? '#25D366' : '#ddd8d0',
                              cursor: 'pointer', transition: 'all 0.3s',
                            }}
                          />
                        ))}
                        <button
                          className="cr-nav-btn"
                          disabled={carouselIndex === allDrafts.length - 1}
                          onClick={() => scrollToCard(carouselIndex + 1)}
                        >›</button>
                      </div>
                    )}

                    <div className="cr-hint" style={{ marginTop: 14 }}>📋 Copy a review → Paste on Google → Submit</div>

                    {/* Post on Google */}
                    <button
                      className="cr-btn"
                      style={{ background: '#4285F4' }}
                      onClick={handleOpenGoogle}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900, color: '#4285F4', flexShrink: 0,
                      }}>G</span>
                      Post on Google Maps
                    </button>

                    {googleClicked && (
                      <div style={{ animation: 'cr-fadeUp 0.25s ease', marginBottom: 2 }}>
                        <button
                          onClick={handleConfirmPosted}
                          style={{
                            width: '100%', padding: '13px', borderRadius: 14,
                            border: '2px solid #25D366', background: '#f0fdf4',
                            color: '#16a34a', fontSize: 14, fontWeight: 800,
                            cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
                          }}
                        >
                          ✓ I posted it!
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── NEGATIVE CONTENT ── */}
                {!showShimmer && draftsReady && submitResult?.path === 'negative' && (
                  <div style={{ animation: 'cr-fadeUp 0.3s ease' }}>
                    <div style={{ textAlign: 'center', marginBottom: 22 }}>
                      <p style={{ fontSize: 52, marginBottom: 14 }}>🙏</p>
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', marginBottom: 10 }}>
                        We're sorry to hear that.
                      </h2>
                      <p style={{ fontSize: 15, color: '#777', lineHeight: 1.65, fontWeight: 600 }}>
                        The owner has been notified and will follow up shortly.
                      </p>
                    </div>

                    <div className="cr-card">
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginBottom: 10 }}>
                        Want to share more details? (optional)
                      </p>
                      <textarea
                        value={extraFeedback}
                        onChange={(e) => setExtraFeedback(e.target.value)}
                        placeholder="Tell us what happened…"
                        rows={3}
                        style={{
                          width: '100%', padding: '12px',
                          border: '1.5px solid #e0ddd8', borderRadius: 10,
                          fontSize: 14, fontFamily: 'inherit', color: '#333',
                          resize: 'none', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      className="cr-btn"
                      style={{ background: '#374151' }}
                      disabled={sendingFeedback}
                      onClick={handleFeedbackSubmit}
                    >
                      {sendingFeedback ? 'Sending…' : 'Done'}
                    </button>
                  </div>
                )}

                <p className="cr-powered">Powered by <b>Praisly</b></p>
              </div>
            </>
          )}

          {/* ══ DONE ════════════════════════════════════════════════════════════ */}
          {screen === 'done' && limitReached && (
            <div style={{
              textAlign: 'center', marginTop: 100, padding: '0 28px',
              animation: 'cr-fadeUp 0.35s ease',
            }}>
              <p style={{ fontSize: 58, marginBottom: 18 }}>🙏</p>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', marginBottom: 10 }}>
                Thank you for visiting!
              </h2>
              <p style={{ fontSize: 15, color: '#999', lineHeight: 1.65, fontWeight: 600, marginBottom: 28 }}>
                This business's review collection is currently paused. We appreciate your feedback!
              </p>
              <button
                className="cr-btn"
                style={{ background: '#374151', maxWidth: 200, margin: '0 auto' }}
                onClick={() => window.history.back()}
              >
                Done
              </button>
            </div>
          )}

          {screen === 'done' && !limitReached && (
            <div style={{
              textAlign: 'center', marginTop: 100, padding: '0 28px',
              animation: 'cr-fadeUp 0.35s ease',
            }}>
              <p style={{ fontSize: 58, marginBottom: 18 }}>
                {submitResult?.path === 'negative' ? '💙' : '🎉'}
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', marginBottom: 10 }}>
                {submitResult?.path === 'negative' ? 'Thank you for sharing' : 'Thank you!'}
              </h2>
              <p style={{ fontSize: 15, color: '#999', lineHeight: 1.65, fontWeight: 600 }}>
                {submitResult?.path === 'negative'
                  ? 'Your feedback has been shared privately with the owner.'
                  : `Your review helps ${bizName} grow. 💚`}
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
