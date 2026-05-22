import { useState } from 'react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

// Separate axios instance — uses sessionStorage so it never touches the regular user session
const agentApi = axios.create({ baseURL: BASE_URL, timeout: 15000 })
agentApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem('praisly_agent_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const BUSINESS_TYPES = [
  'salon / beauty parlour',
  'healthcare / clinic',
  'gym / fitness / yoga',
  'restaurant / cafe',
  'coaching / tuition',
  'ca / law firm',
  'auto / repair service',
  'real estate',
  'other',
]

const STYLES = `
* { box-sizing: border-box; }
.ag-wrap {
  min-height: 100vh;
  background: #FAF6EC;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
.ag-header {
  background: #1A1610;
  padding: 14px 20px;
  display: flex; align-items: center; gap: 10px;
}
.ag-header-mark {
  width: 32px; height: 32px; border-radius: 8px;
  background: #D89020; color: #1A1610;
  display: grid; place-items: center;
  font-weight: 800; font-size: 16px; flex-shrink: 0;
}
.ag-header-title {
  font-size: 16px; font-weight: 800; color: white; letter-spacing: -0.01em;
}
.ag-header-sub { font-size: 12px; color: rgba(255,255,255,0.5); }
.ag-body { padding: 24px 16px 60px; }
.ag-card {
  background: white;
  border: 1px solid #E8E0CC;
  border-radius: 20px;
  padding: 28px 24px;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(26,22,16,0.07);
}
.ag-section-title {
  font-size: 18px; font-weight: 800; letter-spacing: -0.02em;
  color: #1A1610; margin: 0 0 4px;
}
.ag-section-sub {
  font-size: 13px; color: #8C7E65; margin: 0 0 22px;
}
.ag-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
.ag-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: #8C7E65;
}
.ag-input {
  padding: 12px 14px; border-radius: 11px;
  border: 1.5px solid #E8E0CC;
  font-size: 15px; font-family: inherit; color: #1A1610;
  background: white; outline: none; transition: border-color 0.15s;
  width: 100%;
}
.ag-input:focus { border-color: #D89020; }
.ag-btn {
  width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
  font-size: 15px; font-weight: 800; font-family: inherit;
  background: #D89020; color: #2c1e07;
  box-shadow: 0 6px 18px -6px rgba(216,144,32,0.5);
  transition: opacity 0.15s, transform 0.12s;
  margin-top: 6px;
}
.ag-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.ag-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.ag-btn-ghost {
  width: 100%; padding: 12px; border-radius: 12px;
  border: 1.5px solid #E8E0CC;
  font-size: 14px; font-weight: 700; font-family: inherit;
  background: white; color: #1A1610;
  cursor: pointer; transition: background 0.15s; margin-top: 8px;
}
.ag-btn-ghost:hover { background: #F5EFE0; }
.ag-result {
  background: #f0fdf4; border: 1.5px solid #86efac;
  border-radius: 16px; padding: 20px; margin-bottom: 16px;
}
.ag-result-title { font-size: 16px; font-weight: 800; color: #15803d; margin: 0 0 12px; }
.ag-result-row {
  display: flex; flex-direction: column; gap: 2px;
  padding: 9px 0; border-bottom: 1px solid #bbf7d0;
}
.ag-result-row:last-child { border-bottom: none; }
.ag-result-lbl { font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #16a34a; }
.ag-result-val { font-size: 14.5px; font-weight: 600; color: #14532d; word-break: break-all; }
.ag-wa-btn {
  width: 100%; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
  font-size: 15px; font-weight: 800; font-family: inherit;
  background: #25d366; color: white;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.15s; margin-top: 4px; text-decoration: none;
}
.ag-wa-btn:hover { opacity: 0.88; }
.ag-err {
  background: #fef2f2; border: 1px solid #fca5a5;
  border-radius: 10px; padding: 11px 14px;
  font-size: 13px; color: #dc2626; margin-bottom: 14px;
}
.ag-divider { border: none; border-top: 1px solid #E8E0CC; margin: 20px 0; }
.ag-place-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.ag-place-item {
  padding: 12px 14px; border-radius: 11px;
  border: 1.5px solid #E8E0CC; cursor: pointer;
  transition: border-color 0.15s, background 0.15s; background: white;
}
.ag-place-item:hover { background: #FBF6EB; border-color: #D89020; }
.ag-place-item.selected { border-color: #D89020; background: #FFF8E8; }
.ag-place-name { font-size: 14px; font-weight: 700; color: #1A1610; margin-bottom: 2px; }
.ag-place-addr { font-size: 12px; color: #8C7E65; margin-bottom: 3px; }
.ag-place-meta { font-size: 11.5px; color: #B8946B; }
.ag-place-skip {
  display: block; width: 100%; text-align: center; font-size: 12.5px; color: #8C7E65;
  cursor: pointer; padding: 8px; text-decoration: underline;
  background: none; border: none; font-family: inherit;
}
.ag-logout {
  background: none; border: none; cursor: pointer;
  font-size: 12px; color: #8C7E65; text-decoration: underline;
  margin-left: auto; display: block; padding: 0; font-family: inherit;
}
`

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const EMPTY_FORM = {
  business_name: '', business_type: 'salon / beauty parlour',
  city: '', area: '', owner_name: '', owner_phone: '',
}

export default function AgentSignup() {
  const [agentEmail, setAgentEmail] = useState(
    () => sessionStorage.getItem('praisly_agent_email') || ''
  )
  const isLoggedIn = !!sessionStorage.getItem('praisly_agent_token')
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Create-business form state
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // Google Places search state
  const [placeResults, setPlaceResults] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [placeSearching, setPlaceSearching] = useState(false)
  const [placeSearched, setPlaceSearched] = useState(false)

  function setF(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (field === 'business_name' || field === 'city') {
      setPlaceResults([])
      setSelectedPlace(null)
      setPlaceSearched(false)
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      return setLoginError('Email and password are required.')
    }
    setLoginLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}/api/agent/login`, {
        email: loginForm.email.trim(),
        password: loginForm.password,
      })
      sessionStorage.setItem('praisly_agent_token', res.data.access_token)
      sessionStorage.setItem('praisly_agent_email', res.data.email)
      setAgentEmail(res.data.email)
      setLoggedIn(true)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setLoginError(typeof detail === 'string' ? detail : 'Login failed. Check credentials.')
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('praisly_agent_token')
    sessionStorage.removeItem('praisly_agent_email')
    setLoggedIn(false)
    setAgentEmail('')
    setResult(null)
    setError('')
  }

  // ── Google Places search ───────────────────────────────────────────────────
  async function handlePlaceSearch() {
    setPlaceSearching(true)
    setPlaceResults([])
    setSelectedPlace(null)
    setPlaceSearched(false)
    try {
      const res = await agentApi.post('/api/agent/search-places', {
        query: `${form.business_name.trim()} ${form.city.trim()}`,
      })
      setPlaceResults(res.data.results || [])
    } catch {
      setPlaceResults([])
    } finally {
      setPlaceSearching(false)
      setPlaceSearched(true)
    }
  }

  // ── Create business ────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.business_name.trim()) return setError('Business name is required.')
    if (!form.city.trim()) return setError('City is required.')
    if (!form.owner_phone.trim()) return setError('Owner phone is required.')

    setLoading(true)
    try {
      const res = await agentApi.post('/api/agent/create-business', {
        business_name: form.business_name.trim(),
        business_type: form.business_type,
        city: form.city.trim(),
        area: form.area.trim() || null,
        owner_name: form.owner_name.trim() || null,
        owner_phone: form.owner_phone.trim(),
        google_place_id: selectedPlace?.place_id || null,
        google_business_url: selectedPlace?.google_review_url || null,
      })
      setResult(res.data)
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (err?.response?.status === 401) {
        handleLogout()
        return setError('Session expired. Please log in again.')
      }
      setError(typeof detail === 'string' ? detail : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function buildWhatsAppUrl(r) {
    const name = form.owner_name.trim() || 'there'
    const msg = [
      `Hi ${name}! Your Praisly account is ready 🎉`,
      ``,
      `Login: ${r.email}`,
      `Password: ${r.password}`,
      ``,
      `Dashboard: https://praisly.in/login`,
      `Your QR code (share with customers): ${r.qr_url}`,
      ...(r.google_business_url ? [``, `Google Review Link: ${r.google_business_url}`] : []),
      ``,
      `Setup takes 10 min. Any help, WhatsApp us back!`,
    ].join('\n')
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }

  function handleReset() {
    setResult(null)
    setError('')
    setForm(EMPTY_FORM)
    setPlaceResults([])
    setSelectedPlace(null)
    setPlaceSearched(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ag-wrap">
      <style>{STYLES}</style>

      <div className="ag-header">
        <div className="ag-header-mark">P</div>
        <div>
          <div className="ag-header-title">Praisly</div>
          <div className="ag-header-sub">Agent Portal</div>
        </div>
      </div>

      <div className="ag-body">
        {!loggedIn ? (
          /* ── LOGIN CARD ─────────────────────────────────────────────── */
          <div className="ag-card">
            <div className="ag-section-title">Sign in</div>
            <p className="ag-section-sub">Agent accounts only.</p>

            {loginError && <div className="ag-err">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div className="ag-field">
                <label className="ag-label">Email</label>
                <input
                  className="ag-input"
                  type="email"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
              <div className="ag-field">
                <label className="ag-label">Password</label>
                <input
                  className="ag-input"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="ag-btn" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Login'}
              </button>
            </form>
          </div>
        ) : (
          /* ── CREATE BUSINESS CARD ───────────────────────────────────── */
          <div className="ag-card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div className="ag-section-title">Create Business</div>
                <div style={{ fontSize: 12, color: '#8C7E65', marginTop: 2 }}>{agentEmail}</div>
              </div>
              <button className="ag-logout" onClick={handleLogout}>Logout</button>
            </div>

            {!result ? (
              <>
                {error && <div className="ag-err">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="ag-field">
                    <label className="ag-label">Business Name *</label>
                    <input
                      className="ag-input"
                      placeholder="e.g. Looks Salon"
                      value={form.business_name}
                      onChange={e => setF('business_name', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="ag-field">
                    <label className="ag-label">Business Type *</label>
                    <select
                      className="ag-input"
                      value={form.business_type}
                      onChange={e => setF('business_type', e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      {BUSINESS_TYPES.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="ag-field" style={{ marginBottom: 0 }}>
                      <label className="ag-label">City *</label>
                      <input
                        className="ag-input"
                        placeholder="Noida"
                        value={form.city}
                        onChange={e => setF('city', e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="ag-field" style={{ marginBottom: 0 }}>
                      <label className="ag-label">
                        Area <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opt)</span>
                      </label>
                      <input
                        className="ag-input"
                        placeholder="Sector 18"
                        value={form.area}
                        onChange={e => setF('area', e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 15 }} />

                  {/* Google Places search */}
                  <div style={{ marginBottom: 14 }}>
                    <button
                      type="button"
                      className="ag-btn-ghost"
                      style={{ padding: '10px 14px', fontSize: 13.5 }}
                      onClick={handlePlaceSearch}
                      disabled={!form.business_name.trim() || !form.city.trim() || placeSearching}
                    >
                      {placeSearching ? 'Searching…' : '🔍 Find on Google Maps'}
                    </button>
                    {placeSearched && placeResults.length === 0 && (
                      <p style={{ fontSize: 12, color: '#8C7E65', margin: '8px 0 0', textAlign: 'center' }}>
                        No results found. Business will be created without Google tracking.
                      </p>
                    )}
                  </div>

                  {placeResults.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div className="ag-label" style={{ marginBottom: 8 }}>
                        Select Google Business {selectedPlace ? '✓' : ''}
                      </div>
                      <div className="ag-place-list">
                        {placeResults.map(p => (
                          <div
                            key={p.place_id}
                            className={`ag-place-item${selectedPlace?.place_id === p.place_id ? ' selected' : ''}`}
                            onClick={() => setSelectedPlace(prev => prev?.place_id === p.place_id ? null : p)}
                          >
                            <div className="ag-place-name">{p.name}</div>
                            <div className="ag-place-addr">{p.formatted_address}</div>
                            {p.rating != null && (
                              <div className="ag-place-meta">★ {p.rating} · {p.user_ratings_total} reviews</div>
                            )}
                          </div>
                        ))}
                      </div>
                      {selectedPlace ? (
                        <button type="button" className="ag-place-skip" onClick={() => setSelectedPlace(null)}>
                          Clear selection
                        </button>
                      ) : (
                        <button type="button" className="ag-place-skip" onClick={() => { setPlaceResults([]); setPlaceSearched(false); }}>
                          Skip — set up Google later
                        </button>
                      )}
                    </div>
                  )}

                  <div className="ag-field">
                    <label className="ag-label">
                      Owner Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opt)</span>
                    </label>
                    <input
                      className="ag-input"
                      placeholder="Priya Sharma"
                      value={form.owner_name}
                      onChange={e => setF('owner_name', e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="ag-field">
                    <label className="ag-label">Owner Phone *</label>
                    <input
                      className="ag-input"
                      placeholder="9876543210"
                      value={form.owner_phone}
                      onChange={e => setF('owner_phone', e.target.value)}
                      inputMode="tel"
                      autoComplete="off"
                    />
                  </div>

                  <button type="submit" className="ag-btn" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Business'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="ag-result">
                  <div className="ag-result-title">✅ Business created!</div>
                  <div className="ag-result-row">
                    <span className="ag-result-lbl">Business</span>
                    <span className="ag-result-val">{form.business_name}</span>
                  </div>
                  <div className="ag-result-row">
                    <span className="ag-result-lbl">Login Email</span>
                    <span className="ag-result-val">{result.email}</span>
                  </div>
                  <div className="ag-result-row">
                    <span className="ag-result-lbl">Password</span>
                    <span className="ag-result-val">{result.password}</span>
                  </div>
                  <div className="ag-result-row">
                    <span className="ag-result-lbl">QR Code Link</span>
                    <a
                      href={result.qr_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 13.5, color: '#15803d', wordBreak: 'break-all' }}
                    >
                      {result.qr_url}
                    </a>
                  </div>
                  {result.google_business_url && (
                    <div className="ag-result-row">
                      <span className="ag-result-lbl">Google Review Link</span>
                      <a
                        href={result.google_business_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13.5, color: '#15803d', wordBreak: 'break-all' }}
                      >
                        {result.google_business_url}
                      </a>
                    </div>
                  )}
                </div>

                <a href={buildWhatsAppUrl(result)} target="_blank" rel="noreferrer" className="ag-wa-btn">
                  {WA_ICON} Share on WhatsApp
                </a>

                <button className="ag-btn-ghost" onClick={() => window.open(result.qr_url, '_blank')}>
                  Open QR Code link
                </button>

                <button className="ag-btn" onClick={handleReset} style={{ marginTop: 10 }}>
                  + Create Another
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
