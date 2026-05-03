import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ─── Intersection Observer hook for scroll animations ────────────────────────
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
  }, [])
  return [ref, inView]
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

// ─── Animated section wrapper ─────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  .lp-btn-primary {
    display: inline-block; padding: 14px 28px; background: #10b981; color: white;
    border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none;
    border: none; cursor: pointer; transition: all 0.2s; font-family: inherit;
    white-space: nowrap;
  }
  .lp-btn-primary:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(16,185,129,0.35); }
  .lp-btn-outline {
    display: inline-block; padding: 14px 28px; background: transparent; color: white;
    border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none;
    border: 2px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; font-family: inherit;
    white-space: nowrap;
  }
  .lp-btn-outline:hover { border-color: white; background: rgba(255,255,255,0.08); }
  .lp-btn-outline-dark {
    display: inline-block; padding: 13px 26px; background: transparent; color: #0f172a;
    border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none;
    border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.2s; font-family: inherit;
    white-space: nowrap;
  }
  .lp-btn-outline-dark:hover { border-color: #10b981; color: #10b981; }
  .feature-card { transition: box-shadow 0.2s, transform 0.2s; }
  .feature-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.09); transform: translateY(-2px); }
  .pricing-card { transition: box-shadow 0.25s, transform 0.25s; }
  .pricing-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.1); transform: scale(1.02); }
  .faq-item { transition: background 0.15s; }
  .faq-item:hover { background: #f8fafc !important; }
  .nav-link { color: rgba(255,255,255,0.75); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.15s; }
  .nav-link:hover { color: white; }
  .nav-link-dark { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.15s; }
  .nav-link-dark:hover { color: #10b981; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes pulse-green { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); } }
  @keyframes lp-slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
  .lp-mobile-menu { animation: lp-slideDown 0.2s ease; }
  .lp-mobile-link {
    display: block; padding: 14px 0; font-size: 16px; font-weight: 600;
    color: rgba(255,255,255,0.85); text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    transition: color 0.15s;
  }
  .lp-mobile-link:hover { color: white; }
  @media (max-width: 767px) {
  .mobile-hamburger { display: block !important; }
  .desktop-nav-links { display: none !important; }
}
@media (min-width: 768px) {
  .mobile-hamburger { display: none !important; }
  .desktop-nav-links { display: flex !important; }
}
`

// ─── Phone mockup ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: 240,
          background: '#0f172a',
          borderRadius: 36,
          padding: '10px 8px',
          border: '6px solid #334155',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        {/* Notch */}
        <div style={{ width: 70, height: 18, background: '#0f172a', borderRadius: 10, margin: '0 auto 6px', border: '3px solid #334155' }} />
        {/* Screen */}
        <div style={{ background: 'white', borderRadius: 24, padding: '16px 14px', minHeight: 360 }}>
          <p style={{ textAlign: 'center', fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 10 }}>Looks Salon</p>
          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 22, color: i <= 4 ? '#f59e0b' : '#e2e8f0' }}>★</span>
            ))}
          </div>
          {/* Tags */}
          <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'center', marginBottom: 6 }}>What did you enjoy?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 12 }}>
            {['Styling ✓', 'Hygiene', 'Friendly Staff ✓', 'Good Price', 'Ambience'].map(tag => (
              <span key={tag} style={{
                padding: '4px 8px', borderRadius: 20, fontSize: 9, fontWeight: 600,
                background: tag.includes('✓') ? '#10b981' : 'white',
                color: tag.includes('✓') ? 'white' : '#64748b',
                border: `1.5px solid ${tag.includes('✓') ? '#10b981' : '#e2e8f0'}`,
              }}>{tag.replace(' ✓', '')}</span>
            ))}
          </div>
          {/* Draft preview */}
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px 10px', border: '1.5px solid #6ee7b7', marginBottom: 10 }}>
            <p style={{ fontSize: 8.5, color: '#374151', lineHeight: 1.5, margin: 0 }}>
              "Looks Salon mein styling acchi thi aur staff bhi friendly tha. Overall worth visiting! ⭐"
            </p>
          </div>
          {/* CTA */}
          <div style={{ background: '#10b981', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>Post on Google ↗</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="faq-item"
      onClick={() => setOpen(v => !v)}
      style={{
        background: 'white',
        borderRadius: 12,
        marginBottom: 8,
        padding: '18px 20px',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <p style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', margin: 0 }}>{q}</p>
        <span style={{ color: '#10b981', fontSize: 20, lineHeight: 1, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      <div style={{ overflow: 'hidden', maxHeight: open ? 200 : 0, transition: 'max-height 0.3s ease', marginTop: open ? 10 : 0 }}>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{a}</p>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Stat counters ──
  const [statsRef, statsInView] = useInView()
  const r1 = useCountUp(47, 1600, statsInView)
  const r2 = useCountUp(30, 1200, statsInView)
  const r3 = useCountUp(4.7, 1000, statsInView)

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{STYLES}</style>

      {/* ══════════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.07)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui",
            fontWeight: 800,
            fontSize: 22,
            color: scrolled ? '#0f172a' : 'white',
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            transition: 'color 0.3s',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Praisly
        </span>

        {/* Desktop nav */}
        <div className="desktop-nav-links" style={{ alignItems: 'center', gap: 28 }}>
          {[['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
            <a key={label} href={href} className={scrolled ? 'nav-link-dark' : 'nav-link'}>{label}</a>
          ))}
          <Link to="/login" className={scrolled ? 'nav-link-dark' : 'nav-link'}>Login</Link>
          <Link
            to="/signup"
            style={{
              padding: '8px 18px',
              background: '#10b981',
              color: 'white',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            Start Free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
  className="mobile-hamburger"
  onClick={() => setMobileMenuOpen(v => !v)}
  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: scrolled ? '#0f172a' : 'white', padding: 4 }}
>
  {mobileMenuOpen ? '✕' : '☰'}
</button>
      </nav>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 98 }}
        />
      )}

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          className="lp-mobile-menu md:hidden"
          style={{
            position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
            background: '#1a1a2e',
            padding: '8px 24px 24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {[['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
            <a key={label} href={href} className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              {label}
            </a>
          ))}
          <Link to="/login" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Login
          </Link>
          <Link
            to="/signup"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block', marginTop: 16, padding: '13px',
              background: '#10b981', color: 'white', borderRadius: 10,
              fontWeight: 700, fontSize: 15, textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.2s',
            }}
          >
            Start Free →
          </Link>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '80px 24px 60px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
            {/* Left: text */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '6px 14px', marginBottom: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-green 2s infinite' }} />
                <span style={{ color: '#6ee7b7', fontSize: 13, fontWeight: 600 }}>Now live in India</span>
              </div>

              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui",
                  fontSize: 'clamp(32px, 5vw, 54px)',
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.15,
                  marginBottom: 20,
                  letterSpacing: '-1px',
                }}
              >
                Get More Google Reviews{' '}
                <span style={{ color: '#10b981' }}>on Autopilot</span>
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                AI-powered review collection for Indian local businesses. Customers scan, tap, and post — in under 30 seconds.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <Link to="/signup" className="lp-btn-primary" style={{ fontSize: 16, padding: '15px 32px' }}>
                  Start Free — 10 Reviews/Month
                </Link>
                <a href="#how-it-works" className="lp-btn-outline">
                  See How It Works ↓
                </a>
              </div>

              {/* Trust line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex' }}>
                  {['🦷', '💇', '🏋️', '🍽️'].map((e, i) => (
                    <span key={i} style={{ fontSize: 20, marginRight: 2 }}>{e}</span>
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  Trusted by dentists, salons, gyms &amp; restaurants across India
                </span>
              </div>
            </div>

            {/* Right: phone mockup */}
            <PhoneMockup />
          </div>

          {/* Stat strip */}
          <div
            ref={statsRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 1,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              marginTop: 56,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {[
              { value: r1, suffix: '+', label: 'Average reviews after 60 days' },
              { value: r2, suffix: 's', label: 'Time to submit a review' },
              { value: r3, suffix: '★', label: 'Average rating achieved', float: true },
            ].map((s, i) => (
              <div key={i} style={{ padding: '24px 28px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 36, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>
                  {s.float ? s.value.toFixed(1) : s.value}{s.suffix}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PROBLEM
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 12, letterSpacing: '-0.5px' }}>
              Your Customers Are Happy.
              <br />
              <span style={{ color: '#64748b' }}>Your Google Page Doesn't Show It.</span>
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 48 }}>
              Every satisfied customer who doesn't leave a review is a lost opportunity.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { emoji: '😶', title: '90% of happy customers never leave a review', desc: 'They mean to, but life gets in the way. The moment passes.' },
              { emoji: '😬', title: 'Asking for reviews feels awkward and pushy', desc: "\"Please leave us a review\" — nobody likes saying it, nobody likes hearing it." },
              { emoji: '📉', title: 'Bad reviews show up, good ones don\'t', desc: 'Unhappy customers are motivated. Happy ones are silent. Your rating suffers.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="feature-card" style={{ background: '#f8fafc', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0', height: '100%' }}>
                  <p style={{ fontSize: 36, marginBottom: 14 }}>{item.emoji}</p>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', marginBottom: 8, lineHeight: 1.35 }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 12, letterSpacing: '-0.5px' }}>
              3 Steps. 30 Seconds. Real Google Reviews.
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 56 }}>
              No app downloads. No typing. No friction.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, position: 'relative' }}>
            {[
              { icon: '📱', step: '01', title: 'Customer Scans QR', desc: 'Place the QR code at your counter. Customer scans after their visit — no app needed.' },
              { icon: '⭐', step: '02', title: 'Taps What They Liked', desc: 'Quick star rating + tap tags like "Friendly Staff" or "Clean". No typing needed.' },
              { icon: 'G', step: '03', title: 'Posts on Google', desc: 'AI drafts a natural review using their own words. One tap to post directly on Google.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '32px 24px', position: 'relative' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: item.icon === 'G' ? 24 : 28, fontWeight: 900, color: item.icon === 'G' ? '#4285F4' : 'white', fontFamily: 'serif' }}>
                      {item.icon}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>{item.step}</p>
                    <h3 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 10 }}>{item.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65, margin: 0, maxWidth: 220, marginInline: 'auto' }}>{item.desc}</p>
                    {i < 2 && (
                      <div style={{ position: 'absolute', right: -20, top: '40%', color: '#d1fae5', fontSize: 28, fontWeight: 800, display: 'none' }} className="step-arrow">→</div>
                    )}
                  </div>
                  {i < 2 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 52, color: '#10b981', fontSize: 24, fontWeight: 700 }}>→</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 12, letterSpacing: '-0.5px' }}>
              Everything You Need to Grow Your Reviews
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 48 }}>
              Built specifically for Indian local businesses.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { icon: '🤖', color: '#dbeafe', title: 'AI Review Drafts', desc: 'Natural Hindi + English reviews generated from customer feedback. Not copy-paste templates — each one is unique.' },
              { icon: '🛡️', color: '#d1fae5', title: 'Smart Review Gating', desc: 'Happy customers go to Google. Unhappy feedback comes to you privately. Protect your rating automatically.' },
              { icon: '📱', color: '#fce7f3', title: 'QR Code Generator', desc: 'Print and place at your counter. Works with any phone camera, no app download needed.' },
              { icon: '📊', color: '#ede9fe', title: 'Business Dashboard', desc: 'Track reviews, ratings, and conversion rates. See which tags customers choose most.' },
              { icon: '🏷️', color: '#fef3c7', title: 'Niche-Specific Tags', desc: 'Custom tags for dentists, salons, gyms, restaurants, coaching centers. Tap, not type.' },
              { icon: '💬', color: '#f0fdf4', title: 'WhatsApp Alerts', desc: 'Get notified instantly when you receive feedback. Never miss a review request.', soon: true },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="feature-card" style={{ background: 'white', borderRadius: 14, padding: '24px 22px', border: '1px solid #e2e8f0', height: '100%' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
                    {f.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: 0 }}>{f.title}</h3>
                    {f.soon && <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: 20 }}>Coming Soon</span>}
                  </div>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SOCIAL PROOF / DEMO
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>
              See Praisly in Action
            </h2>
          </Reveal>

          {/* Before/After */}
          <Reveal>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
              {/* Before */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '2px solid #e2e8f0', minWidth: 200, textAlign: 'center', flex: '0 0 220px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Before Praisly</p>
                <p style={{ fontSize: 32 }}>😐</p>
                <p style={{ fontWeight: 700, fontSize: 22, color: '#0f172a', margin: '8px 0 4px' }}>3.5 ★</p>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>8 reviews</p>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: 'center', flex: '0 0 120px' }}>
                <p style={{ fontSize: 28 }}>→</p>
                <p style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>After 2 months</p>
              </div>

              {/* After */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '2px solid #10b981', minWidth: 200, textAlign: 'center', flex: '0 0 220px', boxShadow: '0 0 0 4px rgba(16,185,129,0.1)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>After Praisly</p>
                <p style={{ fontSize: 32 }}>🤩</p>
                <p style={{ fontWeight: 700, fontSize: 22, color: '#0f172a', margin: '8px 0 4px' }}>4.7 ★</p>
                <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>47 reviews</p>
              </div>
            </div>
          </Reveal>

          {/* Testimonials */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {[
              { name: 'Dr. Amit Sharma', biz: 'Dental Clinic, Noida', quote: 'Patients actually leave reviews now. We went from 8 to 45 reviews in 6 weeks. Our new patient inquiries have doubled.' },
              { name: 'Priya Mehta', biz: 'Glam Hair Studio, Delhi', quote: 'The QR code at our counter is a game-changer. Clients scan it while waiting for payment. So easy.' },
              { name: 'Raj Singh', biz: 'Fitness Zone, Gurgaon', quote: 'Finally a tool priced for Indian businesses. Not ₹10,000/month like the foreign ones. Worth every rupee.' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="feature-card" style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
                  </div>
                  <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 2px' }}>{t.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{t.biz}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.5px' }}>
              Simple Pricing. No Hidden Fees.
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 48 }}>
              Start free. Upgrade when you grow.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                name: 'Free', price: '₹0', period: '/month', color: '#64748b',
                features: ['10 reviews/month', 'QR code generation', 'Basic dashboard', 'AI review drafts'],
                cta: 'Start Free →', ctaStyle: 'outline',
              },
              {
                name: 'Starter', price: '₹999', period: '/month', color: '#10b981', popular: true,
                features: ['100 reviews/month', 'AI review drafts (Hindi + English)', 'Review gating', 'Analytics dashboard', 'Niche-specific tags'],
                cta: 'Start 7-Day Free Trial →', ctaStyle: 'filled',
              },
              {
                name: 'Pro', price: '₹2,499', period: '/month', color: '#8b5cf6',
                features: ['Unlimited reviews', 'Everything in Starter', 'AI auto-reply to Google reviews', 'Weekly email reports', 'Priority WhatsApp support'],
                cta: 'Start 7-Day Free Trial →', ctaStyle: 'filled',
              },
            ].map((plan, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  className="pricing-card"
                  style={{
                    background: plan.popular ? '#f0fdf4' : 'white',
                    borderRadius: 18,
                    padding: 28,
                    border: `2px solid ${plan.popular ? '#10b981' : '#e2e8f0'}`,
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      Most Popular
                    </div>
                  )}
                  <p style={{ fontSize: 12, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 16 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', system-ui", lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{plan.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 14, color: '#374151', alignItems: 'flex-start' }}>
                        <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px',
                      borderRadius: 9,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      background: plan.ctaStyle === 'filled' ? plan.color : 'transparent',
                      color: plan.ctaStyle === 'filled' ? 'white' : plan.color,
                      border: `2px solid ${plan.color}`,
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 40, letterSpacing: '-0.5px' }}>
              Frequently Asked Questions
            </h2>
          </Reveal>

          {[
            ['Is this allowed by Google?', 'Yes. Customers write and post reviews themselves. We just make it easy with AI-drafted suggestions. The customer always reads, edits, and posts — giving full control.'],
            ['Does it work in Hindi?', 'Yes! Our AI generates natural Hinglish and English reviews using the customer\'s own feedback as input. No awkward machine translations.'],
            ['Do I need a Google Business Profile?', 'Yes. You need an existing Google Business Profile. We help you connect the review link during setup — it takes 2 minutes.'],
            ['What happens to negative feedback?', 'It comes directly to your dashboard, privately. You can address the issue before it becomes a public Google review. Only happy customers are directed to Google.'],
            ['Can I try it for free?', 'Yes. The Free plan gives you 10 review requests per month, forever. No credit card required to start.'],
            ['How do customers leave a review?', 'They scan your QR code, tap a star rating, select what they enjoyed, and post a ready-made AI review on Google. The whole process takes under 30 seconds.'],
          ].map(([q, a], i) => (
            <Reveal key={i} delay={i * 50}>
              <FAQItem q={q} a={a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Start Getting More Google Reviews Today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 36 }}>
            Join 100+ Indian businesses already using Praisly
          </p>
          <Link to="/signup" className="lp-btn-primary" style={{ fontSize: 17, padding: '16px 40px' }}>
            Create Free Account →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 20 }}>
            No credit card required&nbsp;&nbsp;•&nbsp;&nbsp;Free forever plan&nbsp;&nbsp;•&nbsp;&nbsp;Setup in 2 minutes
          </p>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0f172a', padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 28, marginBottom: 32 }}>
            {/* Left */}
            <div style={{ maxWidth: 280 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 8 }}>Praisly</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>
                AI-powered Google review collection for Indian local businesses.
              </p>
            </div>
            {/* Links */}
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Product</p>
                {[['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
                  <a key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
                    {label}
                  </a>
                ))}
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Account</p>
                {[['Login', '/login'], ['Sign Up', '/signup']].map(([label, to]) => (
                  <Link key={label} to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© 2026 Praisly · Made in India 🇮🇳</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, to]) => (
                <Link key={label} to={to} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
