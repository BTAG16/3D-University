import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useToast } from './components/Toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGraduationCap,
  faEnvelope,
  faLock,
  faKey,
  faArrowLeft,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
import './AdminLogin.css'

function AdminLogin() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { adminSession, adminLogin, sendPasswordResetEmail } = useAdminAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (adminSession) {
      navigate('/admin/dashboard')
    }
  }, [adminSession, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required')
      return false
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email')
      return false
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const result = await adminLogin(formData.email, formData.password)
      if (!result.success) {
        setError(result.error || 'Login failed')
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
              <button className="btn-submit" onClick={handleBackToLogin}>
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
          <p className="login-subtitle">University Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

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
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : 'Login to Dashboard'}
          </button>

          <button
            type="button"
            className="btn-forgot-password"
            onClick={() => setShowForgotPassword(true)}
          >
            <FontAwesomeIcon icon={faKey} />
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
