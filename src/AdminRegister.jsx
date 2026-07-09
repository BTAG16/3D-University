import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useToast } from './components/Toast'
import { useIsMobile } from './hooks'
import { Icon } from './icons'

function Field({ label, type = 'text', placeholder, value, onChange, error, id }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-body)' }} htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', height: 48, border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, borderRadius: 8, padding: '0 16px', fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface)', transition: 'all var(--duration) var(--ease)', outline: 'none' }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = 'var(--shadow-focus)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />
      {error && <p style={{ fontSize: 13, color: 'var(--error)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function PasswordField({ label, value, onChange, error, id }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-body)' }} htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder="Min. 6 characters"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', height: 48, border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, borderRadius: 8, padding: '0 48px 0 16px', fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface)', transition: 'all var(--duration) var(--ease)', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = 'var(--shadow-focus)' }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p style={{ fontSize: 13, color: 'var(--error)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function AdminRegister() {
  const [formData, setFormData] = useState({ email: '', password: '', universityName: '', city: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { adminSession, registerAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (adminSession) navigate('/admin/dashboard')
  }, [adminSession, navigate])

  const handleChange = field => val => {
    setFormData(prev => ({ ...prev, [field]: val }))
    setError('')
  }

  const validate = () => {
    if (!formData.universityName.trim()) { toast.error('University name is required'); return false }
    if (!formData.city.trim()) { toast.error('City is required'); return false }
    if (!formData.email || !formData.email.includes('@')) { toast.error('Valid email is required'); return false }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const result = await registerAdmin(formData.email, formData.password, formData.universityName, formData.city)
      if (result.success && result.requiresEmailConfirmation) {
        setSuccess(true)
      } else if (result.success) {
        navigate('/admin/dashboard')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)' }}>
            <Icon name="check" size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, marginBottom: 8, color: 'var(--text-primary)' }}>Check your email</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We sent a confirmation link to <strong>{formData.email}</strong>. Click it to activate your account, then sign in.
          </p>
          <button onClick={() => navigate('/admin/login')} style={{ marginTop: 24, width: '100%', height: 48, borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer' }}>
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row', background: 'var(--bg)' }}>
      <div style={{ flex: isMobile ? 'none' : '0 0 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '48px 24px' : '48px', minHeight: isMobile ? '100vh' : 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
            <div style={{ color: 'var(--accent)' }}><Icon name="mapPin" size={24} /></div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Kampus</span>
          </button>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, marginBottom: 6, color: 'var(--text-primary)' }}>Register your university</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>Create a free admin account to get started</p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--error-subtle)', color: 'var(--error)', fontSize: 14, marginBottom: 16 }}>
              <Icon name="alertCircle" size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field label="University name" id="universityName" placeholder="e.g. University of Edinburgh" value={formData.universityName} onChange={handleChange('universityName')} />
            <Field label="City" id="city" placeholder="e.g. Edinburgh" value={formData.city} onChange={handleChange('city')} />
            <Field label="Admin email" type="email" id="email" placeholder="admin@university.edu" value={formData.email} onChange={handleChange('email')} />
            <PasswordField label="Password" id="password" value={formData.password} onChange={handleChange('password')} />
            <button type="submit" disabled={loading} style={{ width: '100%', height: 48, borderRadius: 8, background: loading ? 'var(--text-tertiary)' : 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: loading ? 'wait' : 'pointer', transition: 'background var(--duration) var(--ease)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}>
              {loading ? <><Icon name="loader" size={16} /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              Already have an account?{' '}
              <button onClick={() => navigate('/admin/login')} style={{ fontSize: 14, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0, fontWeight: 600 }}>
                Sign in
              </button>
            </p>
            <button onClick={() => navigate('/')} style={{ fontSize: 14, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ← Back to home
            </button>
          </div>
        </div>
      </div>

      {!isMobile && (
        <div style={{ flex: '0 0 50%', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.04 }}>
            <pattern id="regDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#regDots)" />
          </svg>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px' }}>
            <p style={{ color: '#7a9cc7', fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Live in minutes</p>
            <p style={{ color: '#4a6a8a', fontSize: 15, fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
              Add your buildings, drop your pins,<br />share one link with students.<br />No technical setup required.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRegister
