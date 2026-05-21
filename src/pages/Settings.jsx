import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { authService } from '../services/api'
import { useToast } from '../components/Toast'

const BIZ_TYPES = [
  { value: 'healthcare / clinic',   label: 'Healthcare / Clinic' },
  { value: 'salon / beauty parlour', label: 'Salon / Beauty Parlour' },
  { value: 'gym / fitness / yoga',  label: 'Gym / Fitness / Yoga' },
  { value: 'restaurant / cafe',     label: 'Restaurant / Cafe' },
  { value: 'coaching / tuition',    label: 'Coaching / Tuition' },
  { value: 'ca / law firm',         label: 'CA / Law Firm' },
  { value: 'auto / repair service', label: 'Auto / Repair Service' },
  { value: 'real estate',           label: 'Real Estate' },
  { value: 'other',                 label: 'Other' },
]

const LEGACY_TYPE_MAP = {
  'dentist':    'healthcare / clinic',
  'ca_firm':    'ca / law firm',
  'salon':      'salon / beauty parlour',
  'gym':        'gym / fitness / yoga',
  'restaurant': 'restaurant / cafe',
  'coaching':   'coaching / tuition',
}

function normalizeType(raw) {
  return LEGACY_TYPE_MAP[raw] || raw || 'other'
}


const PAGE_STYLE = `@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
  background: 'white',
  fontFamily: 'inherit',
}

export default function Settings() {
  const toast   = useToast()
  const stored  = authService.getBusiness()

  const [form, setForm] = useState({
    business_name: stored?.business_name || '',
    business_type: normalizeType(stored?.business_type),
    city:          stored?.city          || '',
    phone:         stored?.phone         || '',
    email:         stored?.email         || '',
  })
  const [saving, setSaving] = useState(false)

  const [seoKeywords, setSeoKeywords] = useState(stored?.seo_keywords || [])
  const [customKw, setCustomKw] = useState('')
  const [seoGenerating, setSeoGenerating] = useState(false)
  const [seoSaving, setSeoSaving] = useState(false)

  const plan       = stored?.plan || null
  const isPaid     = plan === 'monthly' || plan === 'yearly'
  const trialEndsAt = stored?.trial_ends_at
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.floor((new Date(trialEndsAt) - Date.now()) / 86400000))
    : 7
  const trialExpired = trialEndsAt ? Date.now() >= new Date(trialEndsAt).getTime() : false

  const set     = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const onFocus = (e) => (e.target.style.borderColor = 'var(--primary)')
  const onBlur  = (e) => (e.target.style.borderColor = '#e2e8f0')

  async function handleGenerateKeywords() {
    setSeoGenerating(true)
    try {
      const res = await api.post('/api/business/generate-seo-keywords')
      setSeoKeywords(res.data.keywords || [])
      toast('Keywords generated! Edit and save when ready.')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to generate keywords', 'error')
    } finally {
      setSeoGenerating(false)
    }
  }

  function handleAddCustom() {
    const kw = customKw.trim().toLowerCase()
    if (!kw || seoKeywords.length >= 8 || seoKeywords.includes(kw)) return
    setSeoKeywords(prev => [...prev, kw])
    setCustomKw('')
  }

  function removeKw(index) {
    setSeoKeywords(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSaveKeywords() {
    setSeoSaving(true)
    try {
      const res = await api.put('/api/business/update', { seo_keywords: seoKeywords })
      authService.setBusiness({ ...stored, ...res.data })
      toast('Keywords saved!')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save keywords', 'error')
    } finally {
      setSeoSaving(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/api/business/update', form)
      authService.setBusiness({ ...stored, ...res.data })
      toast('Settings saved!')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <style>{PAGE_STYLE}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 22,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 24,
        }}
      >
        Settings
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Business Profile form */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 28,
            border: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
            Business Profile
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                required
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Business Type</label>
              <select
                value={form.business_type}
                onChange={(e) => set('business_type', e.target.value)}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                {BIZ_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Noida"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {stored?.google_business_url && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Google Review URL</label>
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    color: '#64748b',
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                  }}
                >
                  {stored.google_business_url}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Set via Google Places search
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '11px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* SEO Keywords */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 28,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>SEO Keywords</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 380, lineHeight: 1.5 }}>
                Add keywords to boost your Google Maps ranking. These get woven into AI-generated reviews naturally.
              </p>
            </div>
            <button
              onClick={handleGenerateKeywords}
              disabled={seoGenerating}
              style={{
                padding: '8px 16px',
                background: seoGenerating ? '#e5c57a' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: seoGenerating ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {seoGenerating ? 'Generating…' : '✦ Auto-generate'}
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            {seoKeywords.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, padding: '12px 0' }}>
                No keywords yet. Click Auto-generate to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {seoKeywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px 5px 12px',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#92400e',
                    }}
                  >
                    {kw}
                    <button
                      onClick={() => removeKw(i)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        border: 'none',
                        background: 'transparent',
                        color: '#b45309',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                        padding: 0,
                        fontFamily: 'inherit',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <input
              type="text"
              value={customKw}
              onChange={(e) => setCustomKw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder={seoKeywords.length >= 8 ? '8/8 keywords — remove one first' : 'Add custom keyword'}
              disabled={seoKeywords.length >= 8}
              maxLength={60}
              style={{ ...inputStyle, flex: 1, opacity: seoKeywords.length >= 8 ? 0.5 : 1 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customKw.trim() || seoKeywords.length >= 8}
              style={{
                padding: '10px 16px',
                background: '#f1f5f9',
                color: '#374151',
                border: '1.5px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: (!customKw.trim() || seoKeywords.length >= 8) ? 'not-allowed' : 'pointer',
                opacity: (!customKw.trim() || seoKeywords.length >= 8) ? 0.5 : 1,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              Add
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: seoKeywords.length >= 8 ? '#ef4444' : '#94a3b8', fontWeight: seoKeywords.length >= 8 ? 600 : 400 }}>
              {seoKeywords.length}/8 keywords
            </span>
            <button
              onClick={handleSaveKeywords}
              disabled={seoSaving}
              style={{
                padding: '9px 20px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: seoSaving ? 'not-allowed' : 'pointer',
                opacity: seoSaving ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              {seoSaving ? 'Saving…' : 'Save Keywords'}
            </button>
          </div>
        </div>

        {/* Plan & Usage */}
        <div>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 28,
              border: '1px solid #e2e8f0',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
              Plan &amp; Usage
            </h2>

            {/* Plan badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Current plan</span>
              {isPaid ? (
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary-ink)' }}>
                  {plan === 'yearly' ? 'Yearly ✓' : 'Monthly ✓'}
                </span>
              ) : trialExpired ? (
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: '#fee2e2', color: '#991b1b' }}>
                  Trial Expired
                </span>
              ) : (
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                  Free Trial
                </span>
              )}
            </div>

            {/* Status line */}
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              {isPaid
                ? 'Unlimited review requests'
                : trialExpired
                  ? 'Subscribe to continue collecting reviews.'
                  : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining in your trial`}
            </p>

            <Link
              to="/billing"
              style={{
                display: 'block',
                width: '100%',
                padding: '11px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
                transition: 'opacity 0.15s',
              }}
            >
              {isPaid ? 'Manage Billing →' : 'Subscribe Now →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
