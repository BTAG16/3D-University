import PropTypes from 'prop-types'
import { useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTimes, 
  faMapMarkerAlt, 
  faBuilding, 
  faLayerGroup,
  faUsers,
  faWifi,
  faClock,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons'

import StaticMapImage from './StaticMap'
import MapboxTooltip from './MapboxTooltip'
import { BuildingData } from './Card'

const FacilityCard = ({ icon, title, description, available = true }) => (
  <div className="facility-card glass-morphism">
    <div className="facility-icon">
      <FontAwesomeIcon icon={icon} className="text-cyan-400" />
    </div>
    <div className="facility-info">
      <div className="facility-title">{title}</div>
      <div className="facility-description">{description}</div>
      <div className={`facility-status ${available ? 'available' : 'unavailable'}`}>
        <div className={`status-dot ${available ? 'dot-green' : 'dot-red'}`}></div>
        <span>{available ? 'Available' : 'Unavailable'}</span>
      </div>
    </div>
  </div>
)

FacilityCard.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  available: PropTypes.bool
}

const ContactInfo = ({ type, value, icon }) => (
  <div className="contact-item">
    <FontAwesomeIcon icon={icon} className="contact-icon" />
    <div className="contact-details">
      <div className="contact-type">{type}</div>
      <div className="contact-value">{value}</div>
    </div>
  </div>
)

ContactInfo.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired
}

const Modal = ({ feature, onClose }) => {
  // Handle escape key
  const handleEscape = useCallback((event) => {
    if (event.keyCode === 27) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (feature) {
      document.addEventListener('keydown', handleEscape, false)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape, false)
      document.body.style.overflow = 'unset'
    }
  }, [feature, handleEscape])

  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  const { 
    imageUrl, 
    name, 
    description, 
    category,
    floors,
    facilities = [],
    capacity,
    yearBuilt,
    accessibility,
    parking
  } = feature.properties

  // Enhanced facility mapping with icons
  const facilityIconMap = {
    'Lecture Halls': faBuilding,
    'Computer Labs': faBuilding,
    'Library': faBuilding,
    'Administrative Offices': faBuilding,
    'Research Labs': faBuilding,
    'Workshop': faBuilding,
    'Study Areas': faBuilding,
    'Wi-Fi Access': faWifi,
    'Dining Hall': faUsers,
    'Recreation Center': faUsers,
    'Student Organizations': faUsers
  }

  const enhancedFacilities = facilities.map(facility => ({
    name: facility,
    icon: facilityIconMap[facility] || faBuilding,
    description: getFacilityDescription(facility),
    available: true
  }))

  function getFacilityDescription(facility) {
    const descriptions = {
      'Lecture Halls': 'Modern equipped classrooms for interactive learning',
      'Computer Labs': 'Latest technology and software available',
      'Library': 'Extensive collection and digital resources',
      'Administrative Offices': 'Student services and academic support',
      'Research Labs': 'State-of-the-art research facilities',
      'Workshop': 'Hands-on learning and practical training',
      'Study Areas': 'Quiet spaces for individual and group study',
      'Wi-Fi Access': 'High-speed internet throughout the building',
      'Dining Hall': 'Cafeteria and food services',
      'Recreation Center': 'Fitness and recreational facilities',
      'Student Organizations': 'Meeting spaces for student groups'
    }
    return descriptions[facility] || 'Available in this building'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-backdrop"></div>
      
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content glass-morphism">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          {/* Header Image */}
          <div className="modal-header">
            <div 
              className="modal-image"
              style={{
                backgroundImage: `url("${import.meta.env.BASE_URL || '/'}${imageUrl}")`
              }}
            >
              <div className="image-overlay-gradient"></div>
              <div className="modal-image-content">
                <div className="building-badges">
                  {floors && (
                    <span className="building-badge">
                      <FontAwesomeIcon icon={faLayerGroup} />
                      {floors} floors
                    </span>
                  )}
                  <span className="building-badge category-badge">
                    {category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body custom-scrollbar">
            {/* Building Info */}
            <div className="building-info-section">
              <BuildingData feature={feature} large={true} />
            </div>

            {/* Description */}
            <div className="modal-section">
              <h3 className="section-title">About {name}</h3>
              <p className="section-description">
                {description || `This is one of the main buildings at the University of Dunaújváros, serving students and faculty with modern facilities and academic resources. The building features state-of-the-art classrooms, laboratories, and administrative offices designed to support the university's educational mission.`}
              </p>
            </div>

            {/* Building Stats */}
            <div className="modal-section">
              <h3 className="section-title">Building Information</h3>
              <div className="stats-grid">
                <div className="stat-card glass-morphism">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faBuilding} className="text-cyan-400" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{floors || 'N/A'}</div>
                    <div className="stat-label">Floors</div>
                  </div>
                </div>
                
                <div className="stat-card glass-morphism">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-400" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{capacity || '500+'}</div>
                    <div className="stat-label">Capacity</div>
                  </div>
                </div>
                
                <div className="stat-card glass-morphism">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faClock} className="text-purple-400" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{yearBuilt || '2010'}</div>
                    <div className="stat-label">Year Built</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities & Services */}
            {enhancedFacilities.length > 0 && (
              <div className="modal-section">
                <h3 className="section-title">Facilities & Services</h3>
                <div className="facilities-grid">
                  {enhancedFacilities.map((facility, idx) => (
                    <FacilityCard
                      key={idx}
                      icon={facility.icon}
                      title={facility.name}
                      description={facility.description}
                      available={facility.available}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Accessibility & Features */}
            <div className="modal-section">
              <h3 className="section-title">Accessibility & Features</h3>
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon green">✓</div>
                  <span>Wheelchair Accessible</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon green">✓</div>
                  <span>Elevator Access</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon green">✓</div>
                  <span>Free Wi-Fi</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon green">✓</div>
                  <span>Air Conditioning</span>
                </div>
                {parking && (
                  <div className="feature-item">
                    <div className="feature-icon green">✓</div>
                    <span>Parking Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="modal-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="contact-grid">
                <ContactInfo
                  type="Phone"
                  value="+36 25 551 200"
                  icon={faPhone}
                />
                <ContactInfo
                  type="Email"
                  value="info@uniduna.hu"
                  icon={faEnvelope}
                />
              </div>
            </div>

            {/* Location Map */}
            <div className="modal-section">
              <h3 className="section-title">Location</h3>
              <div className="location-container">
                <MapboxTooltip
                  title='Static Images API'
                  className='map-tooltip'
                >
                  {`The [Mapbox Static Images API](https://docs.mapbox.com/api/maps/static-images/) serves standalone, static map images generated from Mapbox Studio styles. These images can be displayed on web and mobile devices without the aid of a mapping library or API.

* [Static Images API Documentation](https://docs.mapbox.com/api/maps/static-images/)`}
                </MapboxTooltip>
                
                <div className="static-map-wrapper glass-morphism">
                  <StaticMapImage lng={lng} lat={lat} />
                </div>
                
                <div className="location-details glass-morphism">
                  <div className="location-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                    <div>
                      <div className="location-title">Address</div>
                      <div className="location-text">University of Dunaújváros Campus</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  feature: PropTypes.shape({
    geometry: PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired
    }).isRequired,
    properties: PropTypes.shape({
      imageUrl: PropTypes.string,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      category: PropTypes.string,
      floors: PropTypes.number,
      facilities: PropTypes.arrayOf(PropTypes.string),
      capacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      yearBuilt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      accessibility: PropTypes.bool,
      parking: PropTypes.bool
    }).isRequired
  }),
  onClose: PropTypes.func.isRequired
}

export default Modal