import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './SlideOver.css'

function SlideOver({ title, subtitle, onClose, children }) {
  // Prevent body scroll when slideover is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return createPortal(
    <div className="dr-modal-wrap" onClick={onClose}>
      <div className="dr-slideover" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</h2>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--text-tertiary)', transition: 'all 150ms var(--ease)', background: 'transparent', border: 'none', cursor: 'pointer' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div style={{ padding: '32px 32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SlideOver
