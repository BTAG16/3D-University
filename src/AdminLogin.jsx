import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useToast } from './components/Toast'
import { useIsMobile, useDarkMode } from './hooks'
import { Icon } from './icons'

/* ─── Campus illustration for brand panel ─────────────────── */
function CampusIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" style={{ width:'85%', maxWidth:360, opacity:0.9 }}>
      <ellipse cx="200" cy="320" rx="160" ry="40" fill="#1a3461" opacity="0.3"/>
      <g transform="translate(120, 140)">
        <rect x="0" y="40" width="70" height="120" rx="3" fill="#2a5298" opacity="0.9"/>
        <rect x="5" y="0" width="60" height="45" rx="3" fill="#3366bb"/>
        {[55,75,95,115,135].map((y,i) => (
          <g key={i}>
            <rect x="10" y={y} width="12" height="10" rx="1" fill="#6b9eff" opacity="0.5"/>
            <rect x="28" y={y} width="12" height="10" rx="1" fill="#6b9eff" opacity="0.4"/>
            <rect x="46" y={y} width="12" height="10" rx="1" fill="#6b9eff" opacity="0.6"/>
          </g>
        ))}
        <rect x="25" y="140" width="20" height="20" rx="2" fill="#1a3461"/>
      </g>
      <g transform="translate(210, 190)">
        <rect x="0" y="0" width="100" height="70" rx="3" fill="#2a5298" opacity="0.8"/>
        {[15,35,55].map((y,i) => (
          <g key={i}>
            <rect x="10" y={y} width="16" height="8" rx="1" fill="#6b9eff" opacity="0.4"/>
            <rect x="32" y={y} width="16" height="8" rx="1" fill="#6b9eff" opacity="0.5"/>
            <rect x="54" y={y} width="16" height="8" rx="1" fill="#6b9eff" opacity="0.3"/>
            <rect x="76" y={y} width="16" height="8" rx="1" fill="#6b9eff" opacity="0.5"/>
          </g>
        ))}
        <rect x="42" y="52" width="16" height="18" rx="2" fill="#1a3461"/>
      </g>
      <g transform="translate(80, 250)">
        <rect x="0" y="0" width="60" height="50" rx="3" fill="#3366bb" opacity="0.7"/>
        {[12, 28].map((y,i) => (
          <g key={i}>
            <rect x="8" y={y} width="10" height="8" rx="1" fill="#6b9eff" opacity="0.4"/>
            <rect x="24" y={y} width="10" height="8" rx="1" fill="#6b9eff" opacity="0.5"/>
            <rect x="40" y={y} width="10" height="8" rx="1" fill="#6b9eff" opacity="0.3"/>
          </g>
        ))}
      </g>
      {[[60,285],[170,290],[320,275],[350,295],[250,300]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={8+i*2} fill="#2a7a4a" opacity={0.3+i*0.05}/>
      ))}
      <path d="M120 310 Q 200 280 310 310" stroke="#4a7ab5" strokeWidth="2" opacity="0.2" fill="none" strokeDasharray="4 3"/>
      <g transform="translate(155, 115)">
        <circle cx="0" cy="0" r="10" fill="#0EA5E9" opacity="0.9"/>
        <circle cx="0" cy="0" r="4" fill="#fff"/>
        <circle cx="0" cy="0" r="14" fill="none" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.3"/>
      </g>
    </svg>
  )
}

/* ─── Field components ─────────────────────────────────────── */
function Field({ label, type = 'text', placeholder, value, onChange, error, id }) {
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:'block', fontSize:14, fontWeight:500, color:'var(--text-primary)', marginBottom:6, fontFamily:'var(--font-body)' }} htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width:'100%', height:48, border:`1px solid ${error ? 'var(--error)' : 'var(--border)'}`, borderRadius:8, padding:'0 16px', fontSize:15, fontFamily:'var(--font-body)', color:'var(--text-primary)', background:'var(--surface)', transition:'all var(--duration) var(--ease)', outline:'none' }}
        onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='var(--shadow-focus)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'; e.target.style.boxShadow='none' }}
      />
      {error && <p style={{ fontSize:13, color:'var(--error)', marginTop:4 }}>{error}</p>}
    </div>
  )
}

function PasswordField({ label, value, onChange, error, placeholder = 'Enter your password', id }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:'block', fontSize:14, fontWeight:500, color:'var(--text-primary)', marginBottom:6, fontFamily:'var(--font-body)' }} htmlFor={id}>{label}</label>
      <div style={{ position:'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width:'100%', height:48, border:`1px solid ${error ? 'var(--error)' : 'var(--border)'}`, borderRadius:8, padding:'0 48px 0 16px', fontSize:15, fontFamily:'var(--font-body)', color:'var(--text-primary)', background:'var(--surface)', transition:'all var(--duration) var(--ease)', outline:'none' }}
          onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='var(--shadow-focus)' }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'; e.target.style.boxShadow='none' }}
        />
        <button type="button" onClick={() => setShow(!show)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', fontSize:13, fontFamily:'var(--font-body)' }}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p style={{ fontSize:13, color:'var(--error)', marginTop:4 }}>{error}</p>}
    </div>
  )
}

/* ─── Main AdminLogin component ────────────────────────────── */
function AdminLogin() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { adminSession, adminLogin, sendPasswordResetEmail } = useAdminAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const isMobile = useIsMobile()
  const [dark] = useDarkMode()

  useEffect(() => {
    if (adminSession) navigate('/admin/dashboard')
  }, [adminSession, navigate])

  const handleChange = (field) => (val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) { toast.error('Email and password are required'); return false }
    if (!formData.email.includes('@')) { toast.error('Please enter a valid email'); return false }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setError('')
    try {
      const result = await adminLogin(formData.email, formData.password)
      if (!result.success) setError(result.error || 'Login failed')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) { setError('Please enter your email address'); return }
    setLoading(true)
    setError('')
    try {
      const result = await sendPasswordResetEmail(forgotEmail.trim())
      if (result.success) setResetSent(true)
      else setError(result.error || 'Failed to send reset email')
    } catch {
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

  /* ── Form content ── */
  const renderForm = () => {
    if (resetSent) {
      return (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--accent)' }}>
            <Icon name="check" size={28} />
          </div>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, marginBottom:8, color:'var(--text-primary)' }}>Check your email</h3>
          <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:24, lineHeight:1.6 }}>We sent a reset link to <strong>{forgotEmail}</strong>. Click the link to set a new password.</p>
          <button onClick={handleBackToLogin} style={{ width:'100%', height:48, borderRadius:8, background:'var(--accent)', color:'#fff', fontSize:15, fontWeight:600, fontFamily:'var(--font-display)', border:'none', cursor:'pointer', transition:'background var(--duration) var(--ease)' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}>
            Back to sign in
          </button>
        </div>
      )
    }

    if (showForgotPassword) {
      return (
        <>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:26, marginBottom:6, color:'var(--text-primary)' }}>Reset password</h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:28 }}>Enter your email to receive a reset link</p>
          <button onClick={handleBackToLogin} style={{ display:'flex', alignItems:'center', gap:4, fontSize:14, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', marginBottom:20, fontFamily:'var(--font-body)', padding:0 }}>
            ← Back to sign in
          </button>
          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:8, background:'var(--error-subtle)', color:'var(--error)', fontSize:14, marginBottom:16 }}>
              <Icon name="alertCircle" size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleForgotPassword} noValidate>
            <Field label="Email address" type="email" id="forgot-email" placeholder="admin@university.edu" value={forgotEmail} onChange={setForgotEmail} />
            <button type="submit" disabled={loading} style={{ width:'100%', height:48, borderRadius:8, background: loading ? 'var(--text-tertiary)' : 'var(--accent)', color:'#fff', fontSize:15, fontWeight:600, fontFamily:'var(--font-display)', border:'none', cursor: loading ? 'wait' : 'pointer', transition:'background var(--duration) var(--ease)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background='var(--accent-hover)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background='var(--accent)' }}>
              {loading ? 'Sending…' : <><Icon name="mail" size={16} /> Send reset link</>}
            </button>
          </form>
        </>
      )
    }

    return (
      <>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:26, marginBottom:6, color:'var(--text-primary)' }}>Welcome back</h2>
        <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:28 }}>Sign in to manage your campus</p>
        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:8, background:'var(--error-subtle)', color:'var(--error)', fontSize:14, marginBottom:16 }}>
            <Icon name="alertCircle" size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email address" type="email" id="email" placeholder="admin@university.edu" value={formData.email} onChange={handleChange('email')} />
          <PasswordField label="Password" id="password" value={formData.password} onChange={handleChange('password')} />
          <div style={{ textAlign:'right', marginTop:-12, marginBottom:20 }}>
            <button type="button" onClick={() => setShowForgotPassword(true)} style={{ fontSize:13, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>Forgot password?</button>
          </div>
          <button type="submit" disabled={loading} style={{ width:'100%', height:48, borderRadius:8, background: loading ? 'var(--text-tertiary)' : 'var(--accent)', color:'#fff', fontSize:15, fontWeight:600, fontFamily:'var(--font-display)', border:'none', cursor: loading ? 'wait' : 'pointer', transition:'background var(--duration) var(--ease)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background='var(--accent-hover)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background='var(--accent)' }}>
            {loading ? <><Icon name="loader" size={16} /> Signing in…</> : 'Sign in'}
          </button>
        </form>
      </>
    )
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', flexDirection: isMobile ? 'column' : 'row', background:'var(--bg)' }}>
      {/* Left: Form panel */}
      <div style={{ flex: isMobile ? 'none' : '0 0 50%', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding: isMobile ? '48px 24px' : '48px', minHeight: isMobile ? '100vh' : 'auto' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:40, background:'none', border:'none', cursor:'pointer', color:'inherit', padding:0 }}>
            <div style={{ color:'var(--accent)' }}><Icon name="mapPin" size={24} /></div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Kampus</span>
          </button>

          {renderForm()}

          {/* Register + Back to home */}
          {!showForgotPassword && !resetSent && (
            <div style={{ textAlign:'center', marginTop:24, display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:14, color:'var(--text-secondary)', margin:0 }}>
                Don't have an account?{' '}
                <button onClick={() => navigate('/admin/register')} style={{ fontSize:14, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', padding:0, fontWeight:600 }}>
                  Register your university
                </button>
              </p>
              <button onClick={() => navigate('/')} style={{ fontSize:14, color:'var(--text-tertiary)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>
                ← Back to home
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Brand panel (desktop only) */}
      {!isMobile && (
        <div style={{ flex:'0 0 50%', background:'var(--navy)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          {/* Dot pattern */}
          <svg style={{ position:'absolute', width:'100%', height:'100%', opacity:0.04 }}>
            <pattern id="loginDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#loginDots)"/>
          </svg>
          <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
            <CampusIllustration />
            <p style={{ color:'#7a9cc7', fontSize:15, marginTop:32, fontFamily:'var(--font-body)', maxWidth:280 }}>
              Interactive 3D campus maps,<br/>built for universities.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLogin
