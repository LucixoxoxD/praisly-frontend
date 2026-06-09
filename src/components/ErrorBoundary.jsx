import { Component } from 'react'

/**
 * Catches any render error below it and shows a friendly recovery screen
 * instead of a blank white page.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          background: 'var(--bg, #FAF6EC)',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 44 }}>😕</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink, #1A1610)', margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3, #8A7E72)', margin: 0, maxWidth: 320 }}>
          Don't worry — your data is safe. Just reload the page and you'll be back in.
        </p>
        <button
          onClick={this.handleReload}
          style={{
            marginTop: 8,
            padding: '14px 36px',
            minHeight: 48,
            borderRadius: 100,
            border: 'none',
            background: 'var(--primary, #D89020)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(216,144,32,0.35)',
          }}
        >
          Reload page
        </button>
      </div>
    )
  }
}
