import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#020408', width: '100vw', height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', padding: '20px', textAlign: 'center',
        }}>
          <div style={{ color: '#22d3ee', fontSize: '24px', marginBottom: '12px', fontWeight: 'bold' }}>
            Something went wrong
          </div>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', maxWidth: 400 }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              background: 'linear-gradient(135deg,#22d3ee,#a855f7)',
              color: '#000', border: 'none', padding: '12px 24px',
              borderRadius: '8px', fontSize: '14px',
              fontWeight: 'bold', cursor: 'pointer',
            }}
          >
            Back to Login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
