import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
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

const TABS = [
  { key: '',        label: 'All' },
  { key: 'posted',  label: 'Posted' },
  { key: 'pending', label: 'Pending' },
  { key: 'private', label: 'Private' },
]

const PAGE_CSS = `
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  .review-card {
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    border: 1px solid #f1f5f9;
    margin-bottom: 10px;
    transition: box-shadow 0.2s ease;
  }
  .review-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
`

function ratingBorder(rating) {
  if (rating >= 4) return '#10b981'
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
    posted:  { bg: '#d1fae5', color: '#065f46', label: 'Posted' },
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    private: { bg: '#f1f5f9', color: '#475569', label: 'Private' },
  }
  const s = map[status] || map.private
  return (
    <span
      style={{
        padding: '3px 12px',
        borderRadius: 20,
        fontSize: 12,
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

export default function Reviews() {
  const [tab, setTab] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ reviews: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 10 })
    if (tab) params.set('status', tab)
    api
      .get(`/api/reviews/list?${params}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tab, page])

  function changeTab(t) {
    setTab(t)
    setPage(1)
  }

  return (
    <div className="fade-up">
      <style>{PAGE_CSS}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui",
            fontSize: 22,
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
          }}
        >
          All Reviews
        </h1>
        <span style={{ color: '#64748b', fontSize: 13 }}>{data.total} total</span>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          background: '#f1f5f9',
          borderRadius: 10,
          padding: 4,
          width: 'fit-content',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            style={{
              padding: '7px 16px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? '#0f172a' : '#64748b',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      {loading ? (
        [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
      ) : data.reviews.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'white',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ fontSize: 36, marginBottom: 12 }}>🌟</p>
          <p style={{ color: '#374151', fontWeight: 600, fontSize: 15, margin: 0 }}>No reviews yet</p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>
            {tab ? `No ${tab} reviews yet` : 'Share your QR code to start collecting reviews'}
          </p>
          {!tab && (
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
          )}
        </div>
      ) : (
        data.reviews.map((r) => (
          <div
            key={r.id}
            className="review-card"
            style={{ borderLeft: `4px solid ${ratingBorder(r.rating)}` }}
          >
            {/* Top row: name + date */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
                gap: 8,
              }}
            >
              <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>
                {r.customer_name || 'Anonymous'}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                {r.created_at
                  ? new Date(r.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : ''}
              </span>
            </div>

            {/* Stars */}
            <div style={{ marginBottom: 8 }}>
              <Stars rating={r.rating} />
            </div>

            {/* Review text (customer_edited_text from DB) */}
            {(r.review_text || r.customer_edited_text) && (
              <p
                style={{
                  color: '#374151',
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: '0 0 6px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {cleanText(r.review_text || r.customer_edited_text)}
              </p>
            )}

            {/* Private feedback */}
            {r.status === 'private' && r.private_feedback && (
              <p
                style={{
                  color: '#64748b',
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: '0 0 6px',
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                Private feedback: {cleanText(r.private_feedback)}
              </p>
            )}

            {/* Tags for positive reviews */}
            {r.status !== 'private' && r.private_feedback && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {cleanText(r.private_feedback)
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            {/* Status badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
          <PaginationBtn
            label="← Prev"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <PaginationBtn
              key={p}
              label={p}
              active={p === page}
              onClick={() => setPage(p)}
            />
          ))}
          <PaginationBtn
            label="Next →"
            disabled={page === data.pages}
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
          />
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
        padding: '7px 13px',
        borderRadius: 8,
        border: `1px solid ${active ? '#10b981' : '#e2e8f0'}`,
        background: active ? '#10b981' : 'white',
        color: active ? 'white' : disabled ? '#94a3b8' : '#374151',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}
