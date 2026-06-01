import { useState, useEffect } from 'react'

const SEARCH_TEXT = 'best salon near me'
const CYCLE_MS = 8000

const STYLES = `
@keyframes amm-typewriter {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes amm-blink {
  0%, 100% { border-color: transparent; }
  50% { border-color: #5f6368; }
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

function ResultRow({ index, label, r, delay, gray }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
      borderBottom: '1px solid #e8eaed',
      opacity: 0,
      animation: `amm-slideIn 0.4s ease-out ${delay}s both`,
      ...(gray ? { filter: 'grayscale(1)', opacity: 0 } : {}),
      ...(gray ? { animation: `amm-fadeIn 0.6s ease-out ${delay}s both`, filter: 'grayscale(0.6)' } : {}),
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

function MapArea({ delay }) {
  return (
    <div style={{
      height: 110, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 40%, #fff9c4 100%)',
      opacity: 0,
      animation: `amm-fadeIn 0.5s ease-out ${delay}s both`,
    }}>
      <svg viewBox="0 0 380 110" style={{ width: '100%', height: '100%' }}>
        {/* Roads */}
        <line x1="0" y1="55" x2="380" y2="55" stroke="#dadce0" strokeWidth="3" />
        <line x1="0" y1="85" x2="380" y2="75" stroke="#dadce0" strokeWidth="2" />
        <line x1="120" y1="0" x2="140" y2="110" stroke="#dadce0" strokeWidth="2" />
        <line x1="280" y1="0" x2="260" y2="110" stroke="#dadce0" strokeWidth="2" />
        {/* Pin A */}
        <g transform="translate(95, 28)">
          <path d="M0,-18 C-10,-18 -14,-10 -14,-4 C-14,6 0,14 0,14 C0,14 14,6 14,-4 C14,-10 10,-18 0,-18Z" fill="#ea4335" />
          <text y="-3" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Arial,sans-serif">A</text>
        </g>
        {/* Pin B */}
        <g transform="translate(200, 42)">
          <path d="M0,-18 C-10,-18 -14,-10 -14,-4 C-14,6 0,14 0,14 C0,14 14,6 14,-4 C14,-10 10,-18 0,-18Z" fill="#ea4335" />
          <text y="-3" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Arial,sans-serif">B</text>
        </g>
        {/* Pin C */}
        <g transform="translate(310, 35)">
          <path d="M0,-18 C-10,-18 -14,-10 -14,-4 C-14,6 0,14 0,14 C0,14 14,6 14,-4 C14,-10 10,-18 0,-18Z" fill="#ea4335" />
          <text y="-3" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Arial,sans-serif">C</text>
        </g>
      </svg>
    </div>
  )
}

export default function AnimatedMapMockup() {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCycle(c => c + 1), CYCLE_MS)
    return () => clearInterval(id)
  }, [])

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
            animation: `amm-fadeOutAll 0.6s ease-in ${7}s both`,
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
                width: 0,
                animation: `amm-typewriter 1.3s steps(${SEARCH_TEXT.length}) 0.2s both`,
                borderRight: '2px solid transparent',
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
          <MapArea delay={1.5} />

          {/* Results header */}
          <div style={{
            padding: '10px 14px 4px', fontSize: 13, fontWeight: 600,
            color: '#202124',
            opacity: 0, animation: 'amm-fadeIn 0.3s ease-out 1.8s both',
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
            />
          ))}

          {/* More places */}
          <div style={{
            padding: '8px 14px', fontSize: 12, color: '#1a73e8', fontWeight: 600,
            opacity: 0, animation: 'amm-fadeIn 0.3s ease-out 3.2s both',
          }}>
            More places ▾
          </div>

          {/* Divider */}
          <div style={{
            height: 6, background: '#f1f3f4',
            opacity: 0, animation: 'amm-fadeIn 0.3s ease-out 3.4s both',
          }} />

          {/* Your result — grayed out */}
          <ResultRow
            index={7}
            label="#8"
            r={yourResult}
            delay={3.6}
            gray
          />

          {/* Buried badge */}
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '8px 14px 14px',
            opacity: 0, animation: `amm-pulseBadge 0.5s ease-out 4.2s both`,
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
