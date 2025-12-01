import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTimes, faPlus, faTrash, faDoorOpen, faStar } from '@fortawesome/free-solid-svg-icons'
import './BuildingForm.css'

function BuildingForm({ building, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    category: 'Academic',
    description: '',
    facilities: '',
    departments: '',
    hours: '',
    isAdminBuilding: false
  })

  const [keyOffices, setKeyOffices] = useState([])
  const [officeRooms, setOfficeRooms] = useState([])
  const [errors, setErrors] = useState({})
  const [loadingRooms, setLoadingRooms] = useState(false)

  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name || '',
        latitude: building.coordinates[1].toString() || '',
        longitude: building.coordinates[0].toString() || '',
        category: building.category || 'Academic',
        description: building.description || '',
        facilities: building.facilities?.join(', ') || '',
        departments: building.departments?.join(', ') || '',
        hours: building.hours || '',
        isAdminBuilding: building.is_admin_building || building.isAdminBuilding || false
      })
      // Handle both snake_case (from DB) and camelCase (from local state)
      const offices = building.key_offices || building.keyOffices || []
      setKeyOffices(offices.map(office => ({
        id: office.id || Date.now().toString() + Math.random(),
        name: office.name || '',
        purpose: office.purpose || '',
        hours: office.hours || '',
        roomNumber: office.room_number || office.roomNumber || ''
      })))
      
      // Load office rooms from the new rooms system
      loadOfficeRooms(building.id)
    }
  }, [building])

  const loadOfficeRooms = async (buildingId) => {
    setLoadingRooms(true)
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.getRooms(buildingId)
      if (result.success) {
        const offices = result.data.filter(room => room.is_office)
        setOfficeRooms(offices)
      }
    } catch (err) {
      console.error('Error loading office rooms:', err)
    } finally {
      setLoadingRooms(false)
    }
  }

  const categories = [
    'Academic',
    'Administration',
    'Library',
    'Engineering',
    'Research',
    'Facilities',
    'Student Services',
    'Sports & Recreation',
    'Dining',
    'Residence',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const addKeyOffice = () => {
    setKeyOffices([
      ...keyOffices,
      {
        id: Date.now().toString(),
        name: '',
        purpose: '',
        hours: '',
        roomNumber: ''
      }
    ])
  }

  const removeKeyOffice = (id) => {
    setKeyOffices(keyOffices.filter((office) => office.id !== id))
  }

  const updateKeyOffice = (id, field, value) => {
    setKeyOffices(
      keyOffices.map((office) =>
        office.id === id ? { ...office, [field]: value } : office
      )
    )
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Building name is required'
    }

    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required'
    } else {
      const lat = parseFloat(formData.latitude)
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90'
      }
    }

    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required'
    } else {
      const lng = parseFloat(formData.longitude)
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180'
      }
    }

    // Validate key offices (only if name is provided)
    keyOffices.forEach((office, index) => {
      if (office.name.trim() && !office.purpose.trim()) {
        newErrors[`office_purpose_${index}`] = 'Purpose is required when office name is provided'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    // Filter out empty key offices
    const validKeyOffices = keyOffices.filter(
      (office) => office.name.trim() && office.purpose.trim()
    )

    const buildingData = {
      name: formData.name.trim(),
      coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      category: formData.category,
      description: formData.description.trim(),
      facilities: formData.facilities
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f),
      departments: formData.departments
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d),
      hours: formData.hours.trim(),
      keyOffices: validKeyOffices,
      isAdminBuilding: formData.isAdminBuilding,
      is_admin_building: formData.isAdminBuilding // Also include snake_case version
    }

    onSave(buildingData)
  }

  return (
    <div className="building-form">
      <h2>{building ? 'Edit Building' : 'Add New Building'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            Building Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Engineering Building"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">
              Latitude <span className="required">*</span>
            </label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g., 40.7128"
              className={errors.latitude ? 'error' : ''}
            />
            {errors.latitude && <span className="error-message">{errors.latitude}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="longitude">
              Longitude <span className="required">*</span>
            </label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g., -74.0060"
              className={errors.longitude ? 'error' : ''}
            />
            {errors.longitude && <span className="error-message">{errors.longitude}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the building..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="facilities">Facilities (comma-separated)</label>
          <input
            type="text"
            id="facilities"
            name="facilities"
            value={formData.facilities}
            onChange={handleChange}
            placeholder="e.g., WiFi, Computer Lab, Cafe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="departments">Departments (comma-separated)</label>
          <input
            type="text"
            id="departments"
            name="departments"
            value={formData.departments}
            onChange={handleChange}
            placeholder="e.g., Computer Science, Mathematics"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hours">Hours of Operation</label>
          <input
            type="text"
            id="hours"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            placeholder="e.g., 08:00 - 18:00"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isAdminBuilding"
              checked={formData.isAdminBuilding}
              onChange={handleChange}
            />
            <span>Mark as Main Administrative Building</span>
          </label>
          <p className="help-text">
            This building will appear on the Super Admin's global university map. Only one building per university can be marked as administrative.
          </p>
        </div>

        {/* Office Rooms from Rooms System */}
        {building && officeRooms.length > 0 && (
          <div className="office-rooms-preview">
            <h3>
              <FontAwesomeIcon icon={faStar} />
              Office Rooms
            </h3>
            <p className="section-description">
              These offices are managed in the Rooms section. Go to the Rooms tab to add or edit office rooms.
            </p>
            <div className="office-rooms-grid">
              {officeRooms.map(room => (
                <div key={room.id} className="office-room-preview-card">
                  <div className="room-header">
                    <span className="room-number">{room.room_number}</span>
                    <span className="office-badge">Office</span>
                  </div>
                  <strong>{room.room_name}</strong>
                  {room.purpose && <p>{room.purpose}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Offices Section (Legacy) */}
        <div className="key-offices-section">
          <div className="section-header">
            <h3>
              <FontAwesomeIcon icon={faDoorOpen} />
              Key Offices (Legacy - Optional)
            </h3>
            <button type="button" className="btn-add-office" onClick={addKeyOffice}>
              <FontAwesomeIcon icon={faPlus} />
              Add Office
            </button>
          </div>
          <p className="section-description">
            Legacy system for key offices. We recommend using the Rooms section for better management.
          </p>

          {keyOffices.length > 0 && (
            <div className="key-offices-list">
              {keyOffices.map((office, index) => (
                <div key={office.id} className="key-office-item">
                  <div className="office-header">
                    <span className="office-number">Office {index + 1}</span>
                    <button
                      type="button"
                      className="btn-remove-office"
                      onClick={() => removeKeyOffice(office.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Office Name</label>
                      <input
                        type="text"
                        value={office.name}
                        onChange={(e) => updateKeyOffice(office.id, 'name', e.target.value)}
                        placeholder="e.g., Dean's Office"
                      />
                    </div>
                    <div className="form-group">
                      <label>Room Number</label>
                      <input
                        type="text"
                        value={office.roomNumber}
                        onChange={(e) => updateKeyOffice(office.id, 'roomNumber', e.target.value)}
                        placeholder="e.g., Room 301"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Purpose/Services</label>
                    <input
                      type="text"
                      value={office.purpose}
                      onChange={(e) => updateKeyOffice(office.id, 'purpose', e.target.value)}
                      placeholder="e.g., Academic advising, course registration"
                      className={errors[`office_purpose_${index}`] ? 'error' : ''}
                    />
                    {errors[`office_purpose_${index}`] && (
                      <span className="error-message">{errors[`office_purpose_${index}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Office Hours</label>
                    <input
                      type="text"
                      value={office.hours}
                      onChange={(e) => updateKeyOffice(office.id, 'hours', e.target.value)}
                      placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <FontAwesomeIcon icon={faTimes} />
            Cancel
          </button>
          <button type="submit" className="btn-save">
            <FontAwesomeIcon icon={faSave} />
            {building ? 'Update' : 'Add'} Building
          </button>
        </div>
      </form>
    </div>
  )
}

export default BuildingForm
