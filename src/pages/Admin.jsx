import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { authService } from '../services/api'

const CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes skelpulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }

  .adm-page {
    min-height: 100vh; background: var(--bg, #faf9f7);
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }

  .adm-topbar {
    background: var(--surface, #fff); border-bottom: 1px solid var(--line, #e8e4de);
    padding: 0 24px; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 30;
  }
  .adm-topbar-left { display: flex; align-items: center; gap: 12px; }
  .adm-topbar h1 { font-size: 18px; font-weight: 800; color: var(--ink, #1A1610); margin: 0; }
  .adm-topbar-badge {
    font-size: 10px; font-weight: 700; letter-spacing: .08em;
    background: #ef4444; color: white; padding: 3px 8px; border-radius: 999px;
  }
  .adm-back {
    background: none; border: 1px solid var(--line, #e8e4de); color: var(--ink-3, #6b5e4f);
    padding: 6px 14px; border-radius: 8px; font-size: 13px; cursor: pointer;
    font-family: inherit; font-weight: 600;
  }
  .adm-back:hover { background: var(--surface-tint, #f5f3ef); }

  .adm-body { max-width: 1200px; margin: 0 auto; padding: 24px; }

  .adm-stats {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px; margin-bottom: 24px;
  }
  .adm-stat {
    background: var(--surface, #fff); border: 1px solid var(--line, #e8e4de);
    border-radius: 14px; padding: 18px 20px;
    animation: fadeUp 0.3s ease both;
  }
  .adm-stat-label { font-size: 12px; color: var(--ink-3, #6b5e4f); font-weight: 600; margin-bottom: 6px; }
  .adm-stat-val { font-size: 32px; font-weight: 800; color: var(--ink, #1A1610); line-height: 1; }

  .adm-search-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .adm-search {
    flex: 1; min-width: 200px; padding: 10px 14px;
    border: 1.5px solid var(--line, #e8e4de); border-radius: 10px;
    font-size: 14px; font-family: inherit; outline: none;
    background: var(--surface, #fff); color: var(--ink, #1A1610);
  }
  .adm-search:focus { border-color: var(--primary, #D89020); }
  .adm-count { font-size: 13px; color: var(--ink-3, #6b5e4f); font-weight: 600; white-space: nowrap; }

  .adm-table-wrap {
    background: var(--surface, #fff); border: 1px solid var(--line, #e8e4de);
    border-radius: 14px; overflow: hidden;
    animation: fadeUp 0.35s ease both;
  }
  .adm-table-scroll { overflow-x: auto; }
  table.adm-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 800px; }
  .adm-table thead th {
    text-align: left; font-size: 10.5px; letter-spacing: .08em;
    text-transform: uppercase; font-weight: 600; color: var(--ink-3, #6b5e4f);
    padding: 11px 16px; background: var(--surface-tint, #f5f3ef);
    border-bottom: 1px solid var(--line, #e8e4de);
    white-space: nowrap;
  }
  .adm-table tbody td {
    padding: 12px 16px; border-bottom: 1px solid var(--line, #e8e4de);
    vertical-align: middle;
  }
  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-table tbody tr:hover { background: var(--surface-tint, #f5f3ef); }
  .adm-table tbody tr { cursor: pointer; }

  .adm-biz-name { font-weight: 600; color: var(--ink, #1A1610); }
  .adm-biz-email { font-size: 11.5px; color: var(--ink-4, #9e9189); margin-top: 1px; }

  .adm-pill {
    display: inline-block; padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
  }
  .adm-pill-paid { background: var(--win-soft, #dcfce7); color: var(--win, #1f8a5b); }
  .adm-pill-trial { background: var(--gold-soft, #fef3c7); color: var(--bronze, #92400e); }
  .adm-pill-expired { background: var(--danger-soft, #fef2f2); color: var(--danger, #dc2626); }
  .adm-pill-free { background: var(--surface-tint, #f5f3ef); color: var(--ink-4, #9e9189); }
  .adm-pill-yes { background: var(--win-soft, #dcfce7); color: var(--win, #1f8a5b); }
  .adm-pill-no { background: var(--surface-tint, #f5f3ef); color: var(--ink-4, #9e9189); }

  .adm-num { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }

  /* Detail modal */
  .adm-overlay {
    position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,0.5);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 40px 16px; overflow-y: auto;
  }
  .adm-detail {
    background: var(--surface, #fff); border-radius: 20px;
    padding: 28px; width: 100%; max-width: 700px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: fadeUp 0.25s ease both;
  }
  .adm-detail-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .adm-detail-head h2 { font-size: 20px; font-weight: 800; color: var(--ink, #1A1610); margin: 0; }
  .adm-detail-close {
    background: none; border: none; font-size: 22px; cursor: pointer;
    color: var(--ink-4, #9e9189); line-height: 1;
  }
  .adm-detail-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    margin-bottom: 20px;
  }
  .adm-detail-field label { font-size: 11px; color: var(--ink-3, #6b5e4f); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
  .adm-detail-field p { font-size: 14px; color: var(--ink, #1A1610); margin: 3px 0 0; font-weight: 500; word-break: break-all; }

  .adm-detail-section { margin-bottom: 16px; }
  .adm-detail-section h3 {
    font-size: 13px; font-weight: 700; color: var(--ink-2, #3d3529);
    margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--line, #e8e4de);
  }
  .adm-mini-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .adm-mini-table th {
    text-align: left; font-size: 10px; letter-spacing: .06em; text-transform: uppercase;
    color: var(--ink-3, #6b5e4f); padding: 6px 10px; font-weight: 600;
    background: var(--surface-tint, #f5f3ef);
  }
  .adm-mini-table td { padding: 7px 10px; border-bottom: 1px solid var(--line, #e8e4de); }
  .adm-mini-table tbody tr:last-child td { border-bottom: none; }

  /* Detail charts */
  .adm-kpi-row {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;
  }
  .adm-kpi {
    background: var(--surface-tint, #f5f3ef); border-radius: 12px; padding: 12px 14px;
    text-align: center;
  }
  .adm-kpi-val { font-size: 22px; font-weight: 800; color: var(--ink, #1A1610); line-height: 1; }
  .adm-kpi-label { font-size: 10.5px; color: var(--ink-3, #6b5e4f); font-weight: 600; margin-top: 4px; }

  .adm-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
  .adm-chart-box {
    background: var(--surface-tint, #f5f3ef); border-radius: 12px; padding: 14px 16px;
  }
  .adm-chart-title { font-size: 11px; font-weight: 700; color: var(--ink-3, #6b5e4f); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 12px; }

  .adm-rating-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .adm-rating-bar-label { font-size: 11px; font-weight: 700; color: var(--ink-3, #6b5e4f); width: 18px; text-align: right; flex-shrink: 0; }
  .adm-rating-bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
  .adm-rating-bar-fill { height: 100%; border-radius: 99px; background: #F5B945; transition: width 0.4s ease; }
  .adm-rating-bar-count { font-size: 11px; color: var(--ink-4, #9e9189); width: 22px; text-align: right; flex-shrink: 0; }

  @media (max-width: 640px) {
    .adm-detail-grid { grid-template-columns: 1fr; }
    .adm-stats { grid-template-columns: repeat(2, 1fr); }
    .adm-kpi-row { grid-template-columns: repeat(2, 1fr); }
    .adm-charts-row { grid-template-columns: 1fr; }
  }
`

function Skel({ style }) {
  return <div style={{ background: '#e2e8f0', borderRadius: 8, animation: 'skelpulse 1.5s ease-in-out infinite', ...style }} />
}

function RatingDistribution({ reviews }) {
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))
  const max = Math.max(...counts.map(c => c.count), 1)
  return (
    <div>
      {counts.map(({ star, count }) => (
        <div key={star} className="adm-rating-bar-row">
          <span className="adm-rating-bar-label">{'★'.repeat(star)}</span>
          <div className="adm-rating-bar-track">
            <div className="adm-rating-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="adm-rating-bar-count">{count}</span>
        </div>
      ))}
    </div>
  )
}

function ActivityChart({ reviews }) {
  // bucket reviews into last 30 days
  const now = Date.now()
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000)
    return d.toISOString().slice(0, 10)
  })
  const countMap = {}
  reviews.forEach(r => {
    const day = (r.created_at || '').slice(0, 10)
    countMap[day] = (countMap[day] || 0) + 1
  })
  const vals = days.map(d => countMap[d] || 0)
  const max = Math.max(...vals, 1)
  const W = 240, H = 52
  const bw = W / vals.length - 1

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
        {vals.map((v, i) => {
          const h = Math.max(2, (v / max) * (H - 4))
          return (
            <rect
              key={i}
              x={i * (W / vals.length)}
              y={H - h}
              width={Math.max(bw, 1)}
              height={h}
              rx="1.5"
              fill={v > 0 ? '#D89020' : '#e2e8f0'}
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#9e9189' }}>30 days ago</span>
        <span style={{ fontSize: 10, color: '#9e9189' }}>Today</span>
      </div>
    </div>
  )
}

function StatusBreakdown({ requests }) {
  const statusColors = {
    review_drafted:    '#D89020',
    review_posted:     '#1f8a5b',
    feedback_received: '#3b82f6',
    rating_received:   '#8b5cf6',
    pending:           '#e2e8f0',
    sent:              '#f59e0b',
    expired:           '#ef4444',
  }
  const counts = {}
  requests.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1 })
  const total = requests.length || 1
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {entries.map(([status, count]) => (
        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] || '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#3d3529', flex: 1 }}>{status.replace(/_/g, ' ')}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1610' }}>{count}</span>
          <span style={{ fontSize: 11, color: '#9e9189', width: 32, textAlign: 'right' }}>{Math.round((count / total) * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function trialStatus(biz) {
  const plan = biz.plan || 'free'
  if (plan === 'monthly' || plan === 'yearly') return { label: plan === 'monthly' ? 'Monthly' : 'Yearly', cls: 'adm-pill-paid' }
  if (!biz.trial_ends_at) return { label: 'Free', cls: 'adm-pill-free' }
  const diff = Math.floor((new Date(biz.trial_ends_at) - Date.now()) / 86400000)
  if (diff < 0) return { label: 'Expired', cls: 'adm-pill-expired' }
  return { label: `Trial (${diff}d)`, cls: 'adm-pill-trial' }
}

function BusinessDetail({ businessId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/admin/businesses/${businessId}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [businessId])

  if (loading) {
    return (
      <div className="adm-overlay" onClick={onClose}>
        <div className="adm-detail" onClick={e => e.stopPropagation()}>
          <Skel style={{ height: 24, width: 200, marginBottom: 20 }} />
          <Skel style={{ height: 120, borderRadius: 12, marginBottom: 16 }} />
          <Skel style={{ height: 160, borderRadius: 12 }} />
        </div>
      </div>
    )
  }

  if (!data?.business) {
    return (
      <div className="adm-overlay" onClick={onClose}>
        <div className="adm-detail" onClick={e => e.stopPropagation()}>
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Business not found</p>
        </div>
      </div>
    )
  }

  const b = data.business
  const reviews = data.reviews || []
  const requests = data.review_requests || []
  const status = trialStatus(b)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'
  const postedCount = reviews.filter(r => r.is_posted_to_google).length
  const positiveCount = reviews.filter(r => r.rating >= 4).length
  const convRate = requests.length
    ? Math.round((reviews.length / requests.length) * 100)
    : 0

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-detail" onClick={e => e.stopPropagation()}>
        <div className="adm-detail-head">
          <div>
            <h2>{b.business_name}</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
              {b.city || '—'} &middot; {b.business_type} &middot; <span className={`adm-pill ${status.cls}`}>{status.label}</span>
            </p>
          </div>
          <button className="adm-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="adm-detail-grid">
          <div className="adm-detail-field"><label>Email</label><p>{b.email || '—'}</p></div>
          <div className="adm-detail-field"><label>Phone</label><p>{b.phone || '—'}</p></div>
          <div className="adm-detail-field"><label>Owner</label><p>{b.owner_name || '—'}</p></div>
          <div className="adm-detail-field"><label>Signed up</label><p>{formatDate(b.created_at)}</p></div>
          <div className="adm-detail-field"><label>Onboarding</label><p>{b.onboarding_completed ? 'Completed' : 'Pending'}</p></div>
          <div className="adm-detail-field"><label>Google connected</label><p>{b.google_place_id ? 'Yes' : 'No'}</p></div>
          <div className="adm-detail-field"><label>Trial ends</label><p>{formatDate(b.trial_ends_at)}</p></div>
          <div className="adm-detail-field"><label>Monthly requests</label><p>{b.monthly_request_count ?? 0}</p></div>
        </div>

        {b.google_business_url && (
          <div className="adm-detail-field" style={{ marginBottom: 16 }}>
            <label>Google review URL</label>
            <p><a href={b.google_business_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>{b.google_business_url}</a></p>
          </div>
        )}

        {/* KPI row */}
        <div className="adm-kpi-row">
          <div className="adm-kpi">
            <div className="adm-kpi-val">{reviews.length}</div>
            <div className="adm-kpi-label">Total Reviews</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-val">{avgRating}</div>
            <div className="adm-kpi-label">Avg Rating</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-val">{convRate}%</div>
            <div className="adm-kpi-label">Conversion</div>
          </div>
          <div className="adm-kpi">
            <div className="adm-kpi-val">{positiveCount}</div>
            <div className="adm-kpi-label">4–5 Star</div>
          </div>
        </div>

        {/* Charts */}
        {reviews.length > 0 && (
          <div className="adm-charts-row">
            <div className="adm-chart-box">
              <div className="adm-chart-title">Rating Distribution</div>
              <RatingDistribution reviews={reviews} />
            </div>
            <div className="adm-chart-box">
              <div className="adm-chart-title">Activity — Last 30 Days</div>
              <ActivityChart reviews={reviews} />
            </div>
          </div>
        )}

        {requests.length > 0 && (
          <div className="adm-chart-box" style={{ marginBottom: 18 }}>
            <div className="adm-chart-title">Request Status Breakdown</div>
            <StatusBreakdown requests={requests} />
          </div>
        )}

        <div className="adm-detail-section">
          <h3>Recent Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No reviews yet</p>
          ) : (
            <table className="adm-mini-table">
              <thead><tr><th>Date</th><th>Rating</th><th>Posted</th><th>Feedback</th></tr></thead>
              <tbody>
                {reviews.slice(0, 15).map(r => (
                  <tr key={r.id}>
                    <td>{formatDateTime(r.created_at)}</td>
                    <td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                    <td><span className={`adm-pill ${r.is_posted_to_google ? 'adm-pill-yes' : 'adm-pill-no'}`}>{r.is_posted_to_google ? 'Yes' : 'No'}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.private_feedback || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="adm-detail-section">
          <h3>Recent Requests ({requests.length})</h3>
          {requests.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No requests yet</p>
          ) : (
            <table className="adm-mini-table">
              <thead><tr><th>Date</th><th>Status</th><th>Rating</th><th>Via</th></tr></thead>
              <tbody>
                {requests.slice(0, 15).map(r => (
                  <tr key={r.id}>
                    <td>{formatDateTime(r.created_at)}</td>
                    <td>{r.status}</td>
                    <td>{r.rating ? '★'.repeat(r.rating) : '—'}</td>
                    <td>{r.sent_via}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const isAuthed = authService.isAuthenticated()
  const [stats, setStats] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBiz, setSelectedBiz] = useState(null)

  useEffect(() => {
    if (!isAuthed) { navigate('/login', { replace: true }); return }
    document.title = 'Praisly Admin'
    setLoading(true)
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/businesses'),
    ]).then(([s, b]) => {
      setStats(s.data)
      setBusinesses(b.data?.businesses || [])
    }).catch(err => {
      if (err.response?.status === 403) {
        setError('forbidden')
      } else {
        setError('failed')
      }
    }).finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? businesses.filter(b => {
        const q = search.toLowerCase()
        return (b.business_name || '').toLowerCase().includes(q)
          || (b.email || '').toLowerCase().includes(q)
          || (b.city || '').toLowerCase().includes(q)
          || (b.phone || '').toLowerCase().includes(q)
          || (b.owner_name || '').toLowerCase().includes(q)
      })
    : businesses

  if (error === 'forbidden') {
    return (
      <div className="adm-page">
        <style>{CSS}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>🔒</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Access Denied</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>This page is restricted to admin accounts.</p>
          <button className="adm-back" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="adm-page">
      <style>{CSS}</style>

      {/* Top bar */}
      <div className="adm-topbar">
        <div className="adm-topbar-left">
          <h1>Praisly Admin</h1>
          <span className="adm-topbar-badge">ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-back" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="adm-back" onClick={() => authService.logout()}>Logout</button>
        </div>
      </div>

      <div className="adm-body">
        {loading ? (
          <>
            <div className="adm-stats">
              {[0,1,2,3,4,5].map(i => <Skel key={i} style={{ height: 90, borderRadius: 14 }} />)}
            </div>
            <Skel style={{ height: 400, borderRadius: 14 }} />
          </>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>😕</p>
            <p>Failed to load admin data. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="adm-stats">
                <div className="adm-stat" style={{ animationDelay: '0ms' }}>
                  <div className="adm-stat-label">Total Businesses</div>
                  <div className="adm-stat-val">{stats.total_businesses}</div>
                </div>
                <div className="adm-stat" style={{ animationDelay: '40ms' }}>
                  <div className="adm-stat-label">Onboarded</div>
                  <div className="adm-stat-val">{stats.onboarded}</div>
                </div>
                <div className="adm-stat" style={{ animationDelay: '80ms' }}>
                  <div className="adm-stat-label">Active Trials</div>
                  <div className="adm-stat-val">{stats.active_trials}</div>
                </div>
                <div className="adm-stat" style={{ animationDelay: '120ms' }}>
                  <div className="adm-stat-label">Paid Subscribers</div>
                  <div className="adm-stat-val">{stats.paid_subscribers}</div>
                </div>
                <div className="adm-stat" style={{ animationDelay: '160ms' }}>
                  <div className="adm-stat-label">Total Reviews</div>
                  <div className="adm-stat-val">{stats.total_reviews}</div>
                </div>
                <div className="adm-stat" style={{ animationDelay: '200ms' }}>
                  <div className="adm-stat-label">Review Requests</div>
                  <div className="adm-stat-val">{stats.total_review_requests}</div>
                </div>
              </div>
            )}

            {/* Search + table */}
            <div className="adm-search-row">
              <input
                className="adm-search"
                placeholder="Search by name, email, city, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="adm-count">{filtered.length} businesses</span>
            </div>

            <div className="adm-table-wrap">
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Business</th>
                      <th>City</th>
                      <th>Type</th>
                      <th>Plan</th>
                      <th>Onboarded</th>
                      <th style={{ textAlign: 'right' }}>Reviews</th>
                      <th style={{ textAlign: 'right' }}>Requests</th>
                      <th>Signed Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                          {search ? 'No businesses match your search' : 'No businesses yet'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map(b => {
                        const status = trialStatus(b)
                        return (
                          <tr key={b.id} onClick={() => setSelectedBiz(b.id)}>
                            <td>
                              <div className="adm-biz-name">{b.business_name}</div>
                              <div className="adm-biz-email">{b.email}</div>
                            </td>
                            <td>{b.city || '—'}</td>
                            <td>{b.business_type}</td>
                            <td><span className={`adm-pill ${status.cls}`}>{status.label}</span></td>
                            <td>
                              <span className={`adm-pill ${b.onboarding_completed ? 'adm-pill-yes' : 'adm-pill-no'}`}>
                                {b.onboarding_completed ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="adm-num">{b.review_count}</td>
                            <td className="adm-num">{b.request_count}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedBiz && <BusinessDetail businessId={selectedBiz} onClose={() => setSelectedBiz(null)} />}
    </div>
  )
}
