import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { dbService } from './lib/dbService'
import { useToast } from './components/Toast'
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
  faRedoAlt,
  faHome,
  faEnvelope,
  faBars,
  faTimes,
  faCog,
  faKey,
  faDoorOpen,
  faChartBar,
  faChartPie,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
import './SuperAdminDashboard.css'

function SuperAdminDashboard() {
  const toast = useToast()
  const [universities, setUniversities] = useState([])
  const [stats, setStats] = useState({
    totalUniversities: 0,
    totalBuildings: 0,
    totalAdmins: 0,
    totalRooms: 0,
    recentActivity: []
  })
  const [analytics, setAnalytics] = useState({
    avgBuildingsPerUniversity: 0,
    avgRoomsPerBuilding: 0,
    mostActiveUniversities: [],
    categoryDistribution: {},
    growthTrend: []
  })
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(600)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const { adminSession, logout, extendSuperAdminSession } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminSession) {
      navigate('/admin')
      return
    }

    if (!adminSession.user.isSuperAdmin) {
      navigate('/admin/dashboard')
      return
    }

    loadData()
  }, [adminSession, navigate])

  useEffect(() => {
    if (!adminSession?.user?.isSuperAdmin) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
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
      setTimeRemaining(600)
      toast.success('Session extended by 10 minutes')
    } else {
      toast.error('Failed to extend session')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [universitiesResult, statsResult] = await Promise.all([
        dbService.getAllUniversities(),
        dbService.getStats()
      ])

      if (!universitiesResult.success) {
        console.error('Failed to load universities:', universitiesResult.error)
        setLoading(false)
        return
      }

      const universitiesList = universitiesResult.data || []
      setUniversities(universitiesList)

      if (statsResult.success) {
        setStats({
          totalUniversities: statsResult.data.totalUniversities,
          totalBuildings: statsResult.data.totalBuildings,
          totalAdmins: statsResult.data.totalAdmins,
          totalRooms: statsResult.data.totalRooms,
          recentActivity: universitiesList.slice(-5).reverse()
        })

        // Calculate analytics (GDPR compliant - no personal data)
        calculateAnalytics(universitiesList, statsResult.data)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const calculateAnalytics = (universities, stats) => {
    // Average buildings per university
    const avgBuildings = universities.length > 0 
      ? (stats.totalBuildings / universities.length).toFixed(1)
      : 0

    // Average rooms per building
    const avgRooms = stats.totalBuildings > 0
      ? (stats.totalRooms / stats.totalBuildings).toFixed(1)
      : 0

    // Most active universities (by building count)
    const mostActive = universities
      .map(uni => ({
        name: uni.name,
        buildingCount: uni.buildings?.[0]?.count || 0
      }))
      .sort((a, b) => b.buildingCount - a.buildingCount)
      .slice(0, 5)

    // Growth trend (last 7 days based on created_at)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const growthTrend = last7Days.map(date => {
      const count = universities.filter(uni => 
        uni.created_at.split('T')[0] === date
      ).length
      return { date, count }
    })

    setAnalytics({
      avgBuildingsPerUniversity: avgBuildings,
      avgRoomsPerBuilding: avgRooms,
      mostActiveUniversities: mostActive,
      growthTrend
    })
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
    if (window.confirm('Are you sure you want to delete this university? This action cannot be undone and will delete all associated buildings, rooms, and admin accounts.')) {
      try {
        toast.info('Deleting university...')
        const result = await dbService.deleteUniversity(universityId)
        if (result.success) {
          toast.success('University deleted successfully')
          loadData()
        } else {
          toast.error(`Failed to delete: ${result.error}`)
        }
      } catch (error) {
        console.error('Delete error:', error)
        toast.error(`Error: ${error.message}`)
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

  const isTimerCritical = timeRemaining <= 120

  return (
    <div className="super-admin-dashboard">
      {/* Header */}
      <header className="super-admin-header">
        <div className="header-left">
          <button 
            className="mobile-menu-trigger"
            onClick={() => setShowMobileNav(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <FontAwesomeIcon icon={faUserShield} className="header-icon" />
          <div className="header-title">
            <h1>Super Admin Dashboard</h1>
            <p>System-wide Overview & Management</p>
          </div>
        </div>
        <div className="header-actions">
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
            className="btn-contact"
            onClick={() => window.location.href = 'mailto:seuncloud03@gmail.com'}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span className="btn-text">Contact</span>
          </button>
          <button 
            className="btn-home"
            onClick={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faHome} />
            <span className="btn-text">Home</span>
          </button>
          <button 
            className="btn-view-map"
            onClick={handleViewGlobalMap}
          >
            <FontAwesomeIcon icon={faMap} />
            <span className="btn-text">Map</span>
          </button>
          <button 
            className="btn-settings"
            onClick={() => setShowSettingsModal(true)}
          >
            <FontAwesomeIcon icon={faCog} />
            <span className="btn-text">Settings</span>
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {showMobileNav && (
        <div className="mobile-nav-overlay" onClick={() => setShowMobileNav(false)}>
          <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <h3>Navigation</h3>
              <button onClick={() => setShowMobileNav(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <nav className="mobile-nav-items">
              <button 
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => { setActiveTab('overview'); setShowMobileNav(false); }}
              >
                <FontAwesomeIcon icon={faChartLine} />
                Overview
              </button>
              <button 
                className={activeTab === 'analytics' ? 'active' : ''}
                onClick={() => { setActiveTab('analytics'); setShowMobileNav(false); }}
              >
                <FontAwesomeIcon icon={faChartBar} />
                Analytics
              </button>
              <button 
                className={activeTab === 'universities' ? 'active' : ''}
                onClick={() => { setActiveTab('universities'); setShowMobileNav(false); }}
              >
                <FontAwesomeIcon icon={faUniversity} />
                Universities
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Navigation Tabs */}
      <nav className="dashboard-nav desktop-only">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faChartLine} />
          Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FontAwesomeIcon icon={faChartBar} />
          Analytics
        </button>
        <button
          className={`nav-tab ${activeTab === 'universities' ? 'active' : ''}`}
          onClick={() => setActiveTab('universities')}
        >
          <FontAwesomeIcon icon={faUniversity} />
          Universities
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
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
                <div className="stat-icon rooms">
                  <FontAwesomeIcon icon={faDoorOpen} />
                </div>
                <div className="stat-content">
                  <h3>{stats.totalRooms}</h3>
                  <p>Total Rooms</p>
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
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-grid">
              <div className="quick-stat-card">
                <div className="quick-stat-header">
                  <FontAwesomeIcon icon={faChartPie} />
                  <h4>Avg. Buildings/University</h4>
                </div>
                <div className="quick-stat-value">{analytics.avgBuildingsPerUniversity}</div>
              </div>
              <div className="quick-stat-card">
                <div className="quick-stat-header">
                  <FontAwesomeIcon icon={faChartPie} />
                  <h4>Avg. Rooms/Building</h4>
                </div>
                <div className="quick-stat-value">{analytics.avgRoomsPerBuilding}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="content-section">
              <h2>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Recent Universities
              </h2>
              {stats.recentActivity.length === 0 ? (
                <p>No recent activity</p>
              ) : (
                <div className="activity-list">
                  {stats.recentActivity.map((uni) => (
                    <div key={uni.id} className="activity-item">
                      <div className="activity-info">
                        <FontAwesomeIcon icon={faUniversity} />
                        <div>
                          <strong>{uni.name}</strong>
                          <small>{uni.city}</small>
                        </div>
                      </div>
                      <small className="activity-date">
                        {new Date(uni.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>
              <FontAwesomeIcon icon={faChartBar} />
              Platform Analytics
            </h2>

            {/* Top Universities */}
            <div className="analytics-card">
              <h3>
                <FontAwesomeIcon icon={faChartLine} />
                Most Active Universities
              </h3>
              <div className="analytics-list">
                {analytics.mostActiveUniversities.map((uni, index) => (
                  <div key={index} className="analytics-item">
                    <div className="analytics-rank">{index + 1}</div>
                    <div className="analytics-info">
                      <strong>{uni.name}</strong>
                      <div className="analytics-bar">
                        <div 
                          className="analytics-bar-fill"
                          style={{
                            width: `${(uni.buildingCount / (analytics.mostActiveUniversities[0]?.buildingCount || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="analytics-value">{uni.buildingCount} buildings</div>
                  </div>
                ))}
                {analytics.mostActiveUniversities.length === 0 && (
                  <p>No data available</p>
                )}
              </div>
            </div>

            {/* Growth Trend */}
            <div className="analytics-card">
              <h3>
                <FontAwesomeIcon icon={faCalendarAlt} />
                7-Day Growth Trend
              </h3>
              <div className="growth-chart">
                {analytics.growthTrend.map((day, index) => (
                  <div key={index} className="growth-bar-container">
                    <div 
                      className="growth-bar"
                      style={{
                        height: `${day.count * 20 + 20}px`
                      }}
                    >
                      <span className="growth-value">{day.count}</span>
                    </div>
                    <small className="growth-date">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="analytics-card">
              <h3>
                <FontAwesomeIcon icon={faChartPie} />
                Platform Health
              </h3>
              <div className="health-metrics">
                <div className="health-metric">
                  <div className="health-label">Average Buildings per University</div>
                  <div className="health-value">{analytics.avgBuildingsPerUniversity}</div>
                  <div className="health-indicator good">
                    {parseFloat(analytics.avgBuildingsPerUniversity) > 5 ? 'Good' : 'Fair'}
                  </div>
                </div>
                <div className="health-metric">
                  <div className="health-label">Average Rooms per Building</div>
                  <div className="health-value">{analytics.avgRoomsPerBuilding}</div>
                  <div className="health-indicator good">
                    {parseFloat(analytics.avgRoomsPerBuilding) > 10 ? 'Good' : 'Fair'}
                  </div>
                </div>
                <div className="health-metric">
                  <div className="health-label">Total Platform Data Points</div>
                  <div className="health-value">{stats.totalUniversities + stats.totalBuildings + stats.totalRooms}</div>
                  <div className="health-indicator good">Active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Universities Tab */}
        {activeTab === 'universities' && (
          <div className="universities-section">
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
                            {university.buildings?.[0]?.count || 0}
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
        )}
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SuperAdminSettings 
          onClose={() => setShowSettingsModal(false)}
          adminSession={adminSession}
        />
      )}

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
                <span>{selectedUniversity.buildings?.[0]?.count || 0}</span>
              </div>

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

// Super Admin Settings Component
function SuperAdminSettings({ onClose, adminSession }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('info')
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faCog} />
            Settings
          </h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-tabs">
          <button
            className={activeSettingsTab === 'info' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('info')}
          >
            Account Info
          </button>
          <button
            className={activeSettingsTab === 'security' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('security')}
          >
            Security
          </button>
        </div>

        <div className="settings-content">
          {activeSettingsTab === 'info' && (
            <div className="settings-section">
              <h3>Account Information</h3>
              <div className="info-row">
                <label>Email:</label>
                <span>{adminSession.user.email}</span>
              </div>
              <div className="info-row">
                <label>Role:</label>
                <span className="badge super-admin">Super Administrator</span>
              </div>
              <div className="info-row">
                <label>Access Level:</label>
                <span>Full System Access</span>
              </div>
              <p className="settings-note">
                <FontAwesomeIcon icon={faKey} />
                Super Admin accounts use time-limited key-based authentication for enhanced security.
              </p>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="security-item">
                <div className="security-info">
                  <h4>Session Duration</h4>
                  <p>10 minutes per session with extension option</p>
                </div>
                <span className="badge active">Active</span>
              </div>
              <div className="security-item">
                <div className="security-info">
                  <h4>Key-Based Authentication</h4>
                  <p>One-time use security keys sent to registered email</p>
                </div>
                <span className="badge active">Enabled</span>
              </div>
              <p className="settings-note">
                Super Admin security settings are managed at the system level and cannot be modified.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
