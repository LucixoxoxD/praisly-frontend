import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const CLIENT_TIMEOUT_MS = 8000

// ── Fallback drafts using selected tags ──────────────────────────────────────
function buildFallbacks(name, tags) {
  const t1 = tags[0] || 'service'
  const t2 = tags[1] || 'staff'
  return {
    hinglish: [
      `${name} mein ${t1} accha tha aur ${t2} bhi. Overall worth visiting.`,
      `Went to ${name}, liked the ${t1}. ${t2} was also good. Will come back.`,
      `${name} ka ${t1} impressive tha. ${t2} bhi theek tha. Recommended.`,
    ],
    english: [
      `Good experience at ${name}. The ${t1} and ${t2} were both solid.`,
      `Visited ${name}. Liked the ${t1} especially. ${t2} was good too. Would return.`,
      `${name} was worth it. ${t1} stood out and ${t2} was also fine.`,
    ],
  }
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Fade({ children, className = '' }) {
  return (
    <div className={className} style={{ animation: 'fadeIn 0.25s ease' }}>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <div
      style={{
        width: 36, height: 36,
        border: '3px solid #e5e7eb',
        borderTopColor: '#f59e0b',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="w-full p-4 rounded-2xl border-2 border-gray-100 space-y-2">
      {['90%', '75%', '55%'].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-gray-200"
          style={{ width: w, animation: `shimmer 1.4s ease-in-out ${i * 0.1}s infinite` }}
        />
      ))}
    </div>
  )
}

// ── Tag chip ─────────────────────────────────────────────────────────────────
function TagChip({ label, selected, onClick, dashed = false }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none active:scale-95 ${
        selected
          ? 'bg-blue-600 text-white border-2 border-blue-600'
          : dashed
          ? 'bg-white text-gray-500 border-2 border-dashed border-gray-300'
          : 'bg-white text-gray-700 border-2 border-gray-300'
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {label}
    </button>
  )
}

// ── Draft card ────────────────────────────────────────────────────────────────
function DraftCard({ text, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all focus:outline-none active:scale-99 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <p className="text-gray-800 text-sm leading-relaxed">{text}</p>
      {isSelected && (
        <span className="inline-block mt-2 text-xs font-semibold text-blue-600">
          ✓ Copied to clipboard
        </span>
      )}
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CustomerReview() {
  const { businessId } = useParams()

  const [screen, setScreen] = useState('loading')   // loading|main|drafts-loading|positive|negative|done-positive|done-negative|error
  const [business, setBusiness] = useState(null)
  const [tags, setTags] = useState([])

  // Screen 1 state
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const [showOther, setShowOther] = useState(false)
  const [customTag, setCustomTag] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Screen 2 state
  const [submitResult, setSubmitResult] = useState(null)
  const [draftsReady, setDraftsReady] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [googleClicked, setGoogleClicked] = useState(false)
  const [extraFeedback, setExtraFeedback] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [error, setError] = useState(null)
  const fallbackTimer = useRef(null)

  // Fetch business info + tags on mount
  useEffect(() => {
    api.get(`/api/review/${businessId}`)
      .then((res) => {
        setBusiness(res.data)
        setTags(res.data.tags || [])
        setScreen('main')
      })
      .catch(() => {
        setError('This review link is not valid or has expired.')
        setScreen('error')
      })
  }, [businessId])

  useEffect(() => () => clearTimeout(fallbackTimer.current), [])

  // ── Tag toggle ──────────────────────────────────────────────────────────────
  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const allSelectedTags = [
    ...selectedTags,
    ...(customTag.trim() ? [customTag.trim()] : []),
  ]
  const canSubmit = rating > 0 && allSelectedTags.length > 0 && !submitting

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)

    if (rating >= 4) {
      setScreen('drafts-loading')
      setDraftsReady(false)

      // 8-second client fallback
      fallbackTimer.current = setTimeout(() => {
        setSubmitResult((prev) => {
          if (prev?.drafts) return prev
          return {
            path: 'positive',
            review_id: null,
            google_review_url: business?.google_review_url || null,
            drafts: buildFallbacks(business?.business_name || '', allSelectedTags),
          }
        })
        setDraftsReady(true)
      }, CLIENT_TIMEOUT_MS)
    }

    try {
      const res = await api.post(`/api/review/${businessId}/submit`, {
        rating,
        selected_tags: selectedTags,
        custom_tag: customTag.trim() || null,
        customer_name: customerName.trim() || null,
        customer_phone: '',
      })
      clearTimeout(fallbackTimer.current)
      setSubmitResult(res.data)

      if (res.data.path === 'positive') {
        setDraftsReady(true)
        // screen already set to drafts-loading — just need draftsReady=true to swap skeletons
      } else {
        setScreen('negative')
      }
    } catch (err) {
      clearTimeout(fallbackTimer.current)
      if (rating >= 4) {
        // Use fallback drafts silently
        setSubmitResult({
          path: 'positive',
          review_id: null,
          google_review_url: business?.google_review_url || null,
          drafts: buildFallbacks(business?.business_name || '', allSelectedTags),
        })
        setDraftsReady(true)
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
        setScreen('error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Draft select ────────────────────────────────────────────────────────────
  async function handleSelectDraft(text) {
    setSelectedDraft(text)
    try { await navigator.clipboard.writeText(text) } catch { /* denied */ }
    try {
      if (submitResult?.review_id) {
        await api.post(`/api/review/${businessId}/select-draft`, {
          review_id: submitResult.review_id,
          selected_draft: text,
        })
      }
    } catch { /* non-fatal */ }
  }

  function handleOpenGoogle() {
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
    } catch { /* non-fatal */ }
    setScreen('done-positive')
  }

  // ── Private feedback ────────────────────────────────────────────────────────
  async function handleFeedbackSubmit() {
    setSendingFeedback(true)
    try {
      if (submitResult?.review_id) {
        await api.post(`/api/review/${businessId}/private-feedback`, {
          review_id: submitResult.review_id,
          feedback_text: extraFeedback.trim() || '(no additional feedback)',
        })
      }
    } catch { /* non-fatal */ }
    setSendingFeedback(false)
    setScreen('done-negative')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const bizName = business?.business_name || ''

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>

      <div className="min-h-screen bg-white flex justify-center px-5 py-10">
        <div className="w-full max-w-sm">

          {/* ── LOADING ── */}
          {screen === 'loading' && (
            <div className="flex justify-center mt-24"><Spinner /></div>
          )}

          {/* ── ERROR ── */}
          {screen === 'error' && (
            <Fade className="text-center mt-20">
              <p className="text-4xl mb-4">😕</p>
              <p className="text-gray-700 font-medium">{error}</p>
            </Fade>
          )}

          {/* ══ SCREEN 1: STARS + TAGS ══════════════════════════════════════ */}
          {screen === 'main' && (
            <Fade>
              {/* Business name */}
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-8 leading-tight">
                {bizName}
              </h1>

              {/* Stars */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { setRating(star); setSelectedTags([]); setShowOther(false); setCustomTag('') }}
                    className="text-5xl leading-none focus:outline-none transition-transform active:scale-90"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <span style={{ color: star <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
                  </button>
                ))}
              </div>

              {/* Tags section — slides in after rating */}
              {rating > 0 && (
                <div style={{ animation: 'slideDown 0.3s ease', overflow: 'hidden' }}>
                  <p className="text-base font-semibold text-gray-800 mb-3 text-center">
                    {rating >= 4 ? 'What did you enjoy?' : 'What can be improved?'}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {tags.map((tag) => (
                      <TagChip
                        key={tag}
                        label={tag}
                        selected={selectedTags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                      />
                    ))}
                    <TagChip
                      label="+ Other"
                      selected={showOther}
                      dashed={!showOther}
                      onClick={() => setShowOther((v) => !v)}
                    />
                  </div>

                  {showOther && (
                    <Fade>
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add your own..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 mb-3"
                        maxLength={50}
                        autoFocus
                      />
                    </Fade>
                  )}

                  {/* Optional name */}
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 mt-2 mb-5"
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base transition-opacity disabled:opacity-35"
                    style={{ backgroundColor: canSubmit ? '#16a34a' : '#9ca3af' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}
            </Fade>
          )}

          {/* ══ SCREEN 2a: DRAFTS (skeleton → real) ════════════════════════ */}
          {screen === 'drafts-loading' && (
            <Fade>
              <div className="text-center mb-6">
                <p className="text-3xl mb-3">🌟</p>
                <h2 className="text-xl font-bold text-gray-900">
                  Here's a review based on your experience:
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {draftsReady ? 'Tap one to select it' : 'Personalising your review...'}
                </p>
              </div>

              {!draftsReady ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hinglish</p>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">English</p>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <Fade>
                  {/* Hinglish */}
                  {submitResult?.drafts?.hinglish?.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hinglish</p>
                      <div className="space-y-3 mb-4">
                        {submitResult.drafts.hinglish.map((text, i) => (
                          <DraftCard key={`h${i}`} text={text} isSelected={selectedDraft === text} onSelect={() => handleSelectDraft(text)} />
                        ))}
                      </div>
                    </>
                  )}
                  {/* English */}
                  {submitResult?.drafts?.english?.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">English</p>
                      <div className="space-y-3">
                        {submitResult.drafts.english.map((text, i) => (
                          <DraftCard key={`e${i}`} text={text} isSelected={selectedDraft === text} onSelect={() => handleSelectDraft(text)} />
                        ))}
                      </div>
                    </>
                  )}
                </Fade>
              )}

              {selectedDraft && (
                <Fade className="mt-6 space-y-3">
                  <button
                    onClick={handleOpenGoogle}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Post on Google ↗
                  </button>
                  {googleClicked && (
                    <Fade>
                      <button
                        onClick={handleConfirmPosted}
                        className="w-full py-3 rounded-2xl font-semibold text-green-700 text-sm border-2 border-green-200 bg-green-50"
                      >
                        I posted it ✓
                      </button>
                    </Fade>
                  )}
                </Fade>
              )}
            </Fade>
          )}

          {/* ══ DONE POSITIVE ═══════════════════════════════════════════════ */}
          {screen === 'done-positive' && (
            <Fade className="text-center mt-20">
              <p className="text-5xl mb-4" style={{ animation: 'fadeIn 0.4s ease' }}>🎉</p>
              <h2 className="text-xl font-bold text-gray-900">Thank you!</h2>
              <p className="text-gray-500 mt-2 text-sm">Your review helps {bizName} grow.</p>
            </Fade>
          )}

          {/* ══ SCREEN 2b: NEGATIVE ═════════════════════════════════════════ */}
          {screen === 'negative' && (
            <Fade>
              <div className="text-center mb-6">
                <p className="text-3xl mb-3">🙏</p>
                <h2 className="text-lg font-bold text-gray-900">
                  Thank you for your feedback.
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  We'll make sure {bizName} hears this.
                </p>
              </div>

              <textarea
                value={extraFeedback}
                onChange={(e) => setExtraFeedback(e.target.value)}
                placeholder="Anything else? (optional)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 mb-4"
              />

              <button
                onClick={handleFeedbackSubmit}
                disabled={sendingFeedback}
                className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40"
                style={{ backgroundColor: '#374151' }}
              >
                {sendingFeedback ? 'Sending...' : 'Send Feedback'}
              </button>

              {submitResult?.google_review_url && (
                <p className="text-center mt-5">
                  <a
                    href={submitResult.google_review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 underline underline-offset-2"
                  >
                    Share on Google too →
                  </a>
                </p>
              )}
            </Fade>
          )}

          {/* ══ DONE NEGATIVE ═══════════════════════════════════════════════ */}
          {screen === 'done-negative' && (
            <Fade className="text-center mt-20">
              <p className="text-5xl mb-4">💙</p>
              <h2 className="text-xl font-bold text-gray-900">Thank you for sharing</h2>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                Your feedback has been sent to the owner privately.<br />
                We appreciate you helping them improve.
              </p>
            </Fade>
          )}

        </div>
      </div>
    </>
  )
}
