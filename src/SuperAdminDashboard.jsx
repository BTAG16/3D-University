import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { dbService } from './lib/dbService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserShield,
  faUniversity,
  faBuilding,
  faUsers,
  faSignOutAlt,
  faEye,
  faTrash,
  faChartLine,
  faGlobe,
  faMap,
  faClock,
  faRedoAlt
} from '@fortawesome/free-solid-svg-icons'
import './SuperAdminDashboard.css'

function SuperAdminDashboard() {
  const [universities, setUniversities] = useState([])
  const [stats, setStats] = useState({
    totalUniversities: 0,
    totalBuildings: 0,
    totalAdmins: 0,
    recentActivity: []
  })
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const { adminSession, logout, extendSuperAdminSession } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if super admin is authenticated
    if (!adminSession) {
      navigate('/admin')
      return
    }

    if (!adminSession.user.isSuperAdmin) {
      navigate('/admin/dashboard')
      return
    }

    // Load all universities
    loadUniversities()
  }, [adminSession, navigate])

  // Session timer
  useEffect(() => {
    if (!adminSession?.user?.isSuperAdmin) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Session expired
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [adminSession])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleExtendSession = () => {
    const result = extendSuperAdminSession()
    if (result.success) {
      setTimeRemaining(600) // Reset to 10 minutes
    }
  }

  const loadUniversities = async () => {
    try {
      setLoading(true)
      
      // Get all universities
      const universitiesResult = await dbService.getAllUniversities()
      if (!universitiesResult.success) {
        console.error('Failed to load universities:', universitiesResult.error)
        setLoading(false)
        return
      }

      const universitiesList = universitiesResult.data || []

      // Get stats
      const statsResult = await dbService.getStats()
      if (statsResult.success) {
        setStats({
          totalUniversities: statsResult.data.totalUniversities,
          totalBuildings: statsResult.data.totalBuildings,
          totalAdmins: statsResult.data.totalAdmins,
          recentActivity: universitiesList.slice(-5).reverse()
        })
      }

      setUniversities(universitiesList)
      setLoading(false)
    } catch (error) {
      console.error('Error loading universities:', error)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  const handleViewGlobalMap = () => {
    navigate('/super-admin/map')
  }

  const handleViewPublicMap = (universityId) => {
    window.open(`/map?uni=${universityId}`, '_blank')
  }

  const handleDeleteUniversity = async (universityId) => {
    if (window.confirm('Are you sure you want to delete this university? This action cannot be undone.')) {
      try {
        const result = await dbService.deleteUniversity(universityId)
        if (result.success) {
          alert('University deleted successfully')
          loadUniversities()
        } else {
          alert(`Failed to delete: ${result.error}`)
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert(`Error: ${error.message}`)
      }
    }
  }

  const handleViewDetails = (university) => {
    setSelectedUniversity(university)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 20
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const isTimerCritical = timeRemaining <= 120 // Last 2 minutes

  return (
    <div className="super-admin-dashboard">
      {/* Header */}
      <header className="super-admin-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faUserShield} className="header-icon" />
          <div>
            <h1>Super Admin Dashboard</h1>
            <p>System-wide Overview & Management</p>
          </div>
        </div>
        <div className="header-actions">
          {/* Session Timer */}
          <div className={`session-timer ${isTimerCritical ? 'critical' : ''}`}>
            <FontAwesomeIcon icon={faClock} />
            <span className="timer-text">{formatTime(timeRemaining)}</span>
            <button 
              className="btn-extend-session"
              onClick={handleExtendSession}
              title="Extend session by 10 minutes"
            >
              <FontAwesomeIcon icon={faRedoAlt} />
            </button>
          </div>

          <button 
            className="btn-view-map"
            onClick={handleViewGlobalMap}
          >
            <FontAwesomeIcon icon={faMap} />
            View Global Map
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon university">
            <FontAwesomeIcon icon={faUniversity} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUniversities}</h3>
            <p>Universities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon buildings">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalBuildings}</h3>
            <p>Total Buildings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admins">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAdmins}</h3>
            <p>Admin Accounts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activity">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-content">
            <h3>{stats.recentActivity.length}</h3>
            <p>Recent Activity</p>
          </div>
        </div>
      </div>

      {/* Universities Table */}
      <div className="content-section">
        <div className="section-header">
          <h2>
            <FontAwesomeIcon icon={faUniversity} />
            All Universities
          </h2>
        </div>

        {universities.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faUniversity} className="empty-icon" />
            <h3>No Universities Yet</h3>
            <p>Universities will appear here once admins register.</p>
          </div>
        ) : (
          <div className="universities-table">
            <table>
              <thead>
                <tr>
                  <th>University Name</th>
                  <th>City</th>
                  <th>Buildings</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((university) => (
                  <tr key={university.id}>
                    <td className="university-name">
                      <FontAwesomeIcon icon={faUniversity} />
                      {university.name}
                    </td>
                    <td>{university.city}</td>
                    <td>
                      <span className="badge">
                        {university.buildings?.length || 0}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(university.created_at).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action view"
                        onClick={() => handleViewDetails(university)}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn-action map"
                        onClick={() => handleViewPublicMap(university.id)}
                        title="View Public Map"
                      >
                        <FontAwesomeIcon icon={faGlobe} />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteUniversity(university.id)}
                        title="Delete University"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* University Details Modal */}
      {selectedUniversity && (
        <div className="modal-overlay" onClick={() => setSelectedUniversity(null)}>
          <div className="university-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUniversity.name}</h2>
              <button className="btn-close" onClick={() => setSelectedUniversity(null)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-row">
                <strong>City:</strong>
                <span>{selectedUniversity.city}</span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{new Date(selectedUniversity.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>University ID:</strong>
                <span className="mono">{selectedUniversity.id}</span>
              </div>
              <div className="detail-row">
                <strong>Buildings:</strong>
                <span>{selectedUniversity.buildings?.length || 0}</span>
              </div>

              {selectedUniversity.buildings && selectedUniversity.buildings.length > 0 && (
                <div className="buildings-list-modal">
                  <h3>Buildings</h3>
                  <div className="buildings-grid">
                    {selectedUniversity.buildings.map((building) => (
                      <div key={building.id} className="building-item">
                        <FontAwesomeIcon icon={faBuilding} />
                        <div>
                          <strong>{building.name}</strong>
                          <small>{building.category}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn-modal-action"
                  onClick={() => handleViewPublicMap(selectedUniversity.id)}
                >
                  <FontAwesomeIcon icon={faGlobe} />
                  View Public Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminDashboard
