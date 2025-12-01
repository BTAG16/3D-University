import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTimes, faStar, faClock, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import RoomTimetable from './RoomTimetable'
import './RoomEditModal.css'

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

function RoomEditModal({ room, buildings, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    building_id: '',
    room_number: '',
    room_name: '',
    is_office: false,
    purpose: '',
    hours: '',
    floor: '',
    timetable: null
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [showTimetable, setShowTimetable] = useState(false)
  const [timetableData, setTimetableData] = useState({
    services: [],
    schedule: {},
    notes: ''
  })
  const [newService, setNewService] = useState('')
  
  // Time slot editor state
  const [editingDay, setEditingDay] = useState(null)
  const [newSlot, setNewSlot] = useState({
    name: '',
    time: '',
    services: []
  })

  useEffect(() => {
    if (room) {
      setFormData({
        building_id: room.building_id || '',
        room_number: room.room_number || '',
        room_name: room.room_name || '',
        is_office: room.is_office || false,
        purpose: room.purpose || '',
        hours: room.hours || '',
        floor: room.floor || '',
        timetable: room.timetable || null
      })
      if (room.timetable) {
        setTimetableData(room.timetable)
        setShowTimetable(true)
      }
    }
  }, [room])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.building_id) {
      newErrors.building_id = 'Building is required'
    }
    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required'
    }
    if (!formData.room_name.trim()) {
      newErrors.room_name = 'Room name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setSaving(true)
    try {
      // Prepare timetable data if it exists
      let timetable = null
      if (showTimetable && (timetableData.services.length > 0 || Object.keys(timetableData.schedule).length > 0)) {
        timetable = {
          services: timetableData.services,
          schedule: timetableData.schedule,
          notes: timetableData.notes || ''
        }
      }

      const updates = {
        building_id: formData.building_id,
        room_number: formData.room_number.trim(),
        room_name: formData.room_name.trim(),
        is_office: formData.is_office,
        purpose: formData.is_office && formData.purpose ? formData.purpose.trim() : null,
        hours: formData.is_office && formData.hours ? formData.hours.trim() : null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        timetable: timetable
      }

      await onSave(room.id, updates)
    } catch (err) {
      console.error('Error saving room:', err)
    } finally {
      setSaving(false)
    }
  }

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId)
    return building ? building.name : 'Unknown'
  }

  // Service management
  const addService = () => {
    if (newService.trim() && !timetableData.services.includes(newService.trim())) {
      setTimetableData({
        ...timetableData,
        services: [...timetableData.services, newService.trim()]
      })
      setNewService('')
    }
  }

  const removeService = (serviceToRemove) => {
    setTimetableData({
      ...timetableData,
      services: timetableData.services.filter(s => s !== serviceToRemove)
    })
  }

  // Time slot management
  const addTimeSlot = (day) => {
    if (!newSlot.name.trim() || !newSlot.time.trim()) {
      alert('Please enter slot name and time')
      return
    }

    const updatedSchedule = { ...timetableData.schedule }
    if (!updatedSchedule[day]) {
      updatedSchedule[day] = {}
    }

    const slotKey = newSlot.name.toLowerCase().replace(/\s+/g, '_')
    updatedSchedule[day][slotKey] = {
      time: newSlot.time,
      services: newSlot.services
    }

    setTimetableData({
      ...timetableData,
      schedule: updatedSchedule
    })

    // Reset form
    setNewSlot({ name: '', time: '', services: [] })
    setEditingDay(null)
  }

  const removeTimeSlot = (day, slotKey) => {
    const updatedSchedule = { ...timetableData.schedule }
    delete updatedSchedule[day][slotKey]
    
    // Remove day if no slots left
    if (Object.keys(updatedSchedule[day]).length === 0) {
      delete updatedSchedule[day]
    }

    setTimetableData({
      ...timetableData,
      schedule: updatedSchedule
    })
  }

  const toggleSlotService = (service) => {
    const services = newSlot.services.includes(service)
      ? newSlot.services.filter(s => s !== service)
      : [...newSlot.services, service]
    
    setNewSlot({ ...newSlot, services })
  }

  const getActiveDays = () => {
    return DAYS.filter(day => timetableData.schedule[day] && Object.keys(timetableData.schedule[day]).length > 0)
  }

  return (
    <div className="room-edit-modal-overlay" onClick={onCancel}>
      <div className="room-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="room-edit-header">
          <h2>Edit Room</h2>
          <button className="btn-close-modal" onClick={onCancel}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="room-edit-form">
          <div className="form-group">
            <label>Building *</label>
            <select
              name="building_id"
              value={formData.building_id}
              onChange={handleChange}
              className={errors.building_id ? 'error' : ''}
              required
            >
              <option value="">Select a building</option>
              {buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
            {errors.building_id && (
              <span className="error-message">{errors.building_id}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Room Number *</label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                placeholder="e.g., 112, F-001"
                className={errors.room_number ? 'error' : ''}
                required
              />
              {errors.room_number && (
                <span className="error-message">{errors.room_number}</span>
              )}
            </div>

            <div className="form-group">
              <label>Floor</label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g., 1, 2, 3"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Room Name *</label>
            <input
              type="text"
              name="room_name"
              value={formData.room_name}
              onChange={handleChange}
              placeholder="e.g., Computer Lab, Dean's Office"
              className={errors.room_name ? 'error' : ''}
              required
            />
            {errors.room_name && (
              <span className="error-message">{errors.room_name}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_office"
                checked={formData.is_office}
                onChange={handleChange}
              />
              <FontAwesomeIcon icon={faStar} className="office-icon" />
              <span>Mark as Office/Special Room</span>
            </label>
          </div>

          {formData.is_office && (
            <>
              <div className="form-group">
                <label>Purpose/Services</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Administration, Faculty Office, Student Services"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Opening Hours</label>
                <input
                  type="text"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Fri 9am-5pm"
                />
              </div>

              {/* Timetable Section */}
              <div className="timetable-section">
                <div className="section-header-row">
                  <h4>
                    <FontAwesomeIcon icon={faClock} />
                    Weekly Schedule (Optional)
                  </h4>
                  <button
                    type="button"
                    className="btn-toggle-timetable"
                    onClick={() => setShowTimetable(!showTimetable)}
                  >
                    {showTimetable ? 'Hide Schedule' : 'Add Schedule'}
                  </button>
                </div>

                {showTimetable && (
                  <div className="timetable-editor">
                    <p className="help-text">
                      Create a complete weekly schedule with time slots and services for this office.
                    </p>

                    {/* Services Management */}
                    <div className="services-editor">
                      <label><strong>Step 1:</strong> Add Available Services</label>
                      <div className="services-input-row">
                        <input
                          type="text"
                          placeholder="e.g., Phone reception, Personal consultation"
                          value={newService}
                          onChange={(e) => setNewService(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addService()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addService}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      {timetableData.services.length > 0 && (
                        <div className="services-list">
                          {timetableData.services.map((service, idx) => (
                            <span key={idx} className="service-tag">
                              {service}
                              <button
                                type="button"
                                onClick={() => removeService(service)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Schedule Builder */}
                    {timetableData.services.length > 0 && (
                      <div className="schedule-builder">
                        <label><strong>Step 2:</strong> Build Weekly Schedule</label>
                        
                        {/* Active Days Display */}
                        {getActiveDays().length > 0 && (
                          <div className="active-schedule-display">
                            {getActiveDays().map(day => (
                              <div key={day} className="day-schedule-card">
                                <div className="day-schedule-header">
                                  <strong>{DAY_LABELS[day]}</strong>
                                  <button
                                    type="button"
                                    className="btn-edit-day"
                                    onClick={() => setEditingDay(editingDay === day ? null : day)}
                                  >
                                    {editingDay === day ? 'Close' : 'Add Slot'}
                                  </button>
                                </div>
                                <div className="day-slots">
                                  {Object.entries(timetableData.schedule[day]).map(([slotKey, slotData]) => (
                                    <div key={slotKey} className="time-slot-card">
                                      <div className="slot-info">
                                        <span className="slot-time">{slotData.time}</span>
                                        <div className="slot-services">
                                          {slotData.services.map((service, idx) => (
                                            <span key={idx} className="service-badge">{service}</span>
                                          ))}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn-remove-slot"
                                        onClick={() => removeTimeSlot(day, slotKey)}
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Day Selector */}
                        <div className="day-selector">
                          <p><strong>Add schedule for a day:</strong></p>
                          <div className="day-buttons">
                            {DAYS.map(day => (
                              <button
                                key={day}
                                type="button"
                                className={`btn-day ${editingDay === day ? 'active' : ''}`}
                                onClick={() => setEditingDay(editingDay === day ? null : day)}
                              >
                                {DAY_LABELS[day].substring(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time Slot Editor */}
                        {editingDay && (
                          <div className="slot-editor">
                            <h5>Add Time Slot for {DAY_LABELS[editingDay]}</h5>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Slot Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Morning, AM, Slot 1"
                                  value={newSlot.name}
                                  onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label>Time Range</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 9:00 - 11:00"
                                  value={newSlot.time}
                                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Services Available (select one or more)</label>
                              <div className="service-checkboxes">
                                {timetableData.services.map((service, idx) => (
                                  <label key={idx} className="service-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={newSlot.services.includes(service)}
                                      onChange={() => toggleSlotService(service)}
                                    />
                                    <span>{service}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="slot-editor-actions">
                              <button
                                type="button"
                                className="btn-cancel-slot"
                                onClick={() => {
                                  setEditingDay(null)
                                  setNewSlot({ name: '', time: '', services: [] })
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn-add-slot"
                                onClick={() => addTimeSlot(editingDay)}
                              >
                                <FontAwesomeIcon icon={faPlus} />
                                Add Slot
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea
                        value={timetableData.notes}
                        onChange={(e) => setTimetableData({ ...timetableData, notes: e.target.value })}
                        placeholder="e.g., Please arrive 10 minutes before your appointment"
                        rows="2"
                      />
                    </div>

                    {/* Preview */}
                    {(getActiveDays().length > 0 || timetableData.services.length > 0) && (
                      <div className="timetable-preview">
                        <h5>Preview:</h5>
                        <RoomTimetable timetable={timetableData} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={saving}
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoomEditModal
