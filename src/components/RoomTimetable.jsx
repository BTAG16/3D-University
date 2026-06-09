import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import './RoomTimetable.css'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}

function RoomTimetable({ timetable }) {
  if (!timetable || !timetable.schedule) {
    return null
  }

  const { services = [], schedule = {}, notes } = timetable

  const timeToMinutes = (value) => {
    if (!value) return Number.MAX_SAFE_INTEGER
    const text = String(value).trim().toLowerCase()
    const rangeStart = text.split('-')[0].trim()
    const match = rangeStart.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
    if (!match) return Number.MAX_SAFE_INTEGER
    let hour = parseInt(match[1], 10)
    const minutes = parseInt(match[2] || '0', 10)
    const period = match[3]
    if (period === 'pm' && hour !== 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0
    return hour * 60 + minutes
  }

  // Get all unique time slots across all days
  const allTimeSlots = new Set()
  Object.values(schedule).forEach(day => {
    Object.keys(day).forEach(slot => allTimeSlots.add(slot))
  })
  const timeSlots = Array.from(allTimeSlots).sort((a, b) => {
    const aTime = Object.values(schedule).find(day => day[a])?.[a]?.time || a
    const bTime = Object.values(schedule).find(day => day[b])?.[b]?.time || b
    return timeToMinutes(aTime) - timeToMinutes(bTime)
  })

  // Get days that have schedules
  const activeDays = DAYS.filter(day => schedule[day])

  if (activeDays.length === 0) {
    return null
  }

  return (
    <div className="room-timetable">
      <div className="timetable-header">
        <h3>
          <FontAwesomeIcon icon={faClock} />
          Weekly Schedule
        </h3>
      </div>

      {/* Services Legend */}
      {services.length > 0 && (
        <div className="services-legend">
          <strong>Available Services:</strong>
          <ul>
            {services.map((service, idx) => (
              <li key={idx}>{service}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="timetable-grid-container">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th className="day-column">Day</th>
              {timeSlots.map(slot => {
                // Get the time range from first occurrence
                const timeRange = Object.values(schedule).find(day => day[slot])?.[slot]?.time || slot
                return <th key={slot}>{timeRange}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {activeDays.map(day => (
              <tr key={day}>
                <td className="day-label">{DAY_LABELS[day]}</td>
                {timeSlots.map(slot => {
                  const slotData = schedule[day]?.[slot]
                  return (
                    <td key={slot} className={slotData ? 'has-service' : 'no-service'}>
                      {slotData ? (
                        <div className="slot-content">
                          {slotData.services?.map((service, idx) => (
                            <div key={idx} className="service-item">
                              {service}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-service-indicator">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Timetable Cards */}
      <div className="timetable-mobile-list">
        {activeDays.map(day => {
          const daySlots = Object.entries(schedule[day] || {})
            .sort(([, aData], [, bData]) => timeToMinutes(aData?.time) - timeToMinutes(bData?.time))
          return (
            <div key={`mobile-${day}`} className="timetable-day-card">
              <h4>{DAY_LABELS[day]}</h4>
              {daySlots.length === 0 ? (
                <p className="day-empty">No services scheduled</p>
              ) : (
                <ul>
                  {daySlots.map(([slotKey, slotData]) => (
                    <li key={slotKey}>
                      <div className="day-slot-time">{slotData.time || slotKey}</div>
                      <div className="day-slot-services">
                        {(slotData.services || []).join(' · ') || 'Service available'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes */}
      {notes && (
        <div className="timetable-notes">
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>{notes}</span>
        </div>
      )}
    </div>
  )
}

export default RoomTimetable
