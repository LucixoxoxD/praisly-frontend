import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import api, { authService } from '../services/api'

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/reviews',   icon: '⭐', label: 'Reviews' },
  { to: '/qr',        icon: '📱', label: 'QR Code' },
  { to: '/send',      icon: '📤', label: 'Send Request' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
  { to: '/billing',   icon: '💳', label: 'Billing' },
]

const NOTIF_ICONS = {
  positive_review:  { icon: '⭐', dot: '#10b981' },
  negative_feedback:{ icon: '🛡️', dot: '#f59e0b' },
  review_posted:    { icon: '📈', dot: '#10b981' },
  milestone:        { icon: '🎉', dot: '#8b5cf6' },
}

const LAYOUT_CSS = `
  .nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; margin-bottom: 2px;
    color: rgba(255,255,255,0.55); background: transparent;
    border-left: 3px solid transparent; text-decoration: none;
    font-size: 14px; font-weight: 400;
    transition: background 0.15s, color 0.15s, border-left-color 0.2s;
  }
  .nav-link:hover  { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
  .nav-link.active { color: #fff; background: rgba(255,255,255,0.07); font-weight: 600; border-left-color: #10b981; }

  .sidebar-logout {
    color: rgba(255,255,255,0.35); background: none; border: none;
    cursor: pointer; font-size: 13px; padding: 0;
    transition: color 0.15s; font-family: inherit;
  }
  .sidebar-logout:hover { color: rgba(255,255,255,0.8); }

  .content-area { padding: 28px 24px; }
  @media (max-width: 767px) { .content-area { padding: 20px 16px; } }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: none; }
  }
  .notif-drop {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 320px; background: white; border-radius: 16px;
    border: 1px solid #e2e8f0; box-shadow: 0 12px 40px rgba(0,0,0,0.14);
    z-index: 200; animation: dropIn 0.18s ease both; overflow: hidden;
  }
  @media (max-width: 400px) { .notif-drop { width: calc(100vw - 32px); right: -8px; } }

  .notif-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-bottom: 1px solid #f1f5f9;
    transition: background 0.12s;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: #f8fafc; }
  .notif-item.unread { background: #f0fdf4; }
  .notif-item.unread:hover { background: #e6faf2; }
`

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
          background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
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
            border: '1.5px solid #1a1a2e',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-drop">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 12, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifs.slice(0, 10).map(n => {
                const meta = NOTIF_ICONS[n.type] || { icon: '📣', dot: '#94a3b8' }
                return (
                  <div key={n.id} className={`notif-item${!n.is_read ? ' unread' : ''}`}>
                    <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 18 }}>{meta.icon}</span>
                      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: meta.dot, border: '1px solid white' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.45, margin: '0 0 3px', fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{relativeTime(n.created_at)}</p>
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

function Sidebar({ onClose }) {
  const biz      = authService.getBusiness()
  const initials = getInitials(biz?.business_name)
  const subtitle = formatSubtitle(biz)

  return (
    <div style={{ width: 240, background: '#1a1a2e', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
      <style>{LAYOUT_CSS}</style>

      {/* Logo row */}
      <div style={{ padding: '24px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'white', fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '-0.5px' }}>
          Praisly
        </span>
        {onClose && (
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }} aria-label="Close menu">
            ✕
          </button>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 8px' }} />

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Bottom: avatar + business + logout */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0, letterSpacing: '0.5px' }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {biz?.business_name || 'My Business'}
            </p>
            {subtitle && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <button className="sidebar-logout" onClick={() => authService.logout()}>Logout →</button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ flexShrink: 0, width: 240 }}>
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
        <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: 240, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
          <Sidebar onClose={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, background: '#f8fafc', minWidth: 0 }}>

        {/* Top bar — mobile: hamburger + title + bell | desktop: bell only */}
        <div
          style={{
            background: '#1a1a2e',
            padding: '0 16px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            style={{ color: 'white', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '4px 8px 4px 0', flexShrink: 0 }}
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Title — mobile only */}
          <span
            className="md:hidden"
            style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', system-ui" }}
          >
            Praisly
          </span>

          {/* Spacer — desktop pushes bell to far right */}
          <div className="hidden md:block" style={{ flex: 1 }} />

          {/* Notification bell — both desktop & mobile */}
          <NotificationBell />
        </div>

        <div className="content-area" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
