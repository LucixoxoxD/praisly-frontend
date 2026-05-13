import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import WhatsAppButton from '../components/WhatsAppButton'

const BIZ_EMOJI = {
  'healthcare / clinic':    '🏥',
  'salon / beauty parlour': '💇',
  'gym / fitness / yoga':   '💪',
  'restaurant / cafe':      '🍽️',
  'coaching / tuition':     '📚',
  'ca / law firm':          '⚖️',
  'auto / repair service':  '🔧',
  'real estate':            '🏠',
  'other':                  '⭐',
  // Legacy DB values
  dentist:    '🏥',
  salon:      '💇',
  gym:        '💪',
  restaurant: '🍽️',
  coaching:   '📚',
  ca_firm:    '⚖️',
}

const STAR_REACTIONS = {
  1: { emoji: '😞', label: 'That bad, huh?' },
  2: { emoji: '😕', label: 'Could be better' },
  3: { emoji: '😐', label: 'Just okay?' },
  4: { emoji: '😊', label: 'Glad you liked it!' },
  5: { emoji: '🤩', label: 'Amazing!' },
}

const STYLES = `
  @keyframes cr-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes cr-popIn {
    0%   { transform: scale(0.7); opacity: 0; }
    65%  { transform: scale(1.18); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes cr-spin { to { transform: rotate(360deg); } }
  @keyframes cr-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }

  .cr-wrap {
    min-height: 100vh;
    background: #f7f5f0;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    justify-content: center;
  }
  .cr-shell {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    padding: 0 0 56px;
  }
  .cr-body {
    padding: 8px 24px 0;
    animation: cr-fadeUp 0.28s ease both;
  }

  .cr-avatar {
    width: 64px; height: 64px; border-radius: 20px;
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    margin: 32px auto 14px;
    box-shadow: 0 6px 20px rgba(37,211,102,0.28);
  }
  .cr-biz-name {
    font-size: 18px; font-weight: 800; color: #1a1a1a;
    text-align: center; margin: 0 0 24px;
  }

  .cr-h2 {
    font-size: 17px; font-weight: 700; color: #374151;
    text-align: center; margin: 0 0 6px;
  }
  .cr-sub {
    font-size: 13px; color: #9ca3af;
    text-align: center; margin: 0 0 22px; font-weight: 500;
  }

  .cr-stars {
    display: flex; justify-content: center; gap: 8px; margin-bottom: 8px;
  }
  .cr-star {
    background: none; border: none; cursor: pointer; padding: 2px;
    font-size: 48px; line-height: 1;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.12s;
  }
  .cr-star:active { transform: scale(0.88) !important; }

  .cr-reaction {
    text-align: center; height: 32px; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 14px; font-weight: 700; color: #374151;
    animation: cr-popIn 0.22s ease both;
  }

  .cr-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 8px;
  }
  .cr-chip {
    padding: 9px 14px; border-radius: 100px;
    border: 1.5px solid #e5e7eb; background: white;
    font-size: 14px; font-weight: 600; color: #374151;
    cursor: pointer; font-family: inherit;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    display: flex; align-items: center; gap: 5px;
  }
  .cr-chip.on {
    border-color: #10b981; background: #d1fae5; color: #065f46;
  }
  .cr-chip:active { transform: scale(0.95); }

  .cr-btn {
    width: 100%; padding: 15px;
    border-radius: 14px; border: none;
    font-size: 16px; font-weight: 700; color: white;
    cursor: pointer; font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
    -webkit-tap-highlight-color: transparent;
    margin-bottom: 10px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cr-btn:active { transform: scale(0.98); }
  .cr-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }

  .cr-ghost {
    width: 100%; padding: 11px;
    border-radius: 14px; border: none; background: transparent;
    font-size: 14px; font-weight: 600; color: #9ca3af;
    cursor: pointer; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    margin-bottom: 4px;
  }
  .cr-ghost:active { color: #6b7280; }

  .cr-card {
    background: white; border-radius: 20px; padding: 20px;
    margin-bottom: 14px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .cr-shimmer-bar {
    border-radius: 7px;
    background: linear-gradient(90deg, #ece9e4 25%, #e2dfd9 50%, #ece9e4 75%);
    background-size: 800px 100%;
    animation: cr-shimmer 1.5s infinite;
  }

  .cr-spinner {
    width: 34px; height: 34px;
    border: 3px solid #e5e5e5;
    border-top-color: #25D366;
    border-radius: 50%;
    animation: cr-spin 0.8s linear infinite;
    margin: 0 auto;
  }

  .cr-powered {
    text-align: center; font-size: 12px; color: #d1d5db;
    margin-top: 32px; font-weight: 500;
  }
  .cr-powered b { color: #25D366; }
`

export default function CustomerReview() {
  const { businessId } = useParams()

  const [screen, setScreen]     = useState('loading')
  const [business, setBusiness] = useState(null)
  const [quickTags, setQuickTags] = useState([])
  const [error, setError]       = useState(null)

  // Rating screen
  const [rating, setRating]         = useState(0)
  const [hovered, setHovered]       = useState(0)
  const [selectedTags, setSelectedTags] = useState([])

  // AI draft screen
  const [submitting, setSubmitting]   = useState(false)
  const [draft, setDraft]             = useState('')
  const [reviewId, setReviewId]       = useState(null)
  const [googleReviewUrl, setGoogleReviewUrl] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied]           = useState(false)
  const [googleClicked, setGoogleClicked] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  // Negative feedback screen
  const [negFeedback, setNegFeedback] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)

  const copyTimer = useRef(null)

  useEffect(() => {
    api.get(`/api/review/${businessId}`)
      .then((res) => {
        setBusiness(res.data)
        setQuickTags(res.data.quick_tags || [])
        setGoogleReviewUrl(res.data.google_review_url || null)
        // Device-level cooldown: one submission per business per 24 h
        const stored = localStorage.getItem(`praisly_done_${businessId}`)
        if (stored && Date.now() - parseInt(stored, 10) < 86_400_000) {
          setScreen('already_done')
        } else {
          setScreen('rate')
        }
      })
      .catch(() => {
        setError('This review link is not valid or has expired.')
        setScreen('error')
      })
  }, [businessId])

  useEffect(() => { document.title = 'Leave a Review' }, [])
  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const isPositive   = rating >= 4
  const bizEmoji     = BIZ_EMOJI[business?.business_type] || '⭐'
  const bizName      = business?.business_name || ''
  const displayRating = hovered || rating

  function starColor(star) {
    if (star > displayRating) return '#d1d5db'
    return '#fbbf24'
  }

  function toggleTag(label) {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)

    try {
      const res = await api.post(`/api/review/${businessId}/submit`, {
        rating,
        selected_tags: selectedTags,
        custom_tag: null,
        customer_phone: '',
      })
      // Record submission in localStorage so the device cooldown kicks in on reload
      localStorage.setItem(`praisly_done_${businessId}`, String(Date.now()))
      if (isPositive) {
        setDraft(res.data.draft || '')
        setReviewId(res.data.review_id || null)
        if (res.data.google_review_url) setGoogleReviewUrl(res.data.google_review_url)
        setScreen('ai_draft')
      } else {
        setReviewId(res.data.review_id || null)
        setScreen('neg_feedback')
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setScreen('already_done')
      } else if (err.response?.status === 403) {
        setLimitReached(true)
        setScreen('done')
      } else {
        setScreen('submit_error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const res = await api.post(`/api/review/${businessId}/regenerate`, {
        review_id: reviewId,
        rating,
        selected_tags: selectedTags,
        previous_draft: draft,
      })
      setDraft(res.data.draft || draft)
      setCopied(false)
    } catch {}
    setRegenerating(false)
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(draft) } catch {}
    setCopied(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  async function handleOpenGoogle() {
    try { await navigator.clipboard.writeText(draft) } catch {}
    setCopied(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1500)
    if (googleReviewUrl) window.open(googleReviewUrl, '_blank', 'noopener')
    setGoogleClicked(true)
  }

  async function handleConfirmPosted() {
    try {
      if (reviewId) {
        await api.post(`/api/review/${businessId}/confirm-posted`, { review_id: reviewId })
      }
    } catch {}
    setScreen('done')
  }

  async function handleNegFeedbackSubmit() {
    setSendingFeedback(true)
    try {
      if (reviewId) {
        await api.post(`/api/review/${businessId}/private-feedback`, {
          review_id: reviewId,
          feedback_text: negFeedback.trim() || '(no details shared)',
        })
      }
    } catch {}
    setSendingFeedback(false)
    setScreen('done')
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="cr-wrap">
        <div className="cr-shell">

          {/* LOADING */}
          {screen === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 140 }}>
              <div className="cr-spinner" />
            </div>
          )}

          {/* ERROR */}
          {screen === 'error' && (
            <div style={{ textAlign: 'center', marginTop: 100, padding: '0 28px', animation: 'cr-fadeUp 0.3s ease' }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>😕</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280' }}>{error}</p>
            </div>
          )}

          {/* ══ SCREEN 1 — RATING + QUICK TAGS ══════════════════════════════════ */}
          {screen === 'rate' && (
            <div className="cr-body">
              <div className="cr-avatar">{bizEmoji}</div>
              <p className="cr-biz-name">{bizName}</p>

              <h2 className="cr-h2">How was your experience?</h2>
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
                    style={{ transform: star <= displayRating ? 'scale(1.1)' : 'scale(1)' }}
                  >
                    <span style={{ color: starColor(star), transition: 'color 0.12s' }}>★</span>
                  </button>
                ))}
              </div>

              {rating > 0 ? (
                <div className="cr-reaction" key={rating}>
                  <span style={{ fontSize: 22 }}>{STAR_REACTIONS[rating].emoji}</span>
                  {STAR_REACTIONS[rating].label}
                </div>
              ) : (
                <div style={{ height: 32, marginBottom: 20 }} />
              )}

              {/* Quick tags — only show after rating */}
              {rating >= 4 && quickTags.length > 0 && (
                <div style={{ animation: 'cr-fadeUp 0.22s ease both' }}>
                  <p className="cr-sub" style={{ marginBottom: 12 }}>What stood out? (optional)</p>
                  <div className="cr-chips" style={{ marginBottom: 20 }}>
                    {quickTags.map((t) => (
                      <button
                        key={t.label}
                        className={`cr-chip${selectedTags.includes(t.label) ? ' on' : ''}`}
                        onClick={() => toggleTag(t.label)}
                      >
                        <span>{t.emoji}</span> {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="cr-btn"
                disabled={rating === 0 || submitting}
                style={{
                  background: rating === 0
                    ? '#d1d5db'
                    : isPositive
                    ? '#25D366'
                    : '#f59e0b',
                  marginTop: rating >= 4 ? 0 : 8,
                }}
                onClick={handleSubmit}
              >
                {submitting
                  ? 'Just a moment…'
                  : rating === 0
                  ? 'Select a rating first'
                  : isPositive
                  ? 'Generate my review →'
                  : 'Share feedback'}
              </button>

              <button className="cr-ghost" onClick={() => setScreen('done')}>
                Skip
              </button>

              <p className="cr-powered">Powered by <b>Praisly</b></p>
            </div>
          )}

          {/* ══ SCREEN 2 — AI DRAFT ══════════════════════════════════════════════ */}
          {screen === 'ai_draft' && (
            <div className="cr-body">

              {/* Badge */}
              <div style={{ marginTop: 28, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  color: '#15803d', fontSize: 12, fontWeight: 700,
                  padding: '5px 14px', borderRadius: 100,
                }}>
                  ✨ Your review is ready!
                </span>
              </div>

              {/* 2-step instruction bar */}
              <div style={{
                background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                borderRadius: 14, padding: '14px 16px',
                marginBottom: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                gap: 6, flexWrap: 'wrap',
              }}>
                {[
                  { text: 'Tap the button below' },
                  { text: 'Paste & submit on Google' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 13, fontWeight: 700, color: '#15803d',
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: '#25D366', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, flexShrink: 0,
                      }}>{i + 1}</span>
                      {step.text}
                    </div>
                    {i < 1 && (
                      <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 16 }}>→</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Draft card — tappable to copy, shimmer while loading */}
              <div
                className="cr-card"
                onClick={!submitting && draft ? handleCopy : undefined}
                style={{
                  cursor: !submitting && draft ? 'pointer' : 'default',
                  border: copied ? '2px solid #10b981' : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: copied
                    ? '0 0 0 4px rgba(16,185,129,0.12)'
                    : '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
              >
                {submitting || !draft ? (
                  <>
                    <div className="cr-shimmer-bar" style={{ height: 13, width: '90%', marginBottom: 10 }} />
                    <div className="cr-shimmer-bar" style={{ height: 13, width: '75%', marginBottom: 10 }} />
                    <div className="cr-shimmer-bar" style={{ height: 13, width: '55%' }} />
                  </>
                ) : (
                  <>
                    <p style={{
                      fontSize: 15, color: '#1f2937', lineHeight: 1.75, margin: '0 0 14px',
                      animation: 'cr-fadeUp 0.25s ease',
                    }}>
                      {draft}
                    </p>

                    {/* Copied toast inside card */}
                    {copied ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, padding: '8px 12px',
                        background: '#d1fae5', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, color: '#065f46',
                        animation: 'cr-fadeUp 0.15s ease',
                      }}>
                        ✓ Review copied!
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 5, fontSize: 11, color: '#d1d5db',
                      }}>
                        tap to copy
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Try another — small text button */}
              {!submitting && draft && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    style={{
                      background: 'none', border: 'none',
                      color: regenerating ? '#d1d5db' : '#6b7280',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', padding: '8px 16px',
                      minHeight: 48,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {regenerating ? '…generating' : '🔄 Try another version'}
                  </button>
                </div>
              )}

              {/* Post on Google */}
              <button
                className="cr-btn"
                disabled={submitting || !draft}
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

              {/* Confirm posted */}
              {googleClicked && (
                <div style={{ animation: 'cr-fadeUp 0.25s ease' }}>
                  <button
                    onClick={handleConfirmPosted}
                    style={{
                      width: '100%', padding: '13px', borderRadius: 14,
                      border: '2px solid #25D366', background: '#f0fdf4',
                      color: '#15803d', fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
                    }}
                  >
                    ✓ I posted it!
                  </button>
                </div>
              )}

              <p className="cr-powered">Powered by <b>Praisly</b></p>
            </div>
          )}

          {/* ══ SCREEN 2b — PRIVATE FEEDBACK (1–3 stars) ════════════════════════ */}
          {screen === 'neg_feedback' && (
            <div className="cr-body" style={{ animation: 'cr-fadeUp 0.28s ease' }}>
              <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 24 }}>
                <p style={{ fontSize: 52, marginBottom: 12 }}>🙏</p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
                  We're sorry to hear that.
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, fontWeight: 500 }}>
                  Your feedback helps us improve our service.
                </p>
              </div>

              <div className="cr-card">
                <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 10 }}>
                  What happened? (optional)
                </p>
                <textarea
                  value={negFeedback}
                  onChange={(e) => setNegFeedback(e.target.value)}
                  placeholder="Tell us what went wrong…"
                  rows={4}
                  style={{
                    width: '100%', padding: '12px',
                    border: '1.5px solid #e5e7eb', borderRadius: 10,
                    fontSize: 14, fontFamily: 'inherit', color: '#1f2937',
                    resize: 'none', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                className="cr-btn"
                style={{ background: '#374151' }}
                disabled={sendingFeedback}
                onClick={handleNegFeedbackSubmit}
              >
                {sendingFeedback ? 'Sending…' : 'Send feedback'}
              </button>

              <button className="cr-ghost" onClick={() => setScreen('done')}>
                Skip
              </button>

              <p className="cr-powered">Powered by <b>Praisly</b></p>
            </div>
          )}

          {/* ══ SUBMIT ERROR ════════════════════════════════════════════════════════ */}
          {screen === 'submit_error' && (
            <div style={{ textAlign: 'center', marginTop: 100, padding: '0 28px', animation: 'cr-fadeUp 0.3s ease' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>😕</p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
                Something went wrong.
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>Please try again.</p>
              <button
                className="cr-btn"
                style={{ background: '#374151', maxWidth: 200, margin: '0 auto' }}
                onClick={() => setScreen('rate')}
              >
                Try Again
              </button>
            </div>
          )}

          {/* ══ ALREADY DONE ═══════════════════════════════════════════════════════ */}
          {screen === 'already_done' && (
            <div style={{
              textAlign: 'center', marginTop: 120, padding: '0 28px',
              animation: 'cr-fadeUp 0.35s ease',
            }}>
              <p style={{ fontSize: 52, marginBottom: 16 }}>🙏</p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
                You've already shared your feedback.
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, fontWeight: 500 }}>
                Thank you! 🙏
                {bizName ? <><br />Your review helps {bizName} grow.</> : ''}
              </p>
              <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 32 }}>You can close this tab now.</p>
            </div>
          )}

          {/* ══ DONE ══════════════════════════════════════════════════════════════ */}
          {screen === 'done' && (
            <div style={{
              textAlign: 'center', marginTop: 120, padding: '0 28px',
              animation: 'cr-fadeUp 0.35s ease',
            }}>
              {limitReached ? (
                <>
                  <p style={{ fontSize: 52, marginBottom: 16 }}>🙏</p>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
                    Thank you for visiting!
                  </h2>
                  <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, fontWeight: 500 }}>
                    This business's review collection is currently paused.
                  </p>
                </>
              ) : rating < 4 ? (
                <>
                  <p style={{ fontSize: 52, marginBottom: 16 }}>🙏</p>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
                    Thank you for your feedback!
                  </h2>
                  <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, fontWeight: 500 }}>
                    Your response helps us improve our service.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 52, marginBottom: 16 }}>🎉</p>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
                    You're amazing!
                  </h2>
                  <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, fontWeight: 500 }}>
                    Your review helps {bizName} grow. Thank you! 💚
                  </p>
                </>
              )}
              <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 32 }}>You can close this tab now.</p>
            </div>
          )}

        </div>
      </div>
      <WhatsAppButton message="Hi I need help with submitting a review" size={48} />
    </>
  )
}
