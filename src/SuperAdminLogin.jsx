import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useIsMobile, useDarkMode } from './hooks'
import { Icon } from './icons'

function ShieldIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 8L16 28v32c0 26.4 18.8 51.1 44 58 25.2-6.9 44-31.6 44-58V28L60 8z" fill="rgba(14,165,233,0.12)" stroke="rgba(14,165,233,0.35)" strokeWidth="1.5"/>
      <path d="M60 22L28 37v21c0 17.3 12.3 33.5 32 38 19.7-4.5 32-20.7 32-38V37L60 22z" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.25)" strokeWidth="1"/>
      <path d="M46 60l10 10 20-20" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SuperAdminLogin() {
  const [secretKey, setSecretKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [dark] = useDarkMode()
  const { loginSuperAdmin, sendSuperAdminKeyEmail, adminSession } = useAdminAuth()

  useEffect(() => {
    if (adminSession?.user?.isSuperAdmin) {
      navigate('/super-admin/dashboard')
    }
  }, [adminSession, navigate])

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
      if (!result.success) throw new Error(result.error || 'Failed to send secret key')
      setEmailSent(true)
    } catch (err) {
      console.error('Error sending email:', err)
      setError('Failed to send code to admin email. Refresh to try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!secretKey.trim()) { setError('Please enter the 6-digit code'); return }
    setLoading(true)
    setError('')
    try {
      const result = await loginSuperAdmin(secretKey.trim())
      if (result.success) {
        navigate('/super-admin/dashboard')
      } else {
        setError(result.error || 'Invalid code — check your email and try again')
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

  const panelBg = dark ? '#0B1120' : '#f8fafc'
  const borderCol = dark ? 'rgba(255,255,255,0.07)' : 'rgba(16,24,40,0.08)'

  return (
    <div style={{ display: 'flex', height: '100dvh', background: panelBg, overflow: 'hidden', fontFamily: 'var(--font-body)' }}>

      {/* ── Left panel ── */}
      <div style={{ flex: isMobile ? '1' : '0 0 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${borderCol}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-primary)' }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="compass" size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Kampus</span>
          </button>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Shield icon */}
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-subtle)', border: '1px solid var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Icon name="shield" size={26} color="var(--accent)" />
            </div>

            {/* Title */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, marginBottom: 6, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Super Admin Access
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, margin: '0 0 28px' }}>
              Secure authentication for system administrators
            </p>

            {/* Email status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 8, marginBottom: 20,
              background: sendingEmail
                ? 'var(--accent-subtle)'
                : emailSent
                  ? 'rgba(16,185,129,0.08)'
                  : 'transparent',
              border: `1px solid ${sendingEmail ? 'var(--accent)' : emailSent ? 'rgba(16,185,129,0.3)' : borderCol}`,
              transition: 'all 200ms ease',
            }}>
              {sendingEmail ? (
                <>
                  <Icon name="loader" size={15} color="var(--accent)" />
                  <span style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 500 }}>Sending code to admin email…</span>
                </>
              ) : emailSent ? (
                <>
                  <Icon name="check" size={15} color="#10B981" />
                  <span style={{ fontSize: 13.5, color: '#10B981', fontWeight: 500 }}>Code sent to admin email — check your inbox</span>
                </>
              ) : (
                <>
                  <Icon name="mail" size={15} color="var(--text-tertiary)" />
                  <span style={{ fontSize: 13.5, color: 'var(--text-tertiary)' }}>Preparing to send code…</span>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 14, marginBottom: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                <Icon name="alertCircle" size={16} color="#EF4444" /> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-body)' }} htmlFor="secretKey">
                  6-Digit Code
                </label>
                <input
                  id="secretKey"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={secretKey}
                  onChange={e => { setSecretKey(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  maxLength={6}
                  autoComplete="off"
                  disabled={loading || sendingEmail}
                  style={{
                    width: '100%', height: 56, border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
                    borderRadius: 8, padding: '0 16px', fontSize: 22, letterSpacing: '0.35em',
                    textAlign: 'center', fontFamily: "'SF Mono', ui-monospace, monospace",
                    color: 'var(--text-primary)', background: 'var(--surface)',
                    transition: 'all 200ms ease', outline: 'none', boxSizing: 'border-box',
                    opacity: (loading || sendingEmail) ? 0.6 : 1,
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = error ? '#EF4444' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || sendingEmail || !emailSent}
                style={{
                  width: '100%', height: 48, borderRadius: 8,
                  background: (loading || sendingEmail || !emailSent) ? 'var(--text-tertiary)' : 'var(--accent)',
                  color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)',
                  border: 'none', cursor: (loading || sendingEmail || !emailSent) ? 'not-allowed' : 'pointer',
                  transition: 'background 200ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 10,
                }}
                onMouseEnter={e => { if (!loading && !sendingEmail && emailSent) e.currentTarget.style.background = 'var(--accent-hover, #0284c7)' }}
                onMouseLeave={e => { if (!loading && !sendingEmail && emailSent) e.currentTarget.style.background = 'var(--accent)' }}
              >
                {loading ? (
                  <><Icon name="loader" size={16} color="#fff" /> Verifying…</>
                ) : (
                  <><Icon name="shield" size={16} color="#fff" /> Access Dashboard</>
                )}
              </button>

              {emailSent && (
                <button
                  type="button"
                  onClick={handleResendKey}
                  disabled={loading || sendingEmail}
                  style={{
                    width: '100%', height: 44, borderRadius: 8,
                    background: 'transparent', border: `1px solid ${borderCol}`,
                    color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                    fontFamily: 'var(--font-body)', cursor: (loading || sendingEmail) ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms ease', opacity: (loading || sendingEmail) ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!loading && !sendingEmail) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = borderCol; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  Didn't receive the code? Resend
                </button>
              )}
            </form>

            {/* Footer */}
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="shield" size={13} color="var(--text-tertiary)" />
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', margin: 0 }}>
                  Restricted area. All access attempts are logged.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                style={{ fontSize: 14, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                ← Back to home
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Right panel (desktop only) ── */}
      {!isMobile && (
        <div style={{ flex: '0 0 50%', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Dot pattern */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.04 }}>
            <pattern id="superAdminDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#superAdminDots)" />
          </svg>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px' }}>
            <ShieldIllustration />
            <div style={{ marginTop: 32 }}>
              <p style={{ color: '#7a9cc7', fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8, margin: '0 0 8px' }}>
                Restricted Access
              </p>
              <p style={{ color: '#4a6a9a', fontSize: 13.5, fontFamily: 'var(--font-body)', maxWidth: 260, margin: '0 auto', lineHeight: 1.7 }}>
                All sessions are logged and timed. Unauthorized access attempts are recorded.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperAdminLogin
