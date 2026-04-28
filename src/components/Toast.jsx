import { useState, useCallback, createContext, useContext } from 'react'

const ToastCtx = createContext(() => {})

export function useToast() {
  return useContext(ToastCtx)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((p) => [...p, { id, message, type }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
  }, [])

  const palette = {
    success: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    error:   { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  }

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const c = palette[t.type] || palette.success
          return (
            <div
              key={t.id}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
                fontSize: 14,
                fontWeight: 500,
                minWidth: 220,
                maxWidth: 340,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                animation: 'toastIn 0.2s ease',
              }}
            >
              {t.message}
            </div>
          )
        })}
      </div>
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </ToastCtx.Provider>
  )
}
