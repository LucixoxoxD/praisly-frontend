import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area,
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

const PAGE_CSS = `
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    flex: 1 1 180px;
    min-width: 160px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    opacity: 0;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.09);
  }
  .review-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #f1f5f9;
    margin-bottom: 10px;
    transition: box-shadow 0.2s ease;
  }
  .review-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
`


function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0)
  const numTarget = typeof target === 'number' ? target : 0

  useEffect(() => {
    if (numTarget === 0) { setVal(0); return }
    let current = 0
    const steps = duration / 16
    const step = numTarget / steps
    const timer = setInterval(() => {
      current += step
      if (current >= numTarget) {
        setVal(numTarget)
        clearInterval(timer)
      } else {
        setVal(current)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [numTarget, duration])

  return val
}

function TrendBadge({ dir, pct }) {
  const up = dir === 'up'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: up ? '#d1fae5' : '#fee2e2',
        color: up ? '#065f46' : '#991b1b',
        marginTop: 6,
      }}
    >
      {up ? '↑' : '↓'} {pct}% vs last month
    </span>
  )
}

function StatCard({ title, numValue, format = 'int', sub, icon, iconBg, tintColor, trend, delay = 0 }) {
  const count = useCountUp(numValue ?? 0, 1000)

  let displayValue
  if (numValue == null) {
    displayValue = '—'
  } else if (format === 'rating') {
    displayValue = `${count.toFixed(1)}★`
  } else if (format === 'percent') {
    displayValue = `${Math.floor(count)}%`
  } else {
    displayValue = Math.floor(count)
  }

  return (
    <div
      className="stat-card fade-up"
      style={{
        background: tintColor ? `color-mix(in srgb, ${tintColor} 5%, white)` : 'white',
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>{title}</p>
          <p
            style={{
              color: '#0f172a',
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1,
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', system-ui",
            }}
          >
            {displayValue}
          </p>
          {sub && <p style={{ color: '#94a3b8', fontSize: 12, margin: '5px 0 0' }}>{sub}</p>}
          {trend && <TrendBadge {...trend} />}
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function Skel({ style }) {
  return (
    <div
      style={{
        background: '#e2e8f0',
        borderRadius: 8,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

function StatusBadge({ status }) {
  const map = {
    posted:  { bg: '#d1fae5', color: '#065f46', label: 'Posted' },
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    private: { bg: '#f1f5f9', color: '#475569', label: 'Private' },
  }
  const s = map[status] || map.private
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

function ratingBorder(rating) {
  if (rating >= 4) return '#10b981'
  if (rating === 3) return '#f59e0b'
  return '#ef4444'
}

function RatingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', fontSize: 13,
    }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a' }}>{payload[0].value} reviews</p>
    </div>
  )
}

function TimeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', fontSize: 13,
    }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a' }}>{payload[0].value} reviews</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div
      style={{
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 13,
        background: '#f8fafc',
        borderRadius: 8,
      }}
    >
      No data yet
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [bizName, setBizName] = useState(authService.getBusiness()?.business_name || '')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([
      api.get('/api/reviews/stats'),
      api.get('/api/reviews/list?limit=5'),
      api.get('/api/auth/me'),
    ])
      .then(([s, r, me]) => {
        setStats(s.data)
        setReviews(r.data.reviews || [])
        const name = me.data?.business?.business_name
        if (name) {
          setBizName(name)
          authService.setBusiness(me.data.business)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const ratingData = stats
    ? [1, 2, 3, 4, 5].map((n) => ({ star: `${n}★`, count: stats.rating_distribution?.[String(n)] || 0 }))
    : []

  const timeData = (stats?.reviews_over_time || []).map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }))

  const noRatingData = ratingData.every((d) => d.count === 0)
  const noTimeData   = timeData.every((d) => d.count === 0)

  if (loading) {
    return (
      <div>
        <style>{PAGE_CSS}</style>
        <Skel style={{ height: 34, width: 260, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ flex: '1 1 180px', minWidth: 160, background: 'white', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <Skel style={{ height: 13, width: 100, marginBottom: 10 }} />
              <Skel style={{ height: 30, width: 70, marginBottom: 8 }} />
              <Skel style={{ height: 11, width: 80 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Skel style={{ height: 240, borderRadius: 12 }} />
          <Skel style={{ height: 240, borderRadius: 12 }} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Skel style={{ height: 13, width: 60 }} />
              <Skel style={{ height: 13, width: 100 }} />
            </div>
            <Skel style={{ height: 12, width: '60%' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{PAGE_CSS}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 24,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 24,
        }}
      >
        {greeting}, {bizName || 'there'} 👋
      </h1>

      {/* Stat cards — stagger delay 0ms */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard
          title="Total Reviews"
          numValue={stats?.total_reviews ?? 0}
          icon="📝" iconBg="#dbeafe" tintColor="#3b82f6"
          delay={0}
        />
        <StatCard
          title="Average Rating"
          numValue={stats?.average_rating ?? 0}
          format="rating" sub="out of 5"
          icon="⭐" iconBg="#fef3c7" tintColor="#f59e0b"
          delay={50}
        />
        <StatCard
          title="Conversion Rate"
          numValue={stats?.conversion_rate ?? 0}
          format="percent" sub="reviews posted"
          icon="📈" iconBg="#d1fae5" tintColor="#10b981"
          delay={100}
        />
        <StatCard
          title="This Month"
          numValue={stats?.monthly_reviews ?? 0}
          sub="new reviews"
          icon="📅" iconBg="#ede9fe" tintColor="#8b5cf6"
          delay={150}
        />
      </div>

      {/* Charts — stagger delay 100ms */}
      <div
        className="fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
          animationDelay: '100ms',
        }}
      >
        {/* Rating distribution */}
        <div style={{ background: 'white', borderRadius: 12, padding: '20px 16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>
            Rating Distribution
          </h3>
          {noRatingData ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="star" fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<RatingTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Reviews" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reviews over time */}
        <div style={{ background: 'white', borderRadius: 12, padding: '20px 16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>
            Reviews (Last 30 Days)
          </h3>
          {noTimeData ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<TimeTooltip />} cursor={{ stroke: '#e2e8f0' }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  fill="url(#areaGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                  name="Reviews"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent reviews — stagger delay 200ms */}
      <div
        className="fade-up"
        style={{ animationDelay: '200ms' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Recent Reviews</h3>
          <Link to="/reviews" style={{ fontSize: 13, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
            View all →
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 36, marginBottom: 12 }}>🌟</p>
            <p style={{ color: '#374151', fontSize: 15, fontWeight: 600, margin: 0 }}>No reviews yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>
              Share your QR code to start collecting reviews
            </p>
            <Link
              to="/qr"
              style={{
                display: 'inline-block',
                padding: '9px 20px',
                background: '#10b981',
                color: 'white',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              View QR Code →
            </Link>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="review-card"
              style={{ borderLeft: `4px solid ${ratingBorder(r.rating)}` }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
                  {r.customer_name || 'Anonymous'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : ''}
                </span>
              </div>

              <div style={{ marginBottom: 6 }}>
                <Stars rating={r.rating} />
              </div>

              {(r.review_text || r.private_feedback) && (
                <p
                  style={{
                    color: '#64748b',
                    fontSize: 13,
                    lineHeight: 1.5,
                    margin: '0 0 8px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {cleanText(r.review_text || r.private_feedback)}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
