import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDoorOpen, faStar, faSpinner, faSearch, faCalendarAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import RoomTimetable from './RoomTimetable'
import './RoomsList.css'

function RoomsList({ buildingId, buildingName, onClose }) {
  const [rooms, setRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyOffices, setShowOnlyOffices] = useState(false)
  const [timetableRoom, setTimetableRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadRooms() }, [buildingId])

  const loadRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.getRooms(buildingId)
      if (result.success) {
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
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q ||
      room.room_number.toLowerCase().includes(q) ||
      room.room_name.toLowerCase().includes(q) ||
      (room.purpose && room.purpose.toLowerCase().includes(q))
    return matchesSearch && (!showOnlyOffices || room.is_office)
  })

  const officeCount = rooms.filter(r => r.is_office).length
  const scheduleCount = rooms.filter(r => r.timetable).length

  return (
    <div className="rooms-list-modal">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="rooms-list-header">
        {timetableRoom ? (
          <div className="header-timetable">
            <button className="btn-back" onClick={() => setTimetableRoom(null)}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>All Rooms</span>
            </button>
            <div className="header-timetable-meta">
              <span className="header-room-number">{timetableRoom.room_number}</span>
              <span className="header-room-name">{timetableRoom.room_name}</span>
            </div>
          </div>
        ) : (
          <div className="header-main">
            <div className="header-icon-wrap">
              <FontAwesomeIcon icon={faDoorOpen} />
            </div>
            <div>
              <h2 className="header-title">Rooms in {buildingName}</h2>
              <p className="header-meta">
                {rooms.length} rooms
                {officeCount > 0 && ` · ${officeCount} offices`}
                {scheduleCount > 0 && ` · ${scheduleCount} with schedule`}
              </p>
            </div>
          </div>
        )}
        {onClose && (
          <button className="rooms-list-close" onClick={onClose} aria-label="Close">✕</button>
        )}
      </div>

      {/* ── Timetable panel ──────────────────────────────── */}
      {timetableRoom ? (
        <div className="timetable-panel">
          {timetableRoom.purpose && (
            <p className="timetable-panel-purpose">{timetableRoom.purpose}</p>
          )}
          {timetableRoom.hours && (
            <p className="timetable-panel-hours">{timetableRoom.hours}</p>
          )}
          <RoomTimetable timetable={timetableRoom.timetable} />
        </div>
      ) : (

      /* ── Grid view ───────────────────────────────────── */
      <div className="rooms-list-content">
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Loading rooms…</p>
          </div>
        ) : error ? (
          <div className="error-state"><p>Error: {error}</p></div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faDoorOpen} className="empty-icon" />
            <h3>No Rooms Found</h3>
            <p>This building doesn't have any rooms registered yet.</p>
          </div>
        ) : (
          <>
            <div className="rooms-tools">
              <div className="rooms-search-box">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search room, name, or purpose"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <label className="offices-toggle">
                <input
                  type="checkbox"
                  checked={showOnlyOffices}
                  onChange={(e) => setShowOnlyOffices(e.target.checked)}
                />
                <span>Offices only</span>
              </label>
            </div>

            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <div key={room.id} className={`room-card ${room.is_office ? 'office' : ''}`}>
                  <div className="room-card-header">
                    <span className="room-number">{room.room_number}</span>
                    <div className="room-card-actions">
                      {room.is_office && (
                        <span className="office-badge">
                          <FontAwesomeIcon icon={faStar} /> Office
                        </span>
                      )}
                      {room.timetable && (
                        <button
                          className="btn-schedule"
                          onClick={() => setTimetableRoom(room)}
                          title="View weekly schedule"
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="room-name">{room.room_name}</h4>
                  {room.purpose && <p className="room-purpose">{room.purpose}</p>}
                  {room.hours && (
                    <p className="room-hours"><strong>Hours:</strong> {room.hours}</p>
                  )}
                </div>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="empty-state compact">
                <h3>No matching rooms</h3>
                <p>Try changing your search or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
  )
}

export default RoomsList
