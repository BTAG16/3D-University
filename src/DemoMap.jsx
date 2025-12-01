import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import Modal from './components/Modal'
import BuildingForm from './components/BuildingForm'
import RoomsList from './components/RoomsList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMapMarkedAlt, faList, faLocationArrow, faBars, faTimes,
  faDirections, faMapMarkerAlt, faPlus, faArrowLeft, faLightbulb,
  faEdit, faTrash, faDoorOpen, faSun
} from '@fortawesome/free-solid-svg-icons'
import { getOfficeRoomsForBuilding } from './demoRoomsData'
import './DemoMap.css'

function DemoMap() {
  const navigate = useNavigate()
  
  // Demo buildings - 3 pre-loaded buildings
  const initialDemoBuildings = [
  {
    id: 'demo-admin',
    name: 'Administration Building',
    coordinates: [19.054707436918342, 47.495248233157284], // Budapest City Hall
    category: 'Administration',
    description: 'Main administrative offices including Registrar, Financial Aid, and Student Services',
    facilities: ['WiFi', 'Student Services', 'Registrar Office', 'Financial Aid'],
    departments: ['Administration', 'Student Affairs'],
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    isAdminBuilding: true,
    keyOffices: [
      {
        id: '1',
        name: "Registrar's Office",
        purpose: 'Course registration and transcripts',
        hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
        roomNumber: 'Room 101'
      }
    ]
  },
  {
    id: 'demo-library',
    name: 'University Library',
    coordinates: [19.05693798689157, 47.49267737360714], // ELTE University Library
    category: 'Library',
    description: 'Central library with study spaces, computer labs, and extensive book collection',
    facilities: ['WiFi', 'Computer Lab', 'Study Rooms', 'Cafe', 'Printing Services'],
    departments: ['Library Services', 'Academic Resources'],
    hours: 'Mon-Thu: 7:00 AM - 11:00 PM, Fri: 7:00 AM - 8:00 PM',
    isAdminBuilding: false,
    keyOffices: [
      {
        id: '1',
        name: 'Reference Desk',
        purpose: 'Research assistance and library help',
        hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
        roomNumber: 'First Floor'
      }
    ]
  },
  {
    id: 'demo-dormitory',
    name: 'Student Dormitory',
    coordinates: [19.053028697400013, 47.473191215229704], // Schönherz Dormitory
    category: 'Residence',
    description: 'On-campus housing with modern amenities and common areas',
    facilities: ['WiFi', 'Laundry', 'Common Room', 'Study Lounge', '24/7 Security'],
    departments: ['Housing', 'Residential Life'],
    hours: '24/7 Access for Residents',
    isAdminBuilding: false,
    keyOffices: [
      {
        id: '1',
        name: 'Resident Advisor Office',
        purpose: 'Dormitory support and assistance',
        hours: 'Available 24/7',
        roomNumber: 'First Floor Lobby'
      }
    ]
  }
]


  const [buildings, setBuildings] = useState(() => {
    // Load from sessionStorage for persistence during demo session
    const saved = sessionStorage.getItem('demoBuildings')
    return saved ? JSON.parse(saved) : initialDemoBuildings
  })
  
  const [userAddedBuilding, setUserAddedBuilding] = useState(() => {
    return sessionStorage.getItem('demoUserAddedBuilding') === 'true'
  })
  
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBuildings, setFilteredBuildings] = useState(buildings)
  const [isMobile, setIsMobile] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showModal, setShowModal] = useState(true)
  const [showBuildingForm, setShowBuildingForm] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [showDemoInfo, setShowDemoInfo] = useState(true)
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

  useEffect(() => {
    if (searchQuery) {
      const filtered = buildings.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.departments?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.facilities?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredBuildings(filtered)
    } else {
      setFilteredBuildings(buildings)
    }
  }, [searchQuery, buildings])

  // Save buildings to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('demoBuildings', JSON.stringify(buildings))
  }, [buildings])

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

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building)
    setShowDirections(false)
    setShowModal(true)
    setShowRoomsList(false)
    
    // Load office rooms for this building from demo data
    const offices = getOfficeRoomsForBuilding(building.id)
    setOfficeRooms(offices)
    
    if (mapRef.current?.clearDirections) {
      mapRef.current.clearDirections()
    }
    if (isMobile) {
      setShowSidebar(false)
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

  const handleAddBuilding = () => {
    if (userAddedBuilding) {
      alert('Demo mode allows only 1 test building. You have already added your test building!')
      return
    }
    setEditingBuilding(null)
    setShowBuildingForm(true)
    setShowDemoInfo(false)
  }

  const handleEditBuilding = (building) => {
    // Only allow editing user's added building
    if (!building.id.startsWith('demo-')) {
      setEditingBuilding(building)
      setShowBuildingForm(true)
      setShowDemoInfo(false)
    } else {
      alert('Demo buildings cannot be edited. You can only edit your test building!')
    }
  }

  const handleSaveBuilding = (buildingData) => {
    if (editingBuilding) {
      // Update existing building
      setBuildings(prev => prev.map(b => 
        b.id === editingBuilding.id 
          ? { ...buildingData, id: editingBuilding.id }
          : b
      ))
      setShowBuildingForm(false)
      setEditingBuilding(null)
    } else {
      // Add new building - only allow if user hasn't added one yet
      if (userAddedBuilding) {
        alert('Demo mode allows only 1 test building!')
        return
      }
      
      const newBuilding = {
        ...buildingData,
        id: `user-${Date.now()}`
      }
      
      setBuildings(prev => [...prev, newBuilding])
      setUserAddedBuilding(true)
      sessionStorage.setItem('demoUserAddedBuilding', 'true')
      setShowBuildingForm(false)
    }
  }

  const handleDeleteBuilding = (buildingId) => {
    // Only allow deleting user's added building
    if (buildingId.startsWith('demo-')) {
      alert('Demo buildings cannot be deleted!')
      return
    }
    
    if (window.confirm('Delete this building?')) {
      setBuildings(prev => prev.filter(b => b.id !== buildingId))
      setUserAddedBuilding(false)
      sessionStorage.setItem('demoUserAddedBuilding', 'false')
      if (selectedBuilding?.id === buildingId) {
        setSelectedBuilding(null)
      }
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

  return (
    <div className="demo-map">
      {/* Demo Info Banner */}
      {showDemoInfo && (
        <div className="demo-info-banner">
          <div className="demo-info-content">
            <FontAwesomeIcon icon={faLightbulb} className="demo-icon" />
            <div className="demo-text">
              <strong>Demo Mode:</strong> Explore our platform with 3 pre-loaded buildings. You can add 1 test building to try the full experience!
            </div>
            <button className="btn-close-demo-info" onClick={() => setShowDemoInfo(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <header className="demo-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <FontAwesomeIcon icon={faMapMarkedAlt} className="header-icon" />
          <div className="header-text">
            <h1>Campus Explorer Demo</h1>
            <p>Demo University · Interactive Tour</p>
          </div>
        </div>
        <div className="header-actions">
          {!isMobile && (
            <>
              <button className="btn-header" onClick={handleGetLocation}>
                <FontAwesomeIcon icon={faLocationArrow} />
                My Location
              </button>
              <button className="btn-header btn-add-building" onClick={handleAddBuilding}>
                <FontAwesomeIcon icon={faPlus} />
                Add Building {userAddedBuilding && '(1/1)'}
              </button>
            </>
          )}
          {isMobile && (
            <button className="btn-mobile-menu" onClick={() => setShowSidebar(!showSidebar)}>
              <FontAwesomeIcon icon={showSidebar ? faTimes : faBars} />
            </button>
          )}
        </div>
      </header>

      {!isMobile && (
        <div className="search-container">
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      <div className="demo-content">
        <aside className={`demo-sidebar ${showSidebar ? 'visible' : 'hidden'} ${isMobile ? 'mobile' : ''}`}>
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
                
                const isDemoBuilding = building.id.startsWith('demo-')
                
                return (
                  <div key={building.id} className="building-card-wrapper">
                    <BuildingCard
                      building={building}
                      distance={distance}
                      onClick={() => handleBuildingClick(building)}
                      selected={selectedBuilding?.id === building.id}
                    />
                    {!isDemoBuilding && (
                      <div className="building-actions">
                        <button 
                          className="btn-building-action edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditBuilding(building)
                          }}
                          title="Edit Building"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="btn-building-action delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteBuilding(building.id)
                          }}
                          title="Delete Building"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    )}
                    {isDemoBuilding && (
                      <div className="demo-badge">Demo</div>
                    )}
                  </div>
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
          <button className="mobile-action-btn" onClick={handleAddBuilding}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add {userAddedBuilding && '(1/1)'}</span>
          </button>
        </div>
      )}

      {selectedBuilding && showModal && !showBuildingForm && !showRoomsList && (
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
                // onClick={() => setShowRoomsList(true)}
              >
                <FontAwesomeIcon icon={faDoorOpen} />
                <span>View All Rooms</span>
              </button>
            </div>

            {/* Office Rooms with Timetables */}
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
          </div>
        </Modal>
      )}

      {/* Rooms List Modal - Uses demo data */}
      {selectedBuilding && showRoomsList && (
        <Modal onClose={() => setShowRoomsList(false)}>
          <DemoRoomsList
            buildingId={selectedBuilding.id}
            buildingName={selectedBuilding.name}
            onClose={() => setShowRoomsList(false)}
          />
        </Modal>
      )}

      {/* Building Form Modal */}
      {showBuildingForm && (
        <Modal onClose={() => {
          setShowBuildingForm(false)
          setEditingBuilding(null)
          setShowDemoInfo(true)
        }}>
          <BuildingForm
            building={editingBuilding}
            onSave={handleSaveBuilding}
            onCancel={() => {
              setShowBuildingForm(false)
              setEditingBuilding(null)
              setShowDemoInfo(true)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

// Demo Rooms List Component
function DemoRoomsList({ buildingId, buildingName, onClose }) {
  const { getAllRoomsForBuilding } = require('./demoRoomsData')
  const rooms = getAllRoomsForBuilding(buildingId)
  
  // Sort: offices first, then by room number
  const sortedRooms = rooms.sort((a, b) => {
    if (a.is_office && !b.is_office) return -1
    if (!a.is_office && b.is_office) return 1
    return a.room_number.localeCompare(b.room_number, undefined, { numeric: true })
  })

  return (
    <div className="rooms-list-modal">
      <div className="rooms-list-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faDoorOpen} className="header-icon" />
          <h2>Rooms in {buildingName}</h2>
        </div>
        <button className="btn-close-rooms" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="rooms-list-content">
        {sortedRooms.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faDoorOpen} className="empty-icon" />
            <h3>No Rooms Found</h3>
            <p>This building doesn't have any rooms registered yet.</p>
          </div>
        ) : (
          <>
            <div className="rooms-summary">
              <span className="summary-item">
                <strong>{sortedRooms.length}</strong> Total Rooms
              </span>
              <span className="summary-item">
                <FontAwesomeIcon icon={faDoorOpen} />
                <strong>{sortedRooms.filter(r => r.is_office).length}</strong> Offices
              </span>
            </div>

            <div className="rooms-grid">
              {sortedRooms.map((room) => {
                const RoomTimetable = require('./components/RoomTimetable').default
                return (
                  <div key={room.id} className={`room-card ${room.is_office ? 'office' : ''}`}>
                    <div className="room-card-header">
                      <span className="room-number">{room.room_number}</span>
                      {room.is_office && (
                        <span className="office-badge">
                          <FontAwesomeIcon icon={faDoorOpen} /> Office
                        </span>
                      )}
                    </div>
                    <h4 className="room-name">{room.room_name}</h4>
                    {room.purpose && (
                      <p className="room-purpose">{room.purpose}</p>
                    )}
                    {room.hours && (
                      <p className="room-hours">
                        <strong>Hours:</strong> {room.hours}
                      </p>
                    )}
                    
                    {/* Display timetable if available */}
                    {room.timetable && (
                      <RoomTimetable timetable={room.timetable} />
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DemoMap
