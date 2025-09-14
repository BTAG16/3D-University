import PropTypes from 'prop-types'
import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'

const Marker = ({ feature, map, children, onMarkerClick }) => {
  const markerRef = useRef()
  const markerEl = useRef()
  const popupEl = useRef()
  const [active, setActive] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handlePopupOpen = useCallback(() => {
    setActive(true)
  }, [])

  const handlePopupClose = useCallback(() => {
    setActive(false)
  }, [])

  const handleMarkerClick = useCallback((e) => {
  e.stopPropagation()

  if (map && feature) {
    // Move camera directly here
    const [lng, lat] = feature.geometry.coordinates
    map.flyTo({
      center: [lng, lat],
      zoom: 18,
      pitch: 60,
      bearing: map.getBearing(),
      speed: 1.2,
      curve: 1.5,
      essential: true
    })

    // Toggle popup after move
    const onMoveEnd = () => {
      if (markerRef.current && markerRef.current.getPopup()) {
        markerRef.current.togglePopup()
      }
      map.off('moveend', onMoveEnd)
    }

    map.on('moveend', onMoveEnd)
  }
}, [map, feature])



  const handleMarkerHover = useCallback((isEntering) => {
    setIsHovered(isEntering)
    setShowTooltip(isEntering)
  }, [])

  // Create minimal marker element with no external CSS dependencies
  const createMarkerElement = useCallback(() => {
    const el = document.createElement('div')
    
    const { name, category } = feature.properties
    
    // Get category icon
    const getCategoryIcon = (category) => {
      const iconMap = {
        'Academic': 'fa-graduation-cap',
        'Engineering': 'fa-cogs',
        'Student Services': 'fa-users',
        'Academic Support': 'fa-book',
        'Library': 'fa-book-open',
        'Recreation': 'fa-dumbbell',
        'Administration': 'fa-building',
        'Research': 'fa-flask',
        'Laboratory': 'fa-microscope',
        'University Building': 'fa-university'
      }
      return iconMap[category] || 'fa-building'
    }

    el.innerHTML = `
      <div style="
        position: relative;
        width: 30px;
        height: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        pointer-events: auto;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        ">
          <i class="fas ${getCategoryIcon(category)}" style="
            color: white;
            font-size: 12px;
            transform: rotate(45deg);
          "></i>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 10px solid #1d4ed8;
          margin-top: -2px;
        "></div>
        <div style="
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(148, 163, 184, 0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10;
        " class="marker-tooltip">
          <div style="font-weight: 600; margin-bottom: 2px;">${name}</div>
          <div style="color: #06b6d4; font-size: 11px;">${category}</div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid rgba(15, 23, 42, 0.95);
          "></div>
        </div>
      </div>
    `

    // Set minimal container styles directly
    el.style.cssText = `
      position: absolute !important;
      transform-origin: center bottom !important;
      z-index: 1 !important;
    `

    // Add event listeners
    el.addEventListener('click', handleMarkerClick)
    el.addEventListener('mouseenter', () => handleMarkerHover(true))
    el.addEventListener('mouseleave', () => handleMarkerHover(false))
    
    // Add keyboard support
    el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', `View ${name} details`)
    
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleMarkerClick(e)
      }
    })

    return el
  }, [feature, handleMarkerClick, handleMarkerHover])

  // Initialize marker with precise positioning
  useEffect(() => {
    if (!map || !feature) return

    const markerElement = createMarkerElement()
    markerEl.current = markerElement

    // Create marker with bottom anchor and no offset
    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'bottom',
      offset: [0, 0]
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
    }
  }, [feature, map, createMarkerElement])

  // Update marker visual state based on hover and active states
  useEffect(() => {
    if (markerEl.current) {
      const element = markerEl.current
      const tooltip = element.querySelector('.marker-tooltip')
      const pinHead = element.querySelector('div > div')
      
      if (isHovered || showTooltip) {
        // Show tooltip
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.style.transform = 'translateX(-50%) translateY(-4px)'
        }
        // Scale up pin
        if (pinHead) {
          pinHead.style.transform = 'rotate(-45deg) scale(1.1)'
          pinHead.style.boxShadow = '0 4px 16px rgba(6, 182, 212, 0.4)'
        }
        // Scale up container
        element.firstElementChild.style.transform = 'scale(1.1)'
      } else {
        // Hide tooltip
        if (tooltip) {
          tooltip.style.opacity = '0'
          tooltip.style.transform = 'translateX(-50%) translateY(0)'
        }
        // Reset pin
        if (pinHead) {
          pinHead.style.transform = 'rotate(-45deg) scale(1)'
          pinHead.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        }
        // Reset container
        element.firstElementChild.style.transform = 'scale(1)'
      }
    }
  }, [isHovered, showTooltip, active])

  // Handle popup
  useEffect(() => {
    const marker = markerRef.current
    if (!marker || !children) return

    let popup

    if (children) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        closeOnMove: false,
        maxWidth: '340px',
        offset: [0, -45],
        className: 'marker-popup'
      })
        .setDOMContent(popupEl.current)
        .on('open', handlePopupOpen)
        .on('close', handlePopupClose)
    }

    marker.setPopup(popup)

    return () => {
      if (popup) {
        popup.remove()
      }
    }
  }, [children, handlePopupOpen, handlePopupClose])

  if (!feature) return null

  return (
    <div ref={popupEl}>
      {children}
    </div>
  )
}

Marker.propTypes = {
  children: PropTypes.node,
  feature: PropTypes.shape({
    geometry: PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired
    }).isRequired,
    properties: PropTypes.shape({
      name: PropTypes.string.isRequired,
      category: PropTypes.string
    }).isRequired
  }).isRequired,
  map: PropTypes.object.isRequired,
  onMarkerClick: PropTypes.func,
  moveToFeature: PropTypes.func
}

export default Marker