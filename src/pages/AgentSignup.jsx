import { useState } from 'react'
import api from '../services/api'

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
.ag-page {
  min-height: 100vh;
  background: var(--bg, #FAF6EC);
  padding: 24px 16px 60px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
.ag-card {
  background: white;
  border: 1px solid var(--line, #E8E0CC);
  border-radius: 20px;
  padding: 28px 24px;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(26,22,16,0.07);
}
.ag-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink, #1A1610);
  margin: 0 0 4px;
}
.ag-sub {
  font-size: 13.5px;
  color: var(--ink-3, #8C7E65);
  margin: 0 0 24px;
}
.ag-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.ag-label {
  font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-3, #8C7E65);
}
.ag-input {
  padding: 12px 14px; border-radius: 11px;
  border: 1.5px solid var(--line, #E8E0CC);
  font-size: 15px; font-family: inherit; color: var(--ink, #1A1610);
  background: white; outline: none; transition: border-color 0.15s;
  width: 100%; box-sizing: border-box;
}
.ag-input:focus { border-color: var(--primary, #D89020); }
.ag-input.error { border-color: #ef4444; }
.ag-btn {
  width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
  font-size: 16px; font-weight: 800; font-family: inherit;
  background: var(--primary, #D89020); color: #2c1e07;
  box-shadow: 0 6px 18px -6px rgba(216,144,32,0.5);
  transition: opacity 0.15s, transform 0.12s;
  margin-top: 8px;
}
.ag-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.ag-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ag-btn-ghost {
  width: 100%; padding: 13px; border-radius: 12px;
  border: 1.5px solid var(--line, #E8E0CC);
  font-size: 15px; font-weight: 700; font-family: inherit;
  background: white; color: var(--ink, #1A1610);
  cursor: pointer; transition: background 0.15s;
  margin-top: 8px;
}
.ag-btn-ghost:hover { background: var(--surface-2, #F5EFE0); }
.ag-result {
  background: #f0fdf4; border: 1.5px solid #86efac;
  border-radius: 16px; padding: 22px 20px; margin-bottom: 16px;
}
.ag-result-title { font-size: 17px; font-weight: 800; color: #15803d; margin: 0 0 14px; }
.ag-result-row {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 0; border-bottom: 1px solid #bbf7d0;
}
.ag-result-row:last-child { border-bottom: none; }
.ag-result-lbl { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #16a34a; }
.ag-result-val { font-size: 15px; font-weight: 600; color: #14532d; word-break: break-all; }
.ag-wa-btn {
  width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
  font-size: 15px; font-weight: 800; font-family: inherit;
  background: #25d366; color: white;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.15s; margin-top: 4px;
}
.ag-wa-btn:hover { opacity: 0.88; }
.ag-err {
  background: #fef2f2; border: 1px solid #fca5a5;
  border-radius: 10px; padding: 12px 14px;
  font-size: 13.5px; color: #dc2626; margin-bottom: 16px;
}
`

export default function AgentSignup() {
  const [form, setForm] = useState({
    business_name: '',
    business_type: 'salon / beauty parlour',
    city: '',
    area: '',
    owner_name: '',
    owner_phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.business_name.trim()) return setError('Business name is required.')
    if (!form.city.trim()) return setError('City is required.')
    if (!form.owner_phone.trim()) return setError('Owner phone is required.')

    setLoading(true)
    try {
      const res = await api.post('/api/agent/create-business', {
        business_name: form.business_name.trim(),
        business_type: form.business_type,
        city: form.city.trim(),
        area: form.area.trim() || null,
        owner_name: form.owner_name.trim() || null,
        owner_phone: form.owner_phone.trim(),
      })
      setResult(res.data)
    } catch (err) {
      const detail = err?.response?.data?.detail
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
      ``,
      `Setup takes 10 min. Any help, WhatsApp us back!`,
    ].join('\n')
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }

  function handleReset() {
    setResult(null)
    setError('')
    setForm({ business_name: '', business_type: 'salon / beauty parlour', city: '', area: '', owner_name: '', owner_phone: '' })
  }

  return (
    <div className="ag-page">
      <style>{STYLES}</style>

      <div className="ag-card">
        {!result ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink, #1A1610)', color: 'var(--primary, #D89020)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17 }}>P</div>
              <div>
                <div className="ag-title">Agent Portal</div>
              </div>
            </div>
            <p className="ag-sub">Create a business account in 30 seconds. Credentials are generated automatically.</p>

            {error && <div className="ag-err">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="ag-field">
                <label className="ag-label">Business Name *</label>
                <input
                  className="ag-input"
                  placeholder="e.g. Looks Salon"
                  value={form.business_name}
                  onChange={e => set('business_name', e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="ag-field">
                <label className="ag-label">Business Type *</label>
                <select
                  className="ag-input"
                  value={form.business_type}
                  onChange={e => set('business_type', e.target.value)}
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
                    onChange={e => set('city', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="ag-field" style={{ marginBottom: 0 }}>
                  <label className="ag-label">Area <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opt)</span></label>
                  <input
                    className="ag-input"
                    placeholder="Sector 18"
                    value={form.area}
                    onChange={e => set('area', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }} />

              <div className="ag-field">
                <label className="ag-label">Owner Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opt)</span></label>
                <input
                  className="ag-input"
                  placeholder="Priya Sharma"
                  value={form.owner_name}
                  onChange={e => set('owner_name', e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="ag-field">
                <label className="ag-label">Owner Phone *</label>
                <input
                  className="ag-input"
                  placeholder="9876543210"
                  value={form.owner_phone}
                  onChange={e => set('owner_phone', e.target.value)}
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
                  style={{ fontSize: 14, color: '#15803d', wordBreak: 'break-all' }}
                >
                  {result.qr_url}
                </a>
              </div>
            </div>

            {error && <div className="ag-err">{error}</div>}

            <a
              href={buildWhatsAppUrl(result)}
              target="_blank"
              rel="noreferrer"
              className="ag-wa-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
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
    </div>
  )
}
