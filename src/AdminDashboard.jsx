import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuilding, faPlus, faEdit, faTrash, faCopy, faSignOutAlt,
  faCheckCircle, faTimes, faMapMarkedAlt, faCog, faChartBar, faDoorOpen, faHome, faCheck
} from '@fortawesome/free-solid-svg-icons'
import Modal from './components/Modal'
import BuildingForm from './components/BuildingForm'
import RoomManagement from './components/RoomManagement'
import './AdminDashboard.css'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [university, setUniversity] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedBuildings, setSelectedBuildings] = useState([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const { adminSession, logout, getUniversity, addBuilding, updateBuilding, deleteBuilding } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminSession) {
      navigate('/admin/login')
      return
    }
    loadUniversity()
  }, [adminSession, navigate])

  const loadUniversity = async () => {
    const uni = await getUniversity()
    setUniversity(uni)
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const handleAddBuilding = () => {
    setEditingBuilding(null)
    setShowModal(true)
  }

  const handleEditBuilding = (building) => {
    setEditingBuilding(building)
    setShowModal(true)
  }

  const handleSaveBuilding = async (buildingData) => {
    if (editingBuilding) {
      const result = await updateBuilding(editingBuilding.id, buildingData)
      if (result.success) {
        await loadUniversity()
        setShowModal(false)
        setEditingBuilding(null)
      } else {
        alert(`Error: ${result.error}`)
      }
    } else {
      const result = await addBuilding(buildingData)
      if (result.success) {
        await loadUniversity()
        setShowModal(false)
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const handleDeleteBuilding = (buildingId) => {
    setDeleteConfirm(buildingId)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      const result = await deleteBuilding(deleteConfirm)
      if (result.success) {
        await loadUniversity()
        setDeleteConfirm(null)
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const toggleBuildingSelection = (buildingId) => {
    setSelectedBuildings(prev => {
      if (prev.includes(buildingId)) {
        return prev.filter(id => id !== buildingId)
      } else {
        return [...prev, buildingId]
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectedBuildings.length === university.buildings.length) {
      setSelectedBuildings([])
    } else {
      setSelectedBuildings(university.buildings.map(b => b.id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedBuildings.length === 0) {
      alert('Please select at least one building to delete')
      return
    }
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = selectedBuildings.map(buildingId => 
        deleteBuilding(buildingId)
      )
      
      await Promise.all(deletePromises)
      await loadUniversity()
      setSelectedBuildings([])
      setBulkDeleteConfirm(false)
    } catch (error) {
      alert(`Error deleting buildings: ${error.message}`)
    }
  }

  const copyPublicLink = () => {
    const link = `${window.location.origin}/map?uni=${university.id}`
    navigator.clipboard.writeText(link)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const getEmbedCode = () => {
    return `<iframe 
  src="${window.location.origin}/embed?uni=${university.id}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode())
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Calculate total rooms count
  const getTotalRoomsCount = () => {
    if (!university || !university.buildings) return 0
    return university.buildings.reduce((total, building) => {
      // Only count if rooms array exists and has actual room data
      const roomsArray = building.rooms
      if (Array.isArray(roomsArray) && roomsArray.length > 0) {
        // Check if it's aggregated count or actual rooms
        if (roomsArray[0] && typeof roomsArray[0].count === 'number') {
          return total + roomsArray[0].count
        }
        // If it's actual room objects, count them
        return total + roomsArray.length
      }
      return total
    }, 0)
  }

  if (!university) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <FontAwesomeIcon icon={faBuilding} className="header-icon" />
            <div>
              <h1>{university.name}</h1>
              <p className="university-city">{university.city}</p>
            </div>
          </div>
          <div className='dash' style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="btn-home" 
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--primary-dark)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--primary)'}
            >
              <FontAwesomeIcon icon={faHome} />
              Home
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faChartBar} />
          Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'buildings' ? 'active' : ''}`}
          onClick={() => setActiveTab('buildings')}
        >
          <FontAwesomeIcon icon={faBuilding} />
          Buildings
        </button>
        <button
          className={`nav-tab ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          <FontAwesomeIcon icon={faDoorOpen} />
          Rooms
        </button>
        <button
          className={`nav-tab ${activeTab === 'link' ? 'active' : ''}`}
          onClick={() => setActiveTab('link')}
        >
          <FontAwesomeIcon icon={faMapMarkedAlt} />
          Public Link
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FontAwesomeIcon icon={faCog} />
          Settings
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon building-stat">
                  <FontAwesomeIcon icon={faBuilding} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{university.buildings.length}</div>
                  <div className="stat-label">Total Buildings</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon room-stat">
                  <FontAwesomeIcon icon={faDoorOpen} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{getTotalRoomsCount()}</div>
                  <div className="stat-label">Total Rooms</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon map-stat">
                  <FontAwesomeIcon icon={faMapMarkedAlt} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">Active</div>
                  <div className="stat-label">Map Status</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon check-stat">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{new Date(university.created_at).toLocaleDateString()}</div>
                  <div className="stat-label">Created On</div>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn primary-action" onClick={handleAddBuilding}>
                  <FontAwesomeIcon icon={faPlus} />
                  Add New Building
                </button>
                <button className="action-btn secondary-action" onClick={() => setActiveTab('rooms')}>
                  <FontAwesomeIcon icon={faDoorOpen} />
                  Manage Rooms
                </button>
                <button className="action-btn secondary-action" onClick={() => setActiveTab('link')}>
                  <FontAwesomeIcon icon={faCopy} />
                  Get Public Link
                </button>
                <a
                  href={`/map?uni=${university.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn tertiary-action"
                >
                  <FontAwesomeIcon icon={faMapMarkedAlt} />
                  View Public Map
                </a>
              </div>
            </div>

            <div className="recent-buildings">
              <h2>Recent Buildings</h2>
              {university.buildings.length === 0 ? (
                <p className="empty-state">No buildings yet. Add your first building to get started!</p>
              ) : (
                <div className="buildings-preview">
                  {university.buildings
                    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                    .slice(0, 3)
                    .map((building) => (
                    <div key={building.id} className="building-preview-card">
                      <h3>{building.name}</h3>
                      <p className="building-category">{building.category}</p>
                      <p className="building-coords">
                        {building.coordinates[1].toFixed(4)}, {building.coordinates[0].toFixed(4)}
                      </p>
                      {(() => {
                        const roomsArray = building.rooms
                        let roomCount = 0
                        if (Array.isArray(roomsArray) && roomsArray.length > 0) {
                          if (roomsArray[0] && typeof roomsArray[0].count === 'number') {
                            roomCount = roomsArray[0].count
                          } else {
                            roomCount = roomsArray.length
                          }
                        }
                        return roomCount > 0 ? (
                          <p className="building-rooms">
                            <FontAwesomeIcon icon={faDoorOpen} /> {roomCount} rooms
                          </p>
                        ) : null
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buildings Tab */}
        {activeTab === 'buildings' && (
          <div className="buildings-tab">
            <div className="tab-header">
              <h2>Manage Buildings</h2>
              <div className="header-actions">
                {selectedBuildings.length > 0 && (
                  <button 
                    className="btn-bulk-delete" 
                    onClick={handleBulkDelete}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Selected ({selectedBuildings.length})
                  </button>
                )}
                <button className="btn-add" onClick={handleAddBuilding}>
                  <FontAwesomeIcon icon={faPlus} />
                  Add Building
                </button>
              </div>
            </div>

            {university.buildings.length === 0 ? (
              <div className="empty-state-large">
                <FontAwesomeIcon icon={faBuilding} className="empty-icon" />
                <h3>No Buildings Yet</h3>
                <p>Start by adding your first campus building</p>
                <button className="btn-add-first" onClick={handleAddBuilding}>
                  <FontAwesomeIcon icon={faPlus} />
                  Add First Building
                </button>
              </div>
            ) : (
              <>
                <div className="bulk-select-bar">
                  <label className="select-all-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedBuildings.length === university.buildings.length}
                      onChange={toggleSelectAll}
                    />
                    <span>Select All ({university.buildings.length})</span>
                  </label>
                </div>
                <div className="buildings-grid">
                  {university.buildings.map((building) => (
                    <div 
                      key={building.id} 
                      className={`building-card ${selectedBuildings.includes(building.id) ? 'selected' : ''}`}
                    >
                      <div className="building-card-select">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedBuildings.includes(building.id)}
                            onChange={() => toggleBuildingSelection(building.id)}
                          />
                          <span className="checkbox-custom">
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                        </label>
                      </div>
                      <div className="building-card-header">
                        <h3>{building.name}</h3>
                        <div className="building-actions">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEditBuilding(building)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteBuilding(building.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                      <div className="building-card-content">
                        <p className="building-category">
                          <strong>Category:</strong> {building.category}
                        </p>
                        <p className="building-coords">
                        <strong>Location:</strong> {building.coordinates[1].toFixed(6)}, {building.coordinates[0].toFixed(6)}
                        </p>
                        {(() => {
                        const roomsArray = building.rooms
                        let roomCount = 0
                        if (Array.isArray(roomsArray) && roomsArray.length > 0) {
                            if (roomsArray[0] && typeof roomsArray[0].count === 'number') {
                            roomCount = roomsArray[0].count
                          } else {
                            roomCount = roomsArray.length
                          }
                        }
                        return roomCount > 0 ? (
                          <p className="building-rooms">
                            <strong>Rooms:</strong> {roomCount}
                          </p>
                        ) : null
                      })()}
                        {building.description && (
                          <p className="building-description">{building.description}</p>
                        )}
                        {building.facilities && building.facilities.length > 0 && (
                          <p className="building-facilities">
                            <strong>Facilities:</strong> {building.facilities.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="rooms-tab">
            {university.buildings.length === 0 ? (
              <div className="empty-state-large">
                <FontAwesomeIcon icon={faBuilding} className="empty-icon" />
                <h3>No Buildings Yet</h3>
                <p>You need to add buildings before you can add rooms</p>
                <button className="btn-add-first" onClick={handleAddBuilding}>
                  <FontAwesomeIcon icon={faPlus} />
                  Add First Building
                </button>
              </div>
            ) : (
              <RoomManagement
                universityId={university.id}
                buildings={university.buildings}
                onClose={() => setActiveTab('overview')}
              />
            )}
          </div>
        )}

        {/* Public Link Tab */}
        {activeTab === 'link' && (
          <div className="link-tab">
            <h2>Public Map Link</h2>
            <p className="link-description">
              Share this link with students or embed it on your university website. No login required!
            </p>

            <div className="link-box">
              <label>Public Map URL:</label>
              <div className="link-input-group">
                <input
                  type="text"
                  value={`${window.location.origin}/map?uni=${university.id}`}
                  readOnly
                  className="link-input"
                />
                <button className="btn-copy" onClick={copyPublicLink}>
                  <FontAwesomeIcon icon={copySuccess ? faCheckCircle : faCopy} />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="embed-section">
              <h3>Embed Code</h3>
              <p>Copy this code to embed the map on your website:</p>
              <div className="code-box">
                <code>{getEmbedCode()}</code>
                <button className="btn-copy-code" onClick={copyEmbedCode}>
                  <FontAwesomeIcon icon={copySuccess ? faCheckCircle : faCopy} />
                  {copySuccess ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div className="link-preview">
              <h3>Preview</h3>
              <a
                href={`/map?uni=${university.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="preview-link"
              >
                <FontAwesomeIcon icon={faMapMarkedAlt} />
                Open Public Map in New Tab
              </a>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>University Settings</h2>
            <div className="settings-info">
              <div className="info-row">
                <label>University Name:</label>
                <span>{university.name}</span>
              </div>
              <div className="info-row">
                <label>City:</label>
                <span>{university.city}</span>
              </div>
              <div className="info-row">
                <label>Admin Email:</label>
                <span>{university.admin_email}</span>
              </div>
              <div className="info-row">
                <label>University ID:</label>
                <span className="mono">{university.id}</span>
              </div>
              <div className="info-row">
                <label>Created:</label>
                <span>{new Date(university.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Building Form Modal */}
      {showModal && (
        <Modal onClose={() => {
          setShowModal(false)
          setEditingBuilding(null)
        }}>
          <BuildingForm
            building={editingBuilding}
            onSave={handleSaveBuilding}
            onCancel={() => {
              setShowModal(false)
              setEditingBuilding(null)
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div className="delete-confirm">
            <h2>Delete Building?</h2>
            <p>Are you sure you want to delete this building? This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <Modal onClose={() => setBulkDeleteConfirm(false)}>
          <div className="delete-confirm">
            <h2>Delete {selectedBuildings.length} Building{selectedBuildings.length > 1 ? 's' : ''}?</h2>
            <p>Are you sure you want to delete these buildings? This action cannot be undone and will also delete all associated rooms.</p>
            <div className="confirm-buttons">
              <button className="btn-cancel" onClick={() => setBulkDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmBulkDelete}>
                <FontAwesomeIcon icon={faTrash} />
                Delete All
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminDashboard
