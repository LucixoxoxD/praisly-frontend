import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WhatsAppButton from '../components/WhatsAppButton'

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
  font-size: 14.5px; font-weight: 500; color: var(--ink-2);
  text-decoration: none; transition: color .15s;
}
.lp-nav-links a:hover { color: var(--ink); }
.lp-nav-spacer { flex: 1; }
.lp-nav-login {
  font-size: 14.5px; font-weight: 600; color: var(--ink-2);
  text-decoration: none; padding: 9px 6px; transition: color .15s;
}
.lp-nav-login:hover { color: var(--ink); }

/* ── BUTTONS ── */
.lp-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 20px; border-radius: 11px;
  font-size: 14.5px; font-weight: 700; letter-spacing: -0.005em;
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
.lp-btn-lg { padding: 15px 24px; font-size: 15.5px; border-radius: 12px; }
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
  background: linear-gradient(180deg, transparent 60%, rgba(216,144,32,0.35) 60%);
  padding: 0 3px;
}
.lp-hero-sub {
  font-size: 18px; line-height: 1.5; color: var(--ink-2);
  max-width: 520px; margin: 0 0 30px;
}
.lp-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.lp-hero-trust {
  margin-top: 22px; display: flex; align-items: center; gap: 14px;
  color: var(--ink-3); font-size: 13.5px;
}
.lp-stack-avatars { display: flex; }
.lp-stack-avatars > div {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--bg);
  font-family: var(--font-display); font-weight: 700; font-size: 11px;
  color: white; display: grid; place-items: center; margin-left: -8px;
}
.lp-stack-avatars > div:first-child { margin-left: 0; }
.lp-hero-trust strong { color: var(--ink); font-weight: 700; }

/* ── BATTLE CARDS ── */
.lp-battle { position: relative; height: 540px; }
.lp-battle-card {
  position: absolute; background: var(--surface); border: 1px solid var(--line);
  border-radius: 24px; padding: 22px 24px; box-shadow: var(--shadow-md); width: 100%;
}
.lp-battle-card.them {
  top: 0; right: 0; width: 78%; transform: rotate(-1.5deg); opacity: 0.85;
  box-shadow: var(--shadow-sm); padding-top: 38px;
  animation: cardSlideUpThem 0.6s ease-out;
}
.lp-battle-card.you {
  top: 195px; bottom: auto; left: 0; width: 88%; transform: rotate(1deg);
  box-shadow: 0 0 20px rgba(216,144,32,0.15), 0 8px 24px rgba(0,0,0,0.1);
  border-left: 3px solid var(--primary); border-color: rgba(216,144,32,0.4); z-index: 2;
  animation: cardSlideUpYou 0.8s ease-out 0.2s both, glowPulse 4s ease-in-out 1s infinite;
}
.lp-bc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.lp-bc-where {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-3);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
.lp-bc-flag {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em;
  padding: 3px 9px; border-radius: 999px; white-space: nowrap; flex-shrink: 0;
}
.lp-bc-flag.stalled { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
.lp-bc-flag.climbing { background: var(--ink); color: var(--primary); }
.lp-bc-name {
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  letter-spacing: -0.015em; color: var(--ink);
}
.lp-bc-meta { font-size: 12.5px; color: var(--ink-3); margin-top: 1px; }
.lp-bc-row { display: flex; align-items: center; gap: 22px; margin-top: 18px; }
.lp-bc-rank { display: flex; align-items: baseline; gap: 4px; }
.lp-bc-rank .hash { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--ink-3); }
.lp-bc-rank .n { font-family: var(--font-display); font-size: 64px; font-weight: 800; line-height: 0.9; letter-spacing: -0.05em; color: var(--ink); }
.lp-battle-card.you .lp-bc-rank .n { color: var(--primary-ink); }
.lp-battle-card.you .lp-bc-rank .hash { color: var(--primary); }
.lp-bc-stats { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.lp-bc-stat-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
.lp-bc-stat-row .lbl { color: var(--ink-3); }
.lp-bc-stat-row .val { font-family: var(--font-display); font-weight: 700; color: var(--ink); }
.lp-bc-stat-row .val.up { color: var(--win); }
.lp-bc-stat-row .val.flat { color: var(--ink-3); }
.lp-bc-foot {
  margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--line-2);
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
.lp-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 11.5px; }
.lp-pill.up { background: var(--win-soft); color: var(--win); box-shadow: 0 0 8px rgba(31,138,91,0.18); }
.lp-pill.flat { background: var(--surface-2); color: var(--ink-3); border: 1px solid var(--line); }
.lp-chase-arrow {
  position: absolute; top: 192px; right: 14%; z-index: 10;
  background: var(--ink); color: var(--primary);
  padding: 9px 14px 9px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
  display: inline-flex; align-items: center; gap: 6px;
  box-shadow: 0 8px 20px -8px rgba(26,22,16,0.4);
  animation: subtlePulse 3s ease-in-out infinite;
}
.lp-chase-caret {
  position: absolute; top: 228px; right: calc(14% + 14px); z-index: 10;
  font-size: 9px; color: var(--primary-ink); opacity: 0.65; line-height: 1;
}
.lp-preview-pill {
  position: absolute; top: 4%; left: 8%; z-index: 4;
  background: var(--primary); color: #2c1e07;
  font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 5px 11px; border-radius: 999px; transform: rotate(-3deg);
  box-shadow: 0 6px 14px -4px rgba(216,144,32,0.5); white-space: nowrap;
}

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
.lp-section-head p { font-size: 17px; color: var(--ink-2); margin: 0; }

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
.lp-step p { margin: 0; font-size: 14.5px; color: var(--ink-3); line-height: 1.5; }
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
.lp-tent-text { font-family: var(--font-display); font-weight: 700; font-size: 17px; letter-spacing: -0.01em; line-height: 1.15; }
.lp-tent-text small { display: block; font-family: inherit; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(44,30,7,0.7); margin-bottom: 6px; }
.lp-qr { width: 84px; height: 84px; background: white; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(26,22,16,0.15); }
.lp-phone-stack { position: absolute; inset: 18px; padding: 14px; display: flex; flex-direction: column; gap: 8px; justify-content: flex-end; }
.lp-chip-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 4px; }
.lp-tagchip { font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--ink-2); }
.lp-tagchip.on { background: var(--ink); color: white; border-color: var(--ink); }
.lp-tagchip.on::before { content: "✓ "; color: var(--primary); margin-right: 1px; font-weight: 800; }
.lp-ai-bubble { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; font-size: 12.5px; line-height: 1.45; color: var(--ink-2); box-shadow: var(--shadow-sm); }
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

/* ── DASHBOARD PREVIEW ── */
.lp-dash-frame { background: var(--surface); border: 1px solid var(--line); border-radius: 22px; overflow: hidden; box-shadow: var(--shadow-md); position: relative; }
.lp-dash-chrome { display: flex; align-items: center; gap: 8px; padding: 14px 18px; background: var(--surface-2); border-bottom: 1px solid var(--line); }
.lp-dash-chrome .dot { width: 11px; height: 11px; border-radius: 50%; background: #E4DCC8; }
.lp-dash-chrome .url { margin-left: 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 7px; padding: 5px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); flex: 1; max-width: 320px; }
.lp-dash-chrome .url strong { color: var(--ink); font-weight: 600; }
.lp-dash-body { padding: 28px; background: var(--bg); }
.lp-dash-hero { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 26px 30px; display: grid; grid-template-columns: 1fr 360px; gap: 28px; align-items: center; position: relative; overflow: hidden; box-shadow: var(--shadow-sm); }
.lp-dash-hero::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 100% at 0% 100%,rgba(216,144,32,0.10),transparent 60%),radial-gradient(50% 80% at 100% 0%,rgba(225,59,59,0.06),transparent 60%); pointer-events: none; }
.lp-dh-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #B26A3C; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.lp-dh-eyebrow::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #B26A3C; }
.lp-dh-rank-row { display: flex; align-items: flex-start; gap: 14px; }
.lp-dh-rank-num { font-family: var(--font-display); font-weight: 800; font-size: 100px; line-height: 0.85; letter-spacing: -0.06em; }
.lp-dh-rank-num .hash { font-size: 38px; color: #B26A3C; font-weight: 700; margin-right: 2px; }
.lp-dh-context { font-family: var(--font-display); font-size: 17px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; padding-top: 8px; }
.lp-dh-context .of { color: var(--ink-3); font-weight: 500; }
.lp-dh-sub { color: var(--ink-3); font-size: 12px; margin-top: 5px; }
.lp-dh-momentum { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.lp-dh-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.lp-dh-pill.win { background: var(--win-soft); color: var(--win); }
.lp-dh-pill.gold { background: var(--primary-soft); color: var(--primary-ink); }
.lp-dh-podium { background: linear-gradient(180deg,var(--surface-2),var(--surface)); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; }
.lp-dh-podium-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3); font-weight: 700; }
.lp-dh-podium-head .tag { background: var(--ink); color: white; padding: 3px 9px; border-radius: 999px; text-transform: none; letter-spacing: 0; font-size: 10.5px; white-space: nowrap; }
.lp-dh-podium-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: end; gap: 8px; height: 130px; }
.lp-dh-pod { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.lp-dh-pod-name { font-size: 10.5px; font-weight: 600; color: var(--ink-2); line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.lp-dh-pod-rev { font-size: 10px; color: var(--ink-3); }
.lp-dh-pod-block { width: 100%; border-radius: 8px 8px 0 0; display: grid; place-items: start center; padding-top: 6px; font-family: var(--font-display); font-weight: 800; font-size: 18px; color: white; position: relative; }
.lp-dh-pod.p1 .lp-dh-pod-block { background: linear-gradient(180deg,#EFC659,#C9971F); height: 100px; }
.lp-dh-pod.p2 .lp-dh-pod-block { background: linear-gradient(180deg,#C8CDD3,#9098A3); height: 78px; }
.lp-dh-pod.p3 .lp-dh-pod-block { background: linear-gradient(180deg,#DA9263,#B26A3C); height: 62px; }
.lp-dh-pod.you .lp-dh-pod-block::after { content: "YOU"; position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--primary); font-size: 9px; font-weight: 800; letter-spacing: 0.08em; padding: 2px 7px; border-radius: 999px; font-family: var(--font-body); }
.lp-dash-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 14px; }
.lp-ds { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; }
.lp-ds-lbl { font-size: 12px; font-weight: 600; color: var(--ink-3); }
.lp-ds-val { font-family: var(--font-display); font-weight: 800; font-size: 32px; letter-spacing: -0.02em; line-height: 1; }
.lp-ds-val .unit { font-size: 16px; color: var(--ink-3); font-weight: 600; margin-left: 1px; }
.lp-ds-meta { font-size: 11.5px; color: var(--ink-3); display: flex; align-items: center; gap: 6px; }
.lp-ds-meta .up { color: var(--win); font-weight: 700; }

/* ── PRICING ── */
.lp-pricing-section { background: var(--surface-2); position: relative; }
.lp-pricing-section::before { content: ""; position: absolute; inset: 0; background: radial-gradient(50% 50% at 50% 0%,rgba(216,144,32,0.08),transparent 60%); pointer-events: none; }
.lp-pricing-wrap { text-align: center; position: relative; z-index: 1; }
.lp-pricing-toggle { display: inline-flex; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 4px; gap: 2px; margin-bottom: 36px; }
.lp-pricing-toggle button { padding: 8px 18px; border-radius: 999px; font-size: 13.5px; font-weight: 700; color: var(--ink-3); transition: all .15s; display: inline-flex; align-items: center; gap: 8px; }
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
.lp-price-features li { display: flex; align-items: center; gap: 12px; font-size: 14.5px; color: var(--ink-2); }
.lp-ck { width: 22px; height: 22px; border-radius: 50%; background: var(--primary-soft); color: var(--primary-ink); display: grid; place-items: center; flex-shrink: 0; font-weight: 800; font-size: 12px; }
.lp-price-cta-row { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.lp-price-cta-row .lp-btn { justify-content: center; }
.lp-price-cta-row .small { text-align: center; font-size: 12.5px; color: var(--ink-3); }

/* ── FAQ ── */
.lp-faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }

/* ── FOOTER CTA ── */
.lp-cta-section { padding: 80px 0 90px; }
.lp-cta-card { background: var(--ink); color: white; border-radius: 28px; padding: 60px 60px 56px; position: relative; overflow: hidden; text-align: center; }
.lp-cta-card::before { content: ""; position: absolute; inset: 0; background: radial-gradient(50% 60% at 100% 100%,rgba(216,144,32,0.30),transparent 60%),radial-gradient(50% 60% at 0% 0%,rgba(225,59,59,0.15),transparent 60%); pointer-events: none; }
.lp-cta-card > * { position: relative; z-index: 1; }
.lp-cta-eyebrow { display: inline-block; font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }
.lp-cta-card h2 { font-family: var(--font-display); font-size: clamp(34px,4.5vw,56px); line-height: 1.05; letter-spacing: -0.025em; font-weight: 700; margin: 0 0 14px; }
.lp-cta-card p { font-size: 17px; color: rgba(255,255,255,.7); margin: 0 auto 28px; max-width: 520px; }
.lp-cta-card .lp-btn-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ── FOOTER ── */
.lp-footer { padding: 40px 0 50px; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--ink-3); }
.lp-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.lp-footer-links { display: flex; gap: 24px; }
.lp-footer-links a { color: var(--ink-3); text-decoration: none; transition: color .15s; }
.lp-footer-links a:hover { color: var(--ink); }

/* ── HERO H1 STROKED ── */
.lp-hero h1 .stroked { color: transparent; -webkit-text-stroke: 2px var(--ink); font-style: italic; }

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

/* ── STORY ── */
.lp-story-section { padding-top: 30px; }
.lp-story-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; position: relative; }
.lp-story-grid::before { content: ""; position: absolute; top: 78px; left: 16%; right: 16%; height: 2px; background: repeating-linear-gradient(90deg, var(--ink-4) 0, var(--ink-4) 4px, transparent 4px, transparent 9px); z-index: 0; }
.lp-story-card { background: var(--surface); border: 1px solid var(--line); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }
.lp-story-card.win { background: linear-gradient(180deg, #FBEED0 0%, #F8DFA1 100%); border-color: rgba(155,102,16,0.25); box-shadow: var(--shadow-gold); }
.lp-story-week { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.lp-story-card.win .lp-story-week { color: var(--primary-ink); }
.lp-story-rank { font-family: var(--font-display); font-weight: 800; font-size: 88px; line-height: 0.85; letter-spacing: -0.05em; color: var(--ink); }
.lp-story-rank .hash { font-size: 36px; color: var(--ink-3); font-weight: 700; margin-right: 2px; }
.lp-story-card.win .lp-story-rank .hash { color: var(--primary-ink); }
.lp-story-rank-meta { font-size: 13px; color: var(--ink-3); font-weight: 600; margin-top: -8px; }
.lp-story-line { font-family: var(--font-display); font-size: 16px; line-height: 1.25; font-weight: 600; letter-spacing: -0.012em; color: var(--ink); margin-top: 4px; }
.lp-story-stat { display: flex; justify-content: space-between; align-items: baseline; padding-top: 14px; border-top: 1px solid rgba(26,22,16,0.10); font-size: 13px; }
.lp-story-stat .lbl { color: var(--ink-3); font-weight: 500; }
.lp-story-stat .val { font-family: var(--font-display); font-weight: 700; color: var(--ink); }
.lp-story-stat .val.up { color: var(--win); }
.lp-story-card.win .lp-story-stat .val { color: var(--primary-ink); }

/* ── DASHBOARD CALLOUTS ── */
.lp-callout { position: absolute; background: var(--ink); color: white; padding: 10px 14px 10px 12px; border-radius: 12px; font-size: 12.5px; font-weight: 600; line-height: 1.3; max-width: 220px; box-shadow: 0 12px 24px -10px rgba(26,22,16,0.4); z-index: 2; }
.lp-callout strong { color: var(--primary); font-weight: 700; }
.lp-callout .pin { position: absolute; width: 22px; height: 22px; background: var(--primary); border: 3px solid var(--ink); border-radius: 50%; }
.lp-callout .pin::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--primary); animation: lp-ping 2s ease-out infinite; }
@keyframes lp-ping { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(2.5); opacity: 0; } }
.lp-callout.c1 { top: 28%; left: -40px; transform: translate(-30%, -50%); }
.lp-callout.c1 .pin { right: -32px; top: 50%; transform: translateY(-50%); }
.lp-callout.c2 { top: 12%; right: -40px; transform: translate(20%, 0); }
.lp-callout.c2 .pin { left: -32px; top: 50%; transform: translateY(-50%); }
.lp-callout.c3 { bottom: 14%; right: -50px; transform: translate(20%, 0); }
.lp-callout.c3 .pin { left: -32px; top: 50%; transform: translateY(-50%); }

/* ── ROI STRIP ── */
.lp-roi-strip { max-width: 760px; margin: 28px auto 0; background: var(--ink); color: white; border-radius: 16px; padding: 18px 22px; display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; position: relative; overflow: hidden; }
.lp-roi-strip::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 100% at 100% 50%, rgba(216,144,32,0.20), transparent 60%); pointer-events: none; }
.lp-roi-strip > * { position: relative; z-index: 1; }
.lp-roi-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary); color: #2c1e07; display: grid; place-items: center; font-size: 22px; font-weight: 800; font-family: var(--font-display); flex-shrink: 0; }
.lp-roi-content .lbl { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 2px; }
.lp-roi-content .body { font-family: var(--font-display); font-size: 17px; font-weight: 600; letter-spacing: -0.01em; color: white; }
.lp-roi-content .body strong { color: var(--primary); font-weight: 700; }

/* ── LOCAL PACK ── */
.lp-local-pack-section { background: var(--bg); }
.lp-lpwrap { display: grid; grid-template-columns: 1fr 1.1fr; gap: 50px; align-items: center; }
.lp-lp-copy h2 { font-family: var(--font-display); font-size: clamp(28px, 3.6vw, 42px); line-height: 1.05; letter-spacing: -0.025em; font-weight: 700; margin: 16px 0 16px; color: var(--ink); }
.lp-lp-copy p { font-size: 17px; color: var(--ink-2); margin: 0 0 24px; max-width: 460px; }
.lp-lp-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.lp-lp-bullets li { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; color: var(--ink-2); }
.lp-lp-bullets .ck { width: 24px; height: 24px; border-radius: 50%; background: var(--primary-soft); color: var(--primary-ink); display: grid; place-items: center; flex-shrink: 0; font-weight: 800; font-size: 13px; margin-top: 1px; }
.lp-maps-frame { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-md); position: relative; }
.lp-maps-search { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--surface); }
.lp-g-logo { font-family: var(--font-display); font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
.lp-g-logo .b { color: #4285F4; } .lp-g-logo .r { color: #EA4335; } .lp-g-logo .y { color: #FBBC05; }
.lp-g-logo .b2 { color: #4285F4; } .lp-g-logo .g { color: #34A853; } .lp-g-logo .r2 { color: #EA4335; }
.lp-maps-qbox { flex: 1; background: var(--surface-2); border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; font-size: 13.5px; color: var(--ink-2); }
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
.lp-maps-meta { font-size: 12.5px; color: var(--ink-3); margin-top: 3px; }
.lp-maps-cta { text-align: right; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: var(--ink-4); text-transform: uppercase; align-self: center; font-family: var(--font-mono); }
.lp-maps-result.you .lp-maps-cta { color: var(--primary-ink); }
.lp-maps-floater { position: absolute; top: 50%; right: -24px; transform: translateY(-50%) rotate(3deg); background: var(--ink); color: white; padding: 12px 16px; border-radius: 14px; font-size: 13px; font-weight: 600; line-height: 1.3; max-width: 220px; box-shadow: 0 18px 40px -16px rgba(26,22,16,0.5); z-index: 2; }
.lp-maps-floater strong { color: var(--primary); }
.lp-maps-floater::after { content: ""; position: absolute; left: -8px; top: 50%; transform: translateY(-50%) rotate(45deg); width: 16px; height: 16px; background: var(--ink); }

/* ── VS CONNECTOR ── */
.lp-vs-connector {
  position: absolute; top: 178px; left: 44%;
  transform: translate(-50%, -50%); z-index: 5;
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

/* ── BATTLE ANIMATIONS ── */
@keyframes cardSlideUpThem {
  from { transform: rotate(-1.5deg) translateY(30px); opacity: 0; }
  to { transform: rotate(-1.5deg) translateY(0); opacity: 1; }
}
@keyframes cardSlideUpYou {
  from { transform: rotate(1deg) translateY(30px); opacity: 0; }
  to { transform: rotate(1deg) translateY(0); opacity: 1; }
}
@keyframes subtlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(216,144,32,0.15), 0 8px 24px rgba(0,0,0,0.1); }
  50% { box-shadow: 0 0 32px rgba(216,144,32,0.28), 0 8px 24px rgba(0,0,0,0.12); }
}

/* ── RESPONSIVE ── */
@media (max-width: 1080px) {
  .lp-hero-grid { grid-template-columns: 1fr; gap: 48px; }
  .lp-battle { max-width: 520px; margin: 0 auto; }
  .lp-features { grid-template-columns: 1fr; }
  .lp-dash-hero { grid-template-columns: 1fr; }
  .lp-tg { grid-template-columns: 1fr; }
  .lp-callout { display: none; }
  .lp-lpwrap { grid-template-columns: 1fr; gap: 32px; }
  .lp-maps-floater { display: none; }
  .lp-story-grid::before { display: none; }
}
@media (max-width: 760px) {
  .lp-nav-links { display: none !important; }
  .lp-hero { padding: 40px 0 50px; }
  .lp-section { padding: 60px 0; }
  .lp-steps { grid-template-columns: 1fr; }
  .lp-dash-stats { grid-template-columns: 1fr; }
  .lp-cta-card { padding: 40px 28px; }
  .lp-hero h1 { font-size: 40px; }
  .lp-story-grid { grid-template-columns: 1fr; }
  .lp-roi-strip { grid-template-columns: 1fr; text-align: center; }
  .lp-roi-icon { margin: 0 auto; }
}
@media (max-width: 480px) {
  .lp-wrap { padding: 0 20px; }
  .lp-nav-inner { padding: 12px 20px; }
  .lp-price-card { padding: 28px 22px; }
}
@media (max-width: 768px) {
  .lp-hero { overflow-x: hidden; }
  /* Battle: switch from absolute-positioned overlap to vertical flex stack */
  .lp-battle {
    height: auto !important;
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    max-width: 100%;
    padding: 0;
    box-sizing: border-box;
    overflow: visible;
  }
  .lp-battle-card {
    position: relative !important;
    width: 100% !important;
    max-width: 100% !important;
    top: auto !important; bottom: auto !important;
    left: 0 !important; right: auto !important;
    margin-left: 0 !important; margin-right: 0 !important;
    transform: none !important;
    animation: none !important;
    opacity: 1 !important;
    box-sizing: border-box;
  }
  .lp-battle-card.them {
    padding-top: 22px !important;
  }
  .lp-battle-card.you {
    box-shadow: 0 0 20px rgba(216,144,32,0.15), 0 8px 24px rgba(0,0,0,0.1) !important;
    border-left: 3px solid var(--primary) !important;
  }
  .lp-preview-pill { display: none !important; }
  /* Chase arrow: in-flow between the two cards, centered */
  .lp-chase-arrow {
    position: relative !important;
    top: auto !important; right: auto !important;
    left: auto !important;
    display: inline-flex !important;
    margin: -8px auto !important;
    z-index: 5;
  }
  .lp-chase-caret { display: none !important; }
  /* VS connector: horizontal divider, centered */
  .lp-vs-connector {
    display: flex !important;
    position: relative !important;
    top: auto !important; left: auto !important;
    right: auto !important;
    transform: none !important;
    flex-direction: row;
    align-items: center;
    margin: -12px auto;
    width: 80px;
    z-index: 5;
  }
  .lp-vs-connector::before,
  .lp-vs-connector::after {
    height: 0 !important;
    width: 28px !important;
    border-left: none !important;
    border-top: 1.5px dashed var(--line-2);
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
      await authService.login(DEMO_EMAIL, DEMO_PASSWORD)
      navigate('/dashboard')
    } catch (err) {
      console.error('Demo login failed:', err)
      setDemoLoading(false)
      alert('Demo is temporarily unavailable. Please try again in a moment.')
    }
  }

  useEffect(() => {
    document.title = 'Praisly — Beat the business next door on Google'
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: 'hidden' }}>
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
              The shop <span className="stroked">next door</span> has<br/>
              <span className="accent">4× your reviews.</span> Not for long.
            </h1>

            <p className="lp-hero-sub">
              Praisly helps Indian local businesses — salons, clinics, gyms, restaurants, coaching centres — collect more Google reviews, track every competitor in your neighborhood, and climb the local pack. All on autopilot.
            </p>

            <div className="lp-hero-ctas">
              <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">
                Start free trial <Arrow />
              </Link>
              {DEMO_EMAIL && DEMO_PASSWORD ? (
                <button onClick={handleDemoLogin} disabled={demoLoading} className="lp-btn lp-btn-outline lp-btn-lg">
                  {demoLoading ? 'Loading…' : 'See live demo'}
                </button>
              ) : (
                <a href="#dashboard" className="lp-btn lp-btn-outline lp-btn-lg">See live demo</a>
              )}
            </div>

            <div className="lp-hero-reassure">
              <span className="lp-re-pill"><span className="ic green">✓</span>Setup in 10 min</span>
              <span className="lp-re-pill"><span className="ic">💳</span>No card required</span>
              <span className="lp-re-pill"><span className="ic ink">W</span>WhatsApp support</span>
            </div>

            <div className="lp-hero-trust">
              <div className="lp-stack-avatars">
                <div style={{ background: 'linear-gradient(135deg,#FF7C4F,#E13B3B)' }}>SD</div>
                <div style={{ background: 'linear-gradient(135deg,#5b6ee8,#3950b8)' }}>PN</div>
                <div style={{ background: 'linear-gradient(135deg,#2a8c5e,#1a6843)' }}>GK</div>
                <div style={{ background: 'linear-gradient(135deg,#EFC659,#C9971F)' }}>RC</div>
              </div>
              <div><strong>237 Indian shops</strong> climbing rankings this week</div>
            </div>
          </div>

          {/* Right: Battle scene */}
          <div className="lp-battle">
            <span className="lp-preview-pill">Live · You vs them</span>

            {/* Competitor card */}
            <div className="lp-battle-card them">
              <div className="lp-bc-head">
                <span className="lp-bc-where">Koramangala · Bengaluru</span>
                <span className="lp-bc-flag stalled">Stalled · 4w</span>
              </div>
              <div className="lp-bc-name">Star Hair Studio</div>
              <div className="lp-bc-meta">Currently #2 · Established 2014</div>
              <div className="lp-bc-row">
                <div className="lp-bc-rank"><span className="hash">#</span><span className="n">2</span></div>
                <div className="lp-bc-stats">
                  <div className="lp-bc-stat-row"><span className="lbl">Reviews</span><span className="val">147</span></div>
                  <div className="lp-bc-stat-row"><span className="lbl">Rating</span><span className="val">4.1 <span style={{ color: '#F5B945' }}>★</span></span></div>
                  <div className="lp-bc-stat-row"><span className="lbl">This month</span><span className="val flat">+5</span></div>
                </div>
              </div>
              <div className="lp-bc-foot">
                <span className="lp-pill flat" style={{ color: '#DC2626', background: '#FEE2E2', border: '1px solid #FCA5A5' }}>▬ No movement</span>
                <svg className="spark" viewBox="0 0 88 24" preserveAspectRatio="none" style={{ height: 24, width: 88 }}>
                  <polyline fill="none" stroke="#B8AFA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,10 8,11 16,11 24,12 32,12 40,13 48,13 56,14 64,14 72,15 80,15 88,16"/>
                </svg>
              </div>
            </div>

            {/* Chase pill — sibling of both cards so it clears the YOU card's stacking context */}
            <div className="lp-chase-arrow">
              <ArrowUp /> 15 to overtake
            </div>
            <div className="lp-chase-caret">▼</div>

            {/* VS bridge */}
            <div className="lp-vs-connector" aria-hidden="true">
              <div className="lp-vs-badge">VS</div>
            </div>

            {/* Your card */}
            <div className="lp-battle-card you">
              <div className="lp-bc-head">
                <span className="lp-bc-where">Indiranagar · Bengaluru</span>
                <span className="lp-bc-flag climbing">🔥 Climbing · +18 this month</span>
              </div>
              <div className="lp-bc-name">
                Glow Beauty Salon{' '}
                <span style={{ fontSize: 11, background: 'var(--primary)', color: '#2c1e07', padding: '2px 7px', borderRadius: 6, marginLeft: 6, fontWeight: 800, letterSpacing: '.06em', fontFamily: 'var(--font-body)', verticalAlign: 'middle' }}>YOU</span>
              </div>
              <div className="lp-bc-meta">Currently #3 · Established 2019</div>
              <div className="lp-bc-row">
                <div className="lp-bc-rank"><span className="hash">#</span><span className="n">3</span></div>
                <div className="lp-bc-stats">
                  <div className="lp-bc-stat-row"><span className="lbl">Reviews</span><span className="val">132</span></div>
                  <div className="lp-bc-stat-row"><span className="lbl">Rating</span><span className="val">4.5 <span style={{ color: '#F5B945' }}>★</span></span></div>
                  <div className="lp-bc-stat-row"><span className="lbl">This month</span><span className="val up">+18</span></div>
                </div>
              </div>
              <div className="lp-bc-foot">
                <span className="lp-pill up">↗ Trending up · 6w streak</span>
                <svg viewBox="0 0 88 24" preserveAspectRatio="none" style={{ height: 24, width: 88 }}>
                  <polyline fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points="0,18 8,17 16,16 24,14 32,15 40,12 48,10 56,11 64,8 72,7 80,5 88,4"/>
                </svg>
              </div>
            </div>
          </div>
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
              ['🦷', 'Dentists', '#FCE6E6'],
              ['💇', 'Salons', '#FBEED0'],
              ['🏋️', 'Gyms', '#E3F4EB'],
              ['🍱', 'Restaurants', '#FDF7E4'],
              ['📚', 'Coaching centres', '#EEF0F2'],
              ['☕', 'Cafés', '#F7E6D6'],
            ].map(([emoji, label, bg]) => (
              <span key={label} className="lp-proof-chip">
                <span className="ic" style={{ background: bg }}>{emoji}</span>
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
              <h2>From "we're invisible on Google" to <em style={{ fontStyle: 'italic', color: 'var(--primary-ink)' }}>#1 in the local pack</em>.</h2>
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
                    <div className="lp-t-meta">Glow Beauty Salon · Indiranagar, Bengaluru</div>
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
              <p>Set up in 10 minutes. Your customers do the rest — Praisly just makes it stupidly easy for them to say something nice.</p>
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
                      <small>Scan to leave a review</small>
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
                <h3>AI writes the review</h3>
                <p>Customer taps what they liked. Our AI drafts a natural-sounding review they can edit and post — in 30 seconds.</p>
                <div className="lp-step-visual" style={{ background: 'linear-gradient(180deg,#FDF7E4,#FBEED0)' }}>
                  <div className="lp-phone-stack">
                    <div className="lp-chip-row">
                      <span className="lp-tagchip on">Painless</span>
                      <span className="lp-tagchip on">Polite staff</span>
                      <span className="lp-tagchip">Clean clinic</span>
                      <span className="lp-tagchip on">On-time</span>
                    </div>
                    <div className="lp-ai-bubble">
                      Got my root canal here last week. Zero pain, Dr. Sharma explained everything, and they ran on time. Front desk was super polite. Highly recommend 👍
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8-WEEK STORY
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-story-section" id="sec-story">
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">A real climb · Gupta Dental, Noida</span>
              <h2>From #5 to #1 in 8 weeks.<br/><em style={{ fontStyle: 'italic', color: 'var(--primary-ink)' }}>Here's exactly what happened.</em></h2>
              <p>One business, one QR code, one dashboard. Anonymized rank journey from a real Praisly customer.</p>
            </div>
          </Reveal>
          <div className="lp-story-grid">
            <Reveal delay={0}>
              <article className="lp-story-card">
                <div className="lp-story-week">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-3)', display: 'inline-block', flexShrink: 0 }} />
                  Week 1 · Starting line
                </div>
                <div className="lp-story-rank"><span className="hash">#</span>5</div>
                <div className="lp-story-rank-meta">of 14 dentists in Sector 18</div>
                <div className="lp-story-line">"Customers say we're good. But nobody finds us on Google."</div>
                <div className="lp-story-stat"><span className="lbl">Reviews</span><span className="val">28</span></div>
                <div className="lp-story-stat"><span className="lbl">Rating</span><span className="val">4.2★</span></div>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="lp-story-card">
                <div className="lp-story-week">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--win)', display: 'inline-block', flexShrink: 0 }} />
                  Week 4 · QR live, AI drafts on
                </div>
                <div className="lp-story-rank"><span className="hash">#</span>3</div>
                <div className="lp-story-rank-meta">Climbed past 2 competitors</div>
                <div className="lp-story-line">QR at billing counter. 2 in 3 happy customers leave a review.</div>
                <div className="lp-story-stat"><span className="lbl">Reviews</span><span className="val up">+33 (61)</span></div>
                <div className="lp-story-stat"><span className="lbl">Rating</span><span className="val up">4.5★</span></div>
              </article>
            </Reveal>
            <Reveal delay={160}>
              <article className="lp-story-card win">
                <div className="lp-story-week">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-ink)', display: 'inline-block', flexShrink: 0 }} />
                  Week 8 · Local pack, position #1
                </div>
                <div className="lp-story-rank"><span className="hash">#</span>1</div>
                <div className="lp-story-rank-meta">Top of Maps for "dentist near me"</div>
                <div className="lp-story-line">"3 walk-ins this week said they found us on Google Maps."</div>
                <div className="lp-story-stat"><span className="lbl">Reviews</span><span className="val">128</span></div>
                <div className="lp-story-stat"><span className="lbl">Rating</span><span className="val">4.7★</span></div>
              </article>
            </Reveal>
          </div>
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
              <p>Other tools collect reviews. Praisly makes you win the local game — with rankings, AI moves, and protection for your reputation.</p>
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
                <p>Customers tap what they liked. Praisly drafts a natural review in their voice — ready to post in 30 seconds. They edit, they own it.</p>
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

            {/* Feature 3: Smart Routing */}
            <Reveal delay={160}>
              <div className="lp-feat">
                <div className="lp-feat-icon red"><Split /></div>
                <h3>Smart Review Routing</h3>
                <p>Happy customers go to Google. Unhappy ones come to you privately — so you can fix it before it becomes a 2-star review.</p>
                <div className="lp-feat-art">
                  <div className="lp-routing">
                    <div className="lp-route happy">
                      <div className="stars">★★★★★</div>
                      <div className="label">Public</div>
                      <div className="arrow">→ Google</div>
                    </div>
                    <div className="lp-route unhappy">
                      <div className="stars" style={{ color: '#B8AFA4' }}>★★☆☆☆</div>
                      <div className="label">Private</div>
                      <div className="arrow">→ Your inbox</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 4: Google Tracking */}
            <Reveal delay={240}>
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
          DASHBOARD PREVIEW
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="dashboard">
        <div className="lp-wrap">
          <Reveal>
            <div className="lp-section-head">
              <span className="lp-section-eyebrow">Your battle dashboard</span>
              <h2>Rankings, stats, and AI insights — all in one place.</h2>
              <p>Every Monday morning, open Praisly. See your rank, your competitors' moves, and your next play.</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="lp-dash-frame" style={{ maxWidth: 1080, margin: '0 auto' }}>
              {/* Callout bubbles */}
              <div className="lp-callout c1">
                <div className="pin" />
                See your <strong>live rank</strong> updated every 12 minutes
              </div>
              <div className="lp-callout c2">
                <div className="pin" />
                <strong>Podium view</strong> shows the top 3 in your area
              </div>
              <div className="lp-callout c3">
                <div className="pin" />
                AI tells you <strong>exactly</strong> who to chase
              </div>

              {/* Browser chrome */}
              <div className="lp-dash-chrome">
                <div className="dot" style={{ background: '#FF9F8B' }} />
                <div className="dot" style={{ background: '#F5C56A' }} />
                <div className="dot" style={{ background: '#9BD3A8' }} />
                <div className="url"><strong>praisly.in</strong>/dashboard</div>
              </div>

              {/* Dashboard body */}
              <div className="lp-dash-body">
                {/* Hero rank + podium */}
                <div className="lp-dash-hero">
                  <div style={{ position: 'relative' }}>
                    <span className="lp-dh-eyebrow">Your standing · Restaurants · Bandra West</span>
                    <div className="lp-dh-rank-row">
                      <div className="lp-dh-rank-num"><span className="hash">#</span>3</div>
                      <div className="lp-dh-context">
                        You're <span style={{ color: '#B26A3C' }}>#3 of 18</span> restaurants<br/>
                        <span className="of">in</span> Bandra West
                        <div className="lp-dh-sub">Tracked weekly · Last updated 12 min ago</div>
                      </div>
                    </div>
                    <div className="lp-dh-momentum">
                      <span className="lp-dh-pill win">↗ +24 reviews this month</span>
                      <span className="lp-dh-pill gold">🔥 6-week streak</span>
                    </div>
                  </div>

                  {/* Podium */}
                  <div className="lp-dh-podium">
                    <div className="lp-dh-podium-head">
                      <span>Top 3 · Restaurants</span>
                      <span className="tag">📍 Bandra</span>
                    </div>
                    <div className="lp-dh-podium-grid">
                      <div className="lp-dh-pod p2">
                        <div className="lp-dh-pod-name">Curry House</div>
                        <div className="lp-dh-pod-rev">312</div>
                        <div className="lp-dh-pod-block">2</div>
                      </div>
                      <div className="lp-dh-pod p1">
                        <div className="lp-dh-pod-name">Bombay Bistro</div>
                        <div className="lp-dh-pod-rev">847</div>
                        <div className="lp-dh-pod-block">1</div>
                      </div>
                      <div className="lp-dh-pod p3 you">
                        <div className="lp-dh-pod-name" style={{ color: 'var(--ink)', fontWeight: 700 }}>Spice Junction</div>
                        <div className="lp-dh-pod-rev">208</div>
                        <div className="lp-dh-pod-block">3</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="lp-dash-stats">
                  <div className="lp-ds">
                    <div className="lp-ds-lbl">Reviews gained</div>
                    <div className="lp-ds-val">24<span className="unit">/mo</span></div>
                    <div className="lp-ds-meta"><span className="up">↗ +33%</span> · 184 → 208</div>
                  </div>
                  <div className="lp-ds">
                    <div className="lp-ds-lbl">Google rating</div>
                    <div className="lp-ds-val">4.6<span className="unit">★</span></div>
                    <div className="lp-ds-meta"><span className="up">↗ +0.2</span> · vs last month</div>
                  </div>
                  <div className="lp-ds">
                    <div className="lp-ds-lbl">QR scans → reviews</div>
                    <div className="lp-ds-val">71<span className="unit">%</span></div>
                    <div className="lp-ds-meta">62 reviews · 14 this week</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          GOOGLE MAPS LOCAL PACK
      ══════════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-local-pack-section" id="sec-local-pack">
        <div className="lp-wrap lp-lpwrap">
          <div className="lp-lp-copy">
            <span className="lp-section-eyebrow">The local pack is the game</span>
            <h2>Top 3 on Google Maps gets <em style={{ fontStyle: 'italic', color: 'var(--primary-ink)' }}>76% of all calls</em> in your area.</h2>
            <p>The "Map Pack" — those 3 businesses Google shows at the top of every "near me" search — is where 76% of local calls go. Praisly's whole job is getting you in there.</p>
            <ul className="lp-lp-bullets">
              {[
                'Track your live position in the local pack, every day',
                'See which competitors are inside the top 3 right now',
                'Get the exact review count needed to break in',
                'WhatsApp alert the moment you climb or drop',
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
                Yearly <span className="lp-save-badge">SAVE 33%</span>
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
                <span className="lp-price-amt">{lpYearly ? '666' : '999'}</span>
                <span className="lp-price-per">/ month</span>
              </div>

              <div className="lp-price-note">
                {lpYearly
                  ? <><strong>Billed ₹7,999/year.</strong> 7 days free · No card required.</>
                  : <><strong>7 days free.</strong> No card required. Cancel anytime.</>
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
                <div className="body">Average local business gains <strong>5 extra walk-ins / week</strong> from Praisly. <strong>1 customer covers the whole month.</strong></div>
              </div>
              <Link to="/signup" className="lp-btn lp-btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                Start free trial <Arrow />
              </Link>
            </div>
          </Reveal>
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
              ['Is Praisly allowed by Google?', 'Yes. Customers write and post reviews themselves — Praisly only helps create an optional draft from what they tell us they liked. They can edit it, ignore it, or write their own. We never post on anyone\'s behalf.'],
              ['Do my customers need to download anything?', 'No app, no signup. They scan a QR code, tap what they liked, and tap once more to post on Google. The whole thing takes under 30 seconds.'],
              ['What if a customer is unhappy?', 'Smart Routing catches them before they hit Google. Customers who tap a low rating are sent to a private feedback form — straight to your dashboard inbox — so you can call, apologise, and fix it. Public reputation protected.'],
              ['How does competitor tracking work?', 'Tell us your business category and location. We automatically find your top 10 nearby competitors on Google and track their review count, rating, and growth every week. You\'ll see exactly who\'s gaining, who\'s stalled, and how far you are from #1.'],
              ['Do I need a website or technical skills?', 'No technical skills needed. If you can use WhatsApp, you can use Praisly. Setup is one form, your QR code is generated instantly, and our team helps you go live the same day.'],
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
              <span className="lp-cta-eyebrow">★ Ready when you are</span>
              <h2>Ready to outrank<br/>your competitors?</h2>
              <p>Join 200+ Indian shops climbing local Google rankings with Praisly. 7 days free, no card required, set up in 10 minutes.</p>
              <div className="lp-btn-row">
                <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-lg">
                  Start free trial <Arrow />
                </Link>
                {DEMO_EMAIL && DEMO_PASSWORD ? (
                  <button onClick={handleDemoLogin} disabled={demoLoading} className="lp-btn lp-btn-outline-ghost lp-btn-lg">
                    {demoLoading ? 'Loading…' : 'See live demo'}
                  </button>
                ) : (
                  <a href="#dashboard" className="lp-btn lp-btn-outline-ghost lp-btn-lg">See live demo</a>
                )}
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
