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

  // Get all unique time slots across all days
  const allTimeSlots = new Set()
  Object.values(schedule).forEach(day => {
    Object.keys(day).forEach(slot => allTimeSlots.add(slot))
  })
  const timeSlots = Array.from(allTimeSlots).sort()

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
