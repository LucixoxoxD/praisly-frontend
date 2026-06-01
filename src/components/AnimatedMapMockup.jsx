import { useState, useEffect } from 'react'

const SEARCH_TEXT = 'best salon near me'
const CYCLE_MS = 8000
const MAX_CYCLES = 2

const STYLES = `
@keyframes amm-typewriter {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes amm-slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes amm-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes amm-pulseBadge {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes amm-fadeOutAll {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`

const results = [
  { name: 'Luxe Hair Studio', rating: '4.8', reviews: '312', dist: '0.3 km', open: true },
  { name: 'Radiance Beauty Bar', rating: '4.6', reviews: '189', dist: '0.5 km', open: true },
  { name: 'Glamour Cuts & Spa', rating: '4.5', reviews: '147', dist: '0.8 km', open: true },
]

const yourResult = { name: 'Your Salon', rating: '4.7', reviews: '23', dist: '2.1 km', open: false }

function Stars({ rating, gray }) {
  const full = Math.floor(Number(rating))
  const half = Number(rating) % 1 >= 0.4
  const color = gray ? '#bdbdbd' : '#f4b400'
  return (
    <span style={{ fontSize: 11, letterSpacing: 1, color, lineHeight: 1 }}>
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  )
}

function ResultRow({ index, label, r, delay, gray, frozen }) {
  const baseAnim = gray
    ? `amm-fadeIn 0.6s ease-out ${delay}s both`
    : `amm-slideIn 0.4s ease-out ${delay}s both`
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
      borderBottom: '1px solid #e8eaed',
      opacity: frozen ? 1 : 0,
      ...(frozen ? {} : { animation: baseAnim }),
      ...(gray ? { filter: 'grayscale(0.6)' } : {}),
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 8, flexShrink: 0,
        background: gray ? '#e0e0e0' : `hsl(${index * 90 + 20}, 45%, 82%)`,
        display: 'grid', placeItems: 'center',
        fontSize: 13, fontWeight: 700, color: gray ? '#9e9e9e' : '#5f6368',
      }}>
        {gray ? '#8' : label}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600,
          color: gray ? '#9e9e9e' : '#202124',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {r.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: gray ? '#bdbdbd' : '#202124' }}>{r.rating}</span>
          <Stars rating={r.rating} gray={gray} />
          <span style={{ fontSize: 11.5, color: gray ? '#bdbdbd' : '#70757a' }}>({r.reviews})</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 11.5 }}>
          {r.open && !gray && <span style={{ color: '#188038', fontWeight: 600 }}>Open</span>}
          {gray && <span style={{ color: '#bdbdbd' }}>Open</span>}
          <span style={{ color: gray ? '#bdbdbd' : '#70757a' }}>{r.dist}</span>
        </div>
      </div>
    </div>
  )
}

function MapArea({ delay, frozen }) {
  return (
    <div style={{
      height: 120, position: 'relative', overflow: 'hidden',
      opacity: frozen ? 1 : 0,
      ...(frozen ? {} : { animation: `amm-fadeIn 0.5s ease-out ${delay}s both` }),
    }}>
      <svg viewBox="0 0 380 120" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <pattern id="amm-grid" width="38" height="38" patternUnits="userSpaceOnUse">
            <rect width="38" height="38" fill="#e8f5e9" />
            <line x1="0" y1="38" x2="38" y2="38" stroke="#d4e8d4" strokeWidth="0.5" />
            <line x1="38" y1="0" x2="38" y2="38" stroke="#d4e8d4" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="380" height="120" fill="url(#amm-grid)" />

        {/* Parks / green patches */}
        <rect x="20" y="10" width="55" height="35" rx="6" fill="#c8e6c9" opacity="0.7" />
        <rect x="290" y="75" width="70" height="35" rx="6" fill="#c8e6c9" opacity="0.5" />
        <ellipse cx="200" cy="95" rx="30" ry="18" fill="#c8e6c9" opacity="0.4" />

        {/* Water body */}
        <ellipse cx="330" cy="25" rx="40" ry="20" fill="#bbdefb" opacity="0.5" />

        {/* Major roads */}
        <line x1="0" y1="58" x2="380" y2="58" stroke="#fff" strokeWidth="5" />
        <line x1="0" y1="58" x2="380" y2="58" stroke="#e0e0e0" strokeWidth="4" />
        <line x1="0" y1="57" x2="380" y2="57" stroke="#fff" strokeWidth="1.5" strokeDasharray="6 8" />

        <line x1="140" y1="0" x2="155" y2="120" stroke="#fff" strokeWidth="4" />
        <line x1="140" y1="0" x2="155" y2="120" stroke="#e0e0e0" strokeWidth="3" />

        {/* Minor roads */}
        <line x1="0" y1="88" x2="380" y2="82" stroke="#e8e8e8" strokeWidth="2" />
        <line x1="0" y1="28" x2="120" y2="25" stroke="#e8e8e8" strokeWidth="2" />
        <line x1="250" y1="0" x2="240" y2="60" stroke="#e8e8e8" strokeWidth="2" />
        <line x1="80" y1="60" x2="90" y2="120" stroke="#e8e8e8" strokeWidth="1.5" />
        <line x1="310" y1="55" x2="320" y2="120" stroke="#e8e8e8" strokeWidth="1.5" />

        {/* Buildings */}
        <rect x="160" y="15" width="18" height="14" rx="2" fill="#e0e0e0" opacity="0.6" />
        <rect x="185" y="20" width="12" height="10" rx="1" fill="#e0e0e0" opacity="0.5" />
        <rect x="160" y="65" width="22" height="16" rx="2" fill="#e0e0e0" opacity="0.5" />
        <rect x="100" y="65" width="15" height="12" rx="2" fill="#e0e0e0" opacity="0.4" />
        <rect x="260" y="35" width="14" height="18" rx="2" fill="#e0e0e0" opacity="0.5" />
        <rect x="55" y="65" width="16" height="10" rx="1" fill="#e0e0e0" opacity="0.4" />
        <rect x="220" y="70" width="20" height="12" rx="2" fill="#e0e0e0" opacity="0.4" />

        {/* Pin shadows */}
        <ellipse cx="95" cy="50" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />
        <ellipse cx="200" cy="50" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />
        <ellipse cx="310" cy="46" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />

        {/* Pin A */}
        <g transform="translate(95, 28)">
          <path d="M0,-18 C-10,-18 -14,-10 -14,-4 C-14,6 0,14 0,14 C0,14 14,6 14,-4 C14,-10 10,-18 0,-18Z" fill="#ea4335" />
          <circle cx="0" cy="-5" r="5.5" fill="white" />
          <text y="-2" textAnchor="middle" fill="#ea4335" fontSize="9" fontWeight="800" fontFamily="Arial,sans-serif">A</text>
        </g>
        {/* Pin B */}
        <g transform="translate(200, 28)">
          <path d="M0,-18 C-10,-18 -14,-10 -14,-4 C-14,6 0,14 0,14 C0,14 14,6 14,-4 C14,-10 10,-18 0,-18Z" fill="#ea4335" />
          <circle cx="0" cy="-5" r="5.5" fill="white" />
          <text y="-2" textAnchor="middle" fill="#ea4335" fontSize="9" fontWeight="800" fontFamily="Arial,sans-serif">B</text>
        </g>
        {/* Pin C */}
        <g transform="translate(310, 24)">
          <path d="M0,-18 C-10,-18 -14,-10 -14,-4 C-14,6 0,14 0,14 C0,14 14,6 14,-4 C14,-10 10,-18 0,-18Z" fill="#ea4335" />
          <circle cx="0" cy="-5" r="5.5" fill="white" />
          <text y="-2" textAnchor="middle" fill="#ea4335" fontSize="9" fontWeight="800" fontFamily="Arial,sans-serif">C</text>
        </g>
      </svg>
    </div>
  )
}

export default function AnimatedMapMockup() {
  const [cycle, setCycle] = useState(0)
  const stopped = cycle >= MAX_CYCLES

  useEffect(() => {
    if (stopped) return
    const id = setTimeout(() => setCycle(c => c + 1), CYCLE_MS)
    return () => clearTimeout(id)
  }, [cycle, stopped])

  const isFinal = stopped
  const fadeOut = !isFinal
    ? `amm-fadeOutAll 0.6s ease-in 7s both`
    : 'none'

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div
          key={cycle}
          style={{
            width: '100%', maxWidth: 380,
            background: 'white', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: fadeOut,
          }}
        >
          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderBottom: '1px solid #e8eaed',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <div style={{
              flex: 1, height: 36, borderRadius: 18,
              background: '#f1f3f4', display: 'flex', alignItems: 'center',
              padding: '0 14px', overflow: 'hidden',
            }}>
              <div style={{
                whiteSpace: 'nowrap', overflow: 'hidden',
                ...(isFinal
                  ? { width: '100%' }
                  : { width: 0, animation: `amm-typewriter 1.3s steps(${SEARCH_TEXT.length}) 0.2s both` }
                ),
                fontSize: 14, color: '#202124',
              }}>
                {SEARCH_TEXT}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          </div>

          {/* Map */}
          <MapArea delay={1.5} frozen={isFinal} />

          {/* Results header */}
          <div style={{
            padding: '10px 14px 4px', fontSize: 13, fontWeight: 600,
            color: '#202124',
            opacity: isFinal ? 1 : 0,
            ...(isFinal ? {} : { animation: 'amm-fadeIn 0.3s ease-out 1.8s both' }),
          }}>
            Top results
          </div>

          {/* Competitor results */}
          {results.map((r, i) => (
            <ResultRow
              key={i}
              index={i}
              label={String.fromCharCode(65 + i)}
              r={r}
              delay={2 + i * 0.4}
              frozen={isFinal}
            />
          ))}

          {/* More places */}
          <div style={{
            padding: '8px 14px', fontSize: 12, color: '#1a73e8', fontWeight: 600,
            opacity: isFinal ? 1 : 0,
            ...(isFinal ? {} : { animation: 'amm-fadeIn 0.3s ease-out 3.2s both' }),
          }}>
            More places ▾
          </div>

          {/* Divider */}
          <div style={{
            height: 6, background: '#f1f3f4',
            opacity: isFinal ? 1 : 0,
            ...(isFinal ? {} : { animation: 'amm-fadeIn 0.3s ease-out 3.4s both' }),
          }} />

          {/* Your result — grayed out */}
          <ResultRow
            index={7}
            label="#8"
            r={yourResult}
            delay={3.6}
            gray
            frozen={isFinal}
          />

          {/* Buried badge */}
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '8px 14px 14px',
            opacity: isFinal ? 1 : 0,
            ...(isFinal ? {} : { animation: `amm-pulseBadge 0.5s ease-out 4.2s both` }),
          }}>
            <span style={{
              background: '#fce8e6', color: '#c5221f',
              fontSize: 12, fontWeight: 700,
              padding: '5px 14px', borderRadius: 12,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
              Buried on page 2
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
