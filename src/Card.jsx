import PropTypes from 'prop-types'
import classNames from 'classnames'

export const pluralize = (number, word) => {
  return `${number} ${word}${number === 1 ? '' : 's'} `
}

const MarkerIcon = ({ className = "" }) => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 20 20'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      d='M5 7.71428C5 5.15607 7.19204 3 10 3C12.808 3 15 5.15607 15 7.71428C15 9.11527 14.179 10.8133 12.9489 12.6083C12.0915 13.8594 11.1256 15.0366 10.2524 16.1008C10.1673 16.2045 10.0831 16.3071 10 16.4086C9.91686 16.3071 9.83265 16.2045 9.74757 16.1008C8.8744 15.0366 7.9085 13.8594 7.0511 12.6083C5.82101 10.8133 5 9.11527 5 7.71428Z'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
    />
  </svg>
)

const CategoryIcon = ({ category }) => {
  const iconMap = {
    'Academic': 'fas fa-graduation-cap',
    'Engineering': 'fas fa-cogs',
    'Student Services': 'fas fa-users',
    'Academic Support': 'fas fa-book',
    'Library': 'fas fa-book-open',
    'Recreation': 'fas fa-dumbbell',
    'Administration': 'fas fa-building',
    'Research': 'fas fa-flask',
    'Laboratory': 'fas fa-microscope'
  }
  
  const iconClass = iconMap[category] || 'fas fa-building'
  
  return <i className={`${iconClass} text-cyan-400`} />
}

const FacilityBadge = ({ facility, index, total, showAll = false }) => {
  if (!showAll && index >= 2) {
    if (index === 2) {
      return (
        <span className="facility-badge overflow-badge">
          +{total - 2} more
        </span>
      )
    }
    return null
  }
  
  return (
    <span className="facility-badge">
      {facility}
    </span>
  )
}

FacilityBadge.propTypes = {
  facility: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  showAll: PropTypes.bool
}

export const BuildingData = ({ feature, large = false, isCompact = false }) => {
  const {
    name,
    category,
    floors,
    description,
    facilities = []
  } = feature.properties

  const titleClass = large ? 'text-2xl' : isCompact ? 'text-lg' : 'text-xl'
  const subtitleClass = large ? 'text-base' : isCompact ? 'text-sm' : 'text-sm'
  const descriptionClass = large ? 'text-base' : isCompact ? 'text-xs' : 'text-sm'

  return (
    <div className={`building-data ${isCompact ? 'compact' : ''}`}>
      <div className="building-header">
        <h3 className={`building-title ${titleClass}`}>
          {name}
        </h3>
        <div className="building-meta">
          <div className="category-section">
            <CategoryIcon category={category} />
            <span className={`category-text ${subtitleClass}`}>{category}</span>
          </div>
          {floors && (
            <div className="floors-badge">
              <i className="fas fa-layer-group text-blue-400"></i>
              <span className={`floors-text ${subtitleClass}`}>
                {floors} floor{floors !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {description && !isCompact && (
        <p className={`building-description ${descriptionClass}`}>
          {description}
        </p>
      )}

      {facilities.length > 0 && (
        <div className="facilities-section">
          <div className="facilities-grid">
            {facilities.map((facility, idx) => (
              <FacilityBadge
                key={idx}
                facility={facility}
                index={idx}
                total={facilities.length}
                showAll={large}
              />
            ))}
          </div>
        </div>
      )}

      <div className="location-section">
        <MarkerIcon className="location-icon" />
        <p className={`location-text ${subtitleClass}`}>
          University of Dunaújváros
        </p>
      </div>
    </div>
  )
}

BuildingData.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.shape({
      name: PropTypes.string.isRequired,
      category: PropTypes.string,
      floors: PropTypes.number,
      description: PropTypes.string,
      facilities: PropTypes.arrayOf(PropTypes.string)
    }).isRequired
  }).isRequired,
  large: PropTypes.bool,
  isCompact: PropTypes.bool
}

const Card = ({ 
  feature, 
  width = 'auto', 
  shortImage = false, 
  onClick, 
  isCompact = false,
  showFullInfo = false 
}) => {
  const handleClick = () => {
    onClick && onClick(feature)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const { imageUrl, name } = feature.properties

  return (
    <div 
      className={classNames(
        'building-card interactive-card',
        {
          'compact-card': isCompact,
          'full-card': !isCompact
        }
      )}
      style={{ width }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name}`}
    >
      <div className="card-container glass-morphism">
        <div className="card-image-container">
          <div
            className={classNames('card-image loading-shimmer', {
              'compact-image': isCompact && shortImage,
              'standard-image': !isCompact || !shortImage
            })}
            style={{
              backgroundImage: imageUrl ? `url("${import.meta.env.BASE_URL || '/'}${imageUrl}")` : 'none'
            }}
            onLoad={(e) => {
              e.target.classList.remove('loading-shimmer')
            }}
          >
            {/* Image Overlay */}
            <div className="image-overlay">
              <div className="overlay-gradient"></div>
              <div className="image-actions">
                <button className="view-btn" aria-label="View building">
                  <i className="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-content">
          <BuildingData 
            feature={feature} 
            large={showFullInfo} 
            isCompact={isCompact}
          />
          
          {!isCompact && (
            <div className="card-actions">
              <button className="action-btn primary-btn">
                <i className="fas fa-info-circle"></i>
                <span>View Details</span>
              </button>
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="hover-overlay">
          <div className="hover-content">
            <i className="fas fa-search-plus hover-icon"></i>
            <p className="hover-text">Click to explore</p>
          </div>
        </div>
      </div>
    </div>
  )
}

Card.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.shape({
      imageUrl: PropTypes.string,
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  onClick: PropTypes.func,
  shortImage: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isCompact: PropTypes.bool,
  showFullInfo: PropTypes.bool
}

export default Card