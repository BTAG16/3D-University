import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserShield,
  faKey,
  faEnvelope,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import './SuperAdminLogin.css'

function SuperAdminLogin() {
  const [secretKey, setSecretKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const navigate = useNavigate()
  const { loginSuperAdmin, sendSuperAdminKeyEmail, adminSession, sendPasswordResetEmail } = useAdminAuth()

  // Redirect if already logged in as super admin
  useEffect(() => {
    if (adminSession?.user?.isSuperAdmin) {
      navigate('/super-admin/dashboard')
    }
  }, [adminSession, navigate])

  // Send secret key email on component mount (only once)
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true)
      sendSecretKeyEmail()
    }
  }, [hasInitialized])

  const sendSecretKeyEmail = async () => {
    try {
      setSendingEmail(true)
      setError('')

      const result = await sendSuperAdminKeyEmail()

      if (!result.success) {
        throw new Error(result.error || 'Failed to send secret key')
      }

      setEmailSent(true)
    } catch (err) {
      console.error('Error sending email:', err)
      setError('Failed to send secret key to admin email. Please refresh the page to try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!secretKey.trim()) {
      setError('Please enter the secret key')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await loginSuperAdmin(secretKey.trim())
      
      if (result.success) {
        navigate('/super-admin/dashboard')
      } else {
        setError(result.error || 'Invalid secret key')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleResendKey = () => {
    setSecretKey('')
    setError('')
    sendSecretKeyEmail()
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
      <div className="super-admin-login">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <FontAwesomeIcon icon={faEnvelope} className="header-icon" />
              <h1>Reset Password</h1>
              <p>Enter your email to receive password reset instructions</p>
            </div>

            {resetSent ? (
              <div className="email-status sent">
                <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                <h3>Reset Email Sent!</h3>
                <p>Check your inbox for password reset instructions.</p>
                <button
                  className="btn-login"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="login-form">
                <div className="form-group">
                  <label htmlFor="forgotEmail">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="key-input"
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-login"
                  disabled={loading}
                >
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
                  className="btn-resend"
                  onClick={handleBackToLogin}
                  disabled={loading}
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="super-admin-login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <FontAwesomeIcon icon={faUserShield} className="header-icon" />
            <h1>Super Admin Access</h1>
            <p>Secure authentication for system administrators</p>
          </div>

          {sendingEmail ? (
            <div className="email-status sending">
              <FontAwesomeIcon icon={faSpinner} spin className="status-icon" />
              <h3>Sending Secret Key...</h3>
              <p>Please wait while we send the authentication key to the admin email.</p>
            </div>
          ) : emailSent ? (
            <div className="email-status sent">
              <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
              <h3>Secret Key Sent!</h3>
              <p>A 6-digit secret key has been sent to the super admin email address.</p>
              <p className="email-note">
                <FontAwesomeIcon icon={faEnvelope} />
                Check your inbox and enter the code below
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="secretKey">
                <FontAwesomeIcon icon={faKey} />
                Secret Key
              </label>
              <input
                type="text"
                id="secretKey"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoComplete="off"
                disabled={loading || sendingEmail}
                className="key-input"
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading || sendingEmail || !emailSent}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Verifying...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserShield} />
                  Access Dashboard
                </>
              )}
            </button>

            <div className="login-actions">
              {emailSent && (
                <button
                  type="button"
                  className="btn-resend"
                  onClick={handleResendKey}
                  disabled={loading || sendingEmail}
                >
                  Didn't receive the key? Resend
                </button>
              )}
              
              <button
                type="button"
                className="btn-forgot-password"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading || sendingEmail}
              >
                <FontAwesomeIcon icon={faKey} />
                Forgot Password?
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p className="security-note">
              <FontAwesomeIcon icon={faUserShield} />
              This is a secure admin-only area. All access attempts are logged.
            </p>
            <button 
              className="btn-back-home"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLogin
