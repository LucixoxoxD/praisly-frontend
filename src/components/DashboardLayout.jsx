import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { authService } from '../services/api'

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/reviews',   icon: '⭐', label: 'Reviews' },
  { to: '/qr',        icon: '📱', label: 'QR Code' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
  { to: '/billing',   icon: '💳', label: 'Billing' },
]

function Sidebar({ onClose }) {
  const biz = authService.getBusiness()

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
      {/* Logo */}
      <div style={{ padding: '24px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
              borderLeft: `3px solid ${isActive ? '#10b981' : 'transparent'}`,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s ease',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: business name + logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
            marginBottom: 6,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {biz?.business_name || 'My Business'}
        </p>
        <button
          onClick={() => authService.logout()}
          style={{
            color: 'rgba(255,255,255,0.35)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.35)')}
        >
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

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: 240 }}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, background: '#f8fafc', minWidth: 0 }}>
        {/* Mobile topbar */}
        <div
          className="md:hidden"
          style={{
            background: '#1a1a2e',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', system-ui",
            }}
          >
            Praisly
          </span>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ color: 'white', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
