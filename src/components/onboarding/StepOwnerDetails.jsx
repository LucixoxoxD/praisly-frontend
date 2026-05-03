import { useState } from 'react'

const STEP_CSS = `
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
  .ob-input.error { border-color: #dc2626; }
  .lang-radio {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    margin-bottom: 8px;
    font-size: 14px;
    color: #0f172a;
    font-family: inherit;
    background: white;
  }
  .lang-radio:hover { border-color: #10b981; background: #f0fdf4; }
  .lang-radio.selected { border-color: #10b981; background: #f0fdf4; }
`

// const LANGUAGES = [
//   { value: 'hindi', label: 'Hindi', sub: 'Reviews in Hindi' },
//   { value: 'english', label: 'English', sub: 'Reviews in English' },
//   { value: 'both', label: 'Both Hindi & English', sub: 'Customer can choose (recommended)' },
// ]

export default function StepOwnerDetails({ data, onUpdate, onNext, onBack, submitting }) {
  const [name, setName] = useState(data.ownerName || '')
  const [phone, setPhone] = useState(data.phone || '')
  // const [lang, setLang] = useState(data.preferredLanguage || 'both')
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) e.phone = 'Enter a valid 10-digit mobile number'
    return e
  }

  function handleNext() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const patch = { ownerName: name.trim(), phone: phone.replace(/\D/g, ''), preferredLanguage: 'english' }
    onUpdate(patch)      // update parent state for back-navigation
    onNext(patch)        // pass data directly so handleFinish doesn't read stale state
  }

  const canProceed = name.trim() && phone.replace(/\D/g, '').length === 10

  return (
    <div>
      <style>{STEP_CSS}</style>

      <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
        Almost done! A few quick details
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
        We'll use this to personalise review requests sent to your customers.
      </p>

      {/* Owner name */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          Your name
        </label>
        <input
          className={`ob-input${errors.name ? ' error' : ''}`}
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })) }}
          placeholder="e.g. Rahul Sharma"
          autoFocus
        />
        {errors.name && <p style={{ color: '#dc2626', fontSize: 12, margin: '4px 0 0' }}>{errors.name}</p>}
      </div>

      {/* Phone */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          Business WhatsApp number
        </label>
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{
            padding: '10px 12px',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            fontSize: 14,
            color: '#64748b',
            fontWeight: 600,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}>
            +91
          </div>
          <input
            className={`ob-input${errors.phone ? ' error' : ''}`}
            style={{ borderRadius: '0 8px 8px 0' }}
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10)
              setPhone(val)
              setErrors((prev) => ({ ...prev, phone: '' }))
            }}
            placeholder="98765 43210"
            inputMode="numeric"
          />
        </div>
        {errors.phone && <p style={{ color: '#dc2626', fontSize: 12, margin: '4px 0 0' }}>{errors.phone}</p>}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '13px',
            background: 'white',
            color: '#374151',
            border: '1.5px solid #e2e8f0',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed || submitting}
          style={{
            flex: 3,
            padding: '13px',
            background: canProceed && !submitting ? '#10b981' : '#e2e8f0',
            color: canProceed && !submitting ? 'white' : '#94a3b8',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: canProceed && !submitting ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
        >
          {submitting ? 'Saving…' : 'Finish Setup'}
        </button>
      </div>
    </div>
  )
}
