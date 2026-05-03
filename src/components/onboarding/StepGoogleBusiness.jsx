import { useState, useEffect } from 'react'
import api from '../../services/api'

const STEP_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .place-card {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;
    animation: fadeUp 0.2s ease forwards;
  }
  .place-card:hover { border-color: #10b981; background: #f0fdf4; }
  .place-card.selected { border-color: #10b981; background: #f0fdf4; }
  .ob-input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
    background: white;
  }
  .ob-input:focus { border-color: #10b981; }
`

function Spinner() {
  return (
    <div
      style={{
        width: 20, height: 20,
        border: '2px solid #e2e8f0',
        borderTopColor: '#10b981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '24px auto',
      }}
    />
  )
}

function SkeletonCard() {
  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 6, width: '60%' }} />
          <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '80%' }} />
        </div>
      </div>
    </div>
  )
}

function validateGoogleUrl(url) {
  if (!url) return false
  return (
    url.includes('google.com') ||
    url.includes('maps.app.goo') ||
    url.includes('g.page') ||
    url.includes('goo.gl/maps')
  )
}

export default function StepGoogleBusiness({ biz, data, onUpdate, onNext }) {
  const [query, setQuery] = useState(biz?.business_name || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(data.googlePlaceId || null)
  const [showManual, setShowManual] = useState(false)
  const [manualUrl, setManualUrl] = useState(data.googleBusinessUrl || '')
  const [urlError, setUrlError] = useState('')
  const [apiAvailable, setApiAvailable] = useState(true)
  const [howToOpen, setHowToOpen] = useState(false)

  useEffect(() => {
    // Auto-search on mount
    doSearch(biz?.business_name || '', biz?.city || '')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function doSearch(q, city) {
    if (!q.trim()) return
    setSearching(true)
    setSelected(null)
    try {
      const res = await api.get(
        `/api/places/search?query=${encodeURIComponent(q)}&city=${encodeURIComponent(city || biz?.city || '')}`
      )
      const list = res.data.results || []
      setResults(list)
      if (list.length === 0) {
        setApiAvailable(false)
        setShowManual(true)
      } else {
        setApiAvailable(true)
      }
    } catch {
      setApiAvailable(false)
      setShowManual(true)
    } finally {
      setSearching(false)
    }
  }

  function handleSelect(placeId) {
    setSelected(placeId)
    setManualUrl('')
    setUrlError('')
  }

  function handleManualChange(val) {
    setManualUrl(val)
    setUrlError('')
  }

  function handleNext() {
    if (showManual || !apiAvailable) {
      if (!validateGoogleUrl(manualUrl)) {
        setUrlError('Please enter a valid Google Business or Maps URL')
        return
      }
      onUpdate({ googlePlaceId: null, googleBusinessUrl: manualUrl.trim() })
    } else {
      const pick = results.find((r) => r.place_id === selected)
      onUpdate({
        googlePlaceId: selected,
        googlePlaceName: pick?.name || '',
        googleBusinessUrl: '',
      })
    }
    onNext()
  }

  const canProceed = showManual || !apiAvailable
    ? validateGoogleUrl(manualUrl)
    : !!selected

  return (
    <div>
      <style>{STEP_CSS}</style>

      <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
        Connect your Google Business
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
        This is where your customers' reviews will be posted on Google.
      </p>

      {/* ── Auto-search panel ── */}
      {apiAvailable && !showManual && (
        <>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="ob-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your business name…"
              onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
            />
            <button
              onClick={() => doSearch(query)}
              disabled={searching}
              style={{
                padding: '10px 16px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: searching ? 'not-allowed' : 'pointer',
                opacity: searching ? 0.6 : 1,
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              Search
            </button>
          </div>

          {/* Results */}
          {searching ? (
            [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          ) : results.length > 0 ? (
            <>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                Select your business from the results below:
              </p>
              {results.map((r) => (
                <div
                  key={r.place_id}
                  className={`place-card${selected === r.place_id ? ' selected' : ''}`}
                  onClick={() => handleSelect(r.place_id)}
                >
                  {/* Radio dot */}
                  <div
                    style={{
                      width: 18, height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${selected === r.place_id ? '#10b981' : '#cbd5e1'}`,
                      background: selected === r.place_id ? '#10b981' : 'white',
                      flexShrink: 0,
                      marginTop: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selected === r.place_id && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{r.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{r.formatted_address}</p>
                    {r.rating != null && (
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#94a3b8' }}>
                        ⭐ {r.rating} · {r.user_ratings_total?.toLocaleString('en-IN') || 0} reviews on Google
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowManual(true)}
                style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0 0', fontFamily: 'inherit' }}
              >
                Can't find your business? Paste URL instead →
              </button>
            </>
          ) : null}
        </>
      )}

      {/* ── Manual URL panel ── */}
      {(showManual || !apiAvailable) && (
        <>
          {apiAvailable && (
            <button
              onClick={() => { setShowManual(false); setSelected(null) }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: '0 0 14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              ← Back to search
            </button>
          )}

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Google Business Profile URL
          </label>
          <input
            className="ob-input"
            value={manualUrl}
            onChange={(e) => handleManualChange(e.target.value)}
            placeholder="https://search.google.com/local/writereview?placeid=..."
            style={{ marginBottom: urlError ? 4 : 12 }}
          />
          {urlError && <p style={{ color: '#dc2626', fontSize: 12, margin: '0 0 12px' }}>{urlError}</p>}

          {/* How to find URL expandable */}
          <button
            onClick={() => setHowToOpen((v) => !v)}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: '0 0 12px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {howToOpen ? '▾' : '▸'} How to find your Google review link
          </button>
          {howToOpen && (
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', marginBottom: 12, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
              {[
                'Search your business name on Google Maps',
                'Click on your business listing',
                'Click "Write a review"',
                'Copy the URL from your address bar',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Next button ── */}
      <button
        onClick={handleNext}
        disabled={!canProceed}
        style={{
          width: '100%',
          padding: '13px',
          background: canProceed ? '#10b981' : '#e2e8f0',
          color: canProceed ? 'white' : '#94a3b8',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 700,
          cursor: canProceed ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          marginTop: 8,
          transition: 'background 0.15s',
        }}
      >
        Next →
      </button>
    </div>
  )
}
