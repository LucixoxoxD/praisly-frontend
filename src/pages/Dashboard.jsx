import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
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

function fmtChartDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function buildGrowthChartData(series) {
  if (!series?.length) return []
  const dateMap = {}
  series.forEach(s => {
    s.data.forEach(pt => {
      if (!dateMap[pt.date]) dateMap[pt.date] = { _date: pt.date }
      dateMap[pt.date][s.name] = pt.count
    })
  })
  return Object.values(dateMap).sort((a, b) => a._date.localeCompare(b._date))
}

const RANK_MEDALS = ['🥇', '🥈', '🥉']

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const PAGE_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
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
  .d-badge-green  { background: #d1fae5; color: #065f46; }
  .d-badge-amber  { background: #fef3c7; color: #92400e; }
  .d-badge-gray   { background: #f1f5f9; color: #475569; }
  .d-badge-purple { background: #ede9fe; color: #5b21b6; }

  .lb-row {
    display: flex; align-items: center; gap: 0;
    padding: 11px 14px;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: #f8fafc; }
  .lb-row.lb-me {
    background: #f0fdf4;
    border-left: 4px solid #10b981;
    padding-left: 10px;
  }
  .lb-row.lb-me:hover { background: #e6faf2; }

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
    .d-hero-grid  { grid-template-columns: 1fr !important; }
    .d-mini-grid  { grid-template-columns: 1fr 1fr !important; }
    .d-chart-grid { grid-template-columns: 1fr !important; }
    .rank-hero-inner { flex-direction: column !important; }
    .lb-scroll { overflow-x: auto; }
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
    posted:  { bg: '#d1fae5', color: '#065f46', label: 'Posted on Google ✓' },
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Sent to customer' },
    private: { bg: '#f1f5f9', color: '#475569', label: 'Private feedback' },
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
// Rank Hero Card
// ---------------------------------------------------------------------------

function RankHeroCard({ rank, reviews30, leaderboard, stats, biz }) {
  const city = biz?.city?.trim()
  const bizType = biz?.business_type?.trim()
  const cityOk = city && city.toLowerCase() !== 'string'
  const typeOk = bizType && bizType.toLowerCase() !== 'string'

  const subtitle = [cityOk ? city : null, typeOk ? bizType : null].filter(Boolean).join(' ')

  const isLeading = rank === 1
  const selfCount = stats?.google_current_count || 0
  const nextEntry = !isLeading ? leaderboard?.[rank - 2] : null
  const gap = nextEntry ? Math.max(0, nextEntry.review_count - selfCount) : 0
  const nextRank = rank - 1

  return (
    <div
      className="d-card"
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, white 80%)',
        marginBottom: 14,
        animation: 'fadeUp 0.3s ease both',
        animationDelay: '0ms',
      }}
    >
      <div className="rank-hero-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        {/* Left — rank number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 56, fontWeight: 800, color: '#0f172a', lineHeight: 1, margin: 0 }}>
              #{rank}
            </p>
            {subtitle && (
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 8px' }}>
                in {subtitle} Rankings
              </p>
            )}
            {reviews30 > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, background: '#10b981', color: 'white', fontSize: 11, fontWeight: 700 }}>
                +{reviews30} this month
              </span>
            )}
          </div>
        </div>

        {/* Right — message */}
        <div style={{ textAlign: 'right' }}>
          {isLeading ? (
            <p style={{ fontSize: 18, fontWeight: 600, color: '#059669', margin: 0, lineHeight: 1.4 }}>
              🏆 You're leading your area!
            </p>
          ) : (
            <p style={{ fontSize: 18, fontWeight: 600, color: '#d97706', margin: 0, lineHeight: 1.4 }}>
              {fmtIN(gap)} reviews to reach #{nextRank}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confetti + milestone overlay
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
            position: 'fixed', top: -10, left: p.left,
            width: p.size, height: p.size,
            borderRadius: p.isCircle ? '50%' : 2,
            background: p.color,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
            pointerEvents: 'none', zIndex: 101,
          }}
        />
      ))}
    </>
  )
}

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
          style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 12, padding: '13px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Awesome! 🙌
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Competitor modal
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
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
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

// ---------------------------------------------------------------------------
// Leaderboard section (with AI recommendation)
// ---------------------------------------------------------------------------

function LeaderboardSection({ stats, competitors, leaderboard, onAdd, onDelete, loadingComps }) {
  const [showModal, setShowModal] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [dismissRec, setDismissRec] = useState(false)
  const bizCity = authService.getBusiness()?.city || ''

  async function handleAdd(place_id, name) {
    const res = await api.post('/api/competitors/add', { place_id, name })
    onAdd(res.data.competitor)
  }

  const canAddMore = competitors.length < 3
  const aiRec = stats?.ai_recommendation

  if (loadingComps) {
    return (
      <div className="d-card" style={{ padding: '20px', marginBottom: 20 }}>
        <Skel style={{ height: 16, width: 140, marginBottom: 16 }} />
        {[0,1,2].map(i => <Skel key={i} style={{ height: 44, borderRadius: 8, marginBottom: 8 }} />)}
      </div>
    )
  }

  if (competitors.length === 0) {
    return (
      <>
        <div className="d-card" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: 20, animation: 'fadeUp 0.35s ease both', animationDelay: '350ms' }}>
          <p style={{ fontSize: 28, margin: '0 0 12px' }}>🏆</p>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Start competing</h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>Add local competitors to see who's winning the review game in your area</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Add Competitors
          </button>
        </div>
        {showModal && <CompetitorModal bizCity={bizCity} onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </>
    )
  }

  return (
    <>
      <div className="d-card" style={{ marginBottom: aiRec && !dismissRec ? 0 : 20, borderBottomLeftRadius: aiRec && !dismissRec ? 0 : 16, borderBottomRightRadius: aiRec && !dismissRec ? 0 : 16, animation: 'fadeUp 0.35s ease both', animationDelay: '350ms', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 12px' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Local Ranking</h3>
          <button
            onClick={() => setShowManage(!showManage)}
            style={{ fontSize: 13, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
          >
            Manage
          </button>
        </div>

        {/* Column headers */}
        <div className="lb-scroll">
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 14px 6px', borderBottom: '1px solid #f1f5f9', minWidth: 460 }}>
            <span style={{ width: 36, fontSize: 11, fontWeight: 600, color: '#94a3b8', flexShrink: 0 }}>Rank</span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#94a3b8', minWidth: 0 }}>Business</span>
            <span style={{ width: 70, fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>Rating</span>
            <span style={{ width: 90, fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>Reviews</span>
            <span style={{ width: 88, fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>Last 30 Days</span>
            {showManage && <span style={{ width: 60, flexShrink: 0 }} />}
          </div>

          {leaderboard.map((entry, i) => (
            <div key={entry.id || 'me'} className={`lb-row${entry.is_self ? ' lb-me' : ''}`} style={{ minWidth: 460 }}>
              {/* Rank */}
              <span style={{ width: 36, fontSize: i < 3 ? 18 : 13, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>
                {i < 3 ? RANK_MEDALS[i] : `#${i + 1}`}
              </span>

              {/* Business name */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <p style={{ fontSize: 13, fontWeight: entry.is_self ? 700 : 500, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.name}
                  {entry.is_self && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginLeft: 6 }}>(You)</span>}
                </p>
              </div>

              {/* Rating */}
              <span style={{ width: 70, fontSize: 13, color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
                {entry.rating ? `${Number(entry.rating).toFixed(1)} ⭐` : '—'}
              </span>

              {/* Total reviews */}
              <span style={{ width: 90, fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right', flexShrink: 0 }}>
                {fmtIN(entry.review_count)}
              </span>

              {/* Last 30 days badge */}
              <span style={{ width: 88, textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: (entry.reviews_last_30_days || 0) > 0 ? '#f0fdf4' : '#f1f5f9',
                  color: (entry.reviews_last_30_days || 0) > 0 ? '#15803d' : '#94a3b8',
                }}>
                  +{entry.reviews_last_30_days || 0}
                </span>
              </span>

              {/* Remove button (manage mode) */}
              {showManage && (
                <span style={{ width: 60, textAlign: 'right', flexShrink: 0 }}>
                  {!entry.is_self && (
                    <button
                      onClick={() => onDelete(entry.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add more button in manage mode */}
        {showManage && canAddMore && (
          <div style={{ padding: '10px 14px 14px' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{ width: '100%', padding: '9px', background: 'none', border: '1.5px dashed #e2e8f0', borderRadius: 10, fontSize: 13, color: '#10b981', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              + Add Competitor
            </button>
          </div>
        )}
      </div>

      {/* AI Recommendation strip */}
      {aiRec && !dismissRec && (
        <div
          style={{
            background: '#ecfdf5', borderRadius: '0 0 16px 16px',
            border: '1px solid #d1fae5', borderTop: 'none',
            padding: '14px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 12,
            animation: 'slideIn 0.2s ease both',
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.3 }}>💡</span>
          <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1f2937', margin: 0, lineHeight: 1.55 }}>{aiRec}</p>
          <button
            onClick={() => setDismissRec(true)}
            style={{ background: 'none', border: 'none', fontSize: 16, color: '#6b7280', cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: '0 0 0 4px' }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {showModal && <CompetitorModal bizCity={bizCity} onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [stats, setStats]               = useState(null)
  const [reviews, setReviews]           = useState([])
  const [competitors, setCompetitors]   = useState([])
  const [growthData, setGrowthData]     = useState([])
  const [compGrowth, setCompGrowth]     = useState(null)
  const [milestoneNotif, setMilestoneNotif] = useState(null)
  const [milestoneDismissed, setMilestoneDismissed] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [loadingComps, setLoadingComps] = useState(true)
  const [bizName, setBizName]           = useState(authService.getBusiness()?.business_name || '')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const biz = authService.getBusiness()

  useEffect(() => {
    Promise.all([
      api.get('/api/reviews/stats'),
      api.get('/api/reviews/list?limit=5'),
      api.get('/api/auth/me'),
      api.get('/api/competitors').catch(() => ({ data: [] })),
      api.get('/api/reviews/growth-chart').catch(() => ({ data: [] })),
      api.get('/api/notifications').catch(() => ({ data: { notifications: [] } })),
      api.get('/api/reviews/competitor-growth').catch(() => ({ data: { series: [] } })),
    ]).then(([s, r, me, c, g, n, cg]) => {
      setStats(s.data)
      setReviews(r.data.reviews || [])
      setCompetitors(Array.isArray(c.data) ? c.data : [])
      setGrowthData(Array.isArray(g.data) ? g.data : [])
      setCompGrowth(cg.data)

      const name = me.data?.business?.business_name
      if (name) { setBizName(name); authService.setBusiness(me.data.business) }

      const notifs = n.data?.notifications || []
      const milestone = notifs.find(x => x.type === 'milestone' && !x.is_read)
      if (milestone) setMilestoneNotif(milestone)
    }).catch(() => {}).finally(() => { setLoading(false); setLoadingComps(false) })
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

  // Leaderboard data — sorted by review_count desc
  const leaderboard = useMemo(() => {
    if (!stats) return []
    return [
      {
        name: bizName || 'Your Business',
        rating: stats.google_current_rating,
        review_count: stats.google_current_count || 0,
        reviews_last_30_days: stats.reviews_last_30_days || 0,
        is_self: true,
      },
      ...competitors.map(c => ({
        id: c.id,
        name: c.name,
        rating: c.rating,
        review_count: c.review_count || 0,
        reviews_last_30_days: c.reviews_last_30_days || 0,
        is_self: false,
      })),
    ].sort((a, b) => b.review_count - a.review_count)
  }, [stats, competitors, bizName])

  const myRank = leaderboard.findIndex(e => e.is_self) + 1
  const showRankCard = !loading && stats && competitors.length > 0 && (stats.google_reviews_gained || 0) > 0

  // Chart data
  const ratingData = stats
    ? [1,2,3,4,5].map(n => ({ star: `${n}★`, count: stats.rating_distribution?.[String(n)] || 0 }))
    : []
  const timeData = (stats?.reviews_over_time || []).map(d => ({ date: d.date.slice(5), count: d.count }))
  const growthChartData = growthData.map(d => ({ date: d.date.slice(5), count: d.review_count }))
  const noRatingData = ratingData.every(d => d.count === 0)
  const noTimeData   = timeData.every(d => d.count === 0)
  const noGrowthData = growthChartData.length === 0

  // Competitor growth chart data
  const cgSeries = compGrowth?.series || []
  const cgDataRaw = useMemo(() => buildGrowthChartData(cgSeries), [cgSeries])
  const cgData = cgDataRaw.map(row => {
    const { _date, ...rest } = row
    return { ...rest, date: fmtChartDate(_date) }
  })
  const cgHasData = cgData.length > 1
  const showCompGrowthChart = competitors.length > 0

  // Chart summaries — declared after all dependencies are defined
  const ratingChartSummary = (() => {
    try {
      if (!stats || !stats.rating_distribution || noRatingData) return 'Collect more reviews to see your ratings'
      const total = ratingData.reduce((s, d) => s + d.count, 0)
      const topEntry = ratingData.reduce((a, b) => b.count > a.count ? b : a, ratingData[0])
      const pct45 = total > 0 ? Math.round(((ratingData[3].count + ratingData[4].count) / total) * 100) : 0
      if (topEntry.star === '5★' && topEntry.count > 0) return "Most of your customers gave you 5 stars! 🎉"
      if (topEntry.star === '4★' && topEntry.count > 0) return "Most customers rated you 4 stars ⭐"
      if (pct45 > 80) return `Your customers love you — ${pct45}% gave 4–5 stars 🎉`
      return 'Collect more reviews to see your ratings'
    } catch { return '' }
  })()

  const activitySummary = (() => {
    try {
      const total = timeData.reduce((s, d) => s + d.count, 0)
      return total > 0
        ? `You got ${total} new review${total !== 1 ? 's' : ''} this month 📈`
        : 'No reviews yet this month. Share your QR code!'
    } catch { return '' }
  })()

  const compChartSummary = (() => {
    try {
      if (!showCompGrowthChart) return 'Add competitors to see how you compare'
      if (!cgHasData) return 'Keep going — growth trends will show up in a few days'
      const myEntry = leaderboard.find(e => e.is_self)
      const myGrowth = myEntry?.reviews_last_30_days ?? 0
      const others = leaderboard.filter(e => !e.is_self)
      const slower = others.find(e => (e.reviews_last_30_days ?? 0) < myGrowth)
      if (slower) return `You're growing faster than ${slower.name} 💪`
      const fastest = others.reduce((a, b) => (b.reviews_last_30_days ?? 0) > (a.reviews_last_30_days ?? 0) ? b : a, others[0])
      if (fastest) return `${fastest.name} gained ${fastest.reviews_last_30_days ?? 0} reviews. Time to push harder!`
      return 'Keep going — growth trends will show up in a few days'
    } catch { return '' }
  })()

  // Animated hero values
  const gainedAnim  = useCountUp(stats?.google_reviews_gained ?? 0)
  const ratingAnim  = useCountUp(stats?.google_current_rating ?? 0)
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
        <Skel style={{ height: 100, borderRadius: 16, marginBottom: 14 }} />
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
        <div className="d-card" style={{ padding: 20, marginBottom: 20 }}>
          <Skel style={{ height: 16, width: 140, marginBottom: 16 }} />
          {[0,1,2].map(i => <Skel key={i} style={{ height: 44, borderRadius: 8, marginBottom: 8 }} />)}
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

      {/* Trial expired banner — undismissable */}
      {stats?.trial_expired && (
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', margin: '0 0 2px' }}>Your 7-day free trial has ended</p>
            <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Subscribe to continue collecting reviews.</p>
          </div>
          <Link to="/billing" style={{ display: 'inline-block', padding: '10px 20px', background: '#10b981', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Subscribe Now →
          </Link>
        </div>
      )}

      {/* Rank hero card (only if competitors added and reviews gained) */}
      {showRankCard && (
        <RankHeroCard
          rank={myRank}
          reviews30={stats.reviews_last_30_days || 0}
          leaderboard={leaderboard}
          stats={stats}
          biz={biz}
        />
      )}

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
            ₹{fmtIN(Math.floor(gainedAnim) * 1000)}
          </p>
          <p className="d-sub">value of reviews earned</p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>based on ₹1,000 per review</span>
            <InfoTooltip text="Each Google review is worth approximately ₹1,000 in new customer value through increased trust and visibility" />
          </div>
        </HeroCard>
      </div>

      {/* ── Mini cards (2-col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }} className="d-mini-grid">
        <MiniCard
          title="Reviews Collected"
          value={stats?.drafts_sent ?? 0}
          sub="customers submitted reviews through your QR"
          icon="✨" iconBg="#dbeafe" tintColor="#3b82f6"
          delay={240}
        />
        <MiniCard
          title="Negative Reviews Blocked"
          value={stats?.negative_saved ?? 0}
          sub="went to you privately instead of Google"
          icon="🛡️" iconBg="#fee2e2" tintColor="#ef4444"
          delay={300}
          extra={stats?.negative_saved > 0 ? (
            <p style={{ fontSize: 11, color: '#ef4444', margin: '6px 0 0', fontWeight: 600 }}>These could have hurt your rating</p>
          ) : null}
        />
      </div>

      {/* ── Leaderboard + AI Recommendation (above charts) ── */}
      <LeaderboardSection
        stats={stats}
        competitors={competitors}
        leaderboard={leaderboard}
        onAdd={handleAddCompetitor}
        onDelete={handleDeleteCompetitor}
        loadingComps={loadingComps}
      />

      {/* ── Charts (3-col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="d-chart-grid">

        {/* Rating distribution */}
        <div className="d-card" style={{ padding: '20px 16px', animation: 'fadeUp 0.35s ease both', animationDelay: '400ms' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Your Star Ratings</h3>
          <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5 }}>{ratingChartSummary}</p>
          {noRatingData ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="star" fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[5,5,0,0]} isAnimationActive label={{ position: 'top', fill: '#6b7280', fontSize: 12 }}>
                  {ratingData.map((_, i) => (
                    <Cell key={i} fill={['#ef4444','#f97316','#facc15','#10b981','#fbbf24'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reviews over time */}
        <div className="d-card" style={{ padding: '20px 16px', animation: 'fadeUp 0.35s ease both', animationDelay: '460ms' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Your Review Activity</h3>
          <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5 }}>{activitySummary}</p>
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

        {/* 3rd card: competitor comparison text or google review count */}
        {showCompGrowthChart ? (
          <div className="d-card" style={{ padding: '20px 16px', animation: 'fadeUp 0.35s ease both', animationDelay: '520ms' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>You vs Competitors</h3>
            <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 16px', lineHeight: 1.5 }}>{compChartSummary}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leaderboard.map(entry => {
                const myGrowth = leaderboard.find(e => e.is_self)?.reviews_last_30_days ?? 0
                if (entry.is_self) {
                  return (
                    <div key="self" style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
                      You: +{entry.reviews_last_30_days ?? 0} this month
                    </div>
                  )
                }
                const theirGrowth = entry.reviews_last_30_days ?? 0
                const winning = myGrowth > theirGrowth
                return (
                  <div key={entry.id} style={{ fontSize: 13, color: winning ? '#059669' : '#d97706' }}>
                    {winning
                      ? `✓ Growing faster than ${entry.name}`
                      : `⚡ ${entry.name} gained +${theirGrowth} this month`}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
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
        )}
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
              {/* Actual review text */}
              {(r.customer_edited_text || r.review_text) && (
                <p style={{ color: '#374151', fontSize: 13, lineHeight: 1.55, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cleanText(r.customer_edited_text || r.review_text)}
                </p>
              )}
              {/* Private feedback */}
              {r.status === 'private' && r.private_feedback && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5, margin: '0 0 8px', fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cleanText(r.private_feedback)}
                </p>
              )}
              {/* Tags fallback — shown only when no review text and not private */}
              {!r.customer_edited_text && !r.review_text && r.status !== 'private' && r.private_feedback && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {cleanText(r.private_feedback).split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><StatusBadge status={r.status} /></div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
