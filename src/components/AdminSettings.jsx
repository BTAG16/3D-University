import { useState, useEffect, useRef } from 'react'
import {
  Settings, User, Lock, Trash2, AlertTriangle,
  Mail, Key, CheckCircle, X, Bell, Palette,
  Globe, Clock, Shield, Download, Camera,
  Building2, Calendar, Moon, Sun, History, Image
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { dbService } from '../lib/dbService'
import { useToast } from './Toast'
import './AdminSettings.css'

function AdminSettings({ onClose, adminSession, onLogout, onUniversityUpdate, dark, onDarkToggle }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const avatarInputRef = useRef(null)

  const [profileData, setProfileData] = useState({
    displayName: '',
    jobTitle: '',
    department: '',
    phone: '',
    bio: ''
  })

  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    buildingUpdates: true,
    roomChanges: true,
    weeklyReports: false,
    securityAlerts: true,
    systemUpdates: true
  })

  const [appearance, setAppearance] = useState({
    theme: localStorage.getItem('kampus-dark') === 'true' ? 'dark' : 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    dashboardLayout: 'grid'
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'university',
    showEmail: false,
    showPhone: false,
    dataSharing: false
  })

  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [activityLog, setActivityLog] = useState([])
  const [avatarPreview, setAvatarPreview] = useState('')

  const [logoUrl, setLogoUrl] = useState(adminSession.university?.logo_url || '')
  const [logoSaving, setLogoSaving] = useState(false)

  useEffect(() => {
    loadUserPreferences()
    loadActivityLog()
  }, [])

  // Keep appearance.theme in sync if parent dark state changes while modal is open
  useEffect(() => {
    if (typeof dark === 'boolean') {
      setAppearance(prev => ({ ...prev, theme: dark ? 'dark' : 'light' }))
    }
  }, [dark])

  const loadUserPreferences = () => {
    const savedNotifications = localStorage.getItem('adminNotifications')
    const savedAppearance = localStorage.getItem('adminAppearance')
    const savedPrivacy = localStorage.getItem('adminPrivacy')
    const savedProfile = localStorage.getItem('adminProfile')

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance))
      applyTheme(JSON.parse(savedAppearance).theme)
    }
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy))
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfileData(parsedProfile)
      if (parsedProfile.avatarPreview) setAvatarPreview(parsedProfile.avatarPreview)
    }
  }

  const loadActivityLog = () => {
    const log = localStorage.getItem('adminActivityLog')
    if (log) setActivityLog(JSON.parse(log))
  }

  const applyTheme = (theme) => {
    let isDark = false
    if (theme === 'auto') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark = theme === 'dark'
    }
    if (isDark) {
      document.documentElement.setAttribute('data-dark', 'true')
      localStorage.setItem('kampus-dark', 'true')
    } else {
      document.documentElement.removeAttribute('data-dark')
      localStorage.setItem('kampus-dark', 'false')
    }
  }

  const handleAvatarButtonClick = () => {
    avatarInputRef.current?.click()
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
    if (strength <= 3) return { label: 'Fair', color: '#f59e0b', width: '66%' }
    return { label: 'Strong', color: '#10b981', width: '100%' }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      localStorage.setItem('adminProfile', JSON.stringify(profileData))
      logActivity('Updated profile information')
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
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
        return
      }
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      logActivity('Changed email address')
      toast.success('Check your new email to confirm the change')
      setNewEmail('')
      setEmailPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to change email')
    } finally {
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
        return
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      logActivity('Changed password')
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications))
    logActivity('Updated notification preferences')
    toast.success('Preferences saved')
  }

  const handleSaveAppearance = () => {
    localStorage.setItem('adminAppearance', JSON.stringify(appearance))
    applyTheme(appearance.theme)
    logActivity('Updated appearance settings')
    toast.success('Appearance saved')
  }

  const handleSavePrivacy = () => {
    localStorage.setItem('adminPrivacy', JSON.stringify(privacy))
    logActivity('Updated privacy settings')
    toast.success('Privacy settings saved')
  }

  const handleResetPreferences = () => {
    const defaultNotifications = {
      emailNotifications: true, buildingUpdates: true, roomChanges: true,
      weeklyReports: false, securityAlerts: true, systemUpdates: true
    }
    const defaultAppearance = {
      theme: 'light', language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY', dashboardLayout: 'grid'
    }
    const defaultPrivacy = { profileVisibility: 'university', showEmail: false, showPhone: false, dataSharing: false }

    setNotifications(defaultNotifications)
    setAppearance(defaultAppearance)
    setPrivacy(defaultPrivacy)
    localStorage.setItem('adminNotifications', JSON.stringify(defaultNotifications))
    localStorage.setItem('adminAppearance', JSON.stringify(defaultAppearance))
    localStorage.setItem('adminPrivacy', JSON.stringify(defaultPrivacy))
    applyTheme(defaultAppearance.theme)
    logActivity('Reset preferences')
    toast.success('Settings reset to defaults')
  }

  const handleExportData = () => {
    const data = {
      profile: profileData,
      university: {
        name: adminSession.university?.name,
        city: adminSession.university?.city,
        created: adminSession.university?.created_at
      },
      preferences: { notifications, appearance, privacy },
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
    toast.success('Data exported')
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
    if (!window.confirm('This will permanently delete your university and all its data. Are you sure?')) return

    setLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: adminSession.user.email,
        password: deletePassword
      })
      if (verifyError) {
        toast.error('Password is incorrect')
        return
      }
      const { error: deleteUniError } = await supabase
        .from('universities').delete().eq('id', adminSession.user.universityId)
      if (deleteUniError) throw deleteUniError

      const { error: deleteAdminError } = await supabase
        .from('admins').delete().eq('id', adminSession.user.id)
      if (deleteAdminError) throw deleteAdminError

      toast.success('Account deleted')
      localStorage.clear()
      await supabase.auth.signOut()
      if (onLogout) onLogout()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLogo = async (e) => {
    e.preventDefault()
    const universityId = adminSession.university?.id
    if (!universityId) { toast.error('No university linked to this account'); return }
    setLogoSaving(true)
    try {
      const result = await dbService.updateUniversity(universityId, { logo_url: logoUrl || null })
      if (!result.success) throw new Error(result.error || 'Update failed')
      logActivity('Updated university logo')
      if (onUniversityUpdate) onUniversityUpdate({ logo_url: logoUrl || null })
      toast.success('Logo updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update logo')
    } finally {
      setLogoSaving(false)
    }
  }

  const logActivity = (action) => {
    const log = JSON.parse(localStorage.getItem('adminActivityLog') || '[]')
    log.unshift({ action, timestamp: new Date().toISOString() })
    localStorage.setItem('adminActivityLog', JSON.stringify(log.slice(0, 50)))
    setActivityLog(log.slice(0, 50))
  }

  const handleClearActivityLog = () => {
    localStorage.removeItem('adminActivityLog')
    setActivityLog([])
    toast.success('Activity log cleared')
  }

  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : null

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'account', label: 'Account', icon: <Building2 size={15} /> },
    { id: 'branding', label: 'Branding', icon: <Image size={15} /> },
    { id: 'security', label: 'Security', icon: <Shield size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock size={15} /> },
    { id: 'activity', label: 'Activity', icon: <History size={15} /> },
    { id: 'danger', label: 'Delete account', icon: <Trash2 size={15} />, danger: true },
  ]

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-left">
            <Settings size={18} className="settings-header-icon" />
            <div>
              <h2 className="settings-header-title">Account settings</h2>
              <p className="settings-header-sub">Manage your profile and preferences</p>
            </div>
          </div>
          <button className="settings-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          {/* Sidebar */}
          <nav className="settings-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`settings-nav-item${activeTab === item.id ? ' active' : ''}${item.danger ? ' danger' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="settings-content">

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Profile information</h3>
                  <p>Update your personal details</p>
                </div>

                <div className="avatar-row">
                  <div className="avatar-circle">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Profile" className="avatar-img" />
                      : <User size={28} />
                    }
                  </div>
                  <div>
                    <input
                      ref={avatarInputRef}
                      id="avatarUpload"
                      name="avatarUpload"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                    <button type="button" className="btn btn-sm btn-secondary" onClick={handleAvatarButtonClick}>
                      <Camera size={14} />
                      Change photo
                    </button>
                    <p className="help-text">JPG, PNG or GIF, max 2 MB</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="settings-form">
                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="displayName">Display name</label>
                      <input
                        id="displayName"
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="jobTitle">Job title</label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                        placeholder="e.g. Facilities Manager"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="department">Department</label>
                      <input
                        id="department"
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        placeholder="e.g. Facilities and Operations"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="phone">Phone number</label>
                      <input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value.slice(0, 500) })}
                      placeholder="A short bio..."
                      rows={3}
                    />
                    <p className="help-text">{profileData.bio.length}/500</p>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account */}
            {activeTab === 'account' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Account information</h3>
                  <p>View your account and university details</p>
                </div>

                <div className="info-cards">
                  <div className="info-card">
                    <div className="info-card-icon"><Mail size={16} /></div>
                    <div className="info-card-body">
                      <span className="info-card-label">Email address</span>
                      <span className="info-card-value">{adminSession.user.email}</span>
                    </div>
                    <button className="btn-link" onClick={() => setActiveTab('security')}>Change</button>
                  </div>
                  <div className="info-card">
                    <div className="info-card-icon"><Building2 size={16} /></div>
                    <div className="info-card-body">
                      <span className="info-card-label">University</span>
                      <span className="info-card-value">{adminSession.university?.name}</span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-icon"><Globe size={16} /></div>
                    <div className="info-card-body">
                      <span className="info-card-label">City</span>
                      <span className="info-card-value">{adminSession.university?.city}</span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-icon"><Calendar size={16} /></div>
                    <div className="info-card-body">
                      <span className="info-card-label">Member since</span>
                      <span className="info-card-value">
                        {adminSession.university?.created_at
                          ? new Date(adminSession.university.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-icon"><User size={16} /></div>
                    <div className="info-card-body">
                      <span className="info-card-label">Role</span>
                      <span className="info-card-value">Administrator</span>
                    </div>
                  </div>
                </div>

                <div className="section-sub">
                  <h4>Data management</h4>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleExportData}>
                      <Download size={14} />
                      Export data
                    </button>
                    {onLogout && (
                      <button type="button" className="btn-link" onClick={onLogout}>Log out</button>
                    )}
                  </div>
                  <p className="help-text">Download a copy of your profile, preferences, and university data</p>
                </div>
              </div>
            )}

            {/* Branding */}
            {activeTab === 'branding' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>University branding</h3>
                  <p>Upload your logo to display on the campus map header</p>
                </div>

                <div className="avatar-row" style={{ alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {logoUrl
                      ? <img src={logoUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={(e) => { e.target.style.display = 'none' }} />
                      : <Image size={28} style={{ opacity: 0.3 }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="help-text" style={{ marginBottom: 8 }}>
                      Paste a public image URL (PNG, SVG, or JPG). The logo appears in the top-left corner of the public campus map instead of the default compass icon.
                    </p>
                    <p className="help-text">Recommended: square or landscape image, at least 64×64 px.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveLogo} className="settings-form" style={{ marginTop: 20 }}>
                  <div className="form-field">
                    <label htmlFor="logoUrl">Logo image URL</label>
                    <input
                      id="logoUrl"
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://youruni.edu/logo.png"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={logoSaving}>
                      {logoSaving ? 'Saving...' : 'Save logo'}
                    </button>
                    {logoUrl && (
                      <button type="button" className="btn-link danger-link" onClick={() => setLogoUrl('')}>
                        Remove logo
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Security</h3>
                  <p>Manage your email address and password</p>
                </div>

                <div className="security-subsection">
                  <h4><Mail size={15} /> Change email address</h4>
                  <p className="section-desc">You will receive a verification email at the new address</p>
                  <form onSubmit={handleChangeEmail} className="settings-form">
                    <div className="form-field">
                      <label htmlFor="newEmail">New email address</label>
                      <input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new@email.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="emailPassword">Current password</label>
                      <input
                        id="emailPassword"
                        type="password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="Confirm with your password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update email'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="settings-divider" />

                <div className="security-subsection">
                  <h4><Lock size={15} /> Change password</h4>
                  <p className="section-desc">Use a strong password with at least 8 characters</p>
                  <form onSubmit={handleChangePassword} className="settings-form">
                    <div className="form-field">
                      <label htmlFor="currentPassword">Current password</label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="newPassword">New password</label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          setShowPasswordStrength(e.target.value.length > 0)
                        }}
                        placeholder="New password"
                        minLength={8}
                        autoComplete="new-password"
                      />
                      {showPasswordStrength && passwordStrength && (
                        <div className="password-strength">
                          <div className="strength-track">
                            <div
                              className="strength-fill"
                              style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                            />
                          </div>
                          <span className="strength-label" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="form-field">
                      <label htmlFor="confirmPassword">Confirm new password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Change password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Notification preferences</h3>
                  <p>Choose what updates you want to receive</p>
                </div>

                <div className="toggle-group">
                  <h4>Email</h4>
                  <ToggleRow
                    label="Email notifications"
                    description="Receive all notifications via email"
                    checked={notifications.emailNotifications}
                    onChange={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                  />
                  <ToggleRow
                    label="Building updates"
                    description="Notified when buildings are added or changed"
                    checked={notifications.buildingUpdates}
                    onChange={() => setNotifications({ ...notifications, buildingUpdates: !notifications.buildingUpdates })}
                    disabled={!notifications.emailNotifications}
                  />
                  <ToggleRow
                    label="Room changes"
                    description="Notified when rooms are added or updated"
                    checked={notifications.roomChanges}
                    onChange={() => setNotifications({ ...notifications, roomChanges: !notifications.roomChanges })}
                    disabled={!notifications.emailNotifications}
                  />
                </div>

                <div className="toggle-group">
                  <h4>System</h4>
                  <ToggleRow
                    label="Security alerts"
                    description="Important security updates and warnings"
                    checked={notifications.securityAlerts}
                    onChange={() => setNotifications({ ...notifications, securityAlerts: !notifications.securityAlerts })}
                  />
                  <ToggleRow
                    label="System updates"
                    description="Platform updates and new features"
                    checked={notifications.systemUpdates}
                    onChange={() => setNotifications({ ...notifications, systemUpdates: !notifications.systemUpdates })}
                  />
                  <ToggleRow
                    label="Weekly reports"
                    description="Weekly summary of dashboard activity"
                    checked={notifications.weeklyReports}
                    onChange={() => setNotifications({ ...notifications, weeklyReports: !notifications.weeklyReports })}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSaveNotifications}>
                    Save preferences
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Appearance</h3>
                  <p>Customize how your dashboard looks</p>
                </div>

                <div className="form-field">
                  <label>Theme</label>
                  <div className="theme-options">
                    {[
                      { value: 'light', label: 'Light', icon: <Sun size={16} /> },
                      { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
                      { value: 'auto', label: 'Auto', icon: <Settings size={16} /> },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`theme-option${appearance.theme === opt.value ? ' active' : ''}`}
                        onClick={() => setAppearance({ ...appearance, theme: opt.value })}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label htmlFor="language">Language</label>
                    <select
                      id="language"
                      value={appearance.language}
                      onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Espanol</option>
                      <option value="fr">Francais</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      id="timezone"
                      value={appearance.timezone}
                      onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSaveAppearance}>
                    Save appearance
                  </button>
                  <button type="button" className="btn-link" onClick={handleResetPreferences}>
                    Reset to defaults
                  </button>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Privacy</h3>
                  <p>Control your data and visibility preferences</p>
                </div>

                <div className="toggle-group">
                  <ToggleRow
                    label="Show email address"
                    description="Display your email on your profile"
                    checked={privacy.showEmail}
                    onChange={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                  />
                  <ToggleRow
                    label="Show phone number"
                    description="Display your phone on your profile"
                    checked={privacy.showPhone}
                    onChange={() => setPrivacy({ ...privacy, showPhone: !privacy.showPhone })}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSavePrivacy}>
                    Save privacy settings
                  </button>
                </div>
              </div>
            )}

            {/* Activity */}
            {activeTab === 'activity' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Activity log</h3>
                  <p>Recent actions on your account</p>
                </div>

                {activityLog.length === 0 ? (
                  <div className="empty-state-settings">
                    <History size={28} />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {activityLog.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-dot" />
                        <div className="activity-details">
                          <p className="activity-action">{activity.action}</p>
                          <p className="activity-time">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activityLog.length > 0 && (
                  <div className="form-actions">
                    <button type="button" className="btn-link danger-link" onClick={handleClearActivityLog}>
                      Clear log
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Danger zone */}
            {activeTab === 'danger' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3>Delete account</h3>
                  <p>Permanent and irreversible actions</p>
                </div>

                <div className="danger-banner">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>This action cannot be undone</strong>
                    <p>Deleting your account will permanently remove your university, all buildings, and all rooms.</p>
                  </div>
                </div>

                <form onSubmit={handleDeleteAccount} className="settings-form">
                  <div className="form-field">
                    <label htmlFor="deleteConfirm">Type DELETE to confirm</label>
                    <input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="deletePassword">Your password</label>
                    <input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={loading || deleteConfirmText !== 'DELETE'}
                    >
                      {loading ? 'Deleting...' : 'Delete account permanently'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className={`toggle-row${disabled ? ' disabled' : ''}`}>
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-desc">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-switch${checked ? ' on' : ''}`}
        onClick={onChange}
        disabled={disabled}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  )
}

export default AdminSettings
