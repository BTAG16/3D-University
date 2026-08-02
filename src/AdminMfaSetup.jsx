import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useIsMobile, useDarkMode } from './hooks'
import { Icon } from './icons'

function AdminMfaSetup() {
  const [factorId, setFactorId] = useState(null)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preparing, setPreparing] = useState(true)
  const hasInitialized = useRef(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [dark] = useDarkMode()
  const { user, adminSession, startMfaEnroll, completeMfaVerification } = useAdminAuth()

  useEffect(() => {
    if (adminSession) { navigate('/admin/dashboard'); return }
    if (!user) { navigate('/admin'); return }
  }, [adminSession, user, navigate])

  useEffect(() => {
    if (hasInitialized.current || !user) return
    hasInitialized.current = true
    const start = async () => {
      const result = await startMfaEnroll()
      if (result.success) {
        setFactorId(result.factorId)
        setQrCode(result.qrCode)
        setSecret(result.secret)
      } else {
        setError(result.error || 'Failed to start MFA enrollment')
      }
      setPreparing(false)
    }
    start()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim() || code.trim().length !== 6) { setError('Enter the 6-digit code from your app'); return }
    if (!factorId) return
    setLoading(true)
    setError('')
    try {
      const result = await completeMfaVerification(factorId, code.trim())
      if (!result.success) setError(result.error || 'Invalid code — try again')
      // On success, adminSession updates via context and the effect above navigates.
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const borderCol = dark ? 'rgba(255,255,255,0.07)' : 'rgba(16,24,40,0.08)'

  return (
    <div style={{ display: 'flex', height: '100dvh', background: dark ? '#0B1120' : '#f8fafc', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>

      {/* ── Left panel ── */}
      <div style={{ flex: isMobile ? '1' : '0 0 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${borderCol}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="compass" size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Kampus</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-subtle)', border: '1px solid var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Icon name="shield" size={26} color="var(--accent)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Set Up Two-Factor Authentication
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 28px' }}>
              Required for every admin account. Scan this with an authenticator app (Google Authenticator, Authy, 1Password).
            </p>

            {preparing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, marginBottom: 20, background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}>
                <Icon name="loader" size={15} color="var(--accent)" />
                <span style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 500 }}>Preparing your authenticator setup…</span>
              </div>
            ) : (
              <>
                {qrCode && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, padding: 16, background: '#fff', borderRadius: 12, border: `1px solid ${borderCol}` }}>
                    <img src={qrCode} alt="Authenticator app QR code" width={180} height={180} />
                  </div>
                )}
                {secret && (
                  <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 4px' }}>Can't scan? Enter this code manually:</p>
                    <code style={{ fontSize: 13, fontFamily: "'SF Mono', ui-monospace, monospace", color: 'var(--text-primary)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 6, letterSpacing: '0.05em', wordBreak: 'break-all' }}>{secret}</code>
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 14, marginBottom: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                <Icon name="alertCircle" size={16} color="#EF4444" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }} htmlFor="mfaCode">
                  Enter the 6-digit code from your app
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  maxLength={6}
                  autoComplete="off"
                  disabled={loading || preparing || !factorId}
                  style={{
                    width: '100%', height: 56, border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
                    borderRadius: 8, padding: '0 16px', fontSize: 22, letterSpacing: '0.35em',
                    textAlign: 'center', fontFamily: "'SF Mono', ui-monospace, monospace",
                    color: 'var(--text-primary)', background: 'var(--surface)',
                    outline: 'none', boxSizing: 'border-box',
                    opacity: (loading || preparing || !factorId) ? 0.6 : 1,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || preparing || !factorId}
                style={{
                  width: '100%', height: 48, borderRadius: 8,
                  background: (loading || preparing || !factorId) ? 'var(--text-tertiary)' : 'var(--accent)',
                  color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)',
                  border: 'none', cursor: (loading || preparing || !factorId) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? (<><Icon name="loader" size={16} color="#fff" /> Verifying…</>) : (<><Icon name="shield" size={16} color="#fff" /> Confirm & Continue</>)}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Right panel (desktop only) ── */}
      {!isMobile && (
        <div style={{ flex: '0 0 50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.04 }}>
            <pattern id="mfaSetupDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#mfaSetupDots)" />
          </svg>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px' }}>
            <Icon name="shield" size={90} color="rgba(14,165,233,0.35)" />
            <div style={{ marginTop: 32 }}>
              <p style={{ color: '#7a9cc7', fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 8px' }}>
                Two-Factor Authentication
              </p>
              <p style={{ color: '#4a6a9a', fontSize: 13.5, maxWidth: 260, margin: '0 auto', lineHeight: 1.7 }}>
                Every admin account requires a verified authenticator app before accessing the dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMfaSetup
