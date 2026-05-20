import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import api, { authService } from '../services/api'
import WhatsAppButton from './WhatsAppButton'

const WORKSPACE_NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/reviews',   icon: '⭐', label: 'Reviews' },
  { to: '/qr',        icon: '📱', label: 'QR Code' },
  { to: '/send',      icon: '💬', label: 'WhatsApp' },
]

const ACCOUNT_NAV = [
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
  { to: '/billing',   icon: '💳', label: 'Billing' },
]

const NOTIF_ICONS = {
  positive_review:  { icon: '⭐', dot: '#D89020' },
  negative_feedback:{ icon: '🛡️', dot: '#f59e0b' },
  review_posted:    { icon: '📈', dot: '#D89020' },
  milestone:        { icon: '🎉', dot: '#8b5cf6' },
}

const LAYOUT_CSS = `
  .nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px; margin-bottom: 2px;
    color: var(--ink-3); background: transparent;
    text-decoration: none;
    font-size: 13.5px; font-weight: 400;
    transition: background 0.15s, color 0.15s;
    position: relative;
  }
  .nav-link:hover { background: var(--surface-tint); color: var(--ink); }
  .nav-link.active {
    color: var(--primary-ink);
    background: var(--primary-soft);
    font-weight: 600;
  }
  .nav-link.active::after {
    content: "";
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--primary);
  }

  .sidebar-logout {
    color: var(--ink-4); background: none; border: none;
    cursor: pointer; font-size: 12px; padding: 0;
    transition: color 0.15s; font-family: inherit;
  }
  .sidebar-logout:hover { color: var(--ink-2); }

  .content-area { padding: 28px 24px; }
  @media (max-width: 767px) { .content-area { padding: 20px 16px 80px; } }

  .sidebar-inner { padding: 16px 12px; }
  @media (max-width: 767px) { .sidebar-inner { padding-bottom: 80px; } }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: none; }
  }
  .notif-drop {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 320px; background: var(--surface); border-radius: 16px;
    border: 1px solid var(--line); box-shadow: 0 12px 40px rgba(0,0,0,0.14);
    z-index: 200; animation: dropIn 0.18s ease both; overflow: hidden;
  }
  @media (max-width: 400px) { .notif-drop { width: calc(100vw - 32px); right: -8px; } }

  .notif-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-bottom: 1px solid var(--line);
    transition: background 0.12s;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--surface-tint); }
  .notif-item.unread { background: var(--primary-soft); }
  .notif-item.unread:hover { background: var(--primary-soft); filter: brightness(0.97); }

  .pwa-banner-wrap {
    max-width: 1100px; margin: 12px auto 0; padding: 0 16px;
  }
  @media (min-width: 768px) {
    .pwa-banner-wrap {
      position: fixed; right: 20px; bottom: 20px; z-index: 60;
      width: min(360px, calc(100vw - 40px)); margin: 0; padding: 0;
    }
  }
`

const PWA_DISMISSED_KEY = 'pwa_dismissed'
const IOS_HINT_DISMISSED_KEY = 'ios_hint_dismissed'

function getStoredFlag(key) {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(key)
}

function setStoredFlag(key) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, 'true')
  }
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  return /(iPad|iPhone|iPod)/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isStandaloneApp() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  return navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true
}

function getInstallMode(promptEvent) {
  if (isStandaloneApp()) return null
  if (isIosDevice()) {
    return getStoredFlag(IOS_HINT_DISMISSED_KEY) === 'true' ? null : 'ios'
  }
  if (promptEvent && getStoredFlag(PWA_DISMISSED_KEY) !== 'true') return 'install'
  return null
}

function PwaInstallBanner() {
  const installPromptRef = useRef(null)
  const [installMode, setInstallMode] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    function refreshInstallMode() {
      setInstallMode(getInstallMode(installPromptRef.current))
    }

    const initialInstallModeTimer = window.setTimeout(refreshInstallMode, 0)

    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      if (isIosDevice() || isStandaloneApp()) return
      installPromptRef.current = event
      refreshInstallMode()
    }

    function handleAppInstalled() {
      installPromptRef.current = null
      setInstallMode(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('resize', refreshInstallMode)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.clearTimeout(initialInstallModeTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('resize', refreshInstallMode)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleAdd() {
    const prompt = installPromptRef.current
    if (!prompt) return
    await prompt.prompt()
    installPromptRef.current = null
    setInstallMode(null)
  }

  function dismissInstallBanner() {
    setStoredFlag(PWA_DISMISSED_KEY)
    setInstallMode(null)
  }

  function dismissIosHint() {
    setStoredFlag(IOS_HINT_DISMISSED_KEY)
    setInstallMode(null)
  }

  if (!installMode) return null

  return (
    <div className="pwa-banner-wrap">
      {installMode === 'install' && (
        <div style={{ background: 'var(--primary-soft)', border: '1px solid var(--line-2)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📱</span>
          <span style={{ flex: 1, color: 'var(--ink)', fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>Add Praisly to your home screen</span>
          <button onClick={handleAdd} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}>Install</button>
          <button onClick={dismissInstallBanner} style={{ background: 'transparent', color: 'var(--primary-ink)', border: 'none', fontSize: 18, lineHeight: 1, padding: 2, cursor: 'pointer', flexShrink: 0 }} aria-label="Dismiss install prompt">×</button>
        </div>
      )}

      {installMode === 'ios' && (
        <div style={{ background: 'var(--primary-soft)', border: '1px solid var(--line-2)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📱</span>
          <span style={{ flex: 1, color: 'var(--ink)', fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>To add Praisly to your home screen: tap Share → Add to Home Screen</span>
          <button onClick={dismissIosHint} style={{ background: 'transparent', color: 'var(--primary-ink)', border: 'none', fontSize: 18, lineHeight: 1, padding: 2, cursor: 'pointer', flexShrink: 0 }} aria-label="Dismiss iOS install hint">×</button>
        </div>
      )}
    </div>
  )
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function NotificationBell() {
  const [notifs, setNotifs]   = useState([])
  const [unread, setUnread]   = useState(0)
  const [open, setOpen]       = useState(false)
  const dropRef               = useRef(null)

  useEffect(() => {
    api.get('/api/notifications')
      .then(res => {
        const list = res.data?.notifications || []
        setNotifs(list)
        setUnread(res.data?.unread_count ?? list.filter(n => !n.is_read).length)
      })
      .catch(() => {})
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function markAllRead() {
    try { await api.post('/api/notifications/mark-read') } catch {}
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: '50%',
          background: open ? 'var(--surface-tint)' : 'var(--surface)',
          border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 17, transition: 'background 0.15s',
          flexShrink: 0,
        }}
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', color: 'white',
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--surface)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-drop">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 10px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifs.slice(0, 10).map(n => {
                const meta = NOTIF_ICONS[n.type] || { icon: '📣', dot: 'var(--ink-4)' }
                return (
                  <div key={n.id} className={`notif-item${!n.is_read ? ' unread' : ''}`}>
                    <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 18 }}>{meta.icon}</span>
                      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: meta.dot, border: '1px solid var(--surface)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.45, margin: '0 0 3px', fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: 0 }}>{relativeTime(n.created_at)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getInitials(name) {
  if (!name) return 'MY'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function formatSubtitle(biz) {
  const city = biz?.city?.trim()
  if (city && city.toLowerCase() !== 'string') return city
  const type = biz?.business_type?.trim()
  if (type && type.toLowerCase() !== 'string') return type.charAt(0).toUpperCase() + type.slice(1)
  return null
}

// ─── Bottom navigation bar (mobile only) ─────────────────────────────────────
const BOTTOM_ITEMS = [
  {
    to: '/dashboard', label: 'Home',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    to: '/reviews', label: 'Reviews',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="m12 17.3-6.18 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73L18.18 21z"/></svg>,
  },
  {
    to: '/qr', label: 'QR Code',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/></svg>,
  },
  {
    to: '/send', label: 'WhatsApp',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
]

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const btnStyle = (active) => ({
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 3, padding: '8px 4px 6px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: active ? 'var(--primary)' : 'var(--ink-4)',
    transition: 'color 0.15s',
  })

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: 'var(--surface)', borderTop: '1px solid var(--line)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      {BOTTOM_ITEMS.map(({ to, label, icon }) => {
        const active = location.pathname === to
        return (
          <button key={to} onClick={() => navigate(to)} style={btnStyle(active)} aria-label={label}>
            {icon}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── PWA swipe-back gesture ───────────────────────────────────────────────────
function useSwipeBack(mobileOpen) {
  const location = useLocation()
  const isPWA = isStandaloneApp()
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [swipeOver, setSwipeOver] = useState(false)
  const state = useRef({ active: false, startX: 0, startY: 0, lastX: 0 })

  // Don't activate on the dashboard root (nowhere to go back to)
  const isHome = location.pathname === '/dashboard'

  useEffect(() => {
    // Also skip when sidebar is open — prevents conflict with sidebar swipe-open gesture
    if (!isPWA || isHome || mobileOpen) return

    const EDGE = 30       // px from left edge to start gesture
    const THRESHOLD = 80  // px horizontal travel to confirm back

    function onTouchStart(e) {
      const t = e.touches[0]
      // Ignore input fields, textareas, selects
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (t.clientX > EDGE) return
      state.current = { active: true, startX: t.clientX, startY: t.clientY, lastX: t.clientX }
    }

    function onTouchMove(e) {
      if (!state.current.active) return
      const t = e.touches[0]
      const dx = t.clientX - state.current.startX
      const dy = Math.abs(t.clientY - state.current.startY)

      // Cancel if it looks like a vertical scroll
      if (dy > dx && dy > 10) {
        state.current.active = false
        setSwipeProgress(0)
        setSwipeOver(false)
        return
      }

      state.current.lastX = t.clientX
      const progress = Math.min(Math.max(dx / THRESHOLD, 0), 1)
      setSwipeProgress(progress)
      setSwipeOver(progress >= 1)
    }

    function onTouchEnd() {
      if (!state.current.active) return
      const dx = state.current.lastX - state.current.startX
      state.current.active = false
      if (dx >= THRESHOLD) window.history.back()
      setSwipeProgress(0)
      setSwipeOver(false)
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [isPWA, isHome, mobileOpen])

  return { swipeProgress, swipeOver }
}

function Sidebar({ onClose, mobileDrawer = false }) {
  const biz      = authService.getBusiness()
  const initials = getInitials(biz?.business_name)
  const subtitle = formatSubtitle(biz)
  const plan     = biz?.plan
  const isPaid   = plan === 'monthly' || plan === 'yearly'

  return (
    <div className="sidebar-inner" style={{
      width: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100vh',
    }}>
      <style>{LAYOUT_CSS}</style>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 20px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF7C4F, #FF5B2E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 18, fontWeight: 800, flexShrink: 0,
        }}>P</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', lineHeight: 1.2 }}>Praisly</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
            Rank · Review · Win
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto', color: 'var(--ink-4)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, flexShrink: 0 }} aria-label="Close menu">
            ✕
          </button>
        )}
      </div>

      {/* Workspace nav group */}
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontWeight: 600, padding: '0 8px 6px' }}>
        Workspace
      </div>
      {WORKSPACE_NAV.map(item => (
        <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      {/* Account nav group */}
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontWeight: 600, padding: '0 8px 6px', marginTop: 20 }}>
        Account
      </div>
      {ACCOUNT_NAV.map(item => (
        <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      {/* Logout */}
      <button
        onClick={() => authService.logout()}
        style={{
          marginTop: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ink-3)',
          fontSize: 13,
          fontFamily: 'inherit',
          padding: '0 8px',
          textAlign: 'left',
        }}
      >
        Logout →
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User card */}
      <div style={{
        background: 'var(--surface-tint)',
        borderRadius: 10,
        padding: '10px 12px',
        border: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF7C4F, #FF5B2E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: '0.5px',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {biz?.business_name || 'My Business'}
            </p>
            {subtitle && (
              <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtitle}
              </p>
            )}
          </div>
          {isPaid && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: 'var(--primary)', color: 'white',
              padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em', flexShrink: 0,
            }}>
              PRO
            </span>
          )}
        </div>
        {!isPaid && (() => {
          const trialEndsAt = biz?.trial_ends_at
          let daysLeft = null
          let expired = false
          if (trialEndsAt) {
            const diff = Math.floor((new Date(trialEndsAt) - Date.now()) / 86400000)
            expired = diff < 0
            daysLeft = Math.max(0, diff)
          }
          if (expired) {
            return (
              <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 8, background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                Trial Expired
              </span>
            )
          }
          const daysLabel = daysLeft !== null ? `Trial — ${daysLeft}d left` : 'Trial'
          return (
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 8, background: 'var(--gold-soft)', color: 'var(--bronze)' }}>
              {daysLabel}
            </span>
          )
        })()}
        <button className="sidebar-logout" style={{ marginTop: 8, display: 'block' }} onClick={() => authService.logout()}>
          Logout →
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isPWA = isStandaloneApp()
  const { swipeProgress, swipeOver } = useSwipeBack(mobileOpen)
  useEffect(() => { document.title = 'Praisly Dashboard' }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* PWA swipe-back indicator */}
      {swipeProgress > 0.02 && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 60, borderRadius: '0 30px 30px 0',
            background: swipeOver ? 'rgba(31,138,91,0.85)' : 'rgba(26,22,16,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: Math.min(swipeProgress * 1.4, 1),
            zIndex: 9999, pointerEvents: 'none',
            transition: 'background 0.12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </div>
      )}
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ flexShrink: 0, width: 220 }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}
        />
        <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: 220, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
          <Sidebar onClose={() => setMobileOpen(false)} mobileDrawer />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, background: 'var(--bg)', minWidth: 0 }}>

        {/* Top bar */}
        <div
          style={{
            background: 'var(--bg)',
            padding: '0 16px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            position: 'sticky',
            top: 0,
            zIndex: 30,
            borderBottom: '1px solid var(--line)',
          }}
        >
          {/* Hamburger — mobile only, opens sidebar */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(o => !o)}
            style={{ color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Title — mobile only, absolutely centered */}
          <span
            className="md:hidden"
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--ink)', fontSize: 18, fontWeight: 800,
              pointerEvents: 'none', userSelect: 'none',
            }}
          >
            Praisly
          </span>

          {/* Spacer — pushes bell/refresh to far right on all screen sizes */}
          <div style={{ flex: 1 }} />

          {/* Refresh — PWA only (no browser button available) */}
          {isPWA && (
            <button
              onClick={() => window.location.reload()}
              style={{ color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 8 }}
              aria-label="Refresh page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
            </button>
          )}

          {/* Notification bell — both desktop & mobile */}
          <NotificationBell />
        </div>

        <PwaInstallBanner />

        <div className="content-area" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </div>

      <WhatsAppButton message="Hi Praisly team, I need help with my account" />

      {/* Fixed bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
