import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WhatsAppButton from '../components/WhatsAppButton'

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
              "Great styling at Looks Salon. Staff was friendly and the place was clean. Will come back for sure."
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
  const [demoLoading, setDemoLoading] = useState(false)

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
  const [lpYearly, setLpYearly] = useState(true)

  useEffect(() => {
    document.title = 'Praisly — Get More Google Reviews on Autopilot'
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
            Start Free Trial →
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
            Start Free Trial →
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
                Dentists, salons, gyms &amp; restaurants — get 5x more Google reviews without asking twice. Customers scan your QR, tap, and post in 30 seconds.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <Link to="/signup" className="lp-btn-primary" style={{ fontSize: 16, padding: '15px 32px' }}>
                  Start Free Trial →
                </Link>
                {DEMO_EMAIL && DEMO_PASSWORD && (
                  <button
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                    style={{
                      padding: '15px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.35)',
                      background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)',
                      fontSize: 15, fontWeight: 600, cursor: demoLoading ? 'wait' : 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                      backdropFilter: 'blur(4px)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
                  >
                    {demoLoading ? 'Loading…' : 'See Live Demo →'}
                  </button>
                )}
              </div>

              {/* Trust line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex' }}>
                  {['🦷', '💇', '🏋️', '🍽️'].map((e, i) => (
                    <span key={i} style={{ fontSize: 20, marginRight: 2 }}>{e}</span>
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  Built for Indian local businesses
                </span>
              </div>
            </div>

            {/* Right: phone mockup */}
            <PhoneMockup />
          </div>

          {/* Banner */}
          <div
            style={{
              marginTop: 56,
              textAlign: 'center',
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p style={{ fontSize: 18, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
              One QR code. Unlimited reviews. Zero awkward asking.
            </p>
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

          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/signup" className="lp-btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
                Start Free Trial →
              </Link>
              <p style={{ color: '#64748b', fontSize: 14, margin: '12px 0 0' }}>7-day free trial. No card required.</p>
            </div>
          </Reveal>
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
              { icon: '🤖', color: '#dbeafe', title: 'Customers write reviews in 10 seconds', desc: 'AI generates a ready-made review based on what they liked. They just copy paste and post.' },
              { icon: '🛡️', color: '#d1fae5', title: 'Customer feedback routing', desc: 'Customers can share private feedback with your team, and every customer stays in control of whether they continue to Google.' },
              { icon: '📱', color: '#fce7f3', title: 'One QR code at your counter. That\'s it.', desc: 'Print it. Place it. Customers scan after their visit and reviews come automatically.' },
              { icon: '📊', color: '#ede9fe', title: 'See how you rank against nearby competitors', desc: 'Track how many reviews your competitors got this month. Know exactly where you stand.' },
              { icon: '📈', color: '#fef3c7', title: 'Watch your Google reviews grow', desc: 'See reviews gained, rating changes, and estimated business value — all in one simple dashboard.' },
              { icon: '🔔', color: '#f0fdf4', title: 'Get alerted the moment a customer rates you', desc: 'Know instantly when someone gives you 5 stars or sends private feedback.' },
              { icon: '⭐', color: '#fff7ed', title: 'Your Google rating tracked automatically', desc: 'We check your Google profile twice a day and show you how your rating is changing over time.' },
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

          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/signup" className="lp-btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
                Start Free Trial →
              </Link>
              <p style={{ color: '#64748b', fontSize: 14, margin: '12px 0 0' }}>7-day free trial. No card required.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WHY PRAISLY — COMPARISON
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 40, letterSpacing: '-0.5px' }}>
              Why Praisly?
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <Reveal delay={0}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', height: '100%' }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 16 }}>Asking manually</p>
                {['😩 Most customers forget', 'Maybe 1-2 reviews per month', 'No control over what they write', 'Free but ineffective'].map(item => (
                  <p key={item} style={{ fontSize: 14, color: '#64748b', margin: '0 0 10px', lineHeight: 1.5 }}>{item}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', height: '100%' }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 16 }}>Foreign tools (Podium, Birdeye)</p>
                {['💰 $250–400/month (₹20,000+)', 'No Hindi/Indian context', 'No UPI payments', 'Built for US businesses'].map(item => (
                  <p key={item} style={{ fontSize: 14, color: '#64748b', margin: '0 0 10px', lineHeight: 1.5 }}>{item}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '2px solid #10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.08)', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: 0 }}>Praisly</p>
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Best choice</span>
                </div>
                {['🚀 AI writes the review for them', '40+ reviews in 2 months', 'Built for Indian businesses', '₹999/month — early adopter pricing'].map(item => (
                  <p key={item} style={{ fontSize: 14, color: '#374151', fontWeight: 500, margin: '0 0 10px', lineHeight: 1.5 }}>{item}</p>
                ))}
              </div>
            </Reveal>
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

          {/* Sample AI-generated reviews */}
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 20 }}>
              Here's what a review collected through Praisly looks like:
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {[
              { stars: 5, review: 'Great experience at this dental clinic. The doctor was thorough and explained everything clearly. Staff was friendly and the wait time was minimal. Will definitely come back.' },
              { stars: 5, review: 'Love this salon! Got a haircut and they did exactly what I asked. Very clean and hygienic place. Pricing is reasonable too. Highly recommend to anyone looking for a good stylist.' },
              { stars: 4, review: 'Good gym with all the equipment you need. Trainers are knowledgeable and the place is well maintained. The morning slots can get a bit crowded but overall a solid choice.' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="feature-card" style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= t.stars ? '#f59e0b' : '#e2e8f0', fontSize: 14 }}>★</span>)}
                  </div>
                  <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{t.review}"</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
              Sample reviews — AI-generated from customer feedback. Customers read, edit if they want, and post.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.5px' }}>
              Simple pricing. No surprises.
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 32 }}>
              Everything you need to grow your Google reviews.
            </p>
          </Reveal>

          {/* Monthly / Yearly pill toggle */}
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 999, padding: 4 }}>
                <button
                  onClick={() => setLpYearly(false)}
                  style={{
                    padding: '10px 24px', borderRadius: 999, border: 'none',
                    fontSize: 14, fontWeight: lpYearly ? 500 : 700, cursor: 'pointer', fontFamily: 'inherit',
                    background: lpYearly ? 'transparent' : 'white',
                    color: lpYearly ? '#6b7280' : '#111827',
                    boxShadow: lpYearly ? 'none' : '0 1px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setLpYearly(true)}
                  style={{
                    padding: '10px 24px', borderRadius: 999, border: 'none',
                    fontSize: 14, fontWeight: lpYearly ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit',
                    background: lpYearly ? 'white' : 'transparent',
                    color: lpYearly ? '#111827' : '#6b7280',
                    boxShadow: lpYearly ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  Yearly
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>Save ₹4,000 (33% off)</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Single pricing card */}
          <Reveal>
            <div
              className="pricing-card"
              style={{
                background: 'white', borderRadius: 20,
                border: '2px solid #10b981',
                boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
                padding: 32, position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 18px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                {lpYearly ? 'Best Value' : 'Full Access'}
              </div>

              <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', textAlign: 'center' }}>Praisly</p>

              {/* Early adopter badge */}
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <span style={{ display: 'inline-block', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
                  🚀 Early Adopter Pricing
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#c2410c', textAlign: 'center', margin: '0 0 16px', fontWeight: 600 }}>
                Early adopter pricing — only for the first 200 businesses. Lock in this rate now.
              </p>

              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                {lpYearly && (
                  <p style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'line-through', margin: '0 0 4px' }}>₹999/month</p>
                )}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 48, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {lpYearly ? '₹666' : '₹999'}
                  </span>
                  <span style={{ fontSize: 16, color: '#94a3b8' }}>/month</span>
                </div>
                {lpYearly && <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>₹7,999 billed yearly</p>}
              </div>

              <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', margin: '8px 0 0' }}>
                {lpYearly ? "Less than ₹23/day — cheaper than auto fare 🛺" : "Less than ₹34/day — that's one samosa plate 🥟"}
              </p>

              {lpYearly && (
                <div style={{ textAlign: 'center', margin: '10px 0 0' }}>
                  <span style={{ display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
                    You save ₹4,000/year — 33% off 🎉
                  </span>
                </div>
              )}

              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Unlimited review requests', 'AI-powered review drafts', 'Smart review routing', 'QR code for your counter', 'Competitor tracking & ranking', 'Real-time dashboard & analytics', 'Notification alerts', 'Google rating tracker'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>✅</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '14px', borderRadius: 12,
                  background: '#10b981', color: 'white',
                  fontWeight: 700, fontSize: 16,
                  textDecoration: 'none', transition: 'opacity 0.15s',
                }}
              >
                Start Now →
              </Link>
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '10px 0 0' }}>
                7-day free trial. No card required.
              </p>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24, marginTop: 24 }}>
              {['🔒 Payments via Razorpay', '🛡️ Your data is encrypted', '❌ Cancel anytime'].map(item => (
                <span key={item} style={{ fontSize: 13, color: '#6b7280' }}>{item}</span>
              ))}
            </div>
          </Reveal>
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
            ['What happens to critical feedback?', 'Customers can share private feedback with your team so you can respond and improve. Praisly does not block customers from writing public reviews; customers decide whether to continue to Google.'],
            ['Can I try it for free?', 'Yes. You get a 7-day free trial — no credit card required. Full access to everything. After that, plans start at ₹999/month (early adopter pricing).'],
            ['How do customers leave a review?', 'They scan your QR code, tap a star rating, select what they enjoyed, and post a ready-made AI review on Google. The whole process takes under 30 seconds.'],
            ['Will Google detect these reviews are AI-written?', 'No. Our AI writes unique reviews every time in natural casual English. Each review is different — no two reviews sound the same. The customer also has the option to edit before posting.'],
            ['How is this different from just asking customers to review?', 'When you ask verbally most customers forget or don\'t bother. Praisly makes it effortless — they scan a QR, tap a few buttons, and a ready-made review is on their clipboard in seconds.'],
            ['What happens after the 7-day free trial?', 'You can subscribe to continue at ₹999/month or ₹7,999/year (early adopter pricing). If you don\'t subscribe your account stays but you won\'t be able to collect new reviews.'],
            ['Can I cancel anytime?', 'Yes. Cancel anytime from your dashboard. No lock-in. No cancellation fees.'],
            ['Do I need any technical knowledge?', 'Not at all. Sign up, print your QR code, place it at your counter. That\'s it. Everything else is automatic.'],
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
            Your competitors are collecting reviews. Are you?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 36 }}>
            Start your 7-day free trial. No card required.
          </p>
          <Link to="/signup" className="lp-btn-primary" style={{ fontSize: 17, padding: '16px 40px' }}>
            Start Free Trial →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 20 }}>
            No credit card required&nbsp;&nbsp;•&nbsp;&nbsp;7-day free trial&nbsp;&nbsp;•&nbsp;&nbsp;Setup in 2 minutes
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
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                AI-powered Google review collection for Indian local businesses.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 8px' }}>Made with ❤️ in India</p>
              {import.meta.env.VITE_SUPPORT_PHONE && (
                <a
                  href={`https://wa.me/${import.meta.env.VITE_SUPPORT_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a7f3d0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6ee7b7'}
                >
                  💬 Questions? WhatsApp us
                </a>
              )}
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
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© 2026 Praisly · Made with ❤️ in India 🇮🇳</p>
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
      <WhatsAppButton message="Hi I want to know more about Praisly" />
    </div>
  )
}
