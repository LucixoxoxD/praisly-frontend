import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import api, { authService } from '../services/api'

const PAGE_STYLE = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
`

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

function StatCard({ title, value, sub, icon, iconBg }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        padding: '20px',
        border: '1px solid #e2e8f0',
        flex: '1 1 180px',
        minWidth: 160,
        animation: 'fadeUp 0.25s ease',
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
            {value}
          </p>
          {sub && <p style={{ color: '#94a3b8', fontSize: 12, margin: '5px 0 0' }}>{sub}</p>}
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
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: 13 }}>
          ★
        </span>
      ))}
    </span>
  )
}

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  cursor: { fill: '#f8fafc' },
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const biz = authService.getBusiness()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([
      api.get('/api/reviews/stats'),
      api.get('/api/reviews/list?limit=5'),
    ])
      .then(([s, r]) => {
        setStats(s.data)
        setReviews(r.data.reviews || [])
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
        <style>{PAGE_STYLE}</style>
        <Skel style={{ height: 34, width: 260, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skel key={i} style={{ height: 100, flex: '1 1 180px', borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Skel style={{ height: 240, borderRadius: 12 }} />
          <Skel style={{ height: 240, borderRadius: 12 }} />
        </div>
        <Skel style={{ height: 200, borderRadius: 12 }} />
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <style>{PAGE_STYLE}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 24,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 24,
        }}
      >
        {greeting}, {biz?.business_name || 'there'} 👋
      </h1>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard
          title="Total Reviews"
          value={stats?.total_reviews ?? 0}
          icon="📝"
          iconBg="#dbeafe"
        />
        <StatCard
          title="Average Rating"
          value={stats?.average_rating ? `${stats.average_rating}★` : '—'}
          sub="out of 5"
          icon="⭐"
          iconBg="#fef3c7"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.conversion_rate ?? 0}%`}
          sub="reviews posted"
          icon="📈"
          iconBg="#d1fae5"
        />
        <StatCard
          title="This Month"
          value={stats?.monthly_reviews ?? 0}
          sub="new reviews"
          icon="📅"
          iconBg="#ede9fe"
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Rating distribution */}
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: '20px 16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>
            Rating Distribution
          </h3>
          {noRatingData ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="star" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reviews over time */}
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: '20px 16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>
            Reviews (Last 30 Days)
          </h3>
          {noTimeData ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#64748b' }} interval="preserveStartEnd" />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  fill="#d1fae5"
                  strokeWidth={2}
                  name="Reviews"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent reviews */}
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Recent Reviews</h3>
          <Link
            to="/reviews"
            style={{ fontSize: 13, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}
          >
            View all →
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>⭐</p>
            <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500, margin: 0 }}>No reviews yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              Share your QR code to start collecting!
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <Stars rating={r.rating} />
                  <span style={{ color: '#374151', fontSize: 14, fontWeight: 500 }}>
                    {r.customer_name || 'Anonymous'}
                  </span>
                </div>
                {(r.review_text || r.private_feedback) && (
                  <p
                    style={{
                      color: '#64748b',
                      fontSize: 13,
                      margin: 0,
                      maxWidth: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.review_text || r.private_feedback}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <StatusBadge status={r.status} />
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
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
