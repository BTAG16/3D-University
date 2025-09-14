'use client'

import { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'
import { accessToken } from './Map'
import Map from './Map'
import Card from './Card'
import Modal from './Modal'
import { getFeatures } from './Map/util'
import housebuyLogo from './img/DUELOGO-alkalmazott.png'
import universityBuldings from './data/university_buildings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMap, faList, faBars, faTimes, faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'

import './styles.css'

export default function Home() {
  const [currentViewData, setCurrentViewData] = useState([])
  const [activeFeature, setActiveFeature] = useState()
  const [mapboxSearchValue, setMapboxSearchValue] = useState('')
  const [localSearchValue, setLocalSearchValue] = useState('')
  const [localResults, setLocalResults] = useState([])
  const [activeMobileView, setActiveMobileView] = useState('map') // 'map' | 'cards'
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const mapInstanceRef = useRef()

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarVisible(true) // Always show sidebar on desktop
      } else {
        setSidebarVisible(false) // Hidden by default on mobile
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Map loaded
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map
    setCurrentViewData(getFeatures())
    setIsLoading(false)
  }

  // Feature click
  const handleFeatureClick = (feature) => {
    setActiveFeature(feature)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: 18,
        pitch: 60,
        speed: 1.2,
        curve: 1.5,
        essential: true
      })
    }
    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  const handleModalClose = () => setActiveFeature(undefined)

  // Local search
  const handleLocalSearchChange = (e) => {
    const value = e.target.value
    setLocalSearchValue(value)
    if (value.length > 1) {
      const filtered = universityBuldings.features.filter((f) =>
        f.properties.name.toLowerCase().includes(value.toLowerCase()) ||
        f.properties.category?.toLowerCase().includes(value.toLowerCase())
      )
      setLocalResults(filtered)
    } else {
      setLocalResults([])
    }
  }

  // Handle search result selection
  const handleSearchResultClick = (feature) => {
    handleFeatureClick(feature)
    setLocalResults([])
    setLocalSearchValue('')
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  // Mobile toggle
  const handleActiveMobileClick = () => {
    setActiveMobileView(activeMobileView === 'map' ? 'cards' : 'map')
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <>
      {activeFeature && <Modal feature={activeFeature} onClose={handleModalClose} />}

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mb-4"></div>
            <div className="text-white text-xl font-bold">Loading Campus Explorer...</div>
            <div className="text-cyan-400 text-sm">University of Dunaújváros</div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="app-container">
        {/* Map Container */}
        <div className="map-wrapper">
          <Map
            data={currentViewData}
            onLoad={handleMapLoad}
            onFeatureClick={handleFeatureClick}
            mapStyle="mapbox://styles/mapbox/dark-v11"
          />
        </div>

        {/* Header */}
        <div className="app-header">
          <div className="header-content">
            <div className="logo-section glass-morphism">
              <div
                className="logo-image"
                style={{
                  backgroundImage: `url(${housebuyLogo})`
                }}
              ></div>
              <div className="logo-text">
                <h1 className="app-title">Campus Explorer</h1>
                <p className="app-subtitle">University of Dunaújváros</p>
              </div>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              className={`mobile-menu-toggle ${isMobile ? 'visible' : 'hidden'}`}
              onClick={toggleSidebar}
            >
              <FontAwesomeIcon icon={sidebarVisible ? faTimes : faBars} />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          {/* Mapbox Global Search */}
          <div className="search-box-wrapper glass-morphism">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <SearchBox
              className="mapbox-search"
              options={{
                proximity: [18.93369153939181, 46.96066806491029],
                types: ['postcode','place','locality','street','address']
              }}
              value={mapboxSearchValue}
              onChange={setMapboxSearchValue}
              accessToken={accessToken}
              marker
              mapboxgl={mapboxgl}
              placeholder='Search city, street, location...'
              map={mapInstanceRef.current}
            />
          </div>

          {/* Local Campus Search */}
          <div className="search-box-wrapper glass-morphism">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="search-icon" />
            <input
              type="text"
              value={localSearchValue}
              onChange={handleLocalSearchChange}
              placeholder="Search campus buildings..."
              className="local-search-input"
            />
            
            {/* Search Results Dropdown */}
            {localResults.length > 0 && (
              <div className="search-results glass-morphism">
                {localResults.map((feature, idx) => (
                  <div
                    key={idx}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(feature)}
                  >
                    <div className="result-name">{feature.properties.name}</div>
                    <div className="result-category">{feature.properties.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={classNames(
          "sidebar glass-morphism custom-scrollbar",
          {
            'sidebar-visible': sidebarVisible,
            'sidebar-mobile': isMobile,
            'sidebar-desktop': !isMobile
          }
        )}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">Campus Buildings</h2>
            {isMobile && (
              <button
                className="sidebar-close-btn"
                onClick={toggleSidebar}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          
          <div className="sidebar-content">
            {currentViewData.map((feature, i) => (
              <Card 
                key={i} 
                feature={feature} 
                onClick={handleFeatureClick}
                isCompact={isMobile}
              />
            ))}
          </div>

          {/* Stats Section */}
          <div className="sidebar-stats">
            <div className="stat-item">
              <div className="stat-value">{currentViewData.length}</div>
              <div className="stat-label">Buildings</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Access</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">WiFi</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="mobile-bottom-nav">
            <button
              className="mobile-nav-btn cyber-button"
              onClick={handleActiveMobileClick}
            >
              <FontAwesomeIcon
                icon={sidebarVisible ? faMap : faList}
                className="mobile-nav-icon"
              />
              <span>{sidebarVisible ? 'Show Map' : 'View Buildings'}</span>
            </button>
          </div>
        )}

        {/* Quick Stats Bar (Desktop Only) */}
        {!isMobile && (
          <div className="quick-stats glass-morphism">
            <div className="quick-stat">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="stat-icon" />
              <span>{currentViewData.length} Locations</span>
            </div>
          </div>
        )}

        {/* Floating Action Button (Mobile) */}
        {isMobile && !sidebarVisible && (
          <div className="floating-action-btn">
            <button
              className="fab cyber-button pulse-animation"
              onClick={toggleSidebar}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}