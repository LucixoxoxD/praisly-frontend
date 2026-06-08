import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WhatsAppButton from '../components/WhatsAppButton'
import AnimatedMapMockup from '../components/AnimatedMapMockup'

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.12, ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView]
}

// ─── Lazy demo embed — loads iframe only when scrolled into view ─────────────
function DemoEmbed() {
  const containerRef = useRef(null)
  const [loaded, setLoaded] = useState(false)   // iframe src set
  const [ready, setReady] = useState(false)      // iframe finished loading

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '200px 0px' } // start loading a bit before visible
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="lp-demo-wrap"
      style={{
        marginTop: 48,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        background: '#faf6ec',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Poster / loading state */}
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#faf6ec',
          gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#1A1610',
            display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', background: '#D89020' }} />
            <span style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'white' }}>P</span>
          </div>
          {loaded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#D89020',
                animation: 'demoPulse 1s ease-in-out infinite',
              }} />
              <span style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>Loading demo...</span>
            </div>
          ) : (
            <span style={{ color: 'var(--ink-4)', fontSize: 13, fontWeight: 500 }}>
              See how Praisly works
            </span>
          )}
        </div>
      )}

      {/* Iframe — full bleed, crops top/bottom chrome */}
      {loaded && (
        <iframe
          src="/demo.html"
          onLoad={() => setReady(true)}
          style={{
            position: 'absolute',
            top: '-6%',
            left: 0,
            width: '100%',
            height: '112%',
            border: 'none',
            display: 'block',
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          title="See how Praisly works"
          allow="autoplay"
        />
      )}

      <style>{`
        @keyframes demoPulse { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.3); } }
        .lp-demo-wrap { padding-bottom: 50%; }
        @media (max-width: 768px) { .lp-demo-wrap { padding-bottom: 65%; } }
        @media (max-width: 480px) { .lp-demo-wrap { padding-bottom: 75%; } }
      `}</style>
    </div>
  )
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

// ─── Icon components ──────────────────────────────────────────────────────────
const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
const ArrowUp = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
const Chev = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
const Trophy = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 4h3v2a3 3 0 0 1-3 3M7 4H4v2a3 3 0 0 0 3 3"/></svg>
const Sparkle = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>
const Split = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v6M9 6l3-3 3 3M5 21l4-8M19 21l-4-8M5 21h4M19 21h-4"/></svg>
const Chart = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18M6 16l4-4 3 3 5-6"/></svg>
const StarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m12 17.3-6.18 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73L18.18 21z"/></svg>
const Check = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>

// ─── Category line icons (replace emoji) ─────────────────────────────────────
const ico = (s = 16) => ({ width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
const Tooth = ({ s }) => <svg {...ico(s)}><path d="M12 5.5c-1.4-1.1-3-1.6-4.5-1C6 5.2 5 6.7 5 8.8c0 1.7.4 3 .9 5 .5 2 .9 4.2 2.1 4.2 1 0 1.2-1.6 1.5-3.2.2-1 .6-1.8 1.5-1.8s1.3.8 1.5 1.8c.3 1.6.5 3.2 1.5 3.2 1.2 0 1.6-2.2 2.1-4.2.5-2 .9-3.3.9-5 0-2.1-1-3.6-2.5-4.3-1.5-.6-3.1-.1-4.5 1Z"/></svg>
const Scissors = ({ s }) => <svg {...ico(s)}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>
const Dumbbell = ({ s }) => <svg {...ico(s)}><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></svg>
const Utensils = ({ s }) => <svg {...ico(s)}><path d="M3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 3 0 0 0 0 13zM21 15v7"/></svg>
const Cap = ({ s }) => <svg {...ico(s)}><path d="M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1 2.5 2 6 2s6-1 6-2v-5"/></svg>
const Coffee = ({ s }) => <svg {...ico(s)}><path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2"/></svg>

// ─── Decorative QR code SVG ───────────────────────────────────────────────────
function QrSvg() {
  return (
    <svg viewBox="0 0 21 21" shapeRendering="crispEdges" style={{ width: '100%', height: '100%' }}>
      <rect width="21" height="21" fill="white"/>
      <g fill="#1A1610">
        <rect x="0" y="0" width="7" height="7"/><rect x="14" y="0" width="7" height="7"/><rect x="0" y="14" width="7" height="7"/>
        <rect x="1" y="1" width="5" height="5" fill="white"/><rect x="15" y="1" width="5" height="5" fill="white"/><rect x="1" y="15" width="5" height="5" fill="white"/>
        <rect x="2" y="2" width="3" height="3"/><rect x="16" y="2" width="3" height="3"/><rect x="2" y="16" width="3" height="3"/>
        <rect x="8" y="0" width="1" height="1"/><rect x="10" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/>
        <rect x="9" y="1" width="1" height="1"/><rect x="11" y="1" width="1" height="1"/>
        <rect x="8" y="2" width="1" height="1"/><rect x="10" y="2" width="2" height="1"/>
        <rect x="9" y="3" width="1" height="1"/><rect x="12" y="3" width="1" height="1"/>
        <rect x="8" y="4" width="2" height="1"/><rect x="11" y="4" width="1" height="1"/>
        <rect x="9" y="5" width="1" height="1"/><rect x="12" y="5" width="1" height="1"/>
        <rect x="0" y="8" width="1" height="1"/><rect x="2" y="8" width="2" height="1"/><rect x="5" y="8" width="1" height="1"/><rect x="7" y="8" width="2" height="1"/><rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="2" height="1"/><rect x="15" y="8" width="1" height="1"/><rect x="17" y="8" width="2" height="1"/><rect x="20" y="8" width="1" height="1"/>
        <rect x="1" y="9" width="2" height="1"/><rect x="4" y="9" width="1" height="1"/><rect x="6" y="9" width="1" height="1"/><rect x="9" y="9" width="2" height="1"/><rect x="13" y="9" width="1" height="1"/><rect x="15" y="9" width="2" height="1"/><rect x="19" y="9" width="1" height="1"/>
        <rect x="0" y="10" width="1" height="1"/><rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="2" height="1"/><rect x="8" y="10" width="1" height="1"/><rect x="11" y="10" width="2" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="16" y="10" width="1" height="1"/><rect x="18" y="10" width="2" height="1"/>
        <rect x="1" y="11" width="1" height="1"/><rect x="3" y="11" width="2" height="1"/><rect x="6" y="11" width="2" height="1"/><rect x="10" y="11" width="1" height="1"/><rect x="12" y="11" width="1" height="1"/><rect x="14" y="11" width="2" height="1"/><rect x="17" y="11" width="1" height="1"/><rect x="19" y="11" width="2" height="1"/>
        <rect x="0" y="12" width="2" height="1"/><rect x="3" y="12" width="1" height="1"/><rect x="5" y="12" width="2" height="1"/><rect x="8" y="12" width="2" height="1"/><rect x="11" y="12" width="1" height="1"/><rect x="13" y="12" width="2" height="1"/><rect x="16" y="12" width="2" height="1"/><rect x="19" y="12" width="1" height="1"/>
        <rect x="2" y="13" width="1" height="1"/><rect x="4" y="13" width="2" height="1"/><rect x="7" y="13" width="1" height="1"/><rect x="9" y="13" width="2" height="1"/><rect x="12" y="13" width="2" height="1"/><rect x="15" y="13" width="1" height="1"/><rect x="17" y="13" width="2" height="1"/><rect x="20" y="13" width="1" height="1"/>
        <rect x="8" y="14" width="1" height="1"/><rect x="10" y="14" width="2" height="1"/><rect x="13" y="14" width="1" height="1"/>
        <rect x="9" y="15" width="1" height="1"/><rect x="11" y="15" width="1" height="1"/><rect x="13" y="15" width="2" height="1"/>
        <rect x="8" y="16" width="2" height="1"/><rect x="11" y="16" width="2" height="1"/>
        <rect x="9" y="17" width="1" height="1"/><rect x="12" y="17" width="1" height="1"/><rect x="14" y="17" width="1" height="1"/>
        <rect x="8" y="18" width="1" height="1"/><rect x="10" y="18" width="1" height="1"/><rect x="13" y="18" width="2" height="1"/>
        <rect x="9" y="19" width="2" height="1"/><rect x="12" y="19" width="1" height="1"/>
        <rect x="8" y="20" width="1" height="1"/><rect x="11" y="20" width="2" height="1"/><rect x="14" y="20" width="1" height="1"/>
      </g>
    </svg>
  )
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${open ? 'rgba(216,144,32,0.35)' : 'var(--line)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .15s', boxShadow: open ? 'var(--shadow-sm)' : 'none' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', padding: '20px 22px', fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, textAlign: 'left' }}
      >
        <span>{q}</span>
        <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: open ? 'var(--primary-soft)' : 'var(--surface-tint)', display: 'grid', placeItems: 'center', color: open ? 'var(--primary-ink)' : 'var(--ink-3)', transition: 'transform 0.2s, background 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <Chev />
        </span>
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? 300 : 0, transition: 'max-height 0.3s ease' }}>
        <div style={{ padding: '0 22px 22px', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>{a}</div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
html { scroll-behavior: smooth; overflow-x: hidden; }

/* ── NAV ── */
.lp-nav {
  position: sticky; top: 0; z-index: 30;
  background: rgba(250,246,236,0.82);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid transparent;
  transition: border-color .2s;
}
.lp-nav.scrolled { border-bottom-color: var(--line); }
.lp-nav-inner {
  display: flex; align-items: center; gap: 24px;
  padding: 16px 28px; max-width: 1200px; margin: 0 auto;
}
.lp-brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-display); font-weight: 800; font-size: 21px;
  letter-spacing: -0.02em; color: var(--ink); text-decoration: none;
}
.lp-brand-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--ink); color: white;
  display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 800; font-size: 15px;
  position: relative; overflow: hidden; flex-shrink: 0;
}
.lp-brand-mark::after {
  content: ""; position: absolute; inset: auto 0 0 0;
  height: 38%; background: var(--primary);
}
.lp-brand-mark span { position: relative; z-index: 1; }
.lp-nav-links { display: flex; gap: 28px; margin-left: 18px; }
.lp-nav-links a {
  font-size: 14px; font-weight: 500; color: var(--ink-2);
  text-decoration: none; transition: color .15s;
}
.lp-nav-links a:hover { color: var(--ink); }
.lp-nav-spacer { flex: 1; }
.lp-nav-login {
  font-size: 14px; font-weight: 600; color: var(--ink-2);
  text-decoration: none; padding: 9px 6px; transition: color .15s;
}
.lp-nav-login:hover { color: var(--ink); }

/* ── BUTTONS ── */
.lp-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 20px; border-radius: 11px;
  font-size: 14px; font-weight: 700; letter-spacing: -0.005em;
  white-space: nowrap; text-decoration: none; border: 0; cursor: pointer;
  font-family: inherit;
  transition: transform .12s, box-shadow .15s, background .15s;
}
.lp-btn-primary {
  background: var(--primary); color: #2c1e07;
  box-shadow: 0 1px 0 rgba(255,255,255,.4) inset, 0 6px 18px -6px rgba(216,144,32,.55);
}
.lp-btn-primary:hover { background: #C68018; transform: translateY(-1px); }
.lp-btn-outline {
  background: var(--surface); color: var(--ink);
  border: 1px solid var(--line-2);
}
.lp-btn-outline:hover { background: var(--surface-2); border-color: var(--ink-3); }
.lp-btn-outline-ghost {
  background: transparent; color: white;
  border: 1px solid rgba(255,255,255,0.18);
}
.lp-btn-outline-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.32); }
.lp-btn-lg { padding: 15px 24px; font-size: 15px; border-radius: 12px; }
.lp-btn svg { transition: transform .2s; }
.lp-btn:hover svg { transform: translateX(3px); }

/* ── MOBILE MENU ── */
.lp-mobile-menu { animation: lp-slideDown 0.2s ease; }
@keyframes lp-slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
.lp-mobile-link {
  display: block; padding: 14px 0; font-size: 16px; font-weight: 600;
  color: var(--ink-2); text-decoration: none;
  border-bottom: 1px solid var(--line); transition: color 0.15s;
}
.lp-mobile-link:hover { color: var(--ink); }
@media (max-width: 759px) { .lp-hamburger { display: block !important; } .lp-nav-links { display: none !important; } .lp-nav-login-desktop { display: none !important; } .lp-nav-cta-desktop { display: none !important; } }
@media (min-width: 760px) { .lp-hamburger { display: none !important; } .lp-nav-links { display: flex !important; } .lp-nav-login-desktop { display: block !important; } .lp-nav-cta-desktop { display: inline-flex !important; } }

/* ── HERO ── */
.lp-hero {
  position: relative; padding: 64px 0 80px; overflow: hidden;
}
.lp-hero::before {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(60% 50% at 85% 20%, rgba(216,144,32,0.10), transparent 60%),
    radial-gradient(50% 40% at 10% 90%, rgba(225,59,59,0.05), transparent 60%);
  pointer-events: none;
}
.lp-wrap { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
.lp-hero-grid {
  position: relative; display: grid;
  grid-template-columns: 1.05fr 1fr; gap: 60px; align-items: center;
  box-sizing: border-box; width: 100%; max-width: 100%;
}
.lp-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 14px 6px 8px;
  background: var(--primary-soft); border: 1px solid rgba(155,102,16,0.15);
  border-radius: 999px; font-size: 12px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary-ink);
  white-space: nowrap; margin-bottom: 22px;
}
.lp-hero-eyebrow .dot {
  width: 18px; height: 18px; border-radius: 50%; background: var(--primary);
  display: grid; place-items: center;
}
.lp-hero-eyebrow .dot::after { content: ""; width: 6px; height: 6px; border-radius: 50%; background: white; }
.lp-hero h1 {
  font-family: var(--font-display);
  font-size: clamp(40px, 5.6vw, 68px);
  line-height: 1.0; letter-spacing: -0.035em; font-weight: 700;
  margin: 0 0 22px; color: var(--ink);
}
.lp-hero h1 .accent {
  color: var(--primary-ink);
}
.lp-hero-sub {
  font-size: 18px; line-height: 1.5; color: var(--ink-2);
  max-width: 520px; margin: 0 0 30px;
}
.lp-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.lp-hero-trust {
  margin-top: 22px; display: flex; align-items: center; gap: 14px;
  color: var(--ink-3); font-size: 13px;
}
.lp-stack-avatars { display: flex; }
.lp-stack-avatars > div {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--bg);
  font-family: var(--font-display); font-weight: 700; font-size: 11px;
  color: white; display: grid; place-items: center; margin-left: -8px;
}
.lp-stack-avatars > div:first-child { margin-left: 0; }
.lp-hero-trust strong { color: var(--ink); font-weight: 700; }

/* ── SOCIAL PROOF ── */
.lp-proof { padding: 30px 0 60px; border-top: 1px solid var(--line); }
.lp-proof-label {
  text-align: center; font-size: 12px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 22px;
}
.lp-proof-row { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.lp-proof-chip {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 10px 16px 10px 12px; background: var(--surface);
  border: 1px solid var(--line); border-radius: 999px;
  font-size: 14px; font-weight: 600; color: var(--ink-2);
  transition: background .15s, transform .15s;
}
.lp-proof-chip:hover { background: var(--surface-2); transform: translateY(-1px); }
.lp-proof-chip .ic { width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; font-size: 14px; }

/* ── SECTION COMMON ── */
.lp-section { padding: 80px 0; }
.lp-section-head { text-align: center; max-width: 720px; margin: 0 auto 50px; }
.lp-section-eyebrow {
  display: inline-block; font-family: var(--font-mono);
  font-size: 12px; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--primary-ink); margin-bottom: 14px;
}
.lp-section-head h2 {
  font-family: var(--font-display); font-size: clamp(32px, 4vw, 48px);
  line-height: 1.05; letter-spacing: -0.025em; font-weight: 700;
  margin: 0 0 14px; color: var(--ink);
}
.lp-section-head p { font-size: 18px; color: var(--ink-2); margin: 0; }

/* ── HOW IT WORKS ── */
.lp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.lp-step {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 24px; padding: 28px; display: flex; flex-direction: column; gap: 18px;
}
.lp-step-num {
  font-family: var(--font-display); font-size: 13px; font-weight: 800;
  letter-spacing: 0.06em; color: var(--primary-ink);
  display: inline-flex; align-items: center; gap: 10px;
}
.lp-step-num .nc {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--primary-soft); color: var(--primary-ink);
  display: grid; place-items: center; font-size: 13px; font-weight: 800;
}
.lp-step h3 {
  font-family: var(--font-display); font-size: 22px; line-height: 1.15;
  letter-spacing: -0.015em; font-weight: 700; margin: 0; color: var(--ink);
}
.lp-step p { margin: 0; font-size: 14px; color: var(--ink-3); line-height: 1.5; }
.lp-step-visual {
  margin-top: auto; height: 170px; background: var(--surface-2);
  border-radius: 14px; border: 1px solid var(--line); position: relative; overflow: hidden;
}
.lp-tent-card {
  position: absolute; inset: 18px;
  background: linear-gradient(165deg, var(--primary) 0%, #C68018 100%);
  border-radius: 12px; display: grid; grid-template-columns: 1fr auto;
  align-items: center; padding: 16px 18px; color: #2c1e07;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 8px 22px -10px rgba(216,144,32,.5);
}
.lp-tent-text { font-family: var(--font-display); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; line-height: 1.15; }
.lp-tent-text small { display: block; font-family: inherit; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(44,30,7,0.7); margin-bottom: 6px; }
.lp-qr { width: 84px; height: 84px; background: white; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(26,22,16,0.15); }
.lp-phone-stack { position: absolute; inset: 18px; padding: 14px; display: flex; flex-direction: column; gap: 8px; justify-content: flex-end; }
.lp-chip-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 4px; }
.lp-tagchip { font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--ink-2); }
.lp-tagchip.on { background: var(--ink); color: white; border-color: var(--ink); }
.lp-tagchip.on::before { content: "✓ "; color: var(--primary); margin-right: 1px; font-weight: 800; }
.lp-ai-bubble { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; font-size: 12px; line-height: 1.45; color: var(--ink-2); box-shadow: var(--shadow-sm); }
.lp-ai-bubble::before { content: "✨ AI draft"; display: block; font-family: var(--font-mono); font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary-ink); margin-bottom: 4px; }
.lp-mini-podium { position: absolute; inset: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: end; gap: 8px; }
.lp-mp { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.lp-mp-name { font-size: 10px; font-weight: 600; color: var(--ink-3); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.lp-mp-block { width: 100%; border-radius: 8px 8px 0 0; display: grid; place-items: start center; padding-top: 7px; font-family: var(--font-display); font-weight: 800; font-size: 16px; color: white; position: relative; }
.lp-mp.p1 .lp-mp-block { background: linear-gradient(180deg,#EFC659,#C9971F); height: 90px; }
.lp-mp.p2 .lp-mp-block { background: linear-gradient(180deg,#C8CDD3,#9098A3); height: 64px; }
.lp-mp.p3 .lp-mp-block { background: linear-gradient(180deg,#DA9263,#B26A3C); height: 46px; }
.lp-mp.you .lp-mp-block::after { content: "YOU"; position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--primary); font-size: 9px; font-weight: 800; letter-spacing: 0.08em; padding: 2px 7px; border-radius: 999px; font-family: var(--font-body); }
.lp-climb-arrow { position: absolute; top: 14px; right: 18px; background: var(--win-soft); color: var(--win); font-weight: 800; font-size: 11px; padding: 4px 10px 4px 6px; border-radius: 999px; display: inline-flex; align-items: center; gap: 3px; }

/* ── FEATURES ── */
.lp-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.lp-feat { background: var(--surface); border: 1px solid var(--line); border-radius: 24px; padding: 32px; display: flex; flex-direction: column; gap: 18px; transition: transform .15s, box-shadow .2s; }
.lp-feat:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.lp-feat-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-ink); }
.lp-feat-icon.dark { background: var(--ink); color: var(--primary); }
.lp-feat-icon.red { background: var(--danger-soft); color: var(--danger); }
.lp-feat-icon.green { background: var(--win-soft); color: var(--win); }
.lp-feat h3 { font-family: var(--font-display); font-size: 22px; line-height: 1.18; letter-spacing: -0.018em; font-weight: 700; margin: 0; }
.lp-feat p { font-size: 15px; color: var(--ink-2); margin: 0; line-height: 1.55; }
.lp-feat-art { border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); padding: 18px; font-size: 13px; }
.lp-feat-rank { display: grid; gap: 6px; }
.lp-feat-rank-row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; padding: 8px 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; font-size: 13px; }
.lp-feat-rank-row.you { background: linear-gradient(90deg,rgba(216,144,32,0.12),rgba(216,144,32,0.04)); border-color: rgba(216,144,32,0.35); }
.lp-feat-rank-row .pos { font-family: var(--font-display); font-weight: 800; font-size: 14px; color: var(--ink-3); width: 22px; }
.lp-feat-rank-row.you .pos { color: var(--primary-ink); }
.lp-feat-rank-row .nm { font-weight: 600; color: var(--ink); }
.lp-feat-rank-row .rev { color: var(--ink-3); font-weight: 700; font-size: 12px; }
.lp-feat-ai-line { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; margin-top: 4px; }
.lp-feat-ai-line .lbl { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary-ink); font-weight: 700; margin-bottom: 4px; }
.lp-feat-ai-line .txt { font-size: 13px; color: var(--ink-2); line-height: 1.45; }
.lp-routing { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.lp-route { border: 1px solid var(--line); background: var(--surface); border-radius: 10px; padding: 12px; text-align: center; }
.lp-route .stars { color: #F5B945; font-size: 14px; letter-spacing: 2px; }
.lp-route .label { margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
.lp-route .arrow { font-weight: 800; font-size: 12px; margin-top: 4px; }
.lp-route.happy { border-color: rgba(31,138,91,0.3); background: var(--win-soft); }
.lp-route.happy .arrow { color: var(--win); }
.lp-route.unhappy { border-color: rgba(225,59,59,0.2); background: var(--danger-soft); }
.lp-route.unhappy .arrow { color: var(--danger); }
.lp-gtrack { display: flex; justify-content: space-between; align-items: center; }
.lp-gt-val { font-family: var(--font-display); font-weight: 800; font-size: 30px; letter-spacing: -0.02em; color: var(--ink); line-height: 1; display: inline-flex; align-items: center; gap: 4px; }
.lp-gt-val sup { font-size: 16px; color: #F5B945; display: inline-flex; align-items: center; vertical-align: baseline; }
.lp-gt-meta { font-size: 11.5px; color: var(--ink-3); margin-top: 3px; font-weight: 600; }
.lp-gt-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; background: var(--win-soft); color: var(--win); font-size: 11px; font-weight: 700; margin-top: 4px; }

/* ── PRICING ── */
.lp-pricing-section { background: var(--surface-2); position: relative; }
.lp-pricing-section::before { content: ""; position: absolute; inset: 0; background: radial-gradient(50% 50% at 50% 0%,rgba(216,144,32,0.08),transparent 60%); pointer-events: none; }
.lp-pricing-wrap { text-align: center; position: relative; z-index: 1; }
.lp-pricing-toggle { display: inline-flex; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 4px; gap: 2px; margin-bottom: 36px; }
.lp-pricing-toggle button { padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: var(--ink-3); transition: all .15s; display: inline-flex; align-items: center; gap: 8px; }
.lp-pricing-toggle button.on { background: var(--ink); color: white; }
.lp-save-badge { background: var(--primary); color: #2c1e07; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; letter-spacing: 0.04em; }
.lp-price-card { max-width: 480px; margin: 0 auto; background: var(--surface); border: 1px solid var(--line); border-radius: 24px; padding: 36px 36px 32px; position: relative; box-shadow: var(--shadow-gold); text-align: left; }
.lp-price-card::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; background: linear-gradient(160deg,var(--primary),transparent 60%); z-index: -1; opacity: .55; }
.lp-price-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--primary); padding: 6px 14px; border-radius: 999px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
.lp-plan-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.015em; margin-bottom: 4px; }
.lp-plan-tag { font-size: 14px; color: var(--ink-3); margin-bottom: 22px; }
.lp-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
.lp-price-cur { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--ink); }
.lp-price-amt { font-family: var(--font-display); font-size: 64px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.lp-price-per { color: var(--ink-3); font-size: 16px; font-weight: 600; }
.lp-price-strike { font-size: 14px; color: var(--ink-4); text-decoration: line-through; margin-bottom: 6px; }
.lp-price-note { font-size: 13px; color: var(--ink-3); margin-bottom: 24px; }
.lp-price-note strong { color: var(--ink); font-weight: 700; }
.lp-price-features { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 22px; }
.lp-price-features li { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--ink-2); }
.lp-ck { width: 22px; height: 22px; border-radius: 50%; background: var(--primary-soft); color: var(--primary-ink); display: grid; place-items: center; flex-shrink: 0; font-weight: 800; font-size: 12px; }
.lp-price-cta-row { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.lp-price-cta-row .lp-btn { justify-content: center; }
.lp-price-cta-row .small { text-align: center; font-size: 12px; color: var(--ink-3); }

/* ── FAQ ── */
.lp-faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }

/* ── FOOTER CTA ── */
.lp-cta-section { padding: 80px 0 90px; }
.lp-cta-card { background: var(--ink); color: white; border-radius: 28px; padding: 60px 60px 56px; position: relative; overflow: hidden; text-align: center; }
.lp-cta-card::before { content: ""; position: absolute; inset: 0; background: radial-gradient(50% 60% at 100% 100%,rgba(216,144,32,0.30),transparent 60%),radial-gradient(50% 60% at 0% 0%,rgba(225,59,59,0.15),transparent 60%); pointer-events: none; }
.lp-cta-card > * { position: relative; z-index: 1; }
.lp-cta-eyebrow { display: inline-block; font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }
.lp-cta-card h2 { font-family: var(--font-display); font-size: clamp(34px,4.5vw,56px); line-height: 1.05; letter-spacing: -0.025em; font-weight: 700; margin: 0 0 14px; }
.lp-cta-card p { font-size: 18px; color: rgba(255,255,255,.7); margin: 0 auto 28px; max-width: 520px; }
.lp-cta-card .lp-btn-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ── FOOTER ── */
.lp-footer { padding: 40px 0 50px; border-top: 1px solid var(--line); font-size: 13px; color: var(--ink-3); }
.lp-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.lp-footer-links { display: flex; gap: 24px; }
.lp-footer-links a { color: var(--ink-3); text-decoration: none; transition: color .15s; }
.lp-footer-links a:hover { color: var(--ink); }

/* ── HERO REASSURE ── */
.lp-hero-reassure { display: flex; align-items: center; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
.lp-hero-reassure .lp-re-pill { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px 7px 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
.lp-hero-reassure .lp-re-pill .ic { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-ink); font-size: 12px; font-weight: 800; }
.lp-hero-reassure .lp-re-pill .ic.green { background: var(--win-soft); color: var(--win); }
.lp-hero-reassure .lp-re-pill .ic.ink { background: var(--ink); color: var(--primary); }

/* ── TESTIMONIALS ── */
.lp-testimonials-section { background: var(--surface-2); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.lp-tg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.lp-tcard { background: var(--surface); border: 1px solid var(--line); border-radius: 24px; padding: 26px 26px 22px; display: flex; flex-direction: column; gap: 16px; position: relative; }
.lp-tcard.feat-card { background: var(--ink); color: #F5EFE0; border-color: var(--ink); }
.lp-tcard.feat-card .lp-t-quote { color: white; }
.lp-tcard.feat-card .lp-t-name { color: white; }
.lp-tcard.feat-card .lp-t-meta { color: rgba(255,255,255,0.55); }
.lp-tcard.feat-card .lp-t-rank { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); }
.lp-tcard.feat-card .lp-t-rank .arr { color: var(--primary); }
.lp-tcard.feat-card .lp-t-rank .from { color: rgba(255,255,255,0.5); }
.lp-tcard.feat-card .lp-t-rank .to { color: var(--primary); }
.lp-t-stars { display: flex; gap: 1px; color: #F5B945; }
.lp-t-stars svg { width: 16px; height: 16px; }
.lp-t-quote { font-family: var(--font-display); font-size: 18px; line-height: 1.35; letter-spacing: -0.012em; color: var(--ink); font-weight: 500; margin: 0; }
.lp-t-quote .accent { color: var(--primary-ink); font-weight: 700; }
.lp-tcard.feat-card .lp-t-quote .accent { color: var(--primary); }
.lp-t-author { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 4px; }
.lp-t-av { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-display); font-weight: 700; color: white; font-size: 14px; flex-shrink: 0; }
.lp-t-name { font-weight: 700; font-size: 14px; color: var(--ink); line-height: 1.2; }
.lp-t-meta { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
.lp-t-rank { background: var(--surface-2); border: 1px solid var(--line); border-radius: 11px; padding: 10px 12px; display: flex; align-items: center; gap: 6px; font-family: var(--font-display); font-weight: 700; font-size: 14px; }
.lp-t-rank .from { color: var(--ink-3); }
.lp-t-rank .arr { color: var(--win); font-weight: 800; }
.lp-t-rank .to { color: var(--primary-ink); font-size: 18px; }
.lp-t-rank .label { margin-left: auto; font-family: inherit; font-size: 11px; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.06em; }

/* ── ROI STRIP ── */
.lp-roi-strip { max-width: 760px; margin: 28px auto 0; background: var(--ink); color: white; border-radius: 16px; padding: 18px 22px; display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; position: relative; overflow: hidden; }
.lp-roi-strip::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 100% at 100% 50%, rgba(216,144,32,0.20), transparent 60%); pointer-events: none; }
.lp-roi-strip > * { position: relative; z-index: 1; }
.lp-roi-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary); color: #2c1e07; display: grid; place-items: center; font-size: 22px; font-weight: 800; font-family: var(--font-display); flex-shrink: 0; }
.lp-roi-content .lbl { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 2px; }
.lp-roi-content .body { font-family: var(--font-display); font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: white; }
.lp-roi-content .body strong { color: var(--primary); font-weight: 700; }

/* ── LOCAL PACK ── */
.lp-local-pack-section { background: var(--bg); }
.lp-lpwrap { display: grid; grid-template-columns: 1fr 1.1fr; gap: 50px; align-items: center; }
.lp-lp-copy h2 { font-family: var(--font-display); font-size: clamp(28px, 3.6vw, 42px); line-height: 1.05; letter-spacing: -0.025em; font-weight: 700; margin: 16px 0 16px; color: var(--ink); }
.lp-lp-copy p { font-size: 18px; color: var(--ink-2); margin: 0 0 24px; max-width: 460px; }
.lp-lp-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.lp-lp-bullets li { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; color: var(--ink-2); }
.lp-lp-bullets .ck { width: 24px; height: 24px; border-radius: 50%; background: var(--primary-soft); color: var(--primary-ink); display: grid; place-items: center; flex-shrink: 0; font-weight: 800; font-size: 13px; margin-top: 1px; }
.lp-maps-frame { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-md); position: relative; }
.lp-maps-search { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--surface); }
.lp-g-logo { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
.lp-g-logo .b { color: #4285F4; } .lp-g-logo .r { color: #EA4335; } .lp-g-logo .y { color: #FBBC05; }
.lp-g-logo .b2 { color: #4285F4; } .lp-g-logo .g { color: #34A853; } .lp-g-logo .r2 { color: #EA4335; }
.lp-maps-qbox { flex: 1; background: var(--surface-2); border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; font-size: 13px; color: var(--ink-2); }
.lp-maps-chips { display: flex; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--line); font-size: 12px; overflow-x: auto; }
.lp-maps-chip { padding: 5px 12px; border: 1px solid var(--line); border-radius: 999px; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
.lp-maps-chip.on { background: var(--ink); color: white; border-color: var(--ink); }
.lp-maps-results { padding: 4px 0 8px; }
.lp-maps-result { display: grid; grid-template-columns: auto 1fr auto; gap: 14px; padding: 14px 18px; border-bottom: 1px solid var(--line); align-items: start; }
.lp-maps-result:last-child { border-bottom: 0; }
.lp-maps-result.you { background: linear-gradient(90deg, rgba(216,144,32,0.10), rgba(216,144,32,0.0)); box-shadow: inset 3px 0 0 var(--primary); }
.lp-maps-pin { width: 28px; height: 28px; border-radius: 8px; background: var(--ink); color: white; display: grid; place-items: center; font-family: var(--font-display); font-weight: 800; font-size: 12px; margin-top: 2px; }
.lp-maps-result.you .lp-maps-pin { background: var(--primary); color: #2c1e07; }
.lp-maps-name { font-weight: 700; font-size: 15px; color: #1A0DAB; letter-spacing: -0.005em; }
.lp-maps-name .you-tag { background: var(--primary); color: #2c1e07; font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em; padding: 2px 6px; border-radius: 4px; margin-left: 6px; vertical-align: middle; }
.lp-maps-rating { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--ink-2); margin-top: 3px; }
.lp-maps-rating .stars { color: #FBBC05; letter-spacing: -1px; font-size: 13px; }
.lp-maps-rating .num { font-weight: 700; }
.lp-maps-rating .reviews { color: var(--ink-3); }
.lp-maps-rating .dot-sep { color: var(--ink-4); margin: 0 2px; }
.lp-maps-meta { font-size: 12px; color: var(--ink-3); margin-top: 3px; }
.lp-maps-cta { text-align: right; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: var(--ink-4); text-transform: uppercase; align-self: center; font-family: var(--font-mono); }
.lp-maps-result.you .lp-maps-cta { color: var(--primary-ink); }
.lp-maps-floater { position: absolute; top: 50%; right: -24px; transform: translateY(-50%) rotate(3deg); background: var(--ink); color: white; padding: 12px 16px; border-radius: 14px; font-size: 13px; font-weight: 600; line-height: 1.3; max-width: 220px; box-shadow: 0 18px 40px -16px rgba(26,22,16,0.5); z-index: 2; }
.lp-maps-floater strong { color: var(--primary); }
.lp-maps-floater::after { content: ""; position: absolute; left: -8px; top: 50%; transform: translateY(-50%) rotate(45deg); width: 16px; height: 16px; background: var(--ink); }

/* ── VS CONNECTOR ── */
.lp-vs-connector {
  position: absolute; top: 178px; left: 44%;
  transform: translate(-50%, -50%); z-index: 10;
  display: flex; flex-direction: column; align-items: center;
}
.lp-vs-connector::before,
.lp-vs-connector::after {
  content: ""; width: 0; border-left: 1.5px dashed var(--line-2); height: 38px;
}
.lp-vs-badge {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--ink); color: white;
  display: grid; place-items: center;
  font-size: 9px; font-weight: 800; letter-spacing: 0.04em;
  box-shadow: 0 2px 8px rgba(26,22,16,0.3); flex-shrink: 0;
}

/* ── RESPONSIVE ── */
@media (max-width: 1080px) {
  .lp-hero-grid { grid-template-columns: 1fr; gap: 48px; }
  .lp-features { grid-template-columns: 1fr; }
  .lp-tg { grid-template-columns: 1fr; }
  .lp-lpwrap { grid-template-columns: 1fr; gap: 32px; }
  .lp-maps-floater { display: none; }
}
@media (max-width: 760px) {
  .lp-nav-links { display: none !important; }
  .lp-hero { padding: 40px 0 50px; }
  .lp-section { padding: 60px 0; }
  .lp-steps { grid-template-columns: 1fr; }
  .lp-cta-card { padding: 40px 28px; }
  .lp-hero h1 { font-size: 40px; }
  .lp-roi-strip { grid-template-columns: 1fr; text-align: center; }
  .lp-roi-icon { margin: 0 auto; }
}
@media (max-width: 480px) {
  .lp-wrap { padding: 0 20px; }
  .lp-nav-inner { padding: 12px 20px; }
  .lp-price-card { padding: 28px 22px; }
}
@media (max-width: 768px) {
  .lp-hero { overflow: hidden; }
  /* Grid: force single column, prevent min-content size from expanding column */
  .lp-hero-grid {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
  }
  .lp-hero-grid > * { min-width: 0; }
  /* VS connector: horizontal divider, centered */
  .lp-vs-connector {
    display: flex !important;
    position: relative !important;
    top: auto !important; left: auto !important; right: auto !important;
    transform: none !important;
    flex-direction: row !important;
    align-items: center !important;
    margin: 4px auto !important;
    width: 80px !important;
    z-index: 10;
  }
  .lp-vs-connector::before,
  .lp-vs-connector::after {
    height: 0 !important;
    width: 28px !important;
    border-left: none !important;
    border-top: 1.5px dashed var(--line-2) !important;
  }
}
`

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [lpYearly, setLpYearly] = useState(false)

  const DEMO_EMAIL    = import.meta.env.VITE_DEMO_EMAIL
  const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD

  async function handleDemoLogin() {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) return
    setDemoLoading(true)
    try {
      const { authService } = await import('../services/api')
      await authService.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      navigate('/dashboard')
    } catch (err) {
      console.error('Demo login failed:', err)
      setDemoLoading(false)
      alert('Demo is temporarily unavailable. Please try again in a moment.')
    }
  }

  useEffect(() => {
    document.title = 'Praisly — Beat the Business Next Door on Google'
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <style>{STYLES}</style>

      {/* ══════════════════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════════════════ */}
      <header className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <a href="#" className="lp-brand" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span className="lp-brand-mark"><span>P</span></span>
            Praisly
          </a>

          <nav className="lp-nav-links">
            {[['How it works', '#how'], ['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>

          <div className="lp-nav-spacer" />

          <Link to="/login" className="lp-nav-login lp-nav-login-desktop">Login</Link>
          <Link to="/signup" className="lp-btn lp-btn-primary lp-nav-cta-desktop" style={{ padding: '9px 18px', fontSize: 14, borderRadius: 9 }}>
            Start free trial <Arrow />
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lp-hamburger"
            onClick={() => setMobileMenuOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--ink)', padding: 4 }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <>
            <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
            <div className="lp-mobile-menu" style={{ position: 'fixed', top: 57, left: 0, right: 0, zIndex: 99, background: 'white', padding: '8px 28px 24px', boxShadow: '0 8px 24px rgba(26,22,16,0.12)', borderBottom: '1px solid var(--line)' }}>
              {[['How it works', '#how'], ['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
                <a key={label} href={href} className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>{label}</a>
              ))}
              <Link to="/login" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="lp-btn lp-btn-primary" style={{ display: 'flex', marginTop: 16, justifyContent: 'center' }}>
                Start free trial <Arrow />
              </Link>
            </div>
          </>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-wrap lp-hero-grid">

          {/* Left: text */}
          <div>
            <span className="lp-hero-eyebrow">
              <span className="dot" />
              Rank · Review · Win
            </span>

            <h1>
              The shop next door has<br/>
              <span className="accent">4× your reviews.</span> Not for long.
            </h1>

            <p className="lp-hero-sub">
              Your competitor gets 4 new Google reviews every week. You get none. Praisly gives you a simple QR code — customers scan, review, done. All you do is stick the QR.
            </p>

            <div className="lp-hero-ctas">
              <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">
                Start free — no card needed <Arrow />
              </Link>
              {DEMO_EMAIL && DEMO_PASSWORD ? (
                <button onClick={handleDemoLogin} disabled={demoLoading} className="lp-btn lp-btn-outline lp-btn-lg">
                  {demoLoading ? 'Loading…' : 'See live demo (2 min)'}
                </button>
              ) : (
                <a href="#features" className="lp-btn lp-btn-outline lp-btn-lg">See how it works</a>
              )}
            </div>

            <div className="lp-hero-reassure">
              <span className="lp-re-pill"><span className="ic green">✓</span>Setup in 10 min</span>
              <span className="lp-re-pill"><span className="ic ink">W</span>WhatsApp support</span>
            </div>

            <div className="lp-hero-trust">
              <div className="lp-stack-avatars">
                <div style={{ background: 'linear-gradient(135deg,#FF7C4F,#E13B3B)' }}>SD</div>
                <div style={{ background: 'linear-gradient(135deg,#5b6ee8,#3950b8)' }}>PN</div>
                <div style={{ background: 'linear-gradient(135deg,#2a8c5e,#1a6843)' }}>GK</div>
                <div style={{ background: 'linear-gradient(135deg,#EFC659,#C9971F)' }}>RC</div>
              </div>
              <div><strong>200+ dentists, salons & restaurants</strong> across India trust Praisly</div>
            </div>
          </div>

          {/* Right: Animated Google Maps mockup */}
          <AnimatedMapMockup />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SOCIAL PROOF BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-proof">
        <div className="lp-wrap">
          <div className="lp-proof-label">Trusted by salons, dentists, gyms, and restaurants across India</div>
          <div className="lp-proof-row">
            {[
              [<Tooth s={15} />, 'Dentists', '#FCE6E6'],
              [<Scissors s={15} />, 'Salons', '#FBEED0'],
              [<Dumbbell s={15} />, 'Gyms', '#E3F4EB'],
              [<Utensils s={15} />, 'Restaurants', '#FDF7E4'],
              [<Cap s={15} />, 'Coaching centres', '#EEF0F2'],
              [<Coffee s={15} />, 'Cafés', '#F7E6D6'],
            ].map(([icon, label, bg]) => (
              <span key={label} className="lp-proof-chip">
                <span className="ic" style={{ background: bg, color: 'var(--ink-2)' }}>{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-testimonials-section" id="sec-testimonials">
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">Real shops · Real ranks</span>
              <h2>From "we're invisible on Google" to <em style={{ fontStyle: 'italic', color: 'var(--primary-ink)' }}>#1 on Google Maps</em>.</h2>
            </div>
          </Reveal>
          <div className="lp-tg">
            <Reveal delay={0}>
              <article className="lp-tcard">
                <div className="lp-t-stars">{[...Array(5)].map((_, i) => <StarIcon key={i} />)}</div>
                <p className="lp-t-quote">"My competitor had been #1 for 3 years. We crossed him in <span className="accent">6 weeks</span>. The QR code on the billing counter is doing all the work."</p>
                <div className="lp-t-rank">
                  <span className="from">#5</span><span className="arr">→</span><span className="to">#1</span>
                  <span className="label">In 6 weeks</span>
                </div>
                <div className="lp-t-author">
                  <div className="lp-t-av" style={{ background: 'linear-gradient(135deg,#FF7C4F,#E13B3B)' }}>RG</div>
                  <div>
                    <div className="lp-t-name">Dr. Rohan Gupta</div>
                    <div className="lp-t-meta">Gupta Dental · Sector 18, Noida</div>
                  </div>
                </div>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="lp-tcard feat-card">
                <div className="lp-t-stars">{[...Array(5)].map((_, i) => <StarIcon key={i} />)}</div>
                <p className="lp-t-quote">"We were invisible on Google. Now every week new customers walk in saying they saw us at the top of Maps. <span className="accent">Praisly changed the game for us.</span>"</p>
                <div className="lp-t-rank">
                  <span className="from">47</span><span className="arr">→</span><span className="to">312</span>
                  <span className="label">Reviews · 4 months</span>
                </div>
                <div className="lp-t-author">
                  <div className="lp-t-av" style={{ background: 'linear-gradient(135deg,#2a8c5e,#1a6843)' }}>PS</div>
                  <div>
                    <div className="lp-t-name">Priya Sharma</div>
                    <div className="lp-t-meta">Radiance Salon & Spa · HSR Layout, Bengaluru</div>
                  </div>
                </div>
              </article>
            </Reveal>
            <Reveal delay={160}>
              <article className="lp-tcard">
                <div className="lp-t-stars">{[...Array(5)].map((_, i) => <StarIcon key={i} />)}</div>
                <p className="lp-t-quote">"Set it up in 15 minutes over WhatsApp with their team. <span className="accent">One extra walk-in per week</span> already pays for the whole year. No-brainer."</p>
                <div className="lp-t-rank">
                  <span className="from">3.9★</span><span className="arr">→</span><span className="to">4.7★</span>
                  <span className="label">Rating · 8 weeks</span>
                </div>
                <div className="lp-t-author">
                  <div className="lp-t-av" style={{ background: 'linear-gradient(135deg,#5b6ee8,#3950b8)' }}>AK</div>
                  <div>
                    <div className="lp-t-name">Arjun Kothari</div>
                    <div className="lp-t-meta">FitZone Gym · Andheri West, Mumbai</div>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="how">
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">How it works</span>
              <h2>Three steps. No tech. Real reviews.</h2>
              <p>Set up in 10 minutes. Your customers do the rest — Praisly just makes it stupidly easy for them to share their experience.</p>
            </div>
          </Reveal>

          <div className="lp-steps">
            {/* Step 1 */}
            <Reveal delay={0}>
              <div className="lp-step">
                <span className="lp-step-num"><span className="nc">1</span>STEP 01</span>
                <h3>Print your QR code</h3>
                <p>Stick it on your counter, billing desk, or back of the menu. Customers scan it on the way out.</p>
                <div className="lp-step-visual">
                  <div className="lp-tent-card">
                    <div className="lp-tent-text">
                      <small>Scan to share your experience</small>
                      Sharma Dental Clinic
                    </div>
                    <div className="lp-qr"><QrSvg /></div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Step 2 */}
            <Reveal delay={100}>
              <div className="lp-step">
                <span className="lp-step-num"><span className="nc">2</span>STEP 02</span>
                <h3>Customer writes, we just help</h3>
                <p>Customer taps what they liked. A draft is ready in seconds — they edit it in their own words and post from their own Google account. No fake reviews, no risk to your business.</p>
                <div className="lp-step-visual" style={{ background: 'linear-gradient(180deg,#FDF7E4,#FBEED0)' }}>
                  <div className="lp-phone-stack">
                    <div className="lp-chip-row">
                      <span className="lp-tagchip on">Painless</span>
                      <span className="lp-tagchip on">Polite staff</span>
                      <span className="lp-tagchip">Clean clinic</span>
                      <span className="lp-tagchip on">On-time</span>
                    </div>
                    <div className="lp-ai-bubble">
                      Got my root canal here last week. Zero pain, Dr. Sharma explained everything, and they ran on time. Front desk was super polite too. Will def be back 👍
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Step 3 */}
            <Reveal delay={200}>
              <div className="lp-step">
                <span className="lp-step-num"><span className="nc">3</span>STEP 03</span>
                <h3>Watch your ranking climb</h3>
                <p>Track competitors in real time. See exactly where you stand vs the shop next door — and what move closes the gap.</p>
                <div className="lp-step-visual">
                  <span className="lp-climb-arrow"><ArrowUp /> You · +8</span>
                  <div className="lp-mini-podium">
                    <div className="lp-mp p2"><div className="lp-mp-name">City Dental</div><div className="lp-mp-block">2</div></div>
                    <div className="lp-mp p1"><div className="lp-mp-name">Noida Smile</div><div className="lp-mp-block">1</div></div>
                    <div className="lp-mp p3 you"><div className="lp-mp-name" style={{ color: 'var(--ink)', fontWeight: 700 }}>Sharma</div><div className="lp-mp-block">3</div></div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <DemoEmbed />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="features" style={{ paddingTop: 20, background: 'var(--surface-2)' }}>
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">Everything you need</span>
              <h2>The only review tool built around <em style={{ fontStyle: 'italic', color: 'var(--primary-ink)' }}>competition</em>.</h2>
              <p>Other tools just collect reviews. Praisly shows you exactly who's beating you on Google — and helps you overtake them.</p>
            </div>
          </Reveal>

          <div className="lp-features">
            {/* Feature 1: Competitor Rankings */}
            <Reveal delay={0}>
              <div className="lp-feat">
                <div className="lp-feat-icon dark"><Trophy /></div>
                <h3>Competitor Rankings</h3>
                <p>See exactly where you stand vs the shop next door. Track up to 10 nearby competitors weekly — and know which one to chase.</p>
                <div className="lp-feat-art">
                  <div className="lp-feat-rank">
                    {[['#1', 'Noida Smile Dental', '1,169', false], ['#2', 'City Dental Care', '61', false], ['#3', 'Sharma Dental · YOU', '58 ↗', true], ['#4', 'Pearl Dental Studio', '44', false]].map(([pos, nm, rev, you]) => (
                      <div key={pos} className={`lp-feat-rank-row${you ? ' you' : ''}`}>
                        <span className="pos">{pos}</span>
                        <span className="nm">{nm}</span>
                        <span className="rev">{rev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 2: AI Review Drafts */}
            <Reveal delay={80}>
              <div className="lp-feat">
                <div className="lp-feat-icon"><Sparkle /></div>
                <h3>AI Review Drafts</h3>
                <p>Customer taps what they liked, a draft appears in seconds. They edit it, post it from their own Google account. 100% real, 100% Google-safe.</p>
                <div className="lp-feat-art">
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="lp-tagchip on">Quick service</span>
                    <span className="lp-tagchip on">Great trainer</span>
                    <span className="lp-tagchip">Clean</span>
                  </div>
                  <div className="lp-feat-ai-line">
                    <div className="lbl">✨ AI draft · ready to post</div>
                    <div className="txt">Joined Anytime Fitness last month — the trainer Rohit really knows his stuff. Quick service, no waiting around. Genuinely recommend.</div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 3: Google Tracking */}
            <Reveal delay={160}>
              <div className="lp-feat">
                <div className="lp-feat-icon green"><Chart /></div>
                <h3>Google Tracking</h3>
                <p>Your rating, review count, and competitor data — updated automatically. Get WhatsApp alerts when something moves.</p>
                <div className="lp-feat-art">
                  <div className="lp-gtrack">
                    <div>
                      <div className="lp-gt-val">4.5<sup><StarIcon /></sup></div>
                      <div className="lp-gt-meta">Google rating · synced 12 min ago</div>
                      <div className="lp-gt-pill">↗ +0.3 vs last month</div>
                    </div>
                    <svg viewBox="0 0 110 36" preserveAspectRatio="none" style={{ height: 36, width: 110 }}>
                      <defs>
                        <linearGradient id="ggrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#1F8A5B" stopOpacity=".25"/>
                          <stop offset="100%" stopColor="#1F8A5B" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,28 L10,26 L22,24 L34,22 L46,20 L58,18 L70,14 L82,10 L94,8 L110,4 L110,36 L0,36 Z" fill="url(#ggrad)"/>
                      <polyline fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points="0,28 10,26 22,24 34,22 46,20 58,18 70,14 82,10 94,8 110,4"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          GOOGLE MAPS LOCAL PACK
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-local-pack-section" id="sec-local-pack">
        <div className="lp-wrap lp-lpwrap">
          <div className="lp-lp-copy">
            <span className="lp-section-eyebrow">Google Maps is the real game</span>
            <h2>Top 3 on Google Maps gets <em style={{ fontStyle: 'italic', color: 'var(--primary-ink)' }}>76% of all calls</em> in your area.</h2>
            <p>When someone searches "dentist near me" or "salon near me," Google shows only 3 businesses at the top. 76% of calls go to those 3. Praisly's whole job is getting you in there.</p>
            <ul className="lp-lp-bullets">
              {[
                'See your live Google Maps position — updated daily',
                'Know which competitors are in the top 3 right now',
                'Get the exact review count you need to overtake them',
                'WhatsApp alert the moment your rank changes',
              ].map(item => (
                <li key={item}><span className="ck">✓</span>{item}</li>
              ))}
            </ul>
          </div>

          <div className="lp-maps-frame">
            <div className="lp-maps-floater">
              <strong>+ 23 reviews</strong> and you take the #1 slot on Maps. Praisly tells you when.
            </div>
            <div className="lp-maps-search">
              <span className="lp-g-logo">
                <span className="b">G</span><span className="r">o</span><span className="y">o</span>
                <span className="b2">g</span><span className="g">l</span><span className="r2">e</span>
              </span>
              <div className="lp-maps-qbox">🔍 gym near me — Andheri West, Mumbai</div>
            </div>
            <div className="lp-maps-chips">
              <span className="lp-maps-chip on">Open now</span>
              <span className="lp-maps-chip">Top rated</span>
              <span className="lp-maps-chip">24/7</span>
              <span className="lp-maps-chip">All</span>
            </div>
            <div className="lp-maps-results">
              {[
                { pin: 'A', name: "Gold's Gym Andheri West", rating: '4.5', stars: '★★★★★', reviews: '(2,341)', type: 'Gym', meta: 'Lokhandwala · Open · 24 hrs · 1.1 km', cta: '#1', you: false },
                { pin: 'B', name: 'Cult Fit Andheri', rating: '4.3', stars: '★★★★☆', reviews: '(894)', type: 'Fitness centre', meta: 'Andheri West · Open · Closes 11pm · 2.3 km', cta: '#2', you: false },
                { pin: 'C', name: 'FitZone Gym', rating: '4.7', stars: '★★★★★', reviews: '(412)', type: 'Gym · Climbing ↗', meta: 'Andheri West · Open · 5am–11pm · 0.4 km', cta: '#3', you: true },
              ].map(r => (
                <div key={r.pin} className={`lp-maps-result${r.you ? ' you' : ''}`}>
                  <div className="lp-maps-pin">{r.pin}</div>
                  <div>
                    <div className="lp-maps-name">
                      {r.name}{r.you && <span className="you-tag">YOU</span>}
                    </div>
                    <div className="lp-maps-rating">
                      <span className="num">{r.rating}</span>
                      <span className="stars">{r.stars}</span>
                      <span className="reviews">{r.reviews}</span>
                      <span className="dot-sep">·</span>
                      <span>{r.type}</span>
                    </div>
                    <div className="lp-maps-meta">{r.meta}</div>
                  </div>
                  <div className="lp-maps-cta">{r.cta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-pricing-section" id="pricing">
        <div className="lp-wrap lp-pricing-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">Simple, honest pricing</span>
              <h2>One plan. Everything included.</h2>
              <p>No per-review fees. No tiers to figure out. Just pick monthly or yearly.</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="lp-pricing-toggle">
              <button className={!lpYearly ? 'on' : ''} onClick={() => setLpYearly(false)}>Monthly</button>
              <button className={lpYearly ? 'on' : ''} onClick={() => setLpYearly(true)}>
                Yearly <span className="lp-save-badge">SAVE 17%</span>
              </button>
            </div>
          </Reveal>

          <Reveal>
            <div className="lp-price-card">
              <span className="lp-price-badge">★ Early Adopter Pricing</span>
              <div className="lp-plan-name">Praisly Pro</div>
              <div className="lp-plan-tag">For one business location · Unlimited reviews</div>

              {lpYearly && <div className="lp-price-strike">₹999/month</div>}

              <div className="lp-price-row">
                <span className="lp-price-cur">₹</span>
                <span className="lp-price-amt">{lpYearly ? '833' : '999'}</span>
                <span className="lp-price-per">/ month</span>
              </div>

              <div className="lp-price-note">
                {lpYearly
                  ? <><strong>Billed ₹9,999/year.</strong> Just ₹27/day — less than a chai. 7 days free · No card required.</>
                  : <><strong>Just ₹33/day</strong> — less than your daily chai. 7 days free · No card required. Cancel anytime.</>
                }
              </div>

              <ul className="lp-price-features">
                {[
                  'Unlimited review requests & QR codes',
                  'AI-assisted review drafts',
                  'Competitor tracking (up to 10)',
                  'Private feedback inbox',
                  'WhatsApp & email alerts',
                  'Google rating & analytics tracking',
                ].map(f => (
                  <li key={f}>
                    <span className="lp-ck"><Check /></span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="lp-price-cta-row">
                <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">
                  Start free trial <Arrow />
                </Link>
                <div className="small">No credit card · Cancel in 1 click · Setup in 10 minutes</div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="lp-roi-strip">
              <div className="lp-roi-icon">₹</div>
              <div className="lp-roi-content">
                <div className="lbl">Quick math · Pays for itself</div>
                <div className="body">Average local business gains <strong>5 extra walk-ins / week</strong> from better Google ranking. <strong>Just 1 extra customer pays for the whole month.</strong> The rest is pure profit.</div>
              </div>
              <Link to="/signup" className="lp-btn lp-btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                Start free trial <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WHAT HAPPENS AFTER SIGNUP
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="after-signup" style={{ paddingTop: 20, paddingBottom: 40 }}>
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">What happens after you sign up?</span>
              <h2>We set everything up for you.</h2>
              <p>No tech skills needed. Seriously.</p>
            </div>
          </Reveal>
          <div className="lp-steps" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Reveal delay={0}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 800, fontSize: 15, color: 'var(--primary-ink)' }}>1</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>We call you on WhatsApp within 1 hour</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>Our team walks you through everything — in whatever language you're comfortable with.</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 800, fontSize: 15, color: 'var(--primary-ink)' }}>2</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Your QR code is ready — we send the printable PDF</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>Just print it at any nearby shop (₹10) and stick it on your counter or billing desk.</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 800, fontSize: 15, color: 'var(--primary-ink)' }}>3</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Reviews start coming in — we track everything for you</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>Open your dashboard anytime to see your Google rank, competitor positions, and new reviews. You'll get WhatsApp alerts too.</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="faq">
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">FAQ</span>
              <h2>Questions we hear a lot.</h2>
            </div>
          </Reveal>

          <div className="lp-faq-list">
            {[
              ['Is this allowed by Google? Will my listing get banned?', 'Absolutely safe. Your customers post reviews from their own Google accounts, in their own words. Praisly just makes it easy for them — like a pen and paper. Google has zero issues with this because every review is real, written by a real customer. 200+ businesses use Praisly with zero problems.'],
              ['Can I cancel anytime?', 'Yes, cancel anytime from your dashboard — no questions asked, no hidden fees. Your subscription stops at the end of your billing period and you keep access until then. We also offer a full refund within the first 14 days if Praisly isn\'t right for you.'],
              ['Do my customers need to download anything?', 'No app, no signup. They scan a QR code, tap what they liked, and tap once more to post on Google. The whole thing takes under 30 seconds.'],
              ['What if a customer is unhappy?', 'Unhappy customers get a private feedback form — straight to your dashboard inbox — so you can call, apologise, and fix the issue directly. All customers can still leave a Google review. You just get an early heads-up when someone had a bad experience.'],
              ['How does competitor tracking work?', 'Tell us your business category and location. We automatically find your top 10 nearby competitors on Google and track their review count, rating, and growth every week. You\'ll see exactly who\'s gaining, who\'s stalled, and how far you are from #1.'],
              ['Do I need a website or technical skills?', 'Not at all. If you can use WhatsApp, you can use Praisly. Sign up, and our team will call you on WhatsApp to set everything up — same day. No website needed, no app needed.'],
              ['What\'s included in the 7-day free trial?', 'Everything. Unlimited reviews, AI drafts, competitor tracking, the full dashboard. No card required. If you don\'t see your rank climb in the first week, just close the tab — no charge, no hassle.'],
            ].map(([q, a], i) => (
              <Reveal key={i} delay={i * 50}>
                <FAQItem q={q} a={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-cta-section">
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-cta-card">
              <span className="lp-cta-eyebrow">★ Your competitor isn't waiting</span>
              <h2>Start today.<br/>See results next week.</h2>
              <p>Your competitor got new reviews this week. You got none. 200+ businesses across India already started — 7 days free, no card, set up in 10 minutes.</p>
              <div className="lp-btn-row">
                <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">
                  Start free — no card needed <Arrow />
                </Link>
                <a href={import.meta.env.VITE_SUPPORT_PHONE ? `https://wa.me/${import.meta.env.VITE_SUPPORT_PHONE}?text=${encodeURIComponent('Hi, I want to know more about Praisly')}` : '#'} className="lp-btn lp-btn-outline-ghost lp-btn-lg" target="_blank" rel="noopener noreferrer">
                  Talk to us on WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div>© 2026 Praisly · Made for Indian local businesses</div>
          <div className="lp-footer-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <a href={import.meta.env.VITE_SUPPORT_PHONE ? `https://wa.me/${import.meta.env.VITE_SUPPORT_PHONE}` : '#'}>Contact</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>

      <WhatsAppButton message="Hi I want to know more about Praisly" />
    </div>
  )
}
