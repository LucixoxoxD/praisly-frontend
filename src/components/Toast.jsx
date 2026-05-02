import { useState, useCallback, createContext, useContext } from 'react'

const ToastCtx = createContext(() => {})

export function useToast() {
  return useContext(ToastCtx)
}

const TOAST_CSS = `
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(100%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(100%); }
  }
  .toast-item { animation: toastIn 0.3s ease forwards; }
  .toast-item.exiting { animation: toastOut 0.3s ease forwards; }
`

const PALETTE = {
  success: { bg: 'white', color: '#065f46', border: '#e2e8f0', accent: '#10b981' },
  error:   { bg: 'white', color: '#991b1b', border: '#e2e8f0', accent: '#ef4444' },
  info:    { bg: 'white', color: '#1e40af', border: '#e2e8f0', accent: '#3b82f6' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((p) => [...p, { id, message, type, exiting: false }])

    // Start exit animation 200ms before removal
    setTimeout(() => {
      setToasts((p) => p.map((t) => t.id === id ? { ...t, exiting: true } : t))
    }, 3000)
    setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id))
    }, 3300)
  }, [])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <style>{TOAST_CSS}</style>
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
          const c = PALETTE[t.type] || PALETTE.success
          return (
            <div
              key={t.id}
              className={`toast-item${t.exiting ? ' exiting' : ''}`}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.accent}`,
                fontSize: 14,
                fontWeight: 500,
                minWidth: 220,
                maxWidth: 340,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              }}
            >
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}
