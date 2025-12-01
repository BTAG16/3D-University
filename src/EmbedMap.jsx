import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dbService } from './lib/dbService'
import MapComponent from './components/Map/MapComponent'
import Modal from './components/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDirections, faMapMarkerAlt, faDoorOpen, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'
import './PublicMap.css'

function EmbedMap() {
  const [searchParams] = useSearchParams()
  const [university, setUniversity] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [buildings, setBuildings] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showDirections, setShowDirections] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [officeRooms, setOfficeRooms] = useState([])
  const mapRef = useRef(null)

  // Automatically get user location on mount
  useEffect(() => {
    const requestLocation = async () => {
      try {
        // Check if we're in an iframe and if permissions are supported
        const isInIframe = window.self !== window.top
        
        if (!('geolocation' in navigator)) {
          console.log('Geolocation not supported')
          return
        }

        // For iframe contexts, check permissions API if available
        if (isInIframe && 'permissions' in navigator) {
          try {
            const result = await navigator.permissions.query({ name: 'geolocation' })
            console.log('Geolocation permission state:', result.state)
            
            if (result.state === 'denied') {
              console.log('Geolocation permission denied by policy')
              return
            }
          } catch (permError) {
            console.log('Permissions API check failed:', permError.message)
          }
        }

        // Attempt to get location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            setUserLocation(location)
            console.log('Location acquired successfully')
          },
          (error) => {
            console.warn('Location access denied or unavailable:', error.message)
            // Don't show alert in iframe context - gracefully degrade
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // Cache for 5 minutes
          }
        )
      } catch (err) {
        console.error('Error requesting location:', err)
      }
    }

    requestLocation()
  }, [])

  // Load university data from Supabase
  useEffect(() => {
    const loadUniversity = async () => {
      const uniId = searchParams.get('uni')
      if (!uniId) {
        setError('University ID is required. Please use the embed code provided by your university.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('Looking for university with ID:', uniId)

        // Try to get by UUID first
        let result = await dbService.getUniversity(uniId)

        // If not found by UUID, try to find by name or get all and search
        if (!result.success) {
          console.log('Not found by ID, trying to find by name...')
          
          const allResult = await dbService.getAllUniversities()
          if (allResult.success && allResult.data) {
            const found = allResult.data.find(u => 
              u.id === uniId || 
              u.name.toLowerCase().replace(/\s+/g, '').includes(uniId.toLowerCase())
            )
            
            if (found) {
              result = await dbService.getUniversity(found.id)
            }
          }
        }

        if (!result.success || !result.data) {
          console.error('University not found:', result.error)
          setError('University not found. Please check the embed code.')
          setLoading(false)
          return
        }

        console.log('Found university:', result.data)
        setUniversity(result.data)
        
        const sortedBuildings = (result.data.buildings || []).sort((a, b) => {
          if (a.is_admin_building && !b.is_admin_building) return -1
          if (!a.is_admin_building && b.is_admin_building) return 1
          return 0
        })
        
        setBuildings(sortedBuildings)
        setLoading(false)
      } catch (err) {
        console.error('Error loading university:', err)
        setError('Failed to load university data. Please try again later.')
        setLoading(false)
      }
    }

    loadUniversity()
  }, [searchParams])

  const handleBuildingClick = async (building) => {
    setSelectedBuilding(building)
    setShowDirections(false)
    setShowModal(true)
    if (mapRef.current?.clearDirections) {
      mapRef.current.clearDirections()
    }
    
    // Load office rooms for this building
    try {
      const result = await dbService.getRooms(building.id)
      if (result.success) {
        const offices = result.data.filter(room => room.is_office)
        setOfficeRooms(offices)
      }
    } catch (err) {
      console.error('Error loading office rooms:', err)
    }
  }

  const handleRequestLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        setUserLocation(location)
        alert('Location acquired! You can now get directions.')
      },
      (error) => {
        let message = 'Unable to get your location. '
        if (error.code === 1) {
          message += 'Please allow location access in your browser settings.'
        } else if (error.code === 2) {
          message += 'Location information is unavailable.'
        } else {
          message += 'Location request timed out.'
        }
        alert(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const handleShowDirections = () => {
    if (!userLocation) {
      if (confirm('Location is required for directions. Would you like to enable location access?')) {
        handleRequestLocation()
      }
      return
    }
    setShowDirections(true)
    setShowModal(false)
  }

  const handleOpenInGoogleMaps = () => {
    if (!selectedBuilding) return
    
    const [lng, lat] = selectedBuilding.coordinates
    let url
    
    if (userLocation) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${lat},${lng}&travelmode=walking`
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    }
    
    window.open(url, '_blank')
  }

  const handleCloseModal = () => {
    setSelectedBuilding(null)
    setShowDirections(false)
    setShowModal(false)
    if (mapRef.current?.clearDirections) {
      mapRef.current.clearDirections()
    }
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c
    return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`
  }

  const getFullMapUrl = () => {
    return `${window.location.origin}/map?uni=${searchParams.get('uni')}`
  }

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '20px'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading map...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="public-map-error" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: 20 }}>Error</h1>
        <div>{error}</div>
      </div>
    )
  }

  if (!university) {
    return <div className="loading">Loading map...</div>
  }

  return (
    <div className="public-map embed-mode">
      {/* Full screen map - no header, no sidebar */}
      <div className="map-container" style={{ height: '100vh', width: '100vw' }}>
        <MapComponent
          ref={mapRef}
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          userLocation={userLocation}
          onBuildingClick={handleBuildingClick}
          showDirections={showDirections}
          destinationCoords={selectedBuilding?.coordinates}
          darkMode={false}
        />

        {/* Floating location button - show if location not available */}
        {!userLocation && (
          <button
            onClick={handleRequestLocation}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.target.style.background = '#0056b3'}
            onMouseOut={(e) => e.target.style.background = '#007bff'}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Enable Location
          </button>
        )}

        {/* Floating watermark/branding */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <strong>{university.name}</strong>
        </div>
      </div>

      {/* Building details modal - only shows when building is clicked */}
      {selectedBuilding && showModal && (
        <Modal onClose={handleCloseModal}>
          <div className="building-details">
            <h2>{selectedBuilding.name}</h2>
            <p className="building-category">{selectedBuilding.category}</p>
            
            {selectedBuilding.description && (
              <p className="building-description">{selectedBuilding.description}</p>
            )}

            {/* Summarized key information */}
            <div className="embed-summary">
              {officeRooms.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <FontAwesomeIcon icon={faDoorOpen} />
                    Key Offices
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {officeRooms.slice(0, 3).map((office) => (
                      <li key={office.id} style={{ marginBottom: '8px' }}>
                        <strong>{office.room_name}</strong> - {office.room_number}
                      </li>
                    ))}
                    {officeRooms.length > 3 && (
                      <li style={{ fontStyle: 'italic', color: '#666' }}>
                        +{officeRooms.length - 3} more offices
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {selectedBuilding.facilities && selectedBuilding.facilities.length > 0 && (
                <div className="detail-section">
                  <h3>Key Facilities</h3>
                  <p>{selectedBuilding.facilities.slice(0, 3).join(', ')}
                    {selectedBuilding.facilities.length > 3 && ` +${selectedBuilding.facilities.length - 3} more`}
                  </p>
                </div>
              )}

              {selectedBuilding.hours && (
                <div className="detail-section">
                  <h3>Hours</h3>
                  <p>{selectedBuilding.hours}</p>
                </div>
              )}

              {userLocation && (
                <div className="detail-section">
                  <h3>Distance</h3>
                  <p>
                    {calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      selectedBuilding.coordinates[1],
                      selectedBuilding.coordinates[0]
                    )} from your location
                  </p>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="navigation-buttons" style={{ marginTop: '20px' }}>
              <button 
                className="btn-navigation btn-show-directions"
                onClick={handleShowDirections}
                disabled={!userLocation}
              >
                <FontAwesomeIcon icon={faDirections} />
                <span>Show Directions</span>
              </button>
              <button 
                className="btn-navigation btn-google-maps"
                onClick={handleOpenInGoogleMaps}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>Google Maps</span>
              </button>
            </div>

            {/* Link to full map */}
            <div style={{
              marginTop: '25px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #007bff',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                Want to explore more features like searching buildings, viewing all rooms, and getting detailed information?
              </p>
              <a 
                href={getFullMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} style={{ marginRight: '8px' }} />
                Open Full Interactive Map
              </a>
            </div>
          </div>
        </Modal>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .embed-mode .public-header,
        .embed-mode .search-container,
        .embed-mode .public-sidebar,
        .embed-mode .mobile-actions {
          display: none !important;
        }
        
        .embed-mode .map-container {
          height: 100vh !important;
          width: 100vw !important;
        }
        
        .embed-summary .detail-section {
          margin-bottom: 15px;
        }
        
        .embed-summary h3 {
          font-size: 14px;
          margin-bottom: 8px;
          color: #333;
        }
      `}</style>
    </div>
  )
}

export default EmbedMap
