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
  const heroRef = useRef(null)

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

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
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

            <button className="roast-cta" onClick={scrollToHero}>
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
      </div>
    </>
  )
}
