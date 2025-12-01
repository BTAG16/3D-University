import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import './BuildingCard.css'

function BuildingCard({ building, distance, onClick, selected }) {
  return (
    <div
      className={`building-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick(building)}
    >
      <div className="building-card-icon">
        <FontAwesomeIcon icon={faBuilding} />
      </div>
      <div className="building-card-info">
        <h3 className="building-name">{building.name}</h3>
        <p className="building-category">{building.category}</p>
        {distance && (
          <p className="building-distance">
            <FontAwesomeIcon icon={faMapMarkerAlt} /> {distance}
          </p>
        )}
      </div>
    </div>
  )
}

export default BuildingCard
