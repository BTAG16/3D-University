import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import './RoomTimetable.css'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}
const WEEKEND = new Set(['saturday', 'sunday'])

function RoomTimetable({ timetable }) {
  if (!timetable?.schedule) return null

  const { services = [], schedule = {}, notes } = timetable

  const timeToMinutes = (v) => {
    if (!v) return Infinity
    const s = String(v).trim().toLowerCase().split('-')[0].trim()
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
    if (!m) return Infinity
    let h = +m[1], min = +(m[2] || 0)
    if (m[3] === 'pm' && h !== 12) h += 12
    if (m[3] === 'am' && h === 12) h = 0
    return h * 60 + min
  }

  const activeDays = DAYS.filter(d => schedule[d] && Object.keys(schedule[d]).length > 0)

  const allSlotKeys = new Set()
  activeDays.forEach(d => Object.keys(schedule[d]).forEach(k => allSlotKeys.add(k)))
  const sortedSlots = [...allSlotKeys].sort((a, b) => {
    const aT = activeDays.map(d => schedule[d]?.[a]?.time).find(Boolean) || a
    const bT = activeDays.map(d => schedule[d]?.[b]?.time).find(Boolean) || b
    return timeToMinutes(aT) - timeToMinutes(bT)
  })

  if (activeDays.length === 0) return null

  return (
    <div className="room-timetable">

      {/* Services legend */}
      {services.length > 0 && (
        <div className="services-legend">
          <span className="legend-label">Services</span>
          <div className="services-pills">
            {services.map((s, i) => (
              <span key={i} className="service-pill">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Day-column CSS grid — no horizontal scroll */}
      <div
        className="timetable-grid"
        style={{ gridTemplateColumns: `max-content repeat(${activeDays.length}, 1fr)` }}
      >
        {/* Header row */}
        <div className="grid-corner" />
        {activeDays.map(day => (
          <div key={day} className={`grid-day-header${WEEKEND.has(day) ? ' weekend' : ''}`}>
            {DAY_SHORT[day]}
          </div>
        ))}

        {/* Time-slot rows */}
        {sortedSlots.map(slotKey => {
          const timeLabel = activeDays.map(d => schedule[d]?.[slotKey]?.time).find(Boolean) || slotKey
          return [
            <div key={`t-${slotKey}`} className="grid-time">{timeLabel}</div>,
            ...activeDays.map(day => {
              const cell = schedule[day]?.[slotKey]
              const svcs = cell?.services || []
              return (
                <div key={`${day}-${slotKey}`} className={`grid-cell${cell ? ' active' : ''}`}>
                  {cell ? (
                    <div className="cell-inner">
                      <span className="cell-dot" />
                      <span className="cell-text">
                        {svcs[0] || 'Available'}
                      </span>
                      {svcs.length > 1 && (
                        <span className="cell-more">+{svcs.length - 1}</span>
                      )}
                    </div>
                  ) : (
                    <span className="cell-empty">—</span>
                  )}
                </div>
              )
            })
          ]
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
