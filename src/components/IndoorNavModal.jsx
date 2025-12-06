import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import './IndoorNavModal.css'

function IndoorNavModal({ children, onClose, mappedInUrl }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="indoor-nav-overlay" onClick={onClose}>
      <div className="indoor-nav-backdrop"></div>
      <div className="indoor-nav-content" onClick={(e) => e.stopPropagation()}>
        <button className="indoor-nav-close" onClick={onClose} aria-label="Close indoor navigation">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="indoor-nav-header">
          <div className="indoor-nav-title">
            <span className="indoor-nav-icon">🧭</span>
            <h2>Indoor Navigation</h2>
          </div>
          <p className="indoor-nav-subtitle">Explore building interiors with Mappedin</p>
        </div>

        <div className="indoor-nav-iframe-container">
          {mappedInUrl ? (
            <iframe
              src={mappedInUrl}
              className="indoor-nav-iframe"
              title="Mappedin Map"
              name="Mappedin Map"
              allow="clipboard-write 'self' https://app.mappedin.com; web-share 'self' https://app.mappedin.com"
              scrolling="no"
              frameBorder="0"
              loading="lazy"
            />
          ) : (
            <div className="indoor-nav-placeholder">
              <p>Loading indoor map...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IndoorNavModal
