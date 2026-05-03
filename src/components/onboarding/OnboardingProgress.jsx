const STEPS = ['Google Business', 'Your Details', 'Done']

export default function OnboardingProgress({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      {STEPS.map((label, i) => {
        const num = i + 1
        const done = current > num
        const active = current === num
        return (
          <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Connector line before (not on first) */}
            {i > 0 && (
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: done || active ? '#10b981' : '#e2e8f0',
                  transition: 'background 0.3s ease',
                }}
              />
            )}
            {/* Dot + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  background: done ? '#10b981' : active ? '#0f172a' : '#f1f5f9',
                  color: done || active ? 'white' : '#94a3b8',
                  border: active ? '2px solid #10b981' : '2px solid transparent',
                }}
              >
                {done ? '✓' : num}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#0f172a' : done ? '#10b981' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
