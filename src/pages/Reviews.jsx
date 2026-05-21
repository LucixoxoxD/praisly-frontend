import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import api, { authService } from '../services/api'
import { stripMarkdown } from '../utils/helpers'

function cleanText(text) {
  if (!text) return ''
  let t = stripMarkdown(text)
  while ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim()
  }
  t = t.replace(/\*\*(.*?)\*\*/g, '$1')
  t = t.replace(/\*(.*?)\*/g, '$1')
  return t
}

function decodeEntities(str) {
  if (!str) return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// ─── Revenue helpers (mirrors Dashboard.jsx) ─────────────────────────────────

const REVENUE_PER_REVIEW = {
  healthcare_clinic: 2500,
  salon:             1500,
  gym:               2000,
  restaurant:        1000,
  coaching:         10000,
  ca_law:            7000,
  auto_repair:       2000,
  real_estate:       8000,
  other:             2000,
  dentist:           2500,
  ca_firm:           7000,
}

const BIZ_TYPE_KEY_MAP = {
  'healthcare / clinic':    'healthcare_clinic',
  'salon / beauty parlour': 'salon',
  'gym / fitness / yoga':   'gym',
  'restaurant / cafe':      'restaurant',
  'coaching / tuition':     'coaching',
  'ca / law firm':          'ca_law',
  'auto / repair service':  'auto_repair',
  'real estate':            'real_estate',
  'other':                  'other',
  'dentist':                'dentist',
  'ca_firm':                'ca_firm',
  'salon':                  'salon',
  'gym':                    'gym',
  'restaurant':             'restaurant',
  'coaching':               'coaching',
}

function getRevenueInfo(rawBizType) {
  const key = BIZ_TYPE_KEY_MAP[(rawBizType || '').toLowerCase().trim()] || 'other'
  return REVENUE_PER_REVIEW[key] ?? REVENUE_PER_REVIEW.other
}

function formatINR(amount) {
  return '₹' + Math.floor(amount || 0).toLocaleString('en-IN')
}

// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { key: '',         label: 'All' },
  { key: 'posted',   label: 'Posted' },
  { key: 'pending',  label: 'Pending' },
  { key: 'private',  label: 'Private' },
  { key: 'insights', label: '🛡️ Insights' },
]

const PAGE_CSS = `
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  .review-card {
    background: var(--surface);
    border-radius: 12px;
    padding: 16px 20px;
    border: 1px solid var(--line);
    margin-bottom: 10px;
    transition: box-shadow 0.2s ease;
  }
  .review-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

  /* ── Funnel metrics ── */
  .rv-funnel-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .rv-title { font-size: 24px; font-weight: 700; color: var(--ink); margin: 0 0 4px; font-family: 'Plus Jakarta Sans', system-ui; }
  .rv-subtitle { font-size: 13px; color: var(--ink-3); margin: 0; }
  .rv-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .rv-period-pill {
    font-size: 12.5px; color: var(--ink-3); padding: 6px 13px;
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 999px; font-weight: 500; white-space: nowrap;
  }
  .rv-export-btn {
    background: var(--primary); color: white; border: 0;
    padding: 7px 16px; border-radius: 9px; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; white-space: nowrap;
  }
  .rv-export-btn:hover { opacity: 0.88; }

  .rv-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .rv-card {
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 12px; padding: 16px; overflow: hidden;
  }
  .rv-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .rv-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: grid; place-items: center; font-size: 17px; flex-shrink: 0;
  }
  .rv-pct-badge { font-size: 11.5px; font-weight: 700; color: var(--win); }
  .rv-label { font-size: 13px; font-weight: 600; color: var(--ink); margin: 0 0 2px; }
  .rv-card-sub { font-size: 11px; color: var(--ink-4); margin: 0 0 10px; line-height: 1.4; }
  .rv-val { font-size: 28px; font-weight: 800; color: var(--ink); line-height: 1; margin-bottom: 14px; }
  .rv-bar-track { width: 100%; height: 4px; background: var(--surface-tint); border-radius: 2px; overflow: hidden; }
  .rv-bar-fill { height: 4px; border-radius: 2px; }

  .rv-top-row { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 20px; }
  .rv-bottom { display: grid; grid-template-columns: 1.8fr 1fr; gap: 14px; margin-bottom: 28px; }
  .rv-chart-card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 20px; }
  .rv-chart-title { font-size: 15px; font-weight: 700; color: var(--ink); margin: 0 0 3px; }
  .rv-chart-sub { font-size: 12px; color: var(--ink-3); margin: 0 0 18px; line-height: 1.5; }
  .rv-chart-legend { display: flex; gap: 14px; margin-bottom: 14px; }
  .rv-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .rv-legend-label { font-size: 12px; color: var(--ink-3); display: flex; align-items: center; gap: 5px; }
  .rv-chart-empty {
    height: 140px; display: flex; align-items: center; justify-content: center;
    background: var(--surface-tint); border-radius: 8px;
    font-size: 13px; color: var(--ink-3); text-align: center; padding: 16px; line-height: 1.5;
  }
  .rv-conv-card {
    border-radius: 12px; padding: 20px;
    background: linear-gradient(135deg, var(--primary), var(--primary-ink));
    color: white;
  }
  .rv-conv-title { font-size: 14px; font-weight: 700; margin: 0 0 6px; }
  .rv-conv-pct { font-size: 40px; font-weight: 800; line-height: 1; margin: 0 0 8px; }
  .rv-conv-sub { font-size: 12px; opacity: 0.8; margin: 0 0 22px; line-height: 1.55; }
  .rv-conv-row { margin-bottom: 14px; }
  .rv-conv-row:last-child { margin-bottom: 0; }
  .rv-conv-bar-label { font-size: 11.5px; font-weight: 600; display: flex; justify-content: space-between; margin-bottom: 5px; }
  .rv-conv-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.15); overflow: hidden; }
  .rv-conv-fill { height: 5px; border-radius: 3px; }

  /* ── Divider ── */
  .rv-divider { height: 1px; background: var(--line); margin-bottom: 24px; }

  /* ── Insights panel ── */
  .ins-stat-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; margin-bottom: 20px;
  }
  .ins-stat-card {
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 14px; padding: 20px 22px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .ins-theme-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .ins-theme-card {
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 12px; padding: 18px 20px;
    transition: box-shadow 0.2s;
  }
  .ins-theme-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

  @media (max-width: 768px) {
    .rv-top-row { grid-template-columns: 1fr; }
    .rv-cards { grid-template-columns: 1fr 1fr; }
    .rv-bottom { grid-template-columns: 1fr; }
    .rv-header-right { flex-wrap: wrap; }
    .ins-stat-grid { grid-template-columns: 1fr; }
    .ins-theme-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .rv-val { font-size: 24px; }
    .rv-conv-pct { font-size: 32px; }
  }
`

function ratingBorder(rating) {
  if (rating >= 4) return 'var(--win)'
  if (rating === 3) return '#f59e0b'
  return '#ef4444'
}

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: 15 }}>★</span>
      ))}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    posted:  { bg: 'var(--win-soft)',     color: 'var(--win)',         label: 'Posted on Google ✓' },
    pending: { bg: 'var(--primary-soft)', color: 'var(--primary-ink)', label: 'Pending' },
    private: { bg: 'var(--danger-soft)',  color: 'var(--danger)',      label: 'Private feedback' },
  }
  const s = map[status] || map.private
  return (
    <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ background: '#e2e8f0', height: 14, width: 120, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        <div style={{ background: '#e2e8f0', height: 12, width: 60, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      </div>
      <div style={{ background: '#e2e8f0', height: 13, width: 80, borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: '#e2e8f0', height: 12, width: '70%', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
      <div style={{ background: '#e2e8f0', height: 12, width: '50%', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
    </div>
  )
}

function Skel({ style }) {
  return (
    <div style={{ background: 'var(--surface-tint)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', ...style }} />
  )
}

function InsightsSkeleton() {
  return (
    <div>
      {/* 3 stat cards */}
      <div className="ins-stat-grid">
        {[0, 1, 2].map(i => (
          <div key={i} className="ins-stat-card">
            <Skel style={{ height: 32, width: 32, borderRadius: 9 }} />
            <Skel style={{ height: 12, width: 120, marginTop: 8 }} />
            <Skel style={{ height: 36, width: 80, marginTop: 4 }} />
            <Skel style={{ height: 11, width: 140, marginTop: 4 }} />
          </div>
        ))}
      </div>
      {/* AI summary */}
      <div style={{ background: 'var(--surface-tint)', border: '1px solid var(--line)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <Skel style={{ height: 12, width: 180, marginBottom: 12 }} />
        <Skel style={{ height: 14, width: '90%', marginBottom: 8 }} />
        <Skel style={{ height: 14, width: '75%', marginBottom: 8 }} />
        <Skel style={{ height: 14, width: '60%' }} />
      </div>
      {/* 2 theme cards */}
      <div className="ins-theme-grid">
        {[0, 1].map(i => (
          <div key={i} className="ins-theme-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <Skel style={{ height: 16, width: 100 }} />
              <Skel style={{ height: 22, width: 80, borderRadius: 20 }} />
            </div>
            <Skel style={{ height: 11, width: 70, marginBottom: 12 }} />
            <Skel style={{ height: 13, width: '95%', marginBottom: 6 }} />
            <Skel style={{ height: 13, width: '80%', marginBottom: 6 }} />
            <Skel style={{ height: 13, width: '65%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsPanel({ data, biz }) {
  if (!data) return null

  const perReview = getRevenueInfo(biz?.business_type)
  const totalBlocked = data.total_blocked || 0
  const blockedThisMonth = data.blocked_this_month || 0
  const revenueProtected = totalBlocked * perReview
  const currentRating = data.current_rating ? Number(data.current_rating).toFixed(1) : null
  const ratingWithout = data.rating_without_protection ? Number(data.rating_without_protection).toFixed(1) : null
  const ratingDiff = currentRating && ratingWithout
    ? (Number(currentRating) - Number(ratingWithout)).toFixed(1)
    : null

  // ── Empty state ────────────────────────────────────────────────
  if (totalBlocked === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '56px 24px',
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 16,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px' }}>
          No negative reviews blocked yet
        </p>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, margin: 0, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          When customers give 1–3 stars, their feedback comes to you privately instead of going to Google.
          Praisly will analyze the patterns and suggest improvements.
        </p>
      </div>
    )
  }

  // ── Trend label ───────────────────────────────────────────────
  function TrendBadge({ trend }) {
    const map = {
      increasing: { label: '↑ Increasing', color: 'var(--danger)' },
      decreasing: { label: '↓ Decreasing', color: 'var(--win)' },
      stable:     { label: '→ Stable',     color: 'var(--ink-4)' },
    }
    const t = map[trend] || map.stable
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: t.color }}>{t.label}</span>
    )
  }

  return (
    <div>

      {/* ── 3 protection stat cards ── */}
      <div className="ins-stat-grid">

        {/* Card 1 — Blocked */}
        <div className="ins-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--danger-soft)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
              🛡️
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 10 }}>
            Negative Reviews Blocked
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--danger)', lineHeight: 1.1 }}>
            {totalBlocked}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
            {blockedThisMonth} this month
          </div>
        </div>

        {/* Card 2 — Rating protected */}
        <div className="ins-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold-soft)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
              ⭐
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 10 }}>
            Your Rating Protected
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>
            {currentRating ? `${currentRating}★` : '—'}
          </div>
          {ratingWithout && (
            <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              <span style={{ color: 'var(--danger)' }}>Without Praisly: {ratingWithout}★</span>
              {ratingDiff && Number(ratingDiff) > 0 && (
                <span style={{ color: 'var(--win)', marginLeft: 6, fontWeight: 700 }}>
                  Saved {ratingDiff}★
                </span>
              )}
            </div>
          )}
          {!ratingWithout && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
              Add more context by sharing your QR
            </div>
          )}
        </div>

        {/* Card 3 — Revenue protected */}
        <div className="ins-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--win-soft)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
              ₹
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 10 }}>
            Revenue Protected
          </div>
          <div style={{ fontSize: revenueProtected >= 100000 ? 28 : 34, fontWeight: 800, color: 'var(--win)', lineHeight: 1.1 }}>
            {formatINR(revenueProtected)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
            Bad reviews cost ~{formatINR(perReview)} each
          </div>
        </div>

      </div>

      {/* ── AI summary banner ── */}
      {data.ai_summary && (
        <div style={{
          background: 'var(--surface-tint)', border: '1px solid var(--line)',
          borderRadius: 14, padding: '18px 22px',
          display: 'flex', alignItems: 'flex-start', gap: 16,
          marginBottom: 20,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #E8B43A, #C9971F)',
            display: 'grid', placeItems: 'center', fontSize: 20,
          }}>
            💡
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary-ink)', fontWeight: 700, marginBottom: 6 }}>
              🧠 PRAISLY AI · FEEDBACK ANALYSIS
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>
              {data.ai_summary}
            </p>
          </div>
        </div>
      )}

      {/* ── Theme cards ── */}
      {data.themes?.length > 0 && (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
            Complaint Themes
          </div>
          <div className="ins-theme-grid">
            {data.themes.map((theme, idx) => (
              <div key={idx} className="ins-theme-card">

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                    {theme.tag}
                  </span>
                  <span style={{
                    background: 'var(--danger-soft)', color: 'var(--danger)',
                    borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {theme.count} complaint{theme.count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Trend */}
                <div style={{ marginBottom: 10 }}>
                  <TrendBadge trend={theme.trend} />
                </div>

                {/* AI insight */}
                {theme.ai_insight && (
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 12px' }}>
                    {theme.ai_insight}
                  </p>
                )}

                {/* Recent feedback quotes */}
                {theme.recent_feedback?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Recent feedback
                    </div>
                    {theme.recent_feedback.map((fb, fi) => (
                      <div
                        key={fi}
                        style={{
                          background: 'var(--bg)',
                          borderLeft: '3px solid var(--line-2)',
                          padding: '7px 12px',
                          fontSize: 12,
                          color: 'var(--ink-3)',
                          fontStyle: 'italic',
                          marginTop: 6,
                          borderRadius: '0 8px 8px 0',
                          lineHeight: 1.5,
                        }}
                      >
                        "{decodeEntities(cleanText(fb))}"
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

function FunnelCard({ icon, iconBg, label, subtitle, value, barColor, barPct, isEmpty }) {
  return (
    <div className="rv-card" style={isEmpty ? { border: '1.5px dashed var(--line)' } : {}}>
      <div className="rv-card-top">
        <div className="rv-icon" style={{ background: iconBg, opacity: isEmpty ? 0.5 : 1 }}>{icon}</div>
        {barPct > 0 && !isEmpty && <span className="rv-pct-badge">+{barPct.toFixed(0)}%</span>}
      </div>
      <div className="rv-label">{label}</div>
      <div className="rv-card-sub">{subtitle}</div>
      <div className="rv-val">{value.toLocaleString('en-IN')}</div>
      <div className="rv-bar-track">
        <div className="rv-bar-fill" style={{ width: `${Math.min(barPct, 100)}%`, background: barColor }} />
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', fontSize: 12 }}>
      <p style={{ margin: '0 0 4px', color: '#64748b', fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.fill, fontWeight: 700 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Reviews() {
  const [tab, setTab]   = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ reviews: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)

  const [stats, setStats]           = useState(null)
  const [allReviews, setAllReviews] = useState([])

  const [insights, setInsights]             = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsFetched, setInsightsFetched] = useState(false)
  const [error, setError] = useState(null)

  const biz = authService.getBusiness()

  // Fetch stats and all reviews independently so one failure doesn't block the other
  useEffect(() => {
    api.get('/api/reviews/stats')
      .then(r => {
        setError(null)
        setStats(r.data)
      })
      .catch(() => setError('Failed to load data. Please try refreshing the page.'))

    api.get('/api/reviews/list?limit=50&page=1')
      .then(r => {
        const reviews = r.data?.reviews || r.data || []
        setAllReviews(reviews)
      })
      .catch(() => setError('Failed to load data. Please try refreshing the page.'))
  }, [])

  // Fetch paginated list for the review list section
  useEffect(() => {
    if (tab === 'insights') return
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 10 })
    if (tab) params.set('status', tab)
    api.get(`/api/reviews/list?${params}`)
      .then((r) => { setError(null); setData(r.data) })
      .catch(() => setError('Failed to load data. Please try refreshing the page.'))
      .finally(() => setLoading(false))
  }, [tab, page])

  function changeTab(t) {
    setTab(t)
    setPage(1)
    if (t === 'insights' && !insightsFetched) {
      setInsightsLoading(true)
      api.get('/api/reviews/feedback-insights')
        .then(r => {
          setInsights(r.data)
          setInsightsFetched(true)
        })
        .catch(() => setInsights(null))
        .finally(() => setInsightsLoading(false))
    }
  }

  // ── Funnel metrics ──────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const pageViews = data.total || allReviews.length || 0
    const dist = stats?.rating_distribution || {}
    const highRatings = (stats && Object.keys(dist).length > 0)
      ? (Number(dist['4'] || 0) + Number(dist['5'] || 0))
      : allReviews.filter(r => Number(r.rating) >= 4).length

    const aiDrafts = typeof stats?.drafts_sent === 'number' && stats.drafts_sent > 0
      ? stats.drafts_sent
      : allReviews.filter(r => r.is_positive === true).length

    const googleClicks = allReviews.length > 0
      ? allReviews.filter(r => r.status === 'posted' || r.is_posted_to_google === true).length
      : (stats?.google_reviews_gained || 0)

    const convPct     = pageViews > 0 ? (googleClicks / pageViews * 100) : 0
    const viewsToHigh = pageViews > 0 ? (highRatings / pageViews * 100) : 0
    const highToClick = highRatings > 0 ? (googleClicks / highRatings * 100) : 0

    // stats.negative_saved is authoritative (all reviews, not capped at 50)
    // fallback: count reviews where status === 'private' (list endpoint never returns is_positive)
    const negativeBlocked = typeof stats?.negative_saved === 'number' && stats.negative_saved > 0
      ? stats.negative_saved
      : allReviews.filter(r => r.status === 'private').length
    return { pageViews, highRatings, aiDrafts, googleClicks, convPct, viewsToHigh, highToClick, negativeBlocked }
  }, [stats, allReviews, data.total])

  const chartData = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key     = d.toISOString().slice(0, 10)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      days.push({ day: dayName, date: key, views: 0, clicks: 0 })
    }
    if (stats?.reviews_over_time) {
      stats.reviews_over_time.forEach(entry => {
        const idx = days.findIndex(d => d.date === entry.date)
        if (idx >= 0) days[idx].views = entry.count
      })
    }
    allReviews.filter(r => r.status === 'posted').forEach(r => {
      if (!r.created_at) return
      const dateStr = r.created_at.slice(0, 10)
      const idx = days.findIndex(d => d.date === dateStr)
      if (idx >= 0) days[idx].clicks++
    })
    return days
  }, [stats, allReviews])

  const hasChartData = chartData.some(d => d.views > 0 || d.clicks > 0)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fade-up">
      <style>{PAGE_CSS}</style>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
          <button onClick={() => { setError(null); window.location.reload() }} style={{ marginLeft: '12px', textDecoration: 'underline', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Funnel header ── */}
      <div className="rv-funnel-header">
        <div>
          <h1 className="rv-title">Reviews</h1>
          <p className="rv-subtitle">Tracking your customer journey and review velocity.</p>
        </div>
        <div className="rv-header-right">
          <span className="rv-period-pill">Last 30 days</span>
        </div>
      </div>

      {/* ── Row 1: Negative Reviews Blocked + Global Conversion ── */}
      <div className="rv-top-row">

        {/* Blocked banner */}
        <div style={{
          background: '#FEF2F2',
          borderRadius: 12,
          padding: '18px 22px',
          borderLeft: '4px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 30, lineHeight: 1 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#DC2626', lineHeight: 1.1 }}>
                {metrics.negativeBlocked}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginTop: 2 }}>
                Negative Reviews Blocked
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, maxWidth: 340, lineHeight: 1.5 }}>
                {metrics.negativeBlocked > 0
                  ? 'These would have been 1–2 star Google reviews — Praisly caught them first'
                  : 'When unhappy customers use your QR, their feedback comes to you privately — never to Google'}
              </div>
            </div>
          </div>
          {metrics.negativeBlocked > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Estimated damage prevented</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#DC2626' }}>
                {formatINR(metrics.negativeBlocked * 5000)}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                Based on avg. revenue impact of a negative Google review
              </div>
            </div>
          )}
        </div>

        {/* Global conversion card */}
        <div className="rv-conv-card">
          <div className="rv-conv-title">Global conversion</div>
          <div className="rv-conv-pct">{metrics.convPct.toFixed(1)}%</div>
          <div className="rv-conv-sub">Share of visits where customers tapped through to your Google review flow.</div>
          <div className="rv-conv-row">
            <div className="rv-conv-bar-label">
              <span>Views → high rating</span>
              <span>{metrics.viewsToHigh.toFixed(0)}%</span>
            </div>
            <div className="rv-conv-track">
              <div className="rv-conv-fill" style={{ width: `${Math.min(metrics.viewsToHigh, 100)}%`, background: 'white' }} />
            </div>
          </div>
          <div className="rv-conv-row">
            <div className="rv-conv-bar-label">
              <span>High rating → Google click</span>
              <span>{metrics.highToClick.toFixed(0)}%</span>
            </div>
            <div className="rv-conv-track">
              <div className="rv-conv-fill" style={{ width: `${Math.min(metrics.highToClick, 100)}%`, background: '#F5B945' }} />
            </div>
          </div>
        </div>

      </div>

      {/* ── 4 funnel stat cards ── */}
      {(() => {
        const allMetricsZero = metrics.pageViews === 0 && metrics.highRatings === 0 && metrics.aiDrafts === 0 && metrics.googleClicks === 0
        return (
          <div className="rv-cards">
            <FunnelCard
              icon="🔗"
              iconBg="#EFF6FF"
              label="Page views"
              subtitle="Customer visits to your review page"
              value={metrics.pageViews}
              barColor="#3B82F6"
              barPct={metrics.pageViews > 0 ? 100 : 0}
              isEmpty={allMetricsZero}
            />
            <FunnelCard
              icon="⭐"
              iconBg="#FFFBEB"
              label="High ratings (4–5★)"
              subtitle="From in-flow sentiment taps"
              value={metrics.highRatings}
              barColor="#D89020"
              barPct={metrics.viewsToHigh}
              isEmpty={allMetricsZero}
            />
            <FunnelCard
              icon="✨"
              iconBg="#F5F3FF"
              label="AI drafts used"
              subtitle="Customers who used a generated draft"
              value={metrics.aiDrafts}
              barColor="#8B5CF6"
              barPct={metrics.pageViews > 0 ? (metrics.aiDrafts / metrics.pageViews * 100) : 0}
              isEmpty={allMetricsZero}
            />
            <FunnelCard
              icon="🔍"
              iconBg="#F0FDF4"
              label="Google review clicks"
              subtitle="Taps on your Google review button"
              value={metrics.googleClicks}
              barColor="#1F8A5B"
              barPct={metrics.viewsToHigh > 0 ? metrics.highToClick : 0}
              isEmpty={allMetricsZero}
            />
          </div>
        )
      })()}

      {/* ── Review growth chart — full width ── */}
      <div className="rv-chart-card" style={{ marginBottom: 28 }}>
        <div className="rv-chart-title">Review growth</div>
        <div className="rv-chart-sub">Daily page views vs. Google review taps (last 7 days)</div>
        <div className="rv-chart-legend">
          <span className="rv-legend-label"><span className="rv-legend-dot" style={{ background: '#3B82F6' }} />Page views</span>
          <span className="rv-legend-label"><span className="rv-legend-dot" style={{ background: '#D89020' }} />Google clicks</span>
        </div>
        {hasChartData ? (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
              <XAxis dataKey="day" fontSize={11} tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="views" name="Page views" fill="#3B82F6" radius={[3,3,0,0]} maxBarSize={24} />
              <Bar dataKey="clicks" name="Google clicks" fill="#D89020" radius={[3,3,0,0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="rv-chart-empty">
            Not enough data yet — reviews will appear here as customers use your QR
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="rv-divider" />

      {/* ── Review list header (hidden on insights tab) ── */}
      {tab !== 'insights' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            All Reviews
          </h2>
          <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>{data.total} total</span>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface-tint)', borderRadius: 10, padding: 4, width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            style={{
              padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: tab === t.key ? 'var(--primary-soft)' : 'transparent',
              color: tab === t.key ? 'var(--primary-ink)' : 'var(--ink-3)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Insights panel ── */}
      {tab === 'insights' && (
        insightsLoading
          ? <InsightsSkeleton />
          : <InsightsPanel data={insights} biz={biz} />
      )}

      {/* ── Review list ── */}
      {tab !== 'insights' && (
        loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : data.reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🌟</p>
            <p style={{ color: '#374151', fontWeight: 600, fontSize: 15, margin: 0 }}>No reviews yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>
              {tab ? `No ${tab} reviews yet` : 'Share your QR code to start collecting reviews'}
            </p>
            {!tab && (
              <Link to="/qr" style={{ display: 'inline-block', padding: '9px 20px', background: 'var(--primary)', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                View QR Code →
              </Link>
            )}
          </div>
        ) : (
          data.reviews.map((r) => (
            <div key={r.id} className="review-card" style={{ borderLeft: `4px solid ${ratingBorder(r.rating)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>{r.customer_name || 'Anonymous'}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <div style={{ marginBottom: 8 }}><Stars rating={r.rating} /></div>
              {(r.review_text || r.customer_edited_text) && (
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cleanText(r.review_text || r.customer_edited_text)}
                </p>
              )}
              {r.status === 'private' && r.private_feedback && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: '0 0 6px', fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  Private feedback: {cleanText(r.private_feedback)}
                </p>
              )}
              {r.status !== 'private' && r.private_feedback && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {decodeEntities(cleanText(r.private_feedback)).split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: 20, background: 'var(--surface-tint)', color: 'var(--ink-3)', fontSize: 11, fontWeight: 500 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))
        )
      )}

      {/* ── Pagination (hidden on insights tab) ── */}
      {tab !== 'insights' && data.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
          <PaginationBtn label="← Prev" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <PaginationBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
          ))}
          <PaginationBtn label="Next →" disabled={page === data.pages} onClick={() => setPage((p) => Math.min(data.pages, p + 1))} />
        </div>
      )}
    </div>
  )
}

function PaginationBtn({ label, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 13px', borderRadius: 8,
        border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? 'white' : disabled ? 'var(--ink-4)' : 'var(--ink-2)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}
