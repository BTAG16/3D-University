import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCog,
  faUser,
  faLock,
  faTrash,
  faExclamationTriangle,
  faEnvelope,
  faKey,
  faCheckCircle,
  faTimes,
  faBell,
  faPalette,
  faGlobe,
  faClock,
  faShieldAlt,
  faDownload,
  faUserCircle,
  faCamera,
  faBuilding,
  faCalendar,
  faToggleOn,
  faToggleOff,
  faMoon,
  faSun,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'
import './AdminSettings.css'

function AdminSettings({ onClose, adminSession, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const avatarInputRef = useRef(null)

  // Profile state
  const [profileData, setProfileData] = useState({
    displayName: '',
    jobTitle: '',
    department: '',
    phone: '',
    bio: ''
  })

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    buildingUpdates: true,
    roomChanges: true,
    weeklyReports: false,
    securityAlerts: true,
    systemUpdates: true
  })

  // Appearance preferences
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    dashboardLayout: 'grid'
  })

  // Privacy preferences
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'university',
    showEmail: false,
    showPhone: false,
    dataSharing: false
  })

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  // Activity log
  const [activityLog, setActivityLog] = useState([])
  const [avatarPreview, setAvatarPreview] = useState('')

  // Load user preferences from localStorage
  useEffect(() => {
    loadUserPreferences()
    loadActivityLog()
  }, [])

  const loadUserPreferences = () => {
    const savedNotifications = localStorage.getItem('adminNotifications')
    const savedAppearance = localStorage.getItem('adminAppearance')
    const savedPrivacy = localStorage.getItem('adminPrivacy')
    const savedProfile = localStorage.getItem('adminProfile')

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance))
      applyTheme(JSON.parse(savedAppearance).theme)
    }
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy))
    }
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfileData(parsedProfile)
      if (parsedProfile.avatarPreview) {
        setAvatarPreview(parsedProfile.avatarPreview)
      }
    }
  }

  const loadActivityLog = () => {
    const log = localStorage.getItem('adminActivityLog')
    if (log) {
      setActivityLog(JSON.parse(log))
    }
  }

  const applyTheme = (theme) => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      return
    }
    document.documentElement.setAttribute('data-theme', theme)
  }

  const handleAvatarButtonClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click()
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, GIF, or WEBP image')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be 2MB or less')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const updatedProfile = { ...profileData, avatarPreview: dataUrl }
      setAvatarPreview(dataUrl)
      setProfileData(updatedProfile)
      localStorage.setItem('adminProfile', JSON.stringify(updatedProfile))
      logActivity('Updated profile photo')
      toast.success('Profile photo updated')
    }
    reader.readAsDataURL(file)
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    
    if (strength <= 2) return { label: 'Weak', color: '#ef4444', width: '33%' }
    if (strength <= 3) return { label: 'Medium', color: '#f59e0b', width: '66%' }
    return { label: 'Strong', color: '#10b981', width: '100%' }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      localStorage.setItem('adminProfile', JSON.stringify(profileData))
      logActivity('Updated profile information')
      toast.success('Profile updated successfully!')
      setLoading(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      setLoading(false)
    }
  }

  const handleChangeEmail = async (e) => {
    e.preventDefault()
    
    if (!newEmail || !emailPassword) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: adminSession.user.email,
        password: emailPassword
      })

      if (verifyError) {
        toast.error('Current password is incorrect')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      logActivity('Changed email address')
      toast.success('Email update initiated! Please check your new email to confirm.')
      setNewEmail('')
      setEmailPassword('')
      setLoading(false)
    } catch (error) {
      console.error('Email change error:', error)
      toast.error(error.message || 'Failed to change email')
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: adminSession.user.email,
        password: currentPassword
      })

      if (verifyError) {
        toast.error('Current password is incorrect')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      logActivity('Changed password')
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setLoading(false)
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
      setLoading(false)
    }
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications))
    logActivity('Updated notification preferences')
    toast.success('Notification preferences saved!')
  }

  const handleSaveAppearance = () => {
    localStorage.setItem('adminAppearance', JSON.stringify(appearance))
    applyTheme(appearance.theme)
    logActivity('Updated appearance settings')
    toast.success('Appearance settings saved!')
  }

  const handleSavePrivacy = () => {
    localStorage.setItem('adminPrivacy', JSON.stringify(privacy))
    logActivity('Updated privacy settings')
    toast.success('Privacy settings saved!')
  }

  const handleResetPreferences = () => {
    const defaultNotifications = {
      emailNotifications: true,
      buildingUpdates: true,
      roomChanges: true,
      weeklyReports: false,
      securityAlerts: true,
      systemUpdates: true
    }
    const defaultAppearance = {
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      dashboardLayout: 'grid'
    }
    const defaultPrivacy = {
      profileVisibility: 'university',
      showEmail: false,
      showPhone: false,
      dataSharing: false
    }

    setNotifications(defaultNotifications)
    setAppearance(defaultAppearance)
    setPrivacy(defaultPrivacy)
    localStorage.setItem('adminNotifications', JSON.stringify(defaultNotifications))
    localStorage.setItem('adminAppearance', JSON.stringify(defaultAppearance))
    localStorage.setItem('adminPrivacy', JSON.stringify(defaultPrivacy))
    applyTheme(defaultAppearance.theme)
    logActivity('Reset preference settings')
    toast.success('Settings reset to default')
  }

  const handleExportData = () => {
    const data = {
      profile: profileData,
      university: {
        name: adminSession.university?.name,
        city: adminSession.university?.city,
        created: adminSession.university?.created_at
      },
      preferences: {
        notifications,
        appearance,
        privacy
      },
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-data-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    logActivity('Exported account data')
    toast.success('Data exported successfully!')
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()

    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    if (!deletePassword) {
      toast.error('Please enter your password')
      return
    }

    if (!window.confirm('Are you absolutely sure? This will permanently delete your university, all buildings, rooms, and cannot be undone!')) {
      return
    }

    setLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: adminSession.user.email,
        password: deletePassword
      })

      if (verifyError) {
        toast.error('Password is incorrect')
        setLoading(false)
        return
      }

      const { error: deleteUniError } = await supabase
        .from('universities')
        .delete()
        .eq('id', adminSession.user.universityId)

      if (deleteUniError) throw deleteUniError

      const { error: deleteAdminError } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminSession.user.id)

      if (deleteAdminError) throw deleteAdminError

      toast.success('Account deleted successfully')
      localStorage.clear()
      await supabase.auth.signOut()
      if (onLogout) onLogout()
      setLoading(false)
      onClose()
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error(error.message || 'Failed to delete account')
      setLoading(false)
    }
  }

  const logActivity = (action) => {
    const log = JSON.parse(localStorage.getItem('adminActivityLog') || '[]')
    log.unshift({
      action,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('adminActivityLog', JSON.stringify(log.slice(0, 50)))
    setActivityLog(log.slice(0, 50))
  }

  const handleClearActivityLog = () => {
    localStorage.removeItem('adminActivityLog')
    setActivityLog([])
    toast.success('Activity log cleared')
  }

  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : null

  return (
    <div className="modal-overlay settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal modern-settings" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <div className="icon-wrapper">
              <FontAwesomeIcon icon={faCog} />
            </div>
            <div>
              <h2>Account Settings</h2>
              <p>Manage your profile and preferences</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="settings-layout">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              <button
                className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FontAwesomeIcon icon={faUserCircle} />
                <span>Profile</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Account</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>Security</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FontAwesomeIcon icon={faBell} />
                <span>Notifications</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <FontAwesomeIcon icon={faPalette} />
                <span>Appearance</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <FontAwesomeIcon icon={faLock} />
                <span>Privacy</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <FontAwesomeIcon icon={faHistory} />
                <span>Activity</span>
              </button>
              <button
                className={`settings-nav-item danger ${activeTab === 'danger' ? 'active' : ''}`}
                onClick={() => setActiveTab('danger')}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Delete Account</span>
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="settings-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Profile Information</h3>
                  <p>Update your personal details and professional information</p>
                </div>

                <form onSubmit={handleSaveProfile} className="settings-form">
                  <div className="profile-avatar-section">
                    <div className="avatar-placeholder">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile avatar" className="avatar-image" />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} />
                      )}
                    </div>
                    <div className="avatar-actions">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden-file-input"
                      />
                      <button type="button" className="btn-secondary btn-sm" onClick={handleAvatarButtonClick}>
                        <FontAwesomeIcon icon={faCamera} />
                        Change Photo
                      </button>
                      <p className="help-text">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faUser} />
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faBuilding} />
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                        placeholder="e.g., Facilities Manager"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faBuilding} />
                        Department
                      </label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        placeholder="e.g., Facilities & Operations"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faEnvelope} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faUser} />
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value.slice(0, 500) })}
                      placeholder="Tell us a bit about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="help-text">{profileData.bio.length}/500 characters</p>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Account Information</h3>
                  <p>View and manage your account details</p>
                </div>

                <div className="info-cards">
                  <div className="info-card">
                    <div className="info-card-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div className="info-card-content">
                      <label>Email Address</label>
                      <span>{adminSession.user.email}</span>
                    </div>
                    <button
                      className="btn-text"
                      onClick={() => setActiveTab('security')}
                    >
                      Change
                    </button>
                  </div>

                  <div className="info-card">
                    <div className="info-card-icon">
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div className="info-card-content">
                      <label>University</label>
                      <span>{adminSession.university?.name}</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card-icon">
                      <FontAwesomeIcon icon={faGlobe} />
                    </div>
                    <div className="info-card-content">
                      <label>City</label>
                      <span>{adminSession.university?.city}</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card-icon">
                      <FontAwesomeIcon icon={faCalendar} />
                    </div>
                    <div className="info-card-content">
                      <label>Member Since</label>
                      <span>
                        {adminSession.university?.created_at
                          ? new Date(adminSession.university.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card-icon">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="info-card-content">
                      <label>Role</label>
                      <span className="badge admin">Administrator</span>
                    </div>
                  </div>
                </div>

                <div className="data-management">
                  <h4>Data Management</h4>
                  <div className="action-buttons">
                    <button type="button" className="btn-secondary" onClick={handleExportData}>
                      <FontAwesomeIcon icon={faDownload} />
                      Export Your Data
                    </button>
                    {onLogout && (
                      <button type="button" className="btn-text" onClick={onLogout}>
                        Log Out
                      </button>
                    )}
                  </div>
                  <p className="help-text">
                    Download a copy of your profile information, preferences, and university data
                  </p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Security Settings</h3>
                  <p>Manage your email and password</p>
                </div>

                {/* Change Email */}
                <div className="email-change-section security-subsection">
                  <h4>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Change Email Address
                  </h4>
                  <p className="section-description">
                    You'll receive a verification email at your new address
                  </p>
                  <form onSubmit={handleChangeEmail} className="settings-form">
                    <div className="form-group">
                      <label>New Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="Confirm with your password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </form>
                </div>

                <div className="divider"></div>

                {/* Change Password */}
                <div className="security-subsection">
                  <h4>
                    <FontAwesomeIcon icon={faLock} />
                    Change Password
                  </h4>
                  <p className="section-description">
                    Use a strong password with at least 8 characters
                  </p>
                  <form onSubmit={handleChangePassword} className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          setShowPasswordStrength(e.target.value.length > 0)
                        }}
                        placeholder="Enter new password"
                        minLength={8}
                      />
                      {showPasswordStrength && passwordStrength && (
                        <div className="password-strength">
                          <div className="strength-bar">
                            <div
                              className="strength-fill"
                              style={{
                                width: passwordStrength.width,
                                backgroundColor: passwordStrength.color
                              }}
                            />
                          </div>
                          <span style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                <div className="security-tips">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <div>
                    <strong>Password Tips:</strong>
                    <ul>
                      <li>Use at least 8 characters</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Add numbers and special characters</li>
                      <li>Avoid common words or patterns</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Notification Preferences</h3>
                  <p>Choose what updates you want to receive</p>
                </div>

                <div className="settings-form">
                  <div className="notification-group">
                    <h4>Email Notifications</h4>
                    
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>Email Notifications</label>
                        <p>Receive notifications via email</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${notifications.emailNotifications ? 'active' : ''}`}
                        onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                      >
                        <FontAwesomeIcon icon={notifications.emailNotifications ? faToggleOn : faToggleOff} />
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>Building Updates</label>
                        <p>Get notified when buildings are added or modified</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${notifications.buildingUpdates ? 'active' : ''}`}
                        onClick={() => setNotifications({ ...notifications, buildingUpdates: !notifications.buildingUpdates })}
                        disabled={!notifications.emailNotifications}
                      >
                        <FontAwesomeIcon icon={notifications.buildingUpdates ? faToggleOn : faToggleOff} />
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>Room Changes</label>
                        <p>Be informed about room additions or updates</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${notifications.roomChanges ? 'active' : ''}`}
                        onClick={() => setNotifications({ ...notifications, roomChanges: !notifications.roomChanges })}
                        disabled={!notifications.emailNotifications}
                      >
                        <FontAwesomeIcon icon={notifications.roomChanges ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  </div>

                  <div className="notification-group">
                    <h4>System Notifications</h4>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>Security Alerts</label>
                        <p>Important security updates and warnings</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${notifications.securityAlerts ? 'active' : ''}`}
                        onClick={() => setNotifications({ ...notifications, securityAlerts: !notifications.securityAlerts })}
                      >
                        <FontAwesomeIcon icon={notifications.securityAlerts ? faToggleOn : faToggleOff} />
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>System Updates</label>
                        <p>Platform updates and new features</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${notifications.systemUpdates ? 'active' : ''}`}
                        onClick={() => setNotifications({ ...notifications, systemUpdates: !notifications.systemUpdates })}
                      >
                        <FontAwesomeIcon icon={notifications.systemUpdates ? faToggleOn : faToggleOff} />
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>Weekly Reports</label>
                        <p>Receive weekly summary of your dashboard activity</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${notifications.weeklyReports ? 'active' : ''}`}
                        onClick={() => setNotifications({ ...notifications, weeklyReports: !notifications.weeklyReports })}
                      >
                        <FontAwesomeIcon icon={notifications.weeklyReports ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={handleSaveNotifications}>
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Appearance & Display</h3>
                  <p>Customize how your dashboard looks and feels</p>
                </div>

                <div className="settings-form">
                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faPalette} />
                      Theme
                    </label>
                    <div className="theme-options">
                      <button
                        type="button"
                        className={`theme-option ${appearance.theme === 'light' ? 'active' : ''}`}
                        onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                      >
                        <FontAwesomeIcon icon={faSun} />
                        <span>Light</span>
                      </button>
                      <button
                        type="button"
                        className={`theme-option ${appearance.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                      >
                        <FontAwesomeIcon icon={faMoon} />
                        <span>Dark</span>
                      </button>
                      <button
                        type="button"
                        className={`theme-option ${appearance.theme === 'auto' ? 'active' : ''}`}
                        onClick={() => setAppearance({ ...appearance, theme: 'auto' })}
                      >
                        <FontAwesomeIcon icon={faCog} />
                        <span>Auto</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faGlobe} />
                      Language
                    </label>
                    <select
                      value={appearance.language}
                      onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faClock} />
                      Timezone
                    </label>
                    <select
                      value={appearance.timezone}
                      onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={handleSaveAppearance}>
                      Save Appearance
                    </button>
                    <button type="button" className="btn-text" onClick={handleResetPreferences}>
                      Reset Defaults
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Privacy & Data</h3>
                  <p>Control your privacy preferences</p>
                </div>

                <div className="settings-form">
                  <div className="privacy-toggles">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>Show Email Address</label>
                        <p>Display your email on your profile</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${privacy.showEmail ? 'active' : ''}`}
                        onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                      >
                        <FontAwesomeIcon icon={privacy.showEmail ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={handleSavePrivacy}>
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Activity Log</h3>
                  <p>Recent actions on your account</p>
                </div>

                <div className="activity-log">
                  {activityLog.length === 0 ? (
                    <div className="empty-activity">
                      <FontAwesomeIcon icon={faHistory} />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="activity-list">
                      {activityLog.map((activity, index) => (
                        <div key={index} className="activity-item-log">
                          <div className="activity-icon">
                            <FontAwesomeIcon icon={faHistory} />
                          </div>
                          <div className="activity-details">
                            <p className="activity-action">{activity.action}</p>
                            <p className="activity-time">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {activityLog.length > 0 && (
                  <div className="form-actions">
                    <button type="button" className="btn-text" onClick={handleClearActivityLog}>
                      Clear Activity Log
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'danger' && (
              <div className="settings-section danger-zone">
                <div className="section-header">
                  <h3>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Danger Zone
                  </h3>
                  <p>Permanent and irreversible actions</p>
                </div>

                <div className="warning-box">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <div>
                    <strong>Warning: This action cannot be undone!</strong>
                    <p>Deleting your account will permanently remove all your data.</p>
                  </div>
                </div>

                <form onSubmit={handleDeleteAccount} className="settings-form">
                  <div className="form-group">
                    <label>Type "DELETE" to confirm</label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faKey} />
                      Enter your password
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Your password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-danger"
                    disabled={loading || deleteConfirmText !== 'DELETE'}
                  >
                    {loading ? 'Deleting...' : 'Delete Account Permanently'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
