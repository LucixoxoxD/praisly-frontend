import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { authService } from '../services/api'

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/reviews',   icon: '⭐', label: 'Reviews' },
  { to: '/qr',        icon: '📱', label: 'QR Code' },
  { to: '/send',      icon: '📤', label: 'Send Request' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
  { to: '/billing',   icon: '💳', label: 'Billing' },
]

const SIDEBAR_CSS = `
  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 2px;
    color: rgba(255,255,255,0.55);
    background: transparent;
    border-left: 3px solid transparent;
    text-decoration: none;
    font-size: 14px;
    font-weight: 400;
    transition: background 0.15s ease, color 0.15s ease, border-left-color 0.2s ease;
  }
  .nav-link:hover {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.85);
  }
  .nav-link.active {
    color: #ffffff;
    background: rgba(255,255,255,0.07);
    font-weight: 600;
    border-left-color: #10b981;
  }
  .sidebar-logout {
    color: rgba(255,255,255,0.35);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    padding: 0;
    transition: color 0.15s;
    font-family: inherit;
  }
  .sidebar-logout:hover { color: rgba(255,255,255,0.8); }
  .content-area { padding: 28px 24px; }
  @media (max-width: 767px) { .content-area { padding: 20px 16px; } }
`

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
  const biz = authService.getBusiness()
  const initials = getInitials(biz?.business_name)
  const subtitle = formatSubtitle(biz)

  return (
    <div
      style={{
        width: 240,
        background: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100vh',
      }}
    >
      <style>{SIDEBAR_CSS}</style>

      {/* Logo row */}
      <div
        style={{
          padding: '24px 20px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', system-ui",
            letterSpacing: '-0.5px',
          }}
        >
          Praisly
        </span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              color: 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 8px' }} />

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divider above bottom section */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Bottom: avatar + business name + city + logout */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              letterSpacing: '0.5px',
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {biz?.business_name || 'My Business'}
            </p>
            {subtitle && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  margin: '2px 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <button className="sidebar-logout" onClick={() => authService.logout()}>
          Logout →
        </button>
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

      {/* Mobile drawer — always in DOM, slide via CSS transform */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        />
        {/* Drawer panel */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 50,
            width: 240,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
          }}
        >
          <Sidebar onClose={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, background: '#f8fafc', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          className="md:hidden"
          style={{
            background: '#1a1a2e',
            padding: '0 16px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Hamburger — left */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              color: 'white',
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px 8px 4px 0',
              flexShrink: 0,
            }}
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Praisly — center */}
          <span
            style={{
              flex: 1,
              textAlign: 'center',
              color: 'white',
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', system-ui",
            }}
          >
            Praisly
          </span>

          {/* Spacer — right (balances hamburger width) */}
          <div style={{ width: 38, flexShrink: 0 }} />
        </div>

        <div className="content-area" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
