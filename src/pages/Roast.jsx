import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { playPop, playWhoosh, playKaching, playDoom, vibrate, unlockAudio } from '../utils/roastSounds'

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

const TOMBSTONES = [
  { name: 'Gupta Electronics (2015-2023)', epitaph: 'Had amazing products. Zero Google reviews. Customers went to Croma.' },
  { name: 'Royal Restaurant', epitaph: "'Our food speaks for itself' — It didn't. Nobody heard it." },
  { name: 'Sharma Salon', epitaph: "'Word of mouth is enough' — Last words before closing." },
  { name: 'City Gym', epitaph: 'Great equipment. Great trainers. Google rating: 3.2. Cult Fit ate their lunch.' },
  { name: 'Brilliant Coaching Centre', epitaph: '100% results. 3 Google reviews. Parents chose the one with 200 reviews instead.' },
]

const TYPEWRITER_LINES = [
  'Every day without reviews...',
  '...a customer chooses your competitor.',
  'Every week you wait...',
  '...you fall further behind on Google.',
  'Every month you ignore this...',
  '...is ₹50,000+ walking out the door.',
  '',
  "But here's the thing.",
  'Your customers ARE happy.',
  'They just need a 30-second nudge.',
]

function getMoneyComparison(amount) {
  if (amount <= 25000) return `That's ${Math.round(amount / 350)} plates of butter chicken you're missing 🍗`
  if (amount <= 50000) return "That's a vacation to Goa you're funding for your competitor 🏖️"
  if (amount <= 100000) return "That's your kid's school fees going to Sharma Ji 📚"
  if (amount <= 150000) return "That's a brand new Activa riding away from you 🛵"
  return "That's literally a Toyota Glanza. A WHOLE CAR. 🚗"
}

function getMoneyColor(amount) {
  const t = Math.min(amount / 200000, 1)
  const r = Math.round(245 * t + 245 * (1 - t))
  const g = Math.round(63 * t + 158 * (1 - t))
  const b = Math.round(94 * t + 11 * (1 - t))
  return `rgb(${r},${g},${b})`
}

function getSliderState(count) {
  let rating, badge, youOpacity, compOpacity, statusText
  if (count < 50) {
    rating = 3.8
    badge = null
    youOpacity = 0.5
    compOpacity = 1
  } else if (count < 100) {
    rating = 4.2
    badge = null
    youOpacity = 0.7
    compOpacity = 1
  } else if (count < 150) {
    rating = 4.5
    badge = 'POPULAR'
    youOpacity = 1
    compOpacity = 1
  } else {
    rating = 4.7
    badge = 'HIGHLY RATED'
    youOpacity = 1
    compOpacity = 0.55
  }
  if (count <= 30) statusText = 'Google is hiding you 🫣'
  else if (count <= 70) statusText = 'Getting there... customers are noticing 👀'
  else if (count <= 120) statusText = "Now we're talking! You're on the map 🗺️"
  else if (count <= 170) statusText = 'Sharma Ji is getting nervous 😰'
  else statusText = 'YOU ARE THE SHARMA JI NOW 👑'
  return { rating, badge, youOpacity, compOpacity, statusText }
}

function StarRow({ rating, size = 16 }) {
  const full = Math.floor(rating)
  const partial = rating - full
  const empty = 5 - full - (partial > 0 ? 1 : 0)
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f${i}`} style={{ color: '#F59E0B', fontSize: size }}>★</span>
      ))}
      {partial > 0 && (
        <span key="p" style={{ position: 'relative', display: 'inline-block', fontSize: size, color: '#4b5563' }}>
          ★
          <span style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            width: `${partial * 100}%`, color: '#F59E0B',
          }}>★</span>
        </span>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e${i}`} style={{ color: '#4b5563', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

const STARS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + Math.random() * 80}%`,
  size: 16 + Math.random() * 16,
  duration: 15 + Math.random() * 10,
  delay: Math.random() * -20,
  startY: `${10 + Math.random() * 80}%`,
}))

const ROAST_URL = 'https://praisly.in/roast'

export default function Roast() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [diagVisible, setDiagVisible] = useState(false)
  const [popped, setPopped] = useState({})
  const [counters, setCounters] = useState({})
  const [showHint, setShowHint] = useState(false)
  const [reviewCount, setReviewCount] = useState(12)
  const [graveyardVisible, setGraveyardVisible] = useState(false)
  const [moneyGap, setMoneyGap] = useState(50)
  const [moneyVisible, setMoneyVisible] = useState(false)
  const [displayedMoney, setDisplayedMoney] = useState(50000)
  const [twVisible, setTwVisible] = useState(false)
  const [twLine, setTwLine] = useState(0)
  const [showFinalCard, setShowFinalCard] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [shared, setShared] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [bizName, setBizName] = useState('')
  const heroRef = useRef(null)
  const diagRef = useRef(null)
  const excuseRef = useRef(null)
  const competitorRef = useRef(null)
  const graveyardRef = useRef(null)
  const moneyRef = useRef(null)
  const wakeupRef = useRef(null)
  const hintTimerRef = useRef(null)
  const kachingRef = useRef(0)
  const soundRef = useRef(true)
  const moneyDebounceRef = useRef(null)

  const sfx = useCallback((fn, ...args) => {
    if (soundRef.current) fn(...args)
  }, [])

  useEffect(() => {
    document.title = 'Is Your Business Secretly Dying? 💀 | Praisly'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Find out why your Google reviews (or lack of them) are killing your business. A hilarious wake-up call for Indian business owners.')

    // Load Bebas Neue + DM Sans via a non-blocking <link> instead of a
    // render-blocking @import. preconnect hints already live in index.html.
    if (!document.getElementById('roast-fonts')) {
      const link = document.createElement('link')
      link.id = 'roast-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap'
      document.head.appendChild(link)
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setTwLine(TYPEWRITER_LINES.length)
      setShowFinalCard(true)
    }
  }, [prefersReducedMotion, twVisible])

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 500)

    const startTime = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress(Math.min((elapsed / 3500) * 100, 100))
    }, 50)

    const fadeTimer = setTimeout(() => { setFadeOut(true); sfx(playDoom) }, 3500)
    const doneTimer = setTimeout(() => setLoading(false), 4000)

    return () => {
      clearInterval(msgTimer)
      clearInterval(progressTimer)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [sfx])

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
    const el = graveyardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setGraveyardVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading])

  useEffect(() => {
    const el = moneyRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMoneyVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading])

  useEffect(() => {
    const el = wakeupRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTwVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading])

  useEffect(() => {
    if (!twVisible || prefersReducedMotion) return
    if (twLine >= TYPEWRITER_LINES.length) {
      const t = setTimeout(() => setShowFinalCard(true), 500)
      return () => clearTimeout(t)
    }
    const delay = TYPEWRITER_LINES[twLine] === '' ? 1000 : 800
    const t = setTimeout(() => {
      setTwLine((l) => l + 1)
      sfx(vibrate, [10])
    }, delay)
    return () => clearTimeout(t)
  }, [twVisible, twLine, sfx, prefersReducedMotion])

  useEffect(() => {
    const target = moneyGap * 1000
    if (displayedMoney === target) return
    const step = target > displayedMoney ? Math.max(1000, Math.ceil((target - displayedMoney) / 8)) : -Math.max(1000, Math.ceil((displayedMoney - target) / 8))
    const t = setTimeout(() => {
      const next = step > 0 ? Math.min(displayedMoney + step, target) : Math.max(displayedMoney + step, target)
      setDisplayedMoney(next)
    }, 30)
    return () => clearTimeout(t)
  }, [moneyGap, displayedMoney])

  useEffect(() => {
    if (!graveyardVisible) return
    sfx(playWhoosh)
  }, [graveyardVisible, sfx])

  useEffect(() => {
    if (!diagVisible) return
    sfx(vibrate, [20])
  }, [diagVisible, sfx])

  useEffect(() => {
    if (Object.keys(popped).length > 0 && Object.keys(popped).length < 6) return
    if (Object.keys(popped).length === 6) { clearTimeout(hintTimerRef.current); return }
    hintTimerRef.current = setTimeout(() => setShowHint(true), 30000)
    return () => clearTimeout(hintTimerRef.current)
  }, [popped])

  const poppedCount = Object.keys(popped).length
  const allDestroyed = poppedCount === 6

  const popExcuse = useCallback((idx) => {
    if (popped[idx]) return
    sfx(playPop)
    sfx(vibrate, [30, 20, 30])
    setPopped((p) => ({ ...p, [idx]: 'popping' }))
    setTimeout(() => {
      setPopped((p) => ({ ...p, [idx]: 'gone' }))
      setCounters((c) => ({ ...c, [idx]: true }))
    }, 300)
    setTimeout(() => {
      setCounters((c) => ({ ...c, [idx]: false }))
    }, 2300)
  }, [popped, sfx])

  const slider = useMemo(() => getSliderState(reviewCount), [reviewCount])
  const displayName = bizName.trim() || 'Your Business'

  const scrollToDiag = useCallback(() => diagRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToExcuse = useCallback(() => excuseRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToCompetitor = useCallback(() => competitorRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToGraveyard = useCallback(() => graveyardRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToMoney = useCallback(() => moneyRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToWakeup = useCallback(() => wakeupRef.current?.scrollIntoView({ behavior: 'smooth' }), [])

  const handleMoneySlider = useCallback((e) => {
    const val = Number(e.target.value)
    clearTimeout(moneyDebounceRef.current)
    moneyDebounceRef.current = setTimeout(() => setMoneyGap(val), 50)
    const now = Date.now()
    if (now - kachingRef.current > 500) {
      kachingRef.current = now
      sfx(playKaching)
    }
  }, [sfx])

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Is Your Business Secretly Dying?',
          text: 'This hilarious page shows why Google reviews matter for local businesses 😂',
          url: ROAST_URL,
        })
      } else {
        await navigator.clipboard.writeText(ROAST_URL)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {}
  }, [])

  const handleWhatsAppShare = useCallback(() => {
    const text = encodeURIComponent(`Bhai dekh ye 😂 - Is Your Business Secretly Dying? ${ROAST_URL}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }, [])

  const toggleSound = useCallback(() => {
    setSoundOn((s) => { soundRef.current = !s; return !s })
  }, [])

  return (
    <>
      <style>{`
        .roast-page {
          background: #06060F;
          color: #fff;
          font-family: 'DM Sans', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .roast-page *,
        .roast-page *::before,
        .roast-page *::after {
          box-sizing: border-box;
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
          touch-action: manipulation;
          min-height: 48px;
        }
        .roast-cta:hover { transform: scale(1.05); }
        .roast-cta:focus-visible {
          outline: 2px solid #39FF14;
          outline-offset: 3px;
        }

        /* Hero business-name input */
        .roast-name-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          width: 100%;
        }
        .roast-name-label {
          font-size: 13px;
          color: #6b7280;
          letter-spacing: 0.3px;
        }
        .roast-name-input {
          width: 100%;
          max-width: 320px;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(12, 12, 30, 0.7);
          color: #fff;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 16px;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          touch-action: manipulation;
        }
        .roast-name-input::placeholder { color: #4b5563; }
        .roast-name-input:focus {
          border-color: #39FF14;
          box-shadow: 0 0 0 3px rgba(57, 255, 20, 0.15);
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
          animation: roast-float var(--dur, 20s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
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
          animation-delay: var(--delay, 0s);
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
        @media (max-width: 480px) {
          .roast-game-area { height: 340px; }
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
          touch-action: manipulation;
          min-height: 44px;
          display: flex;
          align-items: center;
          animation: var(--anim, none) var(--dur, 4s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
        @media (max-width: 480px) {
          .roast-bubble {
            font-size: 11px;
            padding: 8px 12px;
            max-width: 48%;
          }
        }
        .roast-bubble:hover { background: rgba(255, 255, 255, 0.08); }
        .roast-bubble:focus-visible {
          outline: 2px solid #39FF14;
          outline-offset: 2px;
        }
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

        /* Section 5: Competitor Nightmare */
        .roast-competitor {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          position: relative;
          z-index: 1;
        }
        .roast-comp-grid {
          display: flex;
          gap: 20px;
          max-width: 600px;
          width: 100%;
          margin-bottom: 32px;
        }
        @media (max-width: 640px) {
          .roast-comp-grid { flex-direction: column; }
        }
        @media (min-width: 641px) {
          .roast-comp-grid > * { flex: 1; }
        }
        .roast-biz-card {
          border-radius: 14px;
          padding: 20px;
          transition: opacity 0.4s ease, filter 0.4s ease;
          position: relative;
        }
        .roast-biz-card.you {
          background: #0C0C1E;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .roast-biz-card.comp {
          background: #0F1628;
          border: 1px solid rgba(57,255,20,0.15);
        }
        .roast-biz-name {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 6px;
        }
        .roast-biz-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin-bottom: 4px;
        }
        .roast-biz-rating .num {
          font-weight: 700;
          font-size: 14px;
        }
        .roast-biz-reviews {
          font-size: 12px;
          margin-bottom: 12px;
        }
        .roast-biz-photos {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
        }
        .roast-biz-photo-placeholder {
          width: 100%;
          height: 48px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .roast-biz-photo-thumb {
          flex: 1;
          height: 48px;
          border-radius: 6px;
        }
        .roast-biz-desc {
          font-size: 12px;
          line-height: 1.5;
          color: #9ca3af;
        }
        .roast-biz-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .roast-slider-wrap {
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        .roast-slider-label {
          font-size: 14px;
          color: #d1d5db;
          margin-bottom: 12px;
        }
        .roast-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #1a1a2e;
          outline: none;
          touch-action: manipulation;
        }
        .roast-slider:focus-visible {
          outline: 2px solid #39FF14;
          outline-offset: 2px;
        }
        .roast-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #39FF14;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(57, 255, 20, 0.4);
        }
        .roast-slider::-moz-range-thumb {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #39FF14;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 12px rgba(57, 255, 20, 0.4);
        }
        .roast-slider-count {
          font-size: 32px;
          font-family: 'Bebas Neue', cursive;
          color: #39FF14;
          margin-top: 8px;
        }
        .roast-slider-status {
          font-size: 15px;
          color: #F59E0B;
          margin-top: 8px;
          min-height: 24px;
          transition: opacity 0.3s ease;
        }

        /* Section 6: Graveyard */
        .roast-graveyard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          position: relative;
          z-index: 1;
        }
        .roast-graveyard::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 180px;
          background: linear-gradient(to bottom, transparent, rgba(100, 116, 139, 0.05));
          pointer-events: none;
        }
        .roast-tombstones {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 400px;
          width: 100%;
          margin-bottom: 40px;
        }
        @media (max-width: 480px) {
          .roast-tombstones {
            grid-template-columns: 1fr;
            max-width: 280px;
          }
        }
        @keyframes roast-tombRise {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .roast-tombstone {
          background: #1a1a2e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50% 50% 4px 4px;
          padding: 32px 16px 24px;
          text-align: center;
          opacity: 0;
        }
        .roast-tombstone.visible {
          animation: roast-tombRise 0.6s ease both;
          animation-delay: var(--delay, 0s);
        }
        .roast-tomb-rip {
          font-family: 'Bebas Neue', cursive;
          font-size: 14px;
          color: #9ca3af;
          letter-spacing: 1px;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .roast-tomb-epitaph {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.5;
          font-style: italic;
        }
        @keyframes roast-pulseSlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .roast-graveyard-bottom {
          font-size: 15px;
          color: #F43F5E;
          text-align: center;
          animation: roast-pulseSlow 2s ease-in-out infinite;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', system-ui, sans-serif;
          touch-action: manipulation;
          padding: 12px 16px;
          min-height: 44px;
        }
        .roast-graveyard-bottom:focus-visible {
          outline: 2px solid #F43F5E;
          outline-offset: 2px;
        }

        /* Sound toggle */
        .roast-sound-toggle {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 51;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(6, 6, 15, 0.8);
          color: #9ca3af;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: background 0.2s;
          touch-action: manipulation;
        }
        .roast-sound-toggle:hover { background: rgba(255,255,255,0.08); }
        .roast-sound-toggle:focus-visible {
          outline: 2px solid #39FF14;
          outline-offset: 2px;
        }

        /* Section 7: Money Calculator */
        .roast-money {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          position: relative;
          z-index: 1;
        }
        .roast-stat-card {
          background: #0C0C1E;
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 14px;
          padding: 24px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          margin-bottom: 40px;
        }
        .roast-stat-main {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(22px, 5vw, 28px);
          color: #F59E0B;
          margin-bottom: 8px;
        }
        .roast-stat-sub {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }
        @keyframes roast-countUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .roast-stat-card.visible {
          animation: roast-countUp 0.6s ease both;
        }

        .roast-money-question {
          font-size: 15px;
          color: #d1d5db;
          text-align: center;
          margin-bottom: 16px;
          max-width: 400px;
        }
        .roast-money-amount {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(40px, 10vw, 64px);
          text-align: center;
          margin: 12px 0 4px;
          transition: color 0.3s ease;
        }
        .roast-money-label {
          font-size: 14px;
          color: #9ca3af;
          text-align: center;
          margin-bottom: 8px;
        }
        .roast-money-comparison {
          font-size: 15px;
          text-align: center;
          min-height: 24px;
          margin: 8px 0 24px;
          color: #d1d5db;
          transition: opacity 0.3s ease;
          padding: 0 16px;
        }
        .roast-money-hardline {
          max-width: 440px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.7;
          margin-bottom: 32px;
          font-style: italic;
          padding: 0 16px;
        }

        /* Section 8: Wake-up Call */
        .roast-wakeup {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          position: relative;
          z-index: 1;
        }
        .roast-tw-lines {
          max-width: 480px;
          width: 100%;
          margin-bottom: 48px;
        }
        .roast-tw-line {
          font-size: clamp(17px, 4vw, 21px);
          line-height: 1.6;
          color: #d1d5db;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s ease, transform 0.5s ease;
          min-height: 1.6em;
        }
        .roast-tw-line.shown {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes roast-cardReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .roast-final-card {
          background: #0C0C1E;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 40px 28px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          animation: roast-cardReveal 0.8s ease both;
        }
        @media (max-width: 480px) {
          .roast-final-card { padding: 32px 20px; }
        }
        .roast-final-logo {
          font-family: 'Bebas Neue', cursive;
          font-size: 32px;
          color: #39FF14;
          letter-spacing: 2px;
          margin-bottom: 16px;
          opacity: 0.85;
        }
        .roast-final-desc {
          font-size: 15px;
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .roast-final-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .roast-final-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          border: none;
          transition: transform 0.15s ease;
          touch-action: manipulation;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .roast-final-btn:hover { transform: scale(1.04); }
        .roast-final-btn:focus-visible {
          outline: 2px solid #39FF14;
          outline-offset: 2px;
        }
        .roast-final-btn.primary {
          background: #fff;
          color: #06060F;
        }
        .roast-final-btn.secondary {
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .roast-final-footnote {
          font-size: 11px;
          color: #4b5563;
        }

        /* Footer */
        .roast-footer {
          padding: 40px 20px;
          text-align: center;
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .roast-footer-text {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 16px;
        }
        .roast-share-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        }
        .roast-share-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #9ca3af;
          font-size: 13px;
          font-family: 'DM Sans', system-ui, sans-serif;
          cursor: pointer;
          transition: background 0.2s;
          touch-action: manipulation;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .roast-share-btn:hover { background: rgba(255,255,255,0.05); }
        .roast-share-btn:focus-visible {
          outline: 2px solid #39FF14;
          outline-offset: 2px;
        }
        .roast-share-btn.whatsapp {
          border-color: rgba(37, 211, 102, 0.3);
          color: #25D366;
        }
        .roast-share-btn.whatsapp:hover {
          background: rgba(37, 211, 102, 0.08);
        }
        .roast-share-btn .copied-tooltip {
          color: #39FF14;
        }

        /* prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .roast-star { animation: none !important; }
          .roast-tombstone.visible {
            animation: none !important;
            opacity: 1;
          }
          .roast-symptom.visible {
            animation: none !important;
            opacity: 1;
          }
          .roast-tw-line {
            transition: none !important;
          }
          .roast-bubble {
            animation: none !important;
          }
          .roast-ticker-inner {
            animation: none !important;
          }
          .roast-dot {
            animation: none !important;
          }
          .roast-cta {
            animation: none !important;
          }
          .roast-hero-h1-1,
          .roast-hero-h1-2 {
            animation: none !important;
            opacity: 1;
          }
          .roast-graveyard-bottom {
            animation: none !important;
            opacity: 1;
          }
          .roast-stat-card.visible {
            animation: none !important;
            opacity: 1;
          }
          .roast-final-card {
            animation: none !important;
            opacity: 1;
          }
          .roast-result-card {
            animation: none !important;
            opacity: 1;
          }
          .roast-counter {
            animation: none !important;
            opacity: 1;
          }
          .roast-counter.fading {
            animation: none !important;
            opacity: 0;
          }
        }
      `}</style>

      <div className="roast-page" onClickCapture={unlockAudio}>
        <button
          className="roast-sound-toggle"
          onClick={toggleSound}
          aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
          aria-pressed={soundOn}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>

        {/* LOADING SCREEN */}
        {loading && (
          <div className={`roast-loader ${fadeOut ? 'fade-out' : ''}`} role="status" aria-label="Loading reputation report">
            <div className="roast-dot" />
            <div className="roast-loader-msg" aria-live="polite">{LOADING_MESSAGES[msgIndex]}</div>
            <div
              className="roast-progress-bar"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* SECTION 2: HERO / BREAKING NEWS */}
        <section className="roast-hero" ref={heroRef} aria-label="Hero">
          {/* Ticker */}
          <div className="roast-ticker-wrap" aria-hidden="true">
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

            <div className="roast-name-group">
              <label htmlFor="biz-name" className="roast-name-label">
                Enter your business name for an honest diagnosis 👇
              </label>
              <input
                id="biz-name"
                className="roast-name-input"
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') scrollToDiag() }}
                placeholder="e.g. Sharma Garments"
                maxLength={40}
                autoComplete="off"
                aria-label="Your business name"
              />
            </div>

            <button className="roast-cta" onClick={scrollToDiag}>
              CHECK YOUR REPUTATION ↓
            </button>
          </div>

          {/* Floating stars */}
          {!prefersReducedMotion && STARS.map((s) => (
            <span
              key={s.id}
              className="roast-star"
              aria-hidden="true"
              style={{
                left: s.left,
                top: s.startY,
                fontSize: s.size,
                '--dur': `${s.duration}s`,
                '--delay': `${s.delay}s`,
              }}
            >
              ⭐
            </span>
          ))}
        </section>

        {/* SECTION 3: THE DIAGNOSIS */}
        <section className="roast-diagnosis" ref={diagRef} aria-label="Diagnosis">
          <div className="roast-section-label">THE DIAGNOSIS</div>
          <div className="roast-card">
            <div className="roast-confidential" aria-hidden="true">CONFIDENTIAL</div>
            <div className="roast-card-header">OFFICIAL REPUTATION REPORT</div>

            <div className="roast-field">
              <div className="roast-field-label">Patient</div>
              <div className="roast-field-value">{displayName}</div>
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
                  style={{ '--delay': `${i * 400}ms` }}
                >
                  <span className="roast-symptom-x" aria-hidden="true">✗</span>
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
        <section className="roast-excuse-section" ref={excuseRef} role="application" aria-label="Excuse Destroyer Game">
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
                    <button
                      className={`roast-bubble ${state === 'popping' ? 'popping' : ''}`}
                      style={{
                        top: bs.top,
                        left: bs.left,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: bs.border,
                        '--anim': state ? 'none' : 'roast-bubbleFloat',
                        '--dur': `${bs.dur}s`,
                        '--delay': `${bs.delay}s`,
                      }}
                      onClick={() => popExcuse(i)}
                      aria-label={`Destroy excuse: ${exc.text}`}
                    >
                      {exc.text}
                    </button>
                  )}
                  {/* Counter fact */}
                  {counters[i] !== undefined && (
                    <div
                      className={`roast-counter ${!counters[i] ? 'fading' : ''}`}
                      style={{ top: bs.top, left: bs.left }}
                      aria-live="polite"
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
                <button className="roast-cta" onClick={scrollToCompetitor}>
                  SHOW ME ↓
                </button>
              </div>
            )}
          </div>

          <div className="roast-score" aria-live="polite">
            <span>{poppedCount}</span>/6 excuses destroyed
          </div>
          {showHint && !allDestroyed && (
            <div className="roast-hint">Tap the excuses to destroy them!</div>
          )}
        </section>

        {/* SECTION 5: THE COMPETITOR NIGHTMARE */}
        <section className="roast-competitor" ref={competitorRef} aria-label="Competitor Comparison">
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(36px, 9vw, 56px)', textAlign: 'center', margin: '0 0 8px' }}>
            THE COMPETITOR NIGHTMARE 😱
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 32, maxWidth: 480 }}>
            This is what customers see when they Google your category
          </p>

          <div className="roast-comp-grid">
            {/* YOU card */}
            <div
              className="roast-biz-card you"
              style={{ opacity: slider.youOpacity, filter: slider.youOpacity < 1 ? `brightness(${0.5 + slider.youOpacity * 0.5})` : 'none' }}
            >
              {slider.badge && (
                <div className="roast-biz-badge" style={{ background: slider.badge === 'HIGHLY RATED' ? 'rgba(57,255,20,0.15)' : 'rgba(245,158,11,0.15)', color: slider.badge === 'HIGHLY RATED' ? '#39FF14' : '#F59E0B' }}>
                  {slider.badge}
                </div>
              )}
              <div className="roast-biz-name" style={{ color: '#d1d5db' }}>{displayName}</div>
              <div className="roast-biz-rating">
                <StarRow rating={slider.rating} size={14} />
                <span className="num" style={{ color: '#d1d5db' }}>{slider.rating}</span>
              </div>
              <div className="roast-biz-reviews" style={{ color: '#6b7280' }}>({reviewCount} reviews)</div>
              <div className="roast-biz-photo-placeholder" style={{ background: '#1a1a2e', color: '#4b5563' }}>
                📷
              </div>
              <p className="roast-biz-desc" style={{ marginTop: 10 }}>Local business</p>
            </div>

            {/* COMPETITOR card */}
            <div
              className="roast-biz-card comp"
              style={{ opacity: slider.compOpacity, filter: slider.compOpacity < 1 ? 'brightness(0.6)' : 'none' }}
            >
              <div className="roast-biz-badge" style={{ background: 'rgba(57,255,20,0.15)', color: '#39FF14' }}>
                OPEN NOW
              </div>
              <div className="roast-biz-name" style={{ color: '#fff' }}>Sharma Ji Next Door™</div>
              <div className="roast-biz-rating">
                <StarRow rating={4.7} size={14} />
                <span className="num" style={{ color: '#fff' }}>4.7</span>
              </div>
              <div className="roast-biz-reviews" style={{ color: '#d1d5db' }}>(187 reviews)</div>
              <div className="roast-biz-photos">
                <div className="roast-biz-photo-thumb" style={{ background: 'linear-gradient(135deg, #F59E0B, #F43F5E)' }} />
                <div className="roast-biz-photo-thumb" style={{ background: 'linear-gradient(135deg, #39FF14, #22D3EE)' }} />
                <div className="roast-biz-photo-thumb" style={{ background: 'linear-gradient(135deg, #818CF8, #F43F5E)' }} />
              </div>
              <p className="roast-biz-desc">
                Trusted by 187 happy customers. Fastest service in the area. 5-star hygiene rated.
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="roast-slider-wrap">
            <label htmlFor="review-slider" className="roast-slider-label">What if YOU had more reviews?</label>
            <input
              id="review-slider"
              type="range"
              className="roast-slider"
              min={12}
              max={200}
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
              aria-valuetext={`${reviewCount} reviews — ${slider.statusText}`}
            />
            <div className="roast-slider-count" aria-hidden="true">{reviewCount} reviews</div>
            <div className="roast-slider-status" aria-live="polite">{slider.statusText}</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <button className="roast-cta" onClick={scrollToGraveyard}>
              But how do you GET those reviews? ↓
            </button>
          </div>
        </section>

        {/* SECTION 6: THE GRAVEYARD */}
        <section className="roast-graveyard" ref={graveyardRef} aria-label="Google Review Graveyard">
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(32px, 8vw, 52px)', textAlign: 'center', margin: '0 0 8px' }}>
            THE GOOGLE REVIEW GRAVEYARD ⚰️
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 40, maxWidth: 480 }}>
            Dedicated to businesses that said &ldquo;reviews don&rsquo;t matter&rdquo;
          </p>

          <div className="roast-tombstones">
            {TOMBSTONES.map((t, i) => (
              <div
                key={i}
                className={`roast-tombstone ${graveyardVisible ? 'visible' : ''}`}
                style={{ '--delay': `${i * 300}ms` }}
              >
                <div className="roast-tomb-rip">R.I.P.<br />{t.name}</div>
                <div className="roast-tomb-epitaph">{t.epitaph}</div>
              </div>
            ))}
          </div>

          <button className="roast-graveyard-bottom" onClick={scrollToMoney}>
            Don't be the next one here. ↓
          </button>
        </section>

        {/* SECTION 7: THE MONEY CALCULATOR */}
        <section className="roast-money" ref={moneyRef} aria-label="Revenue Calculator">
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(36px, 9vw, 56px)', textAlign: 'center', margin: '0 0 8px' }}>
            THE MONEY YOU'RE LOSING 💸
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 32, maxWidth: 400 }}>
            Let's do some painful math
          </p>

          <div className={`roast-stat-card ${moneyVisible ? 'visible' : ''}`}>
            <div className="roast-stat-main">Each Google review = ~₹1,000 in yearly revenue</div>
            <div className="roast-stat-sub">
              Based on industry data: reviews increase click-through by 25-35%, each click has measurable conversion value
            </div>
          </div>

          <label htmlFor="money-slider" className="roast-money-question">
            How many reviews does your COMPETITOR have that you DON'T?
          </label>

          <div className="roast-slider-wrap">
            <input
              id="money-slider"
              type="range"
              className="roast-slider"
              min={0}
              max={200}
              step={5}
              value={moneyGap}
              onChange={handleMoneySlider}
              aria-valuetext={`${moneyGap} reviews gap — ₹${(moneyGap * 1000).toLocaleString('en-IN')} lost per year`}
            />
          </div>

          <div className="roast-money-amount" style={{ color: getMoneyColor(displayedMoney) }} aria-live="polite">
            ₹{displayedMoney.toLocaleString('en-IN')}
          </div>
          <div className="roast-money-label">on the table every year</div>
          <div className="roast-money-comparison">
            {moneyGap > 0 ? getMoneyComparison(moneyGap * 1000) : "Move the slider to see the damage"}
          </div>

          <div className="roast-money-hardline">
            And this compounds. Every month. Every year. While your competitor collects reviews and you... don't.
          </div>

          <button className="roast-cta" onClick={scrollToWakeup}>
            OK I get it. What do I do? ↓
          </button>
        </section>

        {/* SECTION 8: THE WAKE-UP CALL */}
        <section className="roast-wakeup" ref={wakeupRef} aria-label="Wake-up Call">
          <div className="roast-tw-lines">
            {TYPEWRITER_LINES.map((line, i) => (
              <div
                key={i}
                className={`roast-tw-line ${i < twLine ? 'shown' : ''}`}
              >
                {line || ' '}
              </div>
            ))}
          </div>

          {showFinalCard && (
            <div className="roast-final-card">
              <div className="roast-final-logo">praisly</div>
              <div className="roast-final-desc">
                Get Google reviews from happy customers in 30 seconds. No fake reviews. No hassle.
              </div>
              <div className="roast-final-buttons">
                <a
                  href="https://praisly.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="roast-final-btn primary"
                >
                  See How It Works →
                </a>
                <a
                  href="https://praisly.in#demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="roast-final-btn secondary"
                >
                  Watch Demo
                </a>
              </div>
              <div className="roast-final-footnote">
                Used by salons, clinics, gyms, restaurants & more across India
              </div>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="roast-footer">
          <div className="roast-footer-text">
            Made with 🔥 by Praisly — Because your business deserves better than 7 Google reviews
          </div>
          <div className="roast-share-buttons">
            <button className="roast-share-btn whatsapp" onClick={handleWhatsAppShare} aria-label="Share on WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
            </button>
            <button className="roast-share-btn" onClick={handleShare} aria-label={navigator.share ? 'Share this roast' : 'Copy link to clipboard'}>
              {shared ? <span className="copied-tooltip">Copied!</span> : (navigator.share ? 'Share this roast' : 'Copy link')}
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}
