import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faGraduationCap, 
  faEnvelope, 
  faLock, 
  faBuilding, 
  faCity, 
  faUserShield, 
  faKey, 
  faArrowLeft,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
import './AdminLogin.css'

function AdminLogin() {
  const [isRegister, setIsRegister] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    universityName: '',
    city: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { adminSession, registerAdmin, adminLogin, sendPasswordResetEmail } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (adminSession) {
      if (adminSession.user.isSuperAdmin) {
        navigate('/super-admin/dashboard')
      } else {
        navigate('/admin/dashboard')
      }
    }
  }, [adminSession, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return false
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }

      if (!formData.universityName || !formData.city) {
        setError('University name and city are required')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let result
      if (isRegister) {
        result = await registerAdmin(
          formData.email,
          formData.password,
          formData.universityName,
          formData.city
        )
        
        if (result.success) {
          setSuccess(result.message || 'Registration successful! Please check your email to verify your account.')
          // Clear form
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            universityName: '',
            city: ''
          })
        } else {
          setError(result.error || 'Registration failed')
        }
      } else {
        result = await adminLogin(formData.email, formData.password)
        
        if (result.success) {
          // Navigation handled by useEffect
        } else {
          setError(result.error || 'Login failed')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!forgotEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await sendPasswordResetEmail(forgotEmail.trim())
      
      if (result.success) {
        setResetSent(true)
        setError('')
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setResetSent(false)
    setError('')
    setSuccess('')
  }

  if (showForgotPassword) {
    return (
      <div className="admin-login-page">
        <button 
          className="btn-back-to-landing"
          onClick={() => navigate('/')}
          title="Back to Home"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Home</span>
        </button>

        <div className="login-container">
          <div className="login-header">
            <FontAwesomeIcon icon={faEnvelope} className="login-icon" />
            <h1>Reset Password</h1>
            <p className="login-subtitle">Enter your email to receive password reset instructions</p>
          </div>

          {resetSent ? (
            <div className="reset-success">
              <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
              <h3>Reset Email Sent!</h3>
              <p>Check your inbox for password reset instructions.</p>
              <button
                className="btn-submit"
                onClick={handleBackToLogin}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Sending...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Send Reset Link
                  </>
                )}
              </button>

              <button
                type="button"
                className="switch-mode-btn"
                onClick={handleBackToLogin}
                disabled={loading}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login-page">
      {/* Back to Landing Button */}
      <button 
        className="btn-back-to-landing"
        onClick={() => navigate('/')}
        title="Back to Home"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Home</span>
      </button>

      <div className="login-container">
        <div className="login-header">
          <FontAwesomeIcon icon={faGraduationCap} className="login-icon" />
          <h1>Campus Explorer</h1>
          <p className="login-subtitle">Admin Portal</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false)
              setError('')
              setSuccess('')
            }}
          >
            Login
          </button>
          <button
            className={`tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true)
              setError('')
              setSuccess('')
            }}
          >
            Register University
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message" style={{
            padding: '12px',
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            marginBottom: '20px'
          }}>{success}</div>}

          {isRegister && (
            <>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faBuilding} className="input-icon" />
                  University Name
                </label>
                <input
                  type="text"
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
                  placeholder="Enter university name"
                  required={isRegister}
                />
              </div>

              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faCity} className="input-icon" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required={isRegister}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              Admin Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@university.edu"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required={isRegister}
              />
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register & Create Dashboard' : 'Login to Dashboard'}
          </button>

          {!isRegister && (
            <button
              type="button"
              className="btn-forgot-password"
              onClick={() => setShowForgotPassword(true)}
            >
              <FontAwesomeIcon icon={faKey} />
              Forgot Password?
            </button>
          )}
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="switch-mode-btn"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setSuccess('')
              }}
            >
              {isRegister ? 'Login here' : 'Register your university'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
