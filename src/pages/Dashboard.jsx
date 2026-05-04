import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import api, { authService } from '../services/api'
import { stripMarkdown } from '../utils/helpers'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanText(text) {
  if (!text) return ''
  let t = stripMarkdown(text)
  while ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim()
  }
  return t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
}

function fmtIN(n) {
  return new Intl.NumberFormat('en-IN').format(Math.floor(n || 0))
}

function ratingBorder(r) {
  if (r >= 4) return '#10b981'
  if (r === 3) return '#f59e0b'
  return '#ef4444'
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const PAGE_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  @keyframes confettiFall {
    0%   { transform: translateY(-10px) rotateZ(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
  }
  @keyframes milestoneIn {
    from { opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
    to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

  .d-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    transition: box-shadow 0.2s ease;
  }
  .d-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); }

  .d-hero-num {
    font-family: 'Plus Jakarta Sans', system-ui;
    font-size: 36px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1;
  }
  .d-label { font-size: 13px; font-weight: 500; color: #64748b; margin: 0 0 8px; }
  .d-sub   { font-size: 12px; color: #94a3b8; margin: 6px 0 0; }

  .d-badge {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
  }
  .d-badge-green { background: #d1fae5; color: #065f46; }
  .d-badge-amber { background: #fef3c7; color: #92400e; }
  .d-badge-gray  { background: #f1f5f9; color: #475569; }
  .d-badge-purple { background: #ede9fe; color: #5b21b6; }

  .comp-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-radius: 10px;
    margin-bottom: 6px;
    transition: background 0.15s;
  }
  .comp-row:hover { background: #f8fafc; }
  .comp-row.me    { background: #f0fdf4; border: 1px solid #bbf7d0; }

  .search-result {
    padding: 12px 14px; border-radius: 10px;
    border: 1px solid #e2e8f0; margin-bottom: 8px;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    background: white;
  }
  .search-result:hover { background: #f0fdf4; border-color: #10b981; }

  .review-card {
    background: white; border-radius: 12px;
    padding: 16px; border: 1px solid #f1f5f9;
    margin-bottom: 10px; transition: box-shadow 0.2s;
  }
  .review-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

  @media (max-width: 640px) {
    .d-hero-grid { grid-template-columns: 1fr !important; }
    .d-mini-grid { grid-template-columns: 1fr 1fr !important; }
    .d-chart-grid { grid-template-columns: 1fr !important; }
  }
`

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0)
  const num = typeof target === 'number' ? target : 0
  useEffect(() => {
    if (num === 0) { setVal(0); return }
    let cur = 0
    const steps = duration / 16
    const step = num / steps
    const t = setInterval(() => {
      cur += step
      if (cur >= num) { setVal(num); clearInterval(t) }
      else setVal(cur)
    }, 16)
    return () => clearInterval(t)
  }, [num, duration])
  return val
}

// ---------------------------------------------------------------------------
// Small shared components
// ---------------------------------------------------------------------------

function Skel({ style }) {
  return <div style={{ background: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', ...style }} />
}

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    posted:  { bg: '#d1fae5', color: '#065f46', label: 'Posted' },
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    private: { bg: '#f1f5f9', color: '#475569', label: 'Private' },
  }
  const s = map[status] || map.private
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
}

function ChartTooltip({ active, payload, label, unit = 'reviews' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', fontSize: 13 }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a' }}>{payload[0].value} {unit}</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 8 }}>
      No data yet
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tooltip for Estimated Value card
// ---------------------------------------------------------------------------

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ width: 16, height: 16, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
      >
        i
      </span>
      {show && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 200, background: '#1e293b', color: 'white', fontSize: 11, padding: '8px 10px', borderRadius: 8, lineHeight: 1.5, zIndex: 10, pointerEvents: 'none' }}>
          {text}
        </div>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Hero stat card (large)
// ---------------------------------------------------------------------------

function HeroCard({ title, children, tintColor = '#10b981', icon, delay = 0, style }) {
  return (
    <div
      className="d-card"
      style={{
        padding: '24px',
        background: `color-mix(in srgb, ${tintColor} 4%, white)`,
        animation: `fadeUp 0.35s ease both`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p className="d-label">{title}</p>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini stat card (2nd row)
// ---------------------------------------------------------------------------

function MiniCard({ title, value, sub, icon, iconBg, tintColor = '#10b981', delay = 0, extra }) {
  const count = useCountUp(value ?? 0)
  return (
    <div
      className="d-card"
      style={{
        padding: '20px',
        background: `color-mix(in srgb, ${tintColor} 4%, white)`,
        animation: `fadeUp 0.35s ease both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="d-label">{title}</p>
          <p className="d-hero-num" style={{ fontSize: 28 }}>{fmtIN(count)}</p>
          {sub && <p className="d-sub">{sub}</p>}
          {extra}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confetti pieces (generated once, pure CSS animation)
// ---------------------------------------------------------------------------

const CONF_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

function ConfettiPieces() {
  const pieces = useMemo(() =>
    Array.from({ length: 42 }, (_, i) => ({
      key: i,
      color: CONF_COLORS[i % CONF_COLORS.length],
      left: `${5 + Math.random() * 90}%`,
      delay: `${Math.random() * 1.8}s`,
      duration: `${1.8 + Math.random() * 1.5}s`,
      size: 6 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
    })), []
  )
  return (
    <>
      {pieces.map(p => (
        <div
          key={p.key}
          style={{
            position: 'fixed',
            top: -10,
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: p.isCircle ? '50%' : 2,
            background: p.color,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
            pointerEvents: 'none',
            zIndex: 101,
          }}
        />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Milestone celebration overlay
// ---------------------------------------------------------------------------

function MilestoneOverlay({ notif, onDismiss }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', animation: 'overlayIn 0.25s ease' }}>
      <ConfettiPieces />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: 24, padding: '40px 36px',
        maxWidth: 380, width: '90%', textAlign: 'center',
        animation: 'milestoneIn 0.3s ease',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        <p style={{ fontSize: 64, margin: '0 0 8px', lineHeight: 1 }}>🎉</p>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
          Congratulations!
        </h2>
        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, margin: '0 0 28px' }}>{notif.message}</p>
        <button
          onClick={onDismiss}
          style={{
            background: '#10b981', color: 'white', border: 'none',
            borderRadius: 12, padding: '13px 32px', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Awesome! 🙌
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Competitor modal + leaderboard
// ---------------------------------------------------------------------------

function CompetitorModal({ bizCity, onClose, onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(null)
  const debounce = useRef(null)

  function handleSearch(val) {
    setQuery(val)
    clearTimeout(debounce.current)
    if (!val.trim()) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/api/places/search?query=${encodeURIComponent(val)}&city=${encodeURIComponent(bizCity || '')}`)
        setResults(res.data?.results || [])
      } catch {}
      setSearching(false)
    }, 500)
  }

  async function handleSelect(place) {
    setAdding(place.place_id)
    try {
      await onAdd(place.place_id, place.name)
      onClose()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not add competitor')
    }
    setAdding(null)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>Add Competitor</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <input
          autoFocus
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by business name…"
          style={{
            width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
            borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
            outline: 'none', marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        {searching && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Searching…</p>}
        {results.map(r => (
          <div key={r.place_id} className="search-result" onClick={() => handleSelect(r)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.formatted_address}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                {r.rating && <p style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', margin: '0 0 2px' }}>⭐ {r.rating}</p>}
                {r.user_ratings_total != null && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{fmtIN(r.user_ratings_total)} reviews</p>}
              </div>
            </div>
            {adding === r.place_id && <p style={{ fontSize: 12, color: '#10b981', margin: '6px 0 0', fontWeight: 600 }}>Adding…</p>}
          </div>
        ))}
        {!searching && query && results.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No results. Try a different name.</p>
        )}
      </div>
    </div>
  )
}

function CompetitorSection({ stats, competitors, onAdd, onDelete, bizName }) {
  const [showModal, setShowModal] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const bizCity = authService.getBusiness()?.city || ''

  async function handleAdd(place_id, name) {
    const res = await api.post('/api/competitors/add', { place_id, name })
    onAdd(res.data.competitor)
  }

  const allEntries = [
    {
      name: bizName || 'Your Business',
      review_count: stats?.google_current_count || 0,
      rating: stats?.google_current_rating,
      isMe: true,
    },
    ...competitors.map(c => ({ ...c, isMe: false })),
  ].sort((a, b) => (b.review_count || 0) - (a.review_count || 0))

  const myRank = allEntries.findIndex(e => e.isMe) + 1
  const topEntry = allEntries.find(e => !e.isMe && e.review_count > (stats?.google_current_count || 0))

  const canAddMore = competitors.length < 3

  if (competitors.length === 0) {
    return (
      <>
        <div className="d-card" style={{ padding: '28px 24px', textAlign: 'center', animation: 'fadeUp 0.35s ease both', animationDelay: '350ms' }}>
          <p style={{ fontSize: 28, margin: '0 0 12px' }}>🏆</p>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>How do you compare?</h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>Add up to 3 local competitors to track your Google ranking</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Add Competitor
          </button>
        </div>
        {showModal && <CompetitorModal bizCity={bizCity} onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </>
    )
  }

  return (
    <>
      <div className="d-card" style={{ padding: '20px 20px 14px', animation: 'fadeUp 0.35s ease both', animationDelay: '350ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Local Ranking</h3>
          <button
            onClick={() => setShowManage(!showManage)}
            style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
          >
            Manage
          </button>
        </div>

        {/* #1 or gap banner */}
        {myRank === 1 ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, fontWeight: 700, color: '#15803d', textAlign: 'center' }}>
            🏆 You're #1 in your area!
          </div>
        ) : topEntry ? (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#92400e', textAlign: 'center' }}>
            You're {fmtIN(topEntry.review_count - (stats?.google_current_count || 0))} reviews behind {topEntry.name}. Keep going! 💪
          </div>
        ) : null}

        {/* Leaderboard rows */}
        {allEntries.map((entry, i) => (
          <div key={entry.id || 'me'} className={`comp-row${entry.isMe ? ' me' : ''}`}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? '#92400e' : '#475569', flexShrink: 0 }}>
              {i + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: entry.isMe ? 700 : 500, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.name} {entry.isMe && <span style={{ fontSize: 11, color: '#10b981' }}>(you)</span>}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{fmtIN(entry.review_count)}</p>
              {entry.rating && <p style={{ fontSize: 11, color: '#f59e0b', margin: 0 }}>⭐ {Number(entry.rating).toFixed(1)}</p>}
            </div>
            {showManage && !entry.isMe && (
              <button
                onClick={() => onDelete(entry.id)}
                style={{ marginLeft: 8, color: '#ef4444', background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, flexShrink: 0 }}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {showManage && canAddMore && (
          <button
            onClick={() => setShowModal(true)}
            style={{ width: '100%', marginTop: 10, padding: '9px', background: 'none', border: '1.5px dashed #e2e8f0', borderRadius: 10, fontSize: 13, color: '#10b981', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Add Competitor
          </button>
        )}
      </div>
      {showModal && <CompetitorModal bizCity={bizCity} onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [stats, setStats]           = useState(null)
  const [reviews, setReviews]       = useState([])
  const [competitors, setCompetitors] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [milestoneNotif, setMilestoneNotif] = useState(null)
  const [milestoneDismissed, setMilestoneDismissed] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [bizName, setBizName]       = useState(authService.getBusiness()?.business_name || '')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([
      api.get('/api/reviews/stats'),
      api.get('/api/reviews/list?limit=5'),
      api.get('/api/auth/me'),
      api.get('/api/competitors').catch(() => ({ data: [] })),
      api.get('/api/reviews/growth-chart').catch(() => ({ data: [] })),
      api.get('/api/notifications').catch(() => ({ data: { notifications: [] } })),
    ]).then(([s, r, me, c, g, n]) => {
      setStats(s.data)
      setReviews(r.data.reviews || [])
      setCompetitors(Array.isArray(c.data) ? c.data : [])
      setGrowthData(Array.isArray(g.data) ? g.data : [])

      const name = me.data?.business?.business_name
      if (name) { setBizName(name); authService.setBusiness(me.data.business) }

      const notifs = n.data?.notifications || []
      const milestone = notifs.find(x => x.type === 'milestone' && !x.is_read)
      if (milestone) setMilestoneNotif(milestone)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function dismissMilestone() {
    setMilestoneDismissed(true)
    try { await api.post('/api/notifications/mark-read') } catch {}
  }

  function handleAddCompetitor(comp) {
    setCompetitors(prev => [...prev, comp])
  }

  async function handleDeleteCompetitor(id) {
    try {
      await api.delete(`/api/competitors/${id}`)
      setCompetitors(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  // Chart data
  const ratingData = stats
    ? [1,2,3,4,5].map(n => ({ star: `${n}★`, count: stats.rating_distribution?.[String(n)] || 0 }))
    : []
  const timeData = (stats?.reviews_over_time || []).map(d => ({ date: d.date.slice(5), count: d.count }))
  const growthChartData = growthData.map(d => ({ date: d.date.slice(5), count: d.review_count }))
  const noRatingData = ratingData.every(d => d.count === 0)
  const noTimeData   = timeData.every(d => d.count === 0)
  const noGrowthData = growthChartData.length === 0

  // Animated hero values
  const gainedAnim  = useCountUp(stats?.google_reviews_gained ?? 0)
  const ratingAnim  = useCountUp(stats?.google_current_rating ?? 0)
  const valMinAnim  = useCountUp(stats?.estimated_value_min ?? 0)
  const valMaxAnim  = useCountUp(stats?.estimated_value_max ?? 0)
  const baselineRating = stats?.google_baseline_rating
  const ratingDiff     = stats?.google_current_rating && baselineRating
    ? (Number(stats.google_current_rating) - Number(baselineRating)).toFixed(1)
    : null

  // ---------------------------------------------------------------------------
  // Skeleton
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div>
        <style>{PAGE_CSS}</style>
        <Skel style={{ height: 34, width: 260, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }} className="d-hero-grid">
          {[0,1,2].map(i => (
            <div key={i} className="d-card" style={{ padding: 24 }}>
              <Skel style={{ height: 13, width: 100, marginBottom: 14 }} />
              <Skel style={{ height: 36, width: 80, marginBottom: 10 }} />
              <Skel style={{ height: 11, width: 120 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }} className="d-mini-grid">
          {[0,1].map(i => <div key={i} className="d-card" style={{ padding: 20 }}><Skel style={{ height: 80 }} /></div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }} className="d-chart-grid">
          {[0,1,2].map(i => <Skel key={i} style={{ height: 220, borderRadius: 16 }} />)}
        </div>
        {[0,1,2].map(i => <Skel key={i} style={{ height: 72, borderRadius: 12, marginBottom: 10 }} />)}
      </div>
    )
  }

  return (
    <>
      <style>{PAGE_CSS}</style>

      {/* Milestone celebration */}
      {milestoneNotif && !milestoneDismissed && (
        <MilestoneOverlay notif={milestoneNotif} onDismiss={dismissMilestone} />
      )}

      {/* Greeting */}
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 24, animation: 'fadeUp 0.3s ease' }}>
        {greeting}, {bizName || 'there'} 👋
      </h1>

      {/* ── Hero stat cards (3-col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }} className="d-hero-grid">

        {/* Card 1 — Google Reviews Gained */}
        <HeroCard title="Google Reviews Gained" icon="📈" tintColor="#10b981" delay={0}>
          <p className="d-hero-num" style={{ color: stats?.google_reviews_gained > 0 ? '#059669' : '#0f172a', marginBottom: 4 }}>
            {stats?.google_reviews_gained > 0 ? `+${fmtIN(gainedAnim)}` : fmtIN(gainedAnim)}
          </p>
          <p className="d-sub">since you joined Praisly</p>
          {stats?.google_current_count > 0 ? (
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              {fmtIN(stats.google_baseline_count)} → <strong style={{ color: '#059669' }}>{fmtIN(stats.google_current_count)}</strong> total
            </p>
          ) : (
            <p style={{ fontSize: 12, color: '#10b981', marginTop: 8, fontWeight: 600 }}>Start collecting reviews!</p>
          )}
        </HeroCard>

        {/* Card 2 — Google Rating */}
        <HeroCard title="Google Rating" icon="⭐" tintColor="#f59e0b" delay={80}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
            <p className="d-hero-num">{stats?.google_current_rating ? ratingAnim.toFixed(1) : '—'}</p>
            {stats?.google_current_rating && <span style={{ fontSize: 20, marginBottom: 4 }}>⭐</span>}
          </div>
          {baselineRating && (
            <p className="d-sub">was {Number(baselineRating).toFixed(1)} when you joined</p>
          )}
          {ratingDiff !== null && (
            <span className={`d-badge ${Number(ratingDiff) > 0 ? 'd-badge-green' : Number(ratingDiff) < 0 ? 'd-badge-amber' : 'd-badge-gray'}`} style={{ marginTop: 8 }}>
              {Number(ratingDiff) > 0 ? `↑ +${ratingDiff}` : Number(ratingDiff) < 0 ? `↓ ${ratingDiff}` : '— No change'}
            </span>
          )}
        </HeroCard>

        {/* Card 3 — Estimated Value */}
        <HeroCard title="Estimated Value" icon="💰" tintColor="#8b5cf6" delay={160}>
          <p className="d-hero-num" style={{ fontSize: 26, color: '#7c3aed', marginBottom: 4 }}>
            ₹{fmtIN(valMinAnim)}–{fmtIN(valMaxAnim)}
          </p>
          <p className="d-sub">value of reviews earned</p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>per review: ₹500–2,000</span>
            <InfoTooltip text="Each Google review brings ₹500-2,000 in customer value through increased trust and visibility" />
          </div>
        </HeroCard>
      </div>

      {/* ── Mini cards (2-col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }} className="d-mini-grid">
        <MiniCard
          title="Drafts Sent"
          value={stats?.drafts_sent ?? 0}
          sub="AI review drafts generated"
          icon="✨" iconBg="#dbeafe" tintColor="#3b82f6"
          delay={240}
        />
        <MiniCard
          title="Bad Reviews Saved"
          value={stats?.negative_saved ?? 0}
          sub="caught privately before Google"
          icon="🛡️" iconBg="#fee2e2" tintColor="#ef4444"
          delay={300}
          extra={stats?.negative_saved > 0 ? (
            <p style={{ fontSize: 11, color: '#ef4444', margin: '6px 0 0', fontWeight: 600 }}>These could have hurt your rating</p>
          ) : null}
        />
      </div>

      {/* ── Competitor comparison ── */}
      <div style={{ marginBottom: 20 }}>
        <CompetitorSection
          stats={stats}
          competitors={competitors}
          onAdd={handleAddCompetitor}
          onDelete={handleDeleteCompetitor}
          bizName={bizName}
        />
      </div>

      {/* ── Charts (3-col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="d-chart-grid">

        {/* Rating distribution */}
        <div className="d-card" style={{ padding: '20px 16px', animation: 'fadeUp 0.35s ease both', animationDelay: '400ms' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>Rating Distribution</h3>
          {noRatingData ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ratingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="star" fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[5,5,0,0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reviews over time */}
        <div className="d-card" style={{ padding: '20px 16px', animation: 'fadeUp 0.35s ease both', animationDelay: '460ms' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>Reviews (Last 30 Days)</h3>
          {noTimeData ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#9ca3af' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#areaGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Google Reviews Growth */}
        <div className="d-card" style={{ padding: '20px 16px', animation: 'fadeUp 0.35s ease both', animationDelay: '520ms' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>Google Review Count</h3>
          {noGrowthData ? (
            <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12, textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: 16 }}>
              <p style={{ margin: '0 0 4px' }}>Data starts accumulating after your first snapshot</p>
              <p style={{ margin: 0 }}>Check back tomorrow 📈</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={growthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#9ca3af' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="total reviews" />} cursor={{ stroke: '#e2e8f0' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#growthGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Reviews ── */}
      <div style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '560ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Recent Reviews</h3>
          <Link to="/reviews" style={{ fontSize: 13, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>

        {reviews.length === 0 ? (
          <div className="d-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🌟</p>
            <p style={{ color: '#374151', fontSize: 15, fontWeight: 600, margin: 0 }}>No reviews yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>Share your QR code to start collecting reviews</p>
            <Link to="/qr" style={{ display: 'inline-block', padding: '9px 20px', background: '#10b981', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              View QR Code →
            </Link>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="review-card" style={{ borderLeft: `4px solid ${ratingBorder(r.rating)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 600 }}>{r.customer_name || 'Anonymous'}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
              <div style={{ marginBottom: 6 }}><Stars rating={r.rating} /></div>
              {(r.review_text || r.private_feedback) && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cleanText(r.review_text || r.private_feedback)}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><StatusBadge status={r.status} /></div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
