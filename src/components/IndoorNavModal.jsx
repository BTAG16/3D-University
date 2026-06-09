import { useEffect } from 'react'
import { Icon } from '../icons'

const DARK  = { surface: '#111114', surface2: '#18181C', border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.92)', textDim: 'rgba(255,255,255,0.5)', shadow: 'rgba(0,0,0,0.6)' }
const LIGHT = { surface: '#FFFFFF', surface2: '#F1F5F9', border: 'rgba(0,0,0,0.08)', border2: 'rgba(0,0,0,0.14)', text: '#0F172A', textDim: '#475569', shadow: 'rgba(0,0,0,0.18)' }

function IndoorNavModal({ onClose, mappedInUrl, dark = false }) {
  const D = dark ? DARK : LIGHT

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'indoorFadeIn 0.2s ease',
      }}
    >
      {/* backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />

      {/* panel */}
      <div
        className="indoor-nav-panel"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%', maxWidth: 900,
          height: 'min(88vh, 620px)',
          background: D.surface,
          border: `1px solid ${D.border2}`,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: `0 24px 72px ${D.shadow}`,
          animation: 'indoorSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          borderBottom: `1px solid ${D.border}`,
          background: D.surface2,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(14,165,233,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="compass" size={18} color="#0EA5E9" />
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: D.text, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Indoor Navigation
            </div>
            <div style={{ fontSize: 11, color: D.textDim, marginTop: 2 }}>
              Powered by Mappedin
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 'auto', flexShrink: 0,
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent',
              border: `1px solid ${D.border}`,
              color: D.textDim, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="x" size={14} color={D.textDim} />
          </button>
        </div>

        {/* content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: dark ? '#0A0A0C' : '#F8FAFC' }}>
          {mappedInUrl ? (
            <iframe
              src={mappedInUrl}
              title="Indoor Map"
              allow="clipboard-write 'self' https://app.mappedin.com; web-share 'self' https://app.mappedin.com"
              scrolling="no"
              frameBorder="0"
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: D.textDim }}>
              <Icon name="loader" size={24} color={D.textDim} />
              <span style={{ fontSize: 13 }}>Loading indoor map…</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes indoorFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes indoorSlideUp { from { transform: scale(0.96) translateY(16px); opacity: 0 } to { transform: scale(1) translateY(0); opacity: 1 } }
        @media (max-width: 600px) {
          .indoor-nav-panel { border-radius: 12px !important; height: calc(100dvh - 32px) !important; }
        }
      `}</style>
    </div>
  )
}

export default IndoorNavModal
