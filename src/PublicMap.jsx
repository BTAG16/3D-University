import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dbService } from './lib/dbService'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import Modal from './components/Modal'
import RoomsList from './components/RoomsList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMapMarkedAlt, faList, faLocationArrow, faSearch, faShareAlt, faBars, faTimes, 
  faDirections, faMapMarkerAlt, faMoon, faSun, faDoorOpen
} from '@fortawesome/free-solid-svg-icons'
import './PublicMap.css'

function PublicMap() {
  const [searchParams] = useSearchParams()
  const [university, setUniversity] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [buildings, setBuildings] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBuildings, setFilteredBuildings] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showModal, setShowModal] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showRoomsList, setShowRoomsList] = useState(false)
  const [officeRooms, setOfficeRooms] = useState([])
  const mapRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setShowSidebar(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load university data from Supabase
  useEffect(() => {
    const loadUniversity = async () => {
      const uniId = searchParams.get('uni')
      if (!uniId) {
        setError('University ID is required. Please use the link provided by your university.')
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
          
          // Get all universities and try to match by old ID or name
          const allResult = await dbService.getAllUniversities()
          if (allResult.success && allResult.data) {
            // Try to find a university that matches
            const found = allResult.data.find(u => 
              u.id === uniId || 
              u.name.toLowerCase().replace(/\s+/g, '').includes(uniId.toLowerCase())
            )
            
            if (found) {
              // Get full details for this university
              result = await dbService.getUniversity(found.id)
            }
          }
        }

        if (!result.success || !result.data) {
          console.error('University not found:', result.error)
          setError(
            <div>
              <p>University not found. The ID might have changed during import.</p>
              <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                Old ID: <code>{uniId}</code>
              </p>
              <button 
                onClick={() => window.location.href = '/universities'}
                style={{
                  marginTop: 15,
                  padding: '8px 16px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                View All Universities
              </button>
            </div>
          )
          setLoading(false)
          return
        }

        console.log('Found university:', result.data)
        setUniversity(result.data)
        
        // Sort buildings - administrative building first
        const sortedBuildings = (result.data.buildings || []).sort((a, b) => {
          if (a.is_admin_building && !b.is_admin_building) return -1
          if (!a.is_admin_building && b.is_admin_building) return 1
          return 0
        })
        
        setBuildings(sortedBuildings)
        setFilteredBuildings(sortedBuildings)
        setLoading(false)
      } catch (err) {
        console.error('Error loading university:', err)
        setError('Failed to load university data. Please try again later.')
        setLoading(false)
      }
    }

    loadUniversity()
  }, [searchParams])

  useEffect(() => {
    const searchBuildings = async () => {
      if (searchQuery) {
        // Search both buildings and rooms
        try {
          const result = await dbService.searchBuildingsAndRooms(searchQuery, university.id)
          if (result.success) {
            // Get unique buildings from both building search and room search
            const buildingIds = new Set()
            const matchedBuildings = []
            
            // Add buildings that match directly
            result.data.buildings?.forEach(b => {
              if (!buildingIds.has(b.id)) {
                buildingIds.add(b.id)
                matchedBuildings.push(b)
              }
            })
            
            // Add buildings that contain matching rooms
            result.data.rooms?.forEach(room => {
              if (room.building_id && !buildingIds.has(room.building_id)) {
                const building = buildings.find(b => b.id === room.building_id)
                if (building) {
                  buildingIds.add(building.id)
                  matchedBuildings.push(building)
                }
              }
            })
            
            setFilteredBuildings(matchedBuildings)
          }
        } catch (err) {
          console.error('Search error:', err)
          // Fallback to basic filtering
          const filtered = buildings.filter(b =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.departments?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
            b.facilities?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
            b.key_offices?.some(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          setFilteredBuildings(filtered)
        }
      } else {
        setFilteredBuildings(buildings)
      }
    }
    
    searchBuildings()
  }, [searchQuery, buildings, university])

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setUserLocation(location)
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleBuildingClick = async (building) => {
    setSelectedBuilding(building)
    setShowDirections(false)
    setShowModal(true)
    setShowRoomsList(false)
    if (mapRef.current?.clearDirections) {
      mapRef.current.clearDirections()
    }
    if (isMobile) {
      setShowSidebar(false)
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

  const handleShowDirections = () => {
    if (!userLocation) {
      alert('Please enable your location first to get directions.')
      handleGetLocation()
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

  const handleCloseDirections = () => {
    setShowDirections(false)
    setSelectedBuilding(null)
    setShowModal(true)
    if (mapRef.current?.clearDirections) {
      mapRef.current.clearDirections()
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${university.name} Campus Map`,
        text: `Explore ${university.name} campus`,
        url: window.location.href
      })
    } else {
      setShowShareModal(true)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
    setShowShareModal(false)
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
    <div className="public-map">
      <header className="public-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faMapMarkedAlt} className="header-icon" />
          <div className="header-text">
            <h1>{university.name}</h1>
            <p>{university.city}</p>
          </div>
        </div>
        <div className="header-actions">
          {!isMobile && (
            <>
              <button className="btn-header" onClick={handleGetLocation}>
                <FontAwesomeIcon icon={faLocationArrow} />
                My Location
              </button>
              <button className="btn-header" onClick={handleShare}>
                <FontAwesomeIcon icon={faShareAlt} />
                Share
              </button>
            </>
          )}
          {isMobile && (
            <>
              <button className="btn-mobile-menu" onClick={() => setShowSidebar(!showSidebar)}>
                <FontAwesomeIcon icon={showSidebar ? faTimes : faBars} />
              </button>
            </>
          )}
        </div>
      </header>

      {!isMobile && (
        <div className="search-container">
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      <div className="public-content">
        <aside className={`public-sidebar ${showSidebar ? 'visible' : 'hidden'} ${isMobile ? 'mobile' : ''}`}>
          {isMobile && (
            <div className="mobile-search">
              <SearchBox value={searchQuery} onChange={setSearchQuery} />
            </div>
          )}

          <div className="sidebar-header">
            <h2>Buildings ({filteredBuildings.length})</h2>
            {isMobile && (
              <button className="btn-close-sidebar" onClick={() => setShowSidebar(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="buildings-list">
            {filteredBuildings.length === 0 ? (
              <p className="empty-message">No buildings found</p>
            ) : (
              filteredBuildings.map((building) => {
                let distance = null
                if (userLocation) {
                  distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    building.coordinates[1],
                    building.coordinates[0]
                  )
                }
                return (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    distance={distance}
                    onClick={() => handleBuildingClick(building)}
                    selected={selectedBuilding?.id === building.id}
                  />
                )
              })
            )}
          </div>
        </aside>

        <div className="map-container">
          <MapComponent
            ref={mapRef}
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            userLocation={userLocation}
            onBuildingClick={handleBuildingClick}
            showDirections={showDirections}
            destinationCoords={selectedBuilding?.coordinates}
            darkMode={darkMode}
          />

          {showDirections && selectedBuilding && (
            <div className="floating-navigation-controls">
              <button 
                className="btn-floating-google-maps"
                onClick={handleOpenInGoogleMaps}
                title="Open in Google Maps"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>Open in Google Maps</span>
              </button>
              <button 
                className="btn-floating-close"
                onClick={handleCloseDirections}
                title="Close directions"
              >
                <FontAwesomeIcon icon={faTimes} />
                <span>Close</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="mobile-actions">
          <button className="mobile-action-btn" onClick={() => setShowSidebar(!showSidebar)}>
            <FontAwesomeIcon icon={showSidebar ? faMapMarkedAlt : faList} />
            <span>{showSidebar ? 'Map' : 'List'}</span>
          </button>
          <button className="mobile-action-btn" onClick={handleGetLocation}>
            <FontAwesomeIcon icon={faLocationArrow} />
            <span>Location</span>
          </button>
          <button className="mobile-action-btn" onClick={handleShare}>
            <FontAwesomeIcon icon={faShareAlt} />
            <span>Share</span>
          </button>
        </div>
      )}

      {selectedBuilding && showModal && !showRoomsList && (
        <Modal onClose={() => {
          setSelectedBuilding(null)
          setShowDirections(false)
          setShowModal(true)
          setShowRoomsList(false)
          if (mapRef.current?.clearDirections) {
            mapRef.current.clearDirections()
          }
        }}>
          <div className="building-details">
            <h2>{selectedBuilding.name}</h2>
            <p className="building-category">{selectedBuilding.category}</p>
            {selectedBuilding.description && (
              <p className="building-description">{selectedBuilding.description}</p>
            )}
            
            <div className="navigation-buttons">
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
                <span>Open in Google Maps</span>
              </button>
              <button 
                className="btn-navigation btn-view-rooms"
                onClick={() => setShowRoomsList(true)}
              >
                <FontAwesomeIcon icon={faDoorOpen} />
                <span>View All Rooms</span>
              </button>
            </div>

            {officeRooms.length > 0 && (
              <div className="detail-section key-offices-section">
                <h3>
                  <FontAwesomeIcon icon={faDoorOpen} />
                  Key Offices ({officeRooms.length})
                </h3>
                <div className="key-offices-list">
                  {officeRooms.map((office) => (
                    <div key={office.id} className="key-office-card">
                      <div className="office-header">
                        <strong>{office.room_name}</strong>
                        <span className="room-number">{office.room_number}</span>
                      </div>
                      {office.purpose && (
                        <p className="office-purpose">{office.purpose}</p>
                      )}
                      {office.hours && (
                        <p className="office-hours">
                          <FontAwesomeIcon icon={faSun} />
                          {office.hours}
                        </p>
                      )}
                      {office.timetable && (
                        <div className="office-timetable-preview">
                          <span className="timetable-badge">
                            <FontAwesomeIcon icon={faSun} />
                            Has Weekly Schedule
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Also show legacy key offices from building data */}
            {selectedBuilding.key_offices && selectedBuilding.key_offices.length > 0 && officeRooms.length === 0 && (
              <div className="detail-section key-offices-section">
                <h3>
                  <FontAwesomeIcon icon={faDoorOpen} />
                  Key Offices ({selectedBuilding.key_offices.length})
                </h3>
                <div className="key-offices-list">
                  {selectedBuilding.key_offices.map((office, idx) => (
                    <div key={idx} className="key-office-card">
                      <div className="office-header">
                        <strong>{office.name}</strong>
                        {office.roomNumber && <span className="room-number">{office.roomNumber}</span>}
                      </div>
                      {office.purpose && (
                        <p className="office-purpose">{office.purpose}</p>
                      )}
                      {office.hours && (
                        <p className="office-hours">
                          <FontAwesomeIcon icon={faSun} />
                          {office.hours}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBuilding.facilities && selectedBuilding.facilities.length > 0 && (
              <div className="detail-section">
                <h3>Facilities</h3>
                <ul>
                  {selectedBuilding.facilities.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedBuilding.departments && selectedBuilding.departments.length > 0 && (
              <div className="detail-section">
                <h3>Departments</h3>
                <ul>
                  {selectedBuilding.departments.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
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
        </Modal>
      )}

      {showShareModal && (
        <Modal onClose={() => setShowShareModal(false)}>
          <div className="share-modal">
            <h2>Share Map</h2>
            <input
              type="text"
              value={window.location.href}
              readOnly
              className="share-input"
            />
            <button className="btn-copy-link" onClick={copyLink}>
              Copy Link
            </button>
          </div>
        </Modal>
      )}

      {selectedBuilding && showRoomsList && (
        <Modal onClose={() => setShowRoomsList(false)}>
          <RoomsList
            buildingId={selectedBuilding.id}
            buildingName={selectedBuilding.name}
            onClose={() => setShowRoomsList(false)}
          />
        </Modal>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PublicMap
