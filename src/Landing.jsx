import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useIsMobile, useDarkMode } from './hooks'
import { Icon } from './icons'
import Reveal from './components/Reveal'

/* ─── Campus map screenshot mockup ─────────────────────────── */
const BLDGS = [
  { id: 1, name: 'Main Library', cat: 'Library', dist: '2 min', color: '#7C3AED', x: 148, y: 118, w: 72, h: 52 },
  { id: 2, name: 'Engineering Building', cat: 'Academic', dist: '4 min', color: '#0EA5E9', x: 344, y: 92, w: 88, h: 58, sel: true },
  { id: 3, name: 'Student Center', cat: 'Student Life', dist: '1 min', color: '#F59E0B', x: 258, y: 248, w: 74, h: 48 },
  { id: 4, name: 'Science Complex', cat: 'Academic', dist: '6 min', color: '#10B981', x: 100, y: 260, w: 80, h: 54 },
  { id: 5, name: 'Admin Building', cat: 'Administration', dist: '5 min', color: '#EF4444', x: 458, y: 272, w: 64, h: 52 },
  { id: 6, name: 'Sports Center', cat: 'Sports', dist: '8 min', color: '#EC4899', x: 506, y: 168, w: 58, h: 68 },
]

function CampusMapScreenshot() {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#fff', fontFamily: 'var(--font-body)' }}>
      {/* Browser chrome */}
      <div style={{ height: 36, background: '#F5F5F5', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#EBEBEB', borderRadius: 6, height: 22, width: 220, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5 }}>
            <span style={{ fontSize: 11, color: '#6B7280' }}>campus.youruni.edu/map</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', height: 'calc(100% - 36px)' }}>
        {/* Sidebar */}
        <div style={{ width: 252, borderRight: '1px solid #E9ECF0', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 9 }}>
              <Icon name="mapPin" size={14} />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#101828' }}>Budapest Tech University</span>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 7, height: 30, display: 'flex', alignItems: 'center', padding: '0 9px', gap: 6, border: '1px solid #E9ECF0' }}>
              <Icon name="search" size={11} />
              <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>Search buildings, rooms…</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
              {['All', 'Academic', 'Library', 'Sports'].map((c, i) => (
                <span key={c} style={{ fontSize: 9.5, padding: '2.5px 8px', borderRadius: 9999, background: i === 0 ? 'var(--accent)' : '#F3F4F6', color: i === 0 ? '#fff' : '#6B7280', fontWeight: 500 }}>{c}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'hidden', padding: '6px 6px' }}>
            {BLDGS.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, marginBottom: 1, background: b.sel ? 'var(--accent-subtle)' : 'transparent', borderLeft: `3px solid ${b.sel ? 'var(--accent)' : 'transparent'}` }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="building" size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: b.sel ? 700 : 600, color: b.sel ? 'var(--accent)' : '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                  <div style={{ fontSize: 9.5, color: '#9CA3AF', display: 'flex', gap: 5 }}><span>{b.cat}</span><span>~{b.dist}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#EEF2F6' }}>
          <svg width="100%" height="100%" viewBox="0 0 640 448" preserveAspectRatio="xMidYMid slice">
            <rect width="640" height="448" fill="#EEF2F6" />
            <rect x="228" y="196" width="110" height="76" rx="6" fill="#D4EBC8" opacity="0.85" />
            <path d="M0 406 Q 100 392 240 400 T 480 396 T 640 400 L 640 448 L 0 448 Z" fill="#C4DCE8" opacity="0.6" />
            <rect x="0" y="224" width="640" height="14" fill="#FFF" opacity="0.95" />
            <rect x="304" y="0" width="14" height="448" fill="#FFF" opacity="0.95" />
            <rect x="474" y="0" width="10" height="448" fill="#FFF" opacity="0.85" />
            <rect x="126" y="0" width="10" height="448" fill="#FFF" opacity="0.85" />
            {BLDGS.map(b => <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={b.color} opacity={b.sel ? 0.2 : 0.1} />)}
            {BLDGS.map(b => {
              const cx = b.x + b.w / 2, cy = b.y - 18
              return (
                <g key={b.id}>
                  {b.sel && <circle cx={cx} cy={cy} r="19" fill={b.color} opacity="0.12" />}
                  <circle cx={cx} cy={cy} r={b.sel ? 13 : 9.5} fill="#fff" stroke={b.color} strokeWidth={b.sel ? 2.5 : 1.5} />
                  <circle cx={cx} cy={cy} r={b.sel ? 5 : 3.5} fill={b.color} />
                </g>
              )
            })}
            {/* Info card for selected building */}
            <g transform="translate(348, 76)">
              <rect x="0" y="0" width="206" height="116" rx="10" fill="#FFFFFF" />
              <text x="48" y="24" fontSize="10.5" fontWeight="700" fill="#101828" fontFamily="system-ui">Engineering Building</text>
              <text x="48" y="36" fontSize="9" fill="#9CA3AF" fontFamily="system-ui">Academic · CS & Engineering</text>
              <line x1="12" y1="50" x2="194" y2="50" stroke="#F0F4F8" strokeWidth="1" />
              <text x="12" y="65" fontSize="9" fill="#667085" fontFamily="system-ui">⏰  Mon–Fri 7am–9pm</text>
              <text x="12" y="79" fontSize="9" fill="#0EA5E9" fontFamily="system-ui">📍  ~4 min walk   ·   24 rooms</text>
              <rect x="12" y="88" width="86" height="18" rx="5" fill="#0EA5E9" />
              <text x="55" y="100" textAnchor="middle" fontSize="9.5" fill="#fff" fontFamily="system-ui" fontWeight="600">Get Directions</text>
              <rect x="104" y="88" width="72" height="18" rx="5" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
              <text x="140" y="100" textAnchor="middle" fontSize="9.5" fill="#0EA5E9" fontFamily="system-ui" fontWeight="500">View Rooms</text>
            </g>
            <g>
              <rect x="600" y="12" width="28" height="56" rx="7" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
              <text x="614" y="35" textAnchor="middle" fontSize="16" fill="#6B7280" fontFamily="system-ui">+</text>
              <line x1="602" y1="43" x2="626" y2="43" stroke="#E5E7EB" strokeWidth="1" />
              <text x="614" y="59" textAnchor="middle" fontSize="16" fill="#6B7280" fontFamily="system-ui">−</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ─── Shared small components ─────────────────────────────── */
function NavLogo() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
      <div style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="mapPin" size={22} /></div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Kampus</span>
    </button>
  )
}

function DarkToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: dark ? '#f0c040' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms ease', flexShrink: 0 }}>
      <Icon name={dark ? 'sun' : 'moon'} size={16} />
    </button>
  )
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border-light)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.4 }}>{question}</span>
        <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: open ? 'var(--accent)' : 'var(--accent-subtle)', color: open ? '#fff' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms ease', transform: open ? 'rotate(45deg)' : 'none', fontSize: 18, fontWeight: 300, lineHeight: 1 }}>+</span>
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? 300 : 0, transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, paddingBottom: 20 }}>{answer}</p>
      </div>
    </div>
  )
}

/* ─── Main Landing component ──────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const { adminSession } = useAdminAuth()
  const isMobile = useIsMobile()
  const [dark, toggleDark] = useDarkMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
  }

  const fade = (delay) => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const navLinks = [
    { label: 'Features', action: () => scrollTo('features') },
    { label: 'How It Works', action: () => scrollTo('how-it-works') },
    { label: 'Demo', action: () => navigate('/demo') },
    { label: 'FAQ', action: () => scrollTo('faq') },
  ]

  const features = [
    { icon: 'globe', title: '3D Interactive Map' },
    { icon: 'search', title: 'Smart Search' },
    { icon: 'compass', title: 'Walking Directions' },
    { icon: 'layers', title: 'Indoor Navigation' },
    { icon: 'calendar', title: 'Room Timetables' },
    { icon: 'link', title: 'One Link, Shareable' },
  ]

  const steps = [
    { num: '01', icon: 'userPlus', title: 'Sign up your university', desc: 'Create an admin account in 60 seconds. No credit card, no commitment.' },
    { num: '02', icon: 'building', title: 'Add buildings & rooms', desc: 'Use the visual dashboard to enter details, coordinates, and schedules.' },
    { num: '03', icon: 'share', title: 'Share the link', desc: 'Students open it instantly — zero login, zero download, zero friction.' },
  ]

  const faqs = [
    { q: 'Is Kampus 3D really free?', a: 'Yes. We offer the full platform free for your first campus. We believe in letting you experience the value before any conversation about pricing for multi-campus deployments.' },
    { q: 'How long does it take to set up?', a: 'Most universities are live within a day. Create an admin account (60 seconds), add your buildings and rooms via our dashboard (a few hours depending on campus size), and share the link. No technical integration required.' },
    { q: 'Do students need to download an app?', a: 'No. Your campus map is a web link — students open it in any browser on any device. No app store, no login, no friction. You can also embed it directly on your university website.' },
    { q: 'Where does the map data come from?', a: 'You add your own building data through the admin dashboard — names, categories, coordinates, operating hours, facilities, and room schedules. The base map (streets, terrain) comes from Mapbox.' },
    { q: 'Can I add indoor navigation?', a: 'Yes. If your buildings are mapped on Mappedin, you can link each building to its indoor map. Students tap "Indoor Navigation" and get floor-by-floor wayfinding inside the building.' },
    { q: 'What about data privacy?', a: 'Student location data stays in the browser — we never transmit or store individual positions. Admin data is encrypted in transit and at rest.' },
    { q: 'Can I embed the map on our university website?', a: 'Absolutely. We provide a ready-to-use iframe embed code in your admin dashboard. Just copy and paste it into your site.' },
    { q: 'What if I need help setting up?', a: 'We offer hands-on onboarding support. Reach out to our team and we will help you add your campus data and get live quickly.' },
  ]

  const testimonials = [
    { name: 'Dr. Anna Varga', title: 'Head of Student Affairs', university: 'Budapest Tech', quote: 'We deployed Kampus in a week. Students actually use it now instead of calling our office for directions.' },
    { name: 'Mehmet Yılmaz', title: 'IT Director', university: 'Ankara University', quote: 'The admin dashboard is incredibly intuitive. We added 40 buildings in one afternoon.' },
    { name: 'Elena Petrova', title: 'Campus Operations', university: 'Sofia State University', quote: 'The indoor navigation feature has been a game-changer for our new students during orientation week.' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: dark ? (scrolled ? 'rgba(11,17,32,0.92)' : 'rgba(11,17,32,0.85)') : (scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.98)'),
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        display: 'flex', alignItems: 'center', padding: '0 24px',
        transition: 'all var(--duration-md) var(--ease)',
      }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavLogo />
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {navLinks.map(l => (
                <button key={l.label} onClick={l.action} style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color var(--duration) var(--ease)', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DarkToggle dark={dark} onToggle={toggleDark} />
              <button onClick={() => navigate('/admin/login')} style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Log in
              </button>
              <button onClick={() => navigate(adminSession ? '/admin/dashboard' : '/admin/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 9999, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', transition: 'background var(--duration) var(--ease)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
                {adminSession ? 'Dashboard' : 'Get Started Free'}
              </button>
            </div>
          )}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DarkToggle dark={dark} onToggle={toggleDark} />
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4, display: 'flex' }}>
                <Icon name={menuOpen ? 'x' : 'menu'} size={24} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: 'var(--surface)', padding: 24,
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--duration-md) var(--ease)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {navLinks.map(l => (
            <button key={l.label} onClick={l.action} style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid var(--border-light)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              {l.label}
            </button>
          ))}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => { setMenuOpen(false); navigate('/admin/login') }} style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', textAlign: 'left', fontFamily: 'var(--font-body)' }}>Log in</button>
            <button onClick={() => { setMenuOpen(false); navigate(adminSession ? '/admin/dashboard' : '/admin/login') }} style={{ width: '100%', padding: '14px 28px', borderRadius: 9999, background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer' }}>
              {adminSession ? 'Dashboard' : 'Get Started Free'}
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: isMobile ? 'calc(64px + 48px)' : 'calc(64px + 80px)', paddingBottom: isMobile ? 40 : 20, background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
        {/* Background elements */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.06) 0%, transparent 60%)' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
          <pattern id="heroDots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="currentColor" opacity="0.4" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#heroDots)" style={{ color: 'var(--text-tertiary)' }} />
        </svg>

        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ ...fade(60), display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-muted)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', padding: '5px 16px 5px 10px', borderRadius: 9999, letterSpacing: '0.03em' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
              Built for Universities
            </span>
          </div>

          {/* Heading */}
          <h1 style={{ ...fade(160), fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: isMobile ? 46 : 84, lineHeight: 1.0, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: '0 auto 24px', maxWidth: isMobile ? '100%' : 820 }}>
            Your campus,<br />
            <span style={{ color: 'var(--accent)' }}>mapped beautifully.</span>
          </h1>

          {/* Subtitle */}
          <p style={{ ...fade(280), fontSize: isMobile ? 17 : 20, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 40px' }}>
            Give students an interactive 3D map of your campus — buildings, rooms, timetables, and walking directions, all in one shareable link.
          </p>

          {/* CTAs */}
          <div style={{ ...fade(380), display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', marginBottom: 28, width: isMobile ? '100%' : 'auto' }}>
            <button onClick={() => navigate(adminSession ? '/admin/dashboard' : '/admin/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 9999, background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', transition: 'background var(--duration) var(--ease)', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              Get started free <Icon name="arrowRight" size={18} />
            </button>
            <button onClick={() => navigate('/demo')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              See live demo <Icon name="arrowRight" size={18} />
            </button>
          </div>

          {/* Trust */}
          <div style={{ ...fade(480), display: 'flex', gap: isMobile ? 20 : 36, fontSize: 13, color: 'var(--text-tertiary)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
            {['No credit card', '5 minute setup', 'Free for your first campus'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--success)' }}><Icon name="check" size={13} /></span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Big screenshot */}
        <div style={{ ...fade(260), position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px', marginTop: isMobile ? 32 : 8 }}>
          <div style={{ position: 'absolute', top: '5%', left: '10%', width: '80%', height: '90%', background: 'radial-gradient(ellipse, rgba(14,165,233,0.1) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: isMobile ? 220 : 520, transform: isMobile ? 'none' : 'perspective(2000px) rotateX(10deg) rotateY(10deg)', transformOrigin: '50% 50%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)' }}>
            <CampusMapScreenshot />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: isMobile ? 50 : 100, background: 'linear-gradient(to bottom, transparent, var(--bg))', pointerEvents: 'none', zIndex: 2 }} />
        </div>
      </section>

      {/* ── Social proof bar ─────────────────────────────────── */}
      <section style={{ padding: '52px 0', background: 'var(--surface)', borderTop: '1px solid var(--border-light)' }}>
        <Reveal>
          <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 28, letterSpacing: '0.02em' }}>Trusted by universities in 3 countries</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 24 : 56, flexWrap: 'wrap' }}>
              {['Budapest Tech', 'Ankara Uni', 'Sofia State', 'Debrecen Uni'].map(name => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.35, filter: 'grayscale(100%)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="shield" size={16} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Features overview ────────────────────────────────── */}
      <section id="features" style={{ padding: isMobile ? '64px 0' : '100px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 56 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 30 : 44, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.12 }}>The complete campus platform</h2>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 480, margin: '14px auto 0', lineHeight: 1.6 }}>Everything students need to navigate campus, built into one link.</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? 12 : 16 }}>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div style={{ textAlign: 'center', padding: isMobile ? '20px 12px' : '28px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border-light)', transition: 'all 250ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={f.icon} size={20} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{f.title}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature deep dives ───────────────────────────────── */}
      {[
        {
          id: 'feature-map', eyebrow: 'Core Experience',
          title: 'A 3D interactive campus map students actually use',
          desc: 'Powered by Mapbox, your campus comes alive with 3D building extrusions, smooth fly-to animations, and real-time location. Students search, explore, and get directions — no app download required.',
          bullets: ['Mapbox GL 3D rendering with building height data', 'Custom markers with category icons and clustering', 'Works on any device — desktop, tablet, or phone', 'Dark mode toggle for the map view'],
          bg: 'var(--surface)', reversed: false,
        },
        {
          id: 'feature-dashboard', eyebrow: 'Admin Experience',
          title: 'A dashboard that makes campus data management effortless',
          desc: 'Add buildings, rooms, timetables, and facilities from a clean admin interface. No technical skills needed — if you can fill a form, you can run your campus map.',
          bullets: ['Add buildings with coordinates, categories, and operating hours', 'Manage rooms with office hours, capacity, and weekly timetables', 'Copy your public link or embed code in one click', 'Track visitor analytics and map engagement'],
          bg: 'var(--bg)', reversed: true,
        },
      ].map((sec) => (
        <section key={sec.id} id={sec.id} style={{ padding: isMobile ? '64px 0' : '100px 0', background: sec.bg }}>
          <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', flexDirection: isMobile ? 'column' : (sec.reversed ? 'row-reverse' : 'row'), gap: isMobile ? 40 : 80 }}>
            <Reveal direction={sec.reversed ? 'right' : 'left'} style={{ flex: '0 1 48%' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: 'var(--accent)', display: 'inline-block' }}></span>
                  {sec.eyebrow}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 26 : 34, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 16 }}>{sec.title}</h3>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>{sec.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sec.bullets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Icon name="check" size={12} />
                      </div>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={200} direction={sec.reversed ? 'left' : 'right'} style={{ flex: '0 1 52%', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div style={{ width: '100%', maxWidth: 520, borderRadius: 12, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)', background: 'var(--surface)', height: isMobile ? 220 : 320 }}>
                <div style={{ height: 32, background: 'var(--border-light)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
                  {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ flex: 1, display: 'flex', height: 'calc(100% - 32px)' }}>
                  <div style={{ width: isMobile ? 52 : 64, borderRight: '1px solid var(--border)', padding: '10px 6px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i === 0 ? 'var(--accent-subtle)' : 'var(--border-light)' }} />)}
                  </div>
                  <div style={{ flex: 1, padding: isMobile ? 10 : 16, overflow: 'hidden', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {[{ n: '5', l: 'Buildings', c: 'var(--accent)' }, { n: '24', l: 'Rooms', c: '#7c3aed' }, { n: '●', l: 'Live', c: '#12B76A' }].map(s => (
                        <div key={s.l} style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: isMobile ? '8px 6px' : '10px 12px' }}>
                          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: s.c }}>{s.n}</div>
                          <div style={{ fontSize: 8, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    {['Main Library', 'Engineering', 'Student Center', 'Science Complex'].map((b, i) => (
                      <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', borderBottom: '1px solid var(--border-light)', fontSize: 9 }}>
                        <span style={{ flex: 2, fontWeight: 600, color: 'var(--text-primary)' }}>{b}</span>
                        <span style={{ flex: 1, fontSize: 8, padding: '1px 6px', borderRadius: 9999, background: 'var(--border-light)', color: 'var(--text-secondary)' }}>{['Library', 'Academic', 'Student', 'Academic'][i]}</span>
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{[12, 24, 8, 18][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: isMobile ? '64px 0' : '100px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 72 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 30 : 44, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.12 }}>Live in three steps</h2>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 14 }}>From sign-up to live campus map in under five minutes.</p>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 36 : 0, position: 'relative' }}>
            {!isMobile && <div style={{ position: 'absolute', top: 36, left: '20%', right: '20%', height: 2, background: 'var(--border)', zIndex: 0 }}></div>}
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 150} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: 'var(--surface)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,165,233,0.12)' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{s.num}</span>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 14px', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={22} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo section (dark) ──────────────────────────────── */}
      <section id="demo" style={{ padding: isMobile ? '72px 0' : '112px 0', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
          <pattern id="topo" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#fff" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#fff" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="20" fill="none" stroke="#fff" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>
        <Reveal>
          <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 16 }}>Live Demo</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 30 : 48, letterSpacing: '-0.025em', color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>See it before you build it</h2>
            <p style={{ fontSize: 18, color: '#8899ac', marginBottom: 40, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.6 }}>Explore a demo campus with real buildings, rooms, and timetables already loaded.</p>
            <button onClick={() => navigate('/demo')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 9999, background: '#fff', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', transition: 'background var(--duration) var(--ease)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Try the Demo <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: isMobile ? '64px 0' : '100px 0', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 56 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 30 : 44, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.12 }}>Frequently asked questions</h2>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 14 }}>Everything you need to know.</p>
            </div>
          </Reveal>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <FAQItem question={f.q} answer={f.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '64px 0' : '88px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 28 : 36, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.15 }}>Loved by campus teams</h2>
            </div>
          </Reveal>
          <div style={{ display: 'flex', gap: 20, flexDirection: isMobile ? 'column' : 'row' }}>
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120} style={{ flex: 1 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 28, border: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t.title}, {t.university}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '72px 0' : '96px 0', background: 'var(--accent)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
        <Reveal>
          <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isMobile ? 30 : 44, letterSpacing: '-0.025em', color: '#fff', lineHeight: 1.12, marginBottom: 16 }}>Ready to put your campus on the map?</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>Free setup, free hosting, free support. Your students deserve a better map.</p>
            <button onClick={() => navigate(adminSession ? '/admin/dashboard' : '/admin/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 9999, background: '#fff', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', transition: 'background var(--duration) var(--ease)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Get started free <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ padding: isMobile ? '48px 0 24px' : '64px 0 24px', background: 'var(--surface)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 32 : 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ color: 'var(--accent)' }}><Icon name="mapPin" size={20} /></div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>Kampus</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 260 }}>Interactive 3D campus maps for universities. Built with care in Budapest.</p>
            </div>
            {[
              { title: 'Product', links: [{ label: 'Features', action: () => scrollTo('features') }, { label: 'Demo', action: () => navigate('/demo') }, { label: 'FAQ', action: () => scrollTo('faq') }] },
              { title: 'Company', links: [{ label: 'About', action: () => { } }, { label: 'Blog', action: () => { } }, { label: 'Contact', action: () => window.location.href = 'mailto:contact@kampus3d.com' }] },
              { title: 'Legal', links: [{ label: 'Privacy Policy', action: () => navigate('/privacy') }, { label: 'Terms of Service', action: () => navigate('/terms') }] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <button key={l.label} onClick={l.action} style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'var(--font-body)', transition: 'color var(--duration) var(--ease)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>{l.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>© {new Date().getFullYear()} Kampus 3D. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <button onClick={() => navigate('/privacy')} style={{ fontSize: 13, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Privacy</button>
              <button onClick={() => navigate('/terms')} style={{ fontSize: 13, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Terms</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
