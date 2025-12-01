import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDoorOpen, faPlus, faUpload, faEdit, faTrash, faStar, faSearch,
  faTimes, faDownload, faFileExcel, faExclamationTriangle, faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import RoomEditModal from './RoomEditModal'
import './RoomManagement.css'

function RoomManagement({ universityId, buildings, onClose }) {
  const [activeView, setActiveView] = useState('list') // 'list', 'add', 'bulk'
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)

  // Load rooms on mount
  useEffect(() => {
    loadRooms()
  }, [universityId])

  // Filter rooms when search or building changes
  useEffect(() => {
    filterRooms()
  }, [searchQuery, selectedBuilding, rooms])

  const loadRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.getAllRoomsForUniversity(universityId)
      
      if (result.success) {
        setRooms(result.data || [])
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = rooms

    // Filter by building
    if (selectedBuilding !== 'all') {
      filtered = filtered.filter(room => room.building_id === selectedBuilding)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(room =>
        room.room_number.toLowerCase().includes(query) ||
        room.room_name.toLowerCase().includes(query) ||
        (room.purpose && room.purpose.toLowerCase().includes(query))
      )
    }

    setFilteredRooms(filtered)
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.deleteRoom(roomId)
      
      if (result.success) {
        setSuccess('Room deleted successfully')
        loadRooms()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleOffice = async (room) => {
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.updateRoom(room.id, {
        is_office: !room.is_office
      })
      
      if (result.success) {
        setSuccess(room.is_office ? 'Office status removed' : 'Marked as office')
        loadRooms()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditRoom = async (roomId, updates) => {
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.updateRoom(roomId, updates)
      
      if (result.success) {
        setSuccess('Room updated successfully')
        loadRooms()
        setEditingRoom(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const downloadCSVTemplate = () => {
    const csv = 'room_number,room_name,building_name\nF-001,Computer Lab,F Building\nF-002,Lecture Hall,F Building\nP-101,Dean Office,P Building'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rooms_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId)
    return building ? building.name : 'Unknown Building'
  }

  return (
    <div className="room-management">
      <div className="room-management-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faDoorOpen} className="header-icon" />
          <h2>Room Management</h2>
        </div>
        <button className="btn-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="message error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}
      {success && (
        <div className="message success-message">
          <FontAwesomeIcon icon={faCheckCircle} />
          {success}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="room-nav-tabs">
        <button
          className={`room-nav-tab ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
        >
          <FontAwesomeIcon icon={faDoorOpen} />
          All Rooms ({rooms.length})
        </button>
        <button
          className={`room-nav-tab ${activeView === 'add' ? 'active' : ''}`}
          onClick={() => setActiveView('add')}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Room
        </button>
        <button
          className={`room-nav-tab ${activeView === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveView('bulk')}
        >
          <FontAwesomeIcon icon={faUpload} />
          Bulk Import
        </button>
      </div>

      {/* Content Area */}
      <div className="room-content">
        {/* LIST VIEW */}
        {activeView === 'list' && (
          <div className="rooms-list-view">
            <div className="list-filters">
              <div className="filter-group">
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="building-filter"
                >
                  <option value="all">All Buildings</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Loading rooms...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon icon={faDoorOpen} className="empty-icon" />
                <h3>No Rooms Found</h3>
                <p>
                  {rooms.length === 0
                    ? 'Start by adding rooms or importing from CSV'
                    : 'No rooms match your search criteria'}
                </p>
              </div>
            ) : (
              <div className="rooms-table-container">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Room Name</th>
                      <th>Building</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map(room => (
                      <tr key={room.id}>
                        <td className="room-number">{room.room_number}</td>
                        <td>{room.room_name}</td>
                        <td>{room.building?.name || getBuildingName(room.building_id)}</td>
                        <td>
                          {room.is_office ? (
                            <span className="office-badge">
                              <FontAwesomeIcon icon={faStar} /> Office
                            </span>
                          ) : (
                            <span className="room-badge">Room</span>
                          )}
                        </td>
                        <td>
                          <div className="room-actions">
                            <button
                              className="btn-icon"
                              onClick={() => handleToggleOffice(room)}
                              title={room.is_office ? 'Remove office status' : 'Mark as office'}
                            >
                              <FontAwesomeIcon icon={faStar} />
                            </button>
                            <button
                              className="btn-icon edit"
                              onClick={() => setEditingRoom(room)}
                              title="Edit room"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteRoom(room.id)}
                              title="Delete room"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD ROOM VIEW */}
        {activeView === 'add' && (
          <AddRoomForm
            buildings={buildings}
            universityId={universityId}
            onSuccess={() => {
              setSuccess('Room added successfully')
              loadRooms()
              setTimeout(() => setSuccess(null), 3000)
            }}
            onError={setError}
          />
        )}

        {/* BULK IMPORT VIEW */}
        {activeView === 'bulk' && (
          <BulkImportView
            buildings={buildings}
            universityId={universityId}
            onSuccess={(message) => {
              setSuccess(message)
              loadRooms()
              setTimeout(() => setSuccess(null), 3000)
            }}
            onError={setError}
            onDownloadTemplate={downloadCSVTemplate}
          />
        )}
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
        <RoomEditModal
          room={editingRoom}
          buildings={buildings}
          onSave={handleEditRoom}
          onCancel={() => setEditingRoom(null)}
        />
      )}
    </div>
  )
}

// Add Room Form Component
function AddRoomForm({ buildings, universityId, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    building_id: '',
    room_number: '',
    room_name: '',
    is_office: false,
    purpose: '',
    hours: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    onError(null)

    try {
      if (!formData.building_id) {
        throw new Error('Please select a building')
      }
      if (!formData.room_number || !formData.room_name) {
        throw new Error('Room number and name are required')
      }

      const { dbService } = await import('../lib/dbService')
      const result = await dbService.createRoom({
        building_id: formData.building_id,
        university_id: universityId,
        room_number: formData.room_number.trim(),
        room_name: formData.room_name.trim(),
        is_office: formData.is_office,
        purpose: formData.is_office && formData.purpose ? formData.purpose.trim() : null,
        hours: formData.is_office && formData.hours ? formData.hours.trim() : null
      })

      if (result.success) {
        setFormData({
          building_id: formData.building_id, // Keep building selected
          room_number: '',
          room_name: '',
          is_office: false,
          purpose: '',
          hours: ''
        })
        onSuccess()
      } else {
        onError(result.error)
      }
    } catch (err) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="add-room-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Building *</label>
        <select
          value={formData.building_id}
          onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
          required
        >
          <option value="">Select a building</option>
          {buildings.map(building => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Room Number *</label>
          <input
            type="text"
            placeholder="e.g., 112, F-001, Lab A"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            required
          />
          <small>Can be numbers, letters, or combination</small>
        </div>

        <div className="form-group">
          <label>Room Name *</label>
          <input
            type="text"
            placeholder="e.g., Computer Lab, Dean's Office"
            value={formData.room_name}
            onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.is_office}
            onChange={(e) => setFormData({ ...formData, is_office: e.target.checked })}
          />
          <span>Mark as Office/Special Room</span>
        </label>
      </div>

      {formData.is_office && (
        <>
          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text"
              placeholder="e.g., Administration, Faculty Office"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Opening Hours</label>
            <input
              type="text"
              placeholder="e.g., Mon-Fri 9am-5pm"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            />
          </div>
        </>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Room'}
      </button>
    </form>
  )
}

// Bulk Import View Component
function BulkImportView({ buildings, universityId, onSuccess, onError, onDownloadTemplate }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [importResults, setImportResults] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      onError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    previewCSV(selectedFile)
  }

  const previewCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const previewLines = lines.slice(0, 6) // Header + 5 rows
      setPreview(previewLines.join('\n'))
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!file) {
      onError('Please select a file')
      return
    }

    setLoading(true)
    onError(null)
    setImportResults(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows')
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const roomNumberIndex = headers.indexOf('room_number')
      const roomNameIndex = headers.indexOf('room_name')
      const buildingNameIndex = headers.indexOf('building_name')

      if (roomNumberIndex === -1 || roomNameIndex === -1 || buildingNameIndex === -1) {
        throw new Error('CSV must have columns: room_number, room_name, building_name')
      }

      // Build building name to ID map
      const buildingMap = {}
      buildings.forEach(b => {
        buildingMap[b.name.toLowerCase().trim()] = b.id
      })

      // Process rows
      const roomsToImport = []
      const skippedRows = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const roomNumber = values[roomNumberIndex]
        const roomName = values[roomNameIndex]
        const buildingName = values[buildingNameIndex]

        if (!roomNumber || !roomName || !buildingName) {
          skippedRows.push({ row: i + 1, reason: 'Missing required fields' })
          continue
        }

        const buildingId = buildingMap[buildingName.toLowerCase().trim()]
        if (!buildingId) {
          skippedRows.push({ row: i + 1, reason: `Building "${buildingName}" not found` })
          continue
        }

        roomsToImport.push({
          building_id: buildingId,
          university_id: universityId,
          room_number: roomNumber,
          room_name: roomName
        })
      }

      if (roomsToImport.length === 0) {
        throw new Error('No valid rooms to import')
      }

      // Import rooms
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.createRoomsBulk(roomsToImport)

      if (result.success) {
        setImportResults({
          imported: result.count,
          skipped: skippedRows.length,
          skippedRows
        })
        onSuccess(`Successfully imported ${result.count} rooms`)
      } else {
        onError(result.error)
      }
    } catch (err) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bulk-import-view">
      <div className="import-instructions">
        <h3>CSV Import Instructions</h3>
        <ol>
          <li>Download the CSV template below</li>
          <li>Fill in your room data with columns: <code>room_number</code>, <code>room_name</code>, <code>building_name</code></li>
          <li>Ensure building names match exactly with buildings you've created</li>
          <li>Upload the completed CSV file</li>
        </ol>
        <button className="btn-secondary" onClick={onDownloadTemplate}>
          <FontAwesomeIcon icon={faDownload} />
          Download CSV Template
        </button>
      </div>

      <div className="file-upload-section">
        <label className="file-upload-label">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="file-upload-area">
            <FontAwesomeIcon icon={faFileExcel} className="upload-icon" />
            <p>{file ? file.name : 'Click to select CSV file'}</p>
            <small>Only .csv files are accepted</small>
          </div>
        </label>

        {preview && (
          <div className="csv-preview">
            <h4>Preview (first 5 rows):</h4>
            <pre>{preview}</pre>
          </div>
        )}

        {file && (
          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Rooms'}
          </button>
        )}
      </div>

      {importResults && (
        <div className="import-results">
          <h3>Import Results</h3>
          <div className="results-summary">
            <div className="result-stat success">
              <FontAwesomeIcon icon={faCheckCircle} />
              <div>
                <strong>{importResults.imported}</strong>
                <span>Imported</span>
              </div>
            </div>
            <div className="result-stat warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <div>
                <strong>{importResults.skipped}</strong>
                <span>Skipped</span>
              </div>
            </div>
          </div>

          {importResults.skippedRows.length > 0 && (
            <div className="skipped-rows">
              <h4>Skipped Rows:</h4>
              <ul>
                {importResults.skippedRows.map((skip, i) => (
                  <li key={i}>
                    Row {skip.row}: {skip.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RoomManagement
