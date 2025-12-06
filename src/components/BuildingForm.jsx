import { useState, useEffect } from 'react'
import { useToast } from './Toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTimes, faStar, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import './BuildingForm.css'

function BuildingForm({ building, onSave, onCancel }) {
  const toast = useToast()
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

  const [officeRooms, setOfficeRooms] = useState([])
  const [errors, setErrors] = useState({})
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [saving, setSaving] = useState(false)

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the form errors')
      return
    }

    setSaving(true)
    toast.info(building ? 'Updating building...' : 'Adding building...')

    try {
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
        isAdminBuilding: formData.isAdminBuilding,
        is_admin_building: formData.isAdminBuilding // Also include snake_case version
      }

      await onSave(buildingData)
      toast.success(building ? 'Building updated successfully!' : 'Building added successfully!')
    } catch (error) {
      toast.error('Failed to save building')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
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

        {/* ADMINISTRATIVE BUILDING CHECKBOX - HIGHLIGHTED */}
        <div className={`form-group checkbox-group ${formData.isAdminBuilding ? 'active' : ''}`}>
          <label className="checkbox-label">
            <div className="custom-checkbox">
              <input
                type="checkbox"
                name="isAdminBuilding"
                checked={formData.isAdminBuilding}
                onChange={handleChange}
              />
              <span className="checkmark">
                {formData.isAdminBuilding && <FontAwesomeIcon icon={faStar} />}
              </span>
            </div>
            <span className="checkbox-text">
              <FontAwesomeIcon icon={faStar} className="star-icon" />
              Mark as Main Administrative Building
            </span>
          </label>
          <div className="help-text">
            <p>
              <strong>What this means:</strong> This building will appear on the Super Admin's global university map as your institution's primary administrative center.
            </p>
            {formData.isAdminBuilding && (
              <div className="warning-box">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>
                  <strong>Note:</strong> Saving this will automatically unmark any other building currently set as administrative. Only one building per university can be marked as the main administrative building.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Office Rooms from Rooms System - Info Only */}
        {building && officeRooms.length > 0 && (
          <div className="office-rooms-preview">
            <h3>
              <FontAwesomeIcon icon={faStar} />
              Office Rooms ({officeRooms.length})
            </h3>
            <p className="section-description">
              This building has {officeRooms.length} office room{officeRooms.length !== 1 ? 's' : ''}. To add, edit, or remove office rooms, go to the <strong>Rooms</strong> tab after saving this building.
            </p>
            <div className="office-rooms-grid">
              {officeRooms.slice(0, 6).map(room => (
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
            {officeRooms.length > 6 && (
              <p className="more-rooms-text">
                + {officeRooms.length - 6} more office{officeRooms.length - 6 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={saving}>
            <FontAwesomeIcon icon={faTimes} />
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={saving}>
            <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
            {saving ? 'Saving...' : (building ? 'Update' : 'Add') + ' Building'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BuildingForm
