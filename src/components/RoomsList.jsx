import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDoorOpen, faStar, faTimes, faSpinner, faSearch } from '@fortawesome/free-solid-svg-icons'
import RoomTimetable from './RoomTimetable'
import './RoomsList.css'

function RoomsList({ buildingId, buildingName, onClose }) {
  const [rooms, setRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyOffices, setShowOnlyOffices] = useState(false)
  const [expandedTimetables, setExpandedTimetables] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRooms()
  }, [buildingId])

  const loadRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.getRooms(buildingId)
      
      if (result.success) {
        // Sort: offices first, then by room number
        const sorted = (result.data || []).sort((a, b) => {
          if (a.is_office && !b.is_office) return -1
          if (!a.is_office && b.is_office) return 1
          return a.room_number.localeCompare(b.room_number, undefined, { numeric: true })
        })
        setRooms(sorted)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || room.room_number.toLowerCase().includes(query) || room.room_name.toLowerCase().includes(query) || (room.purpose && room.purpose.toLowerCase().includes(query))
    const matchesOffice = !showOnlyOffices || room.is_office
    return matchesSearch && matchesOffice
  })

  const toggleTimetable = (roomId) => {
    setExpandedTimetables(prev => ({ ...prev, [roomId]: !prev[roomId] }))
  }

  return (
    <div className="rooms-list-modal">
      <div className="rooms-list-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faDoorOpen} className="header-icon" />
          <h2>Rooms in {buildingName}</h2>
        </div>
        <button className="btn-close-rooms" onClick={onClose} aria-label="Close rooms list">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="rooms-list-content">
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Loading rooms...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faDoorOpen} className="empty-icon" />
            <h3>No Rooms Found</h3>
            <p>This building doesn't have any rooms registered yet.</p>
          </div>
        ) : (
          <>
            <div className="rooms-summary">
              <span className="summary-item">
                <strong>{rooms.length}</strong> Total Rooms
              </span>
              <span className="summary-item">
                <FontAwesomeIcon icon={faStar} />
                <strong>{rooms.filter(r => r.is_office).length}</strong> Offices
              </span>
            </div>

            <div className="rooms-tools">
              <div className="rooms-search-box">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search by room number, name, or purpose"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <label className="offices-toggle">
                <input
                  type="checkbox"
                  checked={showOnlyOffices}
                  onChange={(e) => setShowOnlyOffices(e.target.checked)}
                />
                <span>Show only offices</span>
              </label>
            </div>

            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <div key={room.id} className={`room-card ${room.is_office ? 'office' : ''}`}>
                  <div className="room-card-header">
                    <span className="room-number">{room.room_number}</span>
                    {room.is_office && (
                      <span className="office-badge">
                        <FontAwesomeIcon icon={faStar} /> Office
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
                    <div className="room-timetable-section">
                      <button
                        className="btn-toggle-room-timetable"
                        onClick={() => toggleTimetable(room.id)}
                      >
                        {expandedTimetables[room.id] ? 'Hide timetable' : 'View timetable'}
                      </button>
                      {expandedTimetables[room.id] && (
                        <RoomTimetable timetable={room.timetable} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {filteredRooms.length === 0 && (
              <div className="empty-state compact">
                <h3>No matching rooms</h3>
                <p>Try changing your search or filter settings.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RoomsList
