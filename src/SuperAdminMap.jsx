import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { dbService } from './lib/dbService'
import MapComponent from './components/Map/MapComponent'
import SearchBox from './components/SearchBox'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGlobe, faList, faArrowLeft, faSearch, faBars, faTimes,
  faUniversity, faBuilding, faMapMarkedAlt
} from '@fortawesome/free-solid-svg-icons'
import './SuperAdminMap.css'

function SuperAdminMap() {
  const navigate = useNavigate()
  const { adminSession } = useAdminAuth()
  const [universities, setUniversities] = useState([])
  const [displayBuildings, setDisplayBuildings] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUniversities, setFilteredUniversities] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    // Check if super admin is authenticated
    if (!adminSession) {
      navigate('/admin')
      return
    }

    if (!adminSession.user.isSuperAdmin) {
      navigate('/admin/dashboard')
      return
    }

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
  }, [adminSession, navigate])

  useEffect(() => {
    loadUniversities()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = universities.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUniversities(filtered)
    } else {
      setFilteredUniversities(universities)
    }
  }, [searchQuery, universities])

  const loadUniversities = async () => {
    try {
      setLoading(true)
      
      // Get all universities with their buildings from the database
      const universitiesResult = await dbService.getAllUniversities()
      
      if (!universitiesResult.success) {
        console.error('Failed to load universities:', universitiesResult.error)
        setLoading(false)
        return
      }

      const universitiesList = universitiesResult.data || []
      
      // Load detailed data for each university (including buildings)
      const universitiesWithBuildings = await Promise.all(
        universitiesList.map(async (uni) => {
          const detailResult = await dbService.getUniversity(uni.id)
          if (detailResult.success) {
            return detailResult.data
          }
          return uni
        })
      )

      setUniversities(universitiesWithBuildings)
      setFilteredUniversities(universitiesWithBuildings)

      // Create a "building" for each university (using admin building or first building)
      const buildings = universitiesWithBuildings
        .filter(uni => uni.buildings && uni.buildings.length > 0)
        .map(uni => {
          const adminBuilding = uni.buildings.find(b => b.is_admin_building)
          const displayBuilding = adminBuilding || uni.buildings[0]
          
          return {
            id: uni.id,
            name: uni.name,
            category: uni.city,
            coordinates: displayBuilding.coordinates,
            description: `${uni.buildings.length} building${uni.buildings.length !== 1 ? 's' : ''}`,
            universityData: uni,
            isAdminBuilding: displayBuilding.is_admin_building || false
          }
        })

      setDisplayBuildings(buildings)
      setLoading(false)
    } catch (error) {
      console.error('Error loading universities:', error)
      setLoading(false)
    }
  }

  const handleUniversityClick = (building) => {
    setSelectedUniversity(building.universityData)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleViewDashboard = (universityId) => {
    window.open(`/map?uni=${universityId}`, '_blank')
  }

  const handleBackToDashboard = () => {
    navigate('/super-admin/dashboard')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 20
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading global map...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="super-admin-map">
      <header className="map-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBackToDashboard}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <FontAwesomeIcon icon={faGlobe} className="header-icon" />
          <div className="header-text">
            <h1>Global University Map</h1>
            <p>{universities.length} Universities</p>
          </div>
        </div>
        <div className="header-actions">
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

      <div className="map-content">
        <aside className={`map-sidebar ${showSidebar ? 'visible' : 'hidden'} ${isMobile ? 'mobile' : ''}`}>
          {isMobile && (
            <div className="mobile-search">
              <SearchBox value={searchQuery} onChange={setSearchQuery} />
            </div>
          )}

          <div className="sidebar-header">
            <h2>Universities ({filteredUniversities.length})</h2>
            {isMobile && (
              <button className="btn-close-sidebar" onClick={() => setShowSidebar(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="universities-list">
            {filteredUniversities.length === 0 ? (
              <p className="empty-message">No universities found</p>
            ) : (
              filteredUniversities.map((university) => {
                const buildingCount = university.buildings?.length || 0
                const hasAdminBuilding = university.buildings?.some(b => b.is_admin_building)
                
                return (
                  <div
                    key={university.id}
                    className={`university-card ${selectedUniversity?.id === university.id ? 'selected' : ''}`}
                    onClick={() => {
                      const building = displayBuildings.find(b => b.id === university.id)
                      if (building) handleUniversityClick(building)
                    }}
                  >
                    <div className="university-icon">
                      <FontAwesomeIcon icon={faUniversity} />
                    </div>
                    <div className="university-info">
                      <h3>{university.name}</h3>
                      <p className="university-city">
                        <FontAwesomeIcon icon={faMapMarkedAlt} />
                        {university.city}
                      </p>
                      <div className="university-stats">
                        <span className="stat">
                          <FontAwesomeIcon icon={faBuilding} />
                          {buildingCount} building{buildingCount !== 1 ? 's' : ''}
                        </span>
                        {hasAdminBuilding && (
                          <span className="admin-badge">Admin Building Marked</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        <div className="map-container">
          <MapComponent
            ref={mapRef}
            buildings={displayBuildings}
            selectedBuilding={selectedUniversity ? displayBuildings.find(b => b.id === selectedUniversity.id) : null}
            onBuildingClick={(building) => handleUniversityClick(building)}
          />

          {selectedUniversity && (
            <div className="floating-info-panel">
              <div className="panel-header">
                <div>
                  <h3>{selectedUniversity.name}</h3>
                  <p className="university-location">
                    <FontAwesomeIcon icon={faMapMarkedAlt} />
                    {selectedUniversity.city}
                  </p>
                </div>
                <button 
                  className="btn-close-panel"
                  onClick={() => setSelectedUniversity(null)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="panel-content">
                <div className="info-row">
                  <span className="label">Total Buildings:</span>
                  <span className="value">{selectedUniversity.buildings?.length || 0}</span>
                </div>
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(selectedUniversity.created_at).toLocaleDateString()}</span>
                </div>
                {selectedUniversity.buildings?.some(b => b.is_admin_building) && (
                  <div className="info-row">
                    <span className="admin-indicator">
                      <FontAwesomeIcon icon={faBuilding} />
                      Admin Building Designated
                    </span>
                  </div>
                )}
              </div>

              <div className="panel-actions">
                <button
                  className="btn-view-map"
                  onClick={() => handleViewDashboard(selectedUniversity.id)}
                >
                  <FontAwesomeIcon icon={faMapMarkedAlt} />
                  View University Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="mobile-actions">
          <button className="mobile-action-btn" onClick={() => setShowSidebar(!showSidebar)}>
            <FontAwesomeIcon icon={showSidebar ? faGlobe : faList} />
            <span>{showSidebar ? 'Map' : 'List'}</span>
          </button>
          <button className="mobile-action-btn" onClick={handleBackToDashboard}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default SuperAdminMap
