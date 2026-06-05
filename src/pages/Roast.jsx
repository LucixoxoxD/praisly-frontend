import { useState, useEffect, useRef } from 'react'

const LOADING_MESSAGES = [
  'Scanning your Google listing...',
  'Counting your reviews... yikes',
  'Checking competitor reviews... oh no',
  'Analyzing your online reputation...',
  'Comparing you to Sharma ji next door...',
  'Generating reputation report...',
  'This is worse than we thought...',
]

const TICKER_TEXT =
  '⚠️ BREAKING: Local business found with only 7 Google reviews — Customers seen walking to competitor next door ⚠️ SHOCKING: 97% of customers read Google reviews before visiting ⚠️ ALERT: Businesses without reviews losing ₹50,000+ monthly ⚠️'

const SYMPTOMS = [
  'Fewer Google reviews than your chai wala',
  'Last review is from 2022... maybe 2021',
  'Rating below 4.0 — Google is hiding you',
  'Competitor has 3x your reviews and a smug face',
  "Customers searching 'best near me' — you're on page 2",
  'Your Google listing looks like an abandoned house',
]

const EXCUSES = [
  { text: "Reviews don't matter", counter: '93% of customers check reviews before visiting' },
  { text: 'Word of mouth is enough', counter: "But word of mouth doesn't show up on Google Maps" },
  { text: 'My regulars know me', counter: "But new customers don't. And they're Googling right now" },
  { text: "I'm too busy for this", counter: "Your competitor wasn't too busy. They have 200 reviews" },
  { text: 'Negative reviews scare me', counter: '4.2 stars with 100 reviews beats 5.0 with 3 reviews' },
  { text: 'Nobody reads reviews', counter: "Google: 'Hold my algorithm'" },
]

const BUBBLE_STYLES = [
  { border: '#F59E0B', top: '5%', left: '4%', dur: 4.2, delay: 0 },
  { border: '#39FF14', top: '52%', left: '45%', dur: 3.8, delay: -1.5 },
  { border: '#F43F5E', top: '28%', left: '25%', dur: 5.0, delay: -3.2 },
  { border: '#818CF8', top: '72%', left: '8%', dur: 4.5, delay: -0.8 },
  { border: '#22D3EE', top: '12%', left: '48%', dur: 3.5, delay: -2.5 },
  { border: '#FB923C', top: '48%', left: '10%', dur: 4.8, delay: -4.0 },
]

const STARS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + Math.random() * 80}%`,
  size: 16 + Math.random() * 16,
  duration: 15 + Math.random() * 10,
  delay: Math.random() * -20,
  startY: `${10 + Math.random() * 80}%`,
}))

export default function Roast() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [diagVisible, setDiagVisible] = useState(false)
  const [popped, setPopped] = useState({})
  const [counters, setCounters] = useState({})
  const [showHint, setShowHint] = useState(false)
  const heroRef = useRef(null)
  const diagRef = useRef(null)
  const excuseRef = useRef(null)
  const hintTimerRef = useRef(null)

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 500)

    const startTime = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress(Math.min((elapsed / 3500) * 100, 100))
    }, 50)

    const fadeTimer = setTimeout(() => setFadeOut(true), 3500)
    const doneTimer = setTimeout(() => setLoading(false), 4000)

    return () => {
      clearInterval(msgTimer)
      clearInterval(progressTimer)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  useEffect(() => {
    const el = diagRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setDiagVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading])

  useEffect(() => {
    if (Object.keys(popped).length > 0 && Object.keys(popped).length < 6) return
    if (Object.keys(popped).length === 6) { clearTimeout(hintTimerRef.current); return }
    hintTimerRef.current = setTimeout(() => setShowHint(true), 30000)
    return () => clearTimeout(hintTimerRef.current)
  }, [popped])

  const poppedCount = Object.keys(popped).length
  const allDestroyed = poppedCount === 6

  const popExcuse = (idx) => {
    if (popped[idx]) return
    navigator.vibrate?.([30, 20, 30])
    setPopped((p) => ({ ...p, [idx]: 'popping' }))
    setTimeout(() => {
      setPopped((p) => ({ ...p, [idx]: 'gone' }))
      setCounters((c) => ({ ...c, [idx]: true }))
    }, 300)
    setTimeout(() => {
      setCounters((c) => ({ ...c, [idx]: false }))
    }, 2300)
  }

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToDiag = () => {
    diagRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToExcuse = () => {
    excuseRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToNext = () => {
    // placeholder for section 5
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');

        .roast-page {
          background: #06060F;
          color: #fff;
          font-family: 'DM Sans', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .roast-page::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.02;
          pointer-events: none;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* Loading screen */
        .roast-loader {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #06060F;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 500ms ease;
        }
        .roast-loader.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        @keyframes roast-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        .roast-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #39FF14;
          animation: roast-pulse 1s ease-in-out infinite;
          margin-bottom: 24px;
        }

        .roast-loader-msg {
          font-size: 15px;
          color: #9ca3af;
          height: 24px;
          text-align: center;
          padding: 0 24px;
        }

        .roast-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: #39FF14;
          transition: width 50ms linear;
        }

        /* Ticker */
        @keyframes roast-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .roast-ticker-wrap {
          background: #F43F5E;
          overflow: hidden;
          white-space: nowrap;
          padding: 10px 0;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.02em;
        }
        .roast-ticker-inner {
          display: inline-block;
          animation: roast-ticker 25s linear infinite;
        }
        .roast-ticker-inner span {
          padding: 0 48px;
        }

        /* Hero */
        .roast-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        @keyframes roast-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .roast-hero-h1-1 {
          animation: roast-fadeUp 0.6s ease both;
          animation-delay: 0.3s;
        }
        .roast-hero-h1-2 {
          animation: roast-fadeUp 0.6s ease both;
          animation-delay: 0.6s;
        }

        @keyframes roast-btnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.5); }
          50% { box-shadow: 0 0 24px 4px rgba(57, 255, 20, 0.3); }
        }
        .roast-cta {
          display: inline-block;
          background: #39FF14;
          color: #06060F;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 16px;
          padding: 16px 32px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          animation: roast-btnPulse 2s ease-in-out infinite;
          transition: transform 0.15s ease;
        }
        .roast-cta:hover {
          transform: scale(1.05);
        }

        /* Floating stars */
        @keyframes roast-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        .roast-star {
          position: absolute;
          pointer-events: none;
          opacity: 0.08;
          z-index: 0;
        }

        /* Section 3: Diagnosis */
        .roast-diagnosis {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          position: relative;
          z-index: 1;
        }
        .roast-section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 32px;
        }
        .roast-card {
          background: #0C0C1E;
          border: 1px solid rgba(57, 255, 20, 0.15);
          border-radius: 16px;
          padding: 32px 24px;
          max-width: 520px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .roast-card-header {
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
          letter-spacing: 2px;
          color: #9ca3af;
          margin-bottom: 24px;
        }
        .roast-confidential {
          position: absolute;
          top: 24px;
          right: -8px;
          border: 2px solid #F43F5E;
          color: #F43F5E;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          transform: rotate(-12deg);
          opacity: 0.8;
          letter-spacing: 1px;
          pointer-events: none;
        }
        .roast-field { margin-bottom: 16px; }
        .roast-field-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .roast-field-value {
          font-size: 15px;
          color: #fff;
        }
        .roast-field-value.green { color: #39FF14; }

        @keyframes roast-symptomIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .roast-symptom {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          opacity: 0;
          font-size: 14px;
          line-height: 1.5;
          color: #d1d5db;
        }
        .roast-symptom.visible {
          animation: roast-symptomIn 0.4s ease both;
        }
        .roast-symptom-x {
          color: #F43F5E;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          line-height: 1.4;
        }
        .roast-doctor-note {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-style: italic;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
        }

        /* Section 4: Excuse Destroyer */
        .roast-excuse-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          position: relative;
          z-index: 1;
        }
        .roast-excuse-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(36px, 9vw, 56px);
          text-align: center;
          margin: 0 0 8px;
        }
        .roast-excuse-sub {
          color: #9ca3af;
          font-size: 15px;
          text-align: center;
          margin-bottom: 32px;
        }
        .roast-game-area {
          position: relative;
          max-width: 500px;
          width: 100%;
          height: 400px;
          background: rgba(12, 12, 30, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .roast-score {
          text-align: center;
          margin-top: 16px;
          font-size: 14px;
          color: #9ca3af;
          font-weight: 500;
        }
        .roast-score span { color: #39FF14; font-weight: 700; }

        @keyframes roast-bubbleFloat {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -14px); }
          50% { transform: translate(-8px, 8px); }
          75% { transform: translate(12px, 12px); }
        }
        .roast-bubble {
          position: absolute;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          font-size: 13px;
          font-weight: 500;
          color: #e5e7eb;
          cursor: pointer;
          user-select: none;
          max-width: 45%;
          transition: transform 0.3s ease, opacity 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .roast-bubble:hover { background: rgba(255, 255, 255, 0.08); }
        .roast-bubble.popping {
          transform: scale(1.3) !important;
          opacity: 0;
          pointer-events: none;
        }
        .roast-bubble.gone { display: none; }

        @keyframes roast-counterIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes roast-counterOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .roast-counter {
          position: absolute;
          padding: 10px 16px;
          border-radius: 12px;
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.25);
          color: #39FF14;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.5;
          max-width: 200px;
          white-space: normal;
          pointer-events: none;
          animation: roast-counterIn 0.3s ease both;
        }
        .roast-counter.fading {
          animation: roast-counterOut 0.4s ease both;
        }

        .roast-hint {
          text-align: center;
          margin-top: 12px;
          font-size: 13px;
          color: #F59E0B;
          animation: roast-fadeUp 0.4s ease both;
        }

        @keyframes roast-resultIn {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .roast-result-card {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          text-align: center;
          background: rgba(6, 6, 15, 0.95);
          animation: roast-resultIn 0.5s ease both;
        }
        .roast-result-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 32px;
          color: #39FF14;
          margin-bottom: 8px;
        }
        .roast-result-score {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 24px;
        }
        .roast-result-prompt {
          font-size: 14px;
          color: #d1d5db;
          margin-bottom: 20px;
          line-height: 1.5;
        }
      `}</style>

      <div className="roast-page">
        {/* LOADING SCREEN */}
        {loading && (
          <div className={`roast-loader ${fadeOut ? 'fade-out' : ''}`}>
            <div className="roast-dot" />
            <div className="roast-loader-msg">{LOADING_MESSAGES[msgIndex]}</div>
            <div
              className="roast-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* SECTION 2: HERO / BREAKING NEWS */}
        <section className="roast-hero" ref={heroRef}>
          {/* Ticker */}
          <div className="roast-ticker-wrap">
            <div className="roast-ticker-inner">
              <span>{TICKER_TEXT}</span>
              <span>{TICKER_TEXT}</span>
            </div>
          </div>

          {/* Hero content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '48px 24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              <div
                className="roast-hero-h1-1"
                style={{ fontSize: 'clamp(48px, 12vw, 96px)' }}
              >
                IS YOUR BUSINESS
              </div>
              <div
                className="roast-hero-h1-2"
                style={{ fontSize: 'clamp(48px, 12vw, 96px)' }}
              >
                SECRETLY DYING?{' '}
                <span role="img" aria-label="skull">
                  💀
                </span>
              </div>
            </h1>

            <p
              style={{
                color: '#9ca3af',
                fontSize: 'clamp(16px, 3.5vw, 20px)',
                maxWidth: 520,
                margin: '24px auto 40px',
                lineHeight: 1.6,
              }}
            >
              Your customers are happy. Your Google profile says otherwise.
            </p>

            <button className="roast-cta" onClick={scrollToDiag}>
              CHECK YOUR REPUTATION ↓
            </button>
          </div>

          {/* Floating stars */}
          {STARS.map((s) => (
            <span
              key={s.id}
              className="roast-star"
              style={{
                left: s.left,
                top: s.startY,
                fontSize: s.size,
                animation: `roast-float ${s.duration}s ease-in-out infinite`,
                animationDelay: `${s.delay}s`,
              }}
            >
              ⭐
            </span>
          ))}
        </section>

        {/* SECTION 3: THE DIAGNOSIS */}
        <section className="roast-diagnosis" ref={diagRef}>
          <div className="roast-section-label">THE DIAGNOSIS</div>
          <div className="roast-card">
            <div className="roast-confidential">CONFIDENTIAL</div>
            <div className="roast-card-header">OFFICIAL REPUTATION REPORT</div>

            <div className="roast-field">
              <div className="roast-field-label">Patient</div>
              <div className="roast-field-value">Your Business</div>
            </div>
            <div className="roast-field">
              <div className="roast-field-label">Diagnosis</div>
              <div className="roast-field-value green">
                Review Deficiency Syndrome (RDS) — Stage 4
              </div>
            </div>
            <div className="roast-field">
              <div className="roast-field-label">Symptoms</div>
              {SYMPTOMS.map((s, i) => (
                <div
                  key={i}
                  className={`roast-symptom ${diagVisible ? 'visible' : ''}`}
                  style={diagVisible ? { animationDelay: `${i * 400}ms` } : undefined}
                >
                  <span className="roast-symptom-x">✗</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="roast-doctor-note">
              Prognosis: Terminal if left untreated. Immediate review collection recommended.
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <button className="roast-cta" onClick={scrollToExcuse}>
              HOW BAD IS IT? ↓
            </button>
          </div>
        </section>

        {/* SECTION 4: EXCUSE DESTROYER */}
        <section className="roast-excuse-section" ref={excuseRef}>
          <h2 className="roast-excuse-title">EXCUSE DESTROYER 💥</h2>
          <p className="roast-excuse-sub">
            Business owners love excuses. Tap them to destroy them.
          </p>

          <div className="roast-game-area">
            {EXCUSES.map((exc, i) => {
              const bs = BUBBLE_STYLES[i]
              const state = popped[i]
              if (state === 'gone' && !counters[i]) return null
              return (
                <div key={i}>
                  {/* Bubble */}
                  {state !== 'gone' && (
                    <div
                      className={`roast-bubble ${state === 'popping' ? 'popping' : ''}`}
                      style={{
                        top: bs.top,
                        left: bs.left,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: bs.border,
                        animation: state ? undefined : `roast-bubbleFloat ${bs.dur}s ease-in-out infinite`,
                        animationDelay: `${bs.delay}s`,
                      }}
                      onClick={() => popExcuse(i)}
                    >
                      {exc.text}
                    </div>
                  )}
                  {/* Counter fact */}
                  {counters[i] !== undefined && (
                    <div
                      className={`roast-counter ${!counters[i] ? 'fading' : ''}`}
                      style={{ top: bs.top, left: bs.left }}
                    >
                      {exc.counter}
                    </div>
                  )}
                </div>
              )
            })}

            {allDestroyed && (
              <div className="roast-result-card">
                <div className="roast-result-title">ALL EXCUSES DESTROYED 💥</div>
                <div className="roast-result-score">{poppedCount}/6 excuses destroyed</div>
                <p className="roast-result-prompt">
                  Now that we've cleared that up... let's see the REAL damage
                </p>
                <button className="roast-cta" onClick={scrollToNext}>
                  SHOW ME ↓
                </button>
              </div>
            )}
          </div>

          <div className="roast-score">
            <span>{poppedCount}</span>/6 excuses destroyed
          </div>
          {showHint && !allDestroyed && (
            <div className="roast-hint">Tap the excuses to destroy them!</div>
          )}
        </section>
      </div>
    </>
  )
}
