import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useIsMobile, useDarkMode } from './hooks'
import { Icon } from './icons'

function AdminMfaChallenge() {
  const [factorId, setFactorId] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preparing, setPreparing] = useState(true)
  const hasInitialized = useRef(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [dark] = useDarkMode()
  const { user, adminSession, getMfaFactors, completeMfaVerification } = useAdminAuth()

  useEffect(() => {
    if (adminSession) { navigate('/admin/dashboard'); return }
    if (!user) { navigate('/admin'); return }
  }, [adminSession, user, navigate])

  useEffect(() => {
    if (hasInitialized.current || !user) return
    hasInitialized.current = true
    const load = async () => {
      const result = await getMfaFactors()
      if (result.success) {
        const verified = result.totp.find(f => f.status === 'verified')
        if (verified) setFactorId(verified.id)
        else setError('No verified authenticator found for this account.')
      } else {
        setError(result.error || 'Failed to load authentication factors')
      }
      setPreparing(false)
    }
    load()
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
              Two-Factor Verification
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 28px' }}>
              Enter the 6-digit code from your authenticator app to finish signing in.
            </p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 14, marginBottom: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                <Icon name="alertCircle" size={16} color="#EF4444" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }} htmlFor="mfaChallengeCode">
                  6-Digit Code
                </label>
                <input
                  id="mfaChallengeCode"
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
                {loading ? (<><Icon name="loader" size={16} color="#fff" /> Verifying…</>) : (<><Icon name="shield" size={16} color="#fff" /> Verify & Continue</>)}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Right panel (desktop only) ── */}
      {!isMobile && (
        <div style={{ flex: '0 0 50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.04 }}>
            <pattern id="mfaChallengeDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#mfaChallengeDots)" />
          </svg>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px' }}>
            <Icon name="shield" size={90} color="rgba(14,165,233,0.35)" />
            <div style={{ marginTop: 32 }}>
              <p style={{ color: '#7a9cc7', fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 8px' }}>
                Verify It's You
              </p>
              <p style={{ color: '#4a6a9a', fontSize: 13.5, maxWidth: 260, margin: '0 auto', lineHeight: 1.7 }}>
                Two-factor authentication protects your university's admin account from unauthorized access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMfaChallenge
