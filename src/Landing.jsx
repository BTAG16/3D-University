import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useDarkMode } from './hooks'
import './Landing.css'

// ─── SVG helpers ─────────────────────────────────────────────────────────────
function Svg({ size = 24, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      {...rest}>
      {children}
    </svg>
  )
}

// ─── Logo icon ────────────────────────────────────────────────────────────────
function LogoIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
    </Svg>
  )
}

// ─── Inline check icon ────────────────────────────────────────────────────────
function CheckIcon({ size = 13 }) {
  return (
    <Svg size={size} strokeWidth="2.2">
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  )
}

// ─── Arrow right icon ─────────────────────────────────────────────────────────
function ArrowIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Svg>
  )
}

// ─── Feature icons ────────────────────────────────────────────────────────────
const featureIcons = {
  globe: () => <Svg size={21} strokeWidth={1.7}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></Svg>,
  compass: () => <Svg size={21} strokeWidth={1.7}><polygon points="3 11 22 2 13 21 11 13 3 11"/></Svg>,
  mobile: () => <Svg size={21} strokeWidth={1.7}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></Svg>,
  building: () => <Svg size={21} strokeWidth={1.7}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01M12 14h.01"/></Svg>,
  chart: () => <Svg size={21} strokeWidth={1.7}><path d="M3 3v18h18"/><path d="m7 15 4-6 4 3 5-7"/></Svg>,
  link: () => <Svg size={21} strokeWidth={1.7}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Svg>,
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS_DEF = [
  { target: 5,    suffix: ' min', label: 'Setup Time'          },
  { target: 50,   suffix: '+',   label: 'Buildings Supported'  },
  { target: 1000, suffix: '+',   label: 'Students per Campus', k: true },
  { target: 99.9, suffix: '%',   label: 'Uptime',              decimal: true },
]

const FEATURES_DEF = [
  { key: 'globe',    title: 'Interactive 3D Maps',   color: '#c084fc', desc: 'Photorealistic campus maps with building extrusions, smooth fly-to animations, and real-time positioning.' },
  { key: 'compass',  title: 'Smart Navigation',      color: '#22d3ee', desc: 'Turn-by-turn walking directions between any two points on campus, with accurate time estimates.' },
  { key: 'mobile',   title: 'Mobile-First Design',   color: '#f472b6', desc: 'Native-app quality on every device — from 320px phones to ultrawide monitors. No download required.' },
  { key: 'building', title: 'Building Details',      color: '#facc15', desc: 'Categories, hours, facilities, departments, and photos — every building tells students what they need.' },
  { key: 'chart',    title: 'Analytics Dashboard',   color: '#4ade80', desc: 'See which buildings students search for most, peak usage times, and how your map is performing.' },
  { key: 'link',     title: 'Easy Integration',      color: '#60a5fa', desc: 'Embed the map on your website with one iframe snippet, or share the link directly — done in minutes.' },
]

const STEPS = [
  { num: '01', title: 'Add your campus',       desc: 'Register, drop a pin, and define your buildings with the visual dashboard.',    delay: 0 },
  { num: '02', title: 'Customize everything',  desc: 'Add rooms, timetables, categories, and your university branding.',               delay: 120 },
  { num: '03', title: 'Share with students',   desc: 'One link, zero friction, instant access on any device.',                        delay: 240 },
]

const TESTIMONIALS = [
  { quote: 'We deployed Kampus in a week. Students actually use it now instead of calling our office for directions.', name: 'Dr. A. Varga',   role: 'Head of Student Affairs',   initial: 'A', delay: 0   },
  { quote: 'The admin dashboard is incredibly intuitive. We added 40 buildings in one afternoon.',                     name: 'M. Yılmaz',      role: 'IT Director',               initial: 'M', delay: 110 },
  { quote: 'Indoor navigation has been a game-changer for new students during orientation week.',                      name: 'E. Petrova',     role: 'Campus Operations',         initial: 'E', delay: 220 },
]

const FAQS = [
  { q: 'Is Kampus 3D really free?',              a: 'Yes — and fully open source (MIT licensed). Fork the repo, self-host on Vercel for free, and use it for as many campuses as you like. No tiers, no pricing conversations, no lock-in.' },
  { q: 'How long does it take to set up?',       a: 'Most universities are live within a day. Create an admin account, add your buildings and rooms via the dashboard, and share the link. No technical integration required.' },
  { q: 'Do students need to download an app?',   a: 'No. Your campus map is a web link — students open it in any browser on any device. No app store, no login, no friction.' },
  { q: 'Where does the map data come from?',     a: 'You add your own building data through the admin dashboard — names, categories, coordinates, hours, facilities, and room schedules. The base map comes from Mapbox.' },
  { q: 'Can I customize it to match our brand?', a: 'Yes. Upload your university logo, set your accent color, and write a custom welcome message — all from the Settings tab of your dashboard.' },
  { q: 'What about data privacy?',               a: 'Student location data stays in the browser — we never transmit or store individual positions. Admin data is encrypted in transit and at rest, and we are GDPR compliant.' },
  { q: 'Can I embed the map on our website?',    a: 'Absolutely. Your dashboard provides a ready-to-use iframe embed code — copy, paste, done.' },
  { q: 'What if I need help setting up?',        a: 'We offer hands-on onboarding support. Reach out and we will help you add your campus data and get live quickly.' },
]

const PILLS = ['3D Building Extrusions', 'Walking Directions', 'Room Timetables', 'Indoor Navigation', 'Live Occupancy', 'Instant Sharing']

// ─── useReveal hook ───────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    if (!els.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target) } })
    }, { rootMargin: '-60px 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Stat counter hook ────────────────────────────────────────────────────────
function useStatCounter(statsRef) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!statsRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect()
        if (reduced) { setProgress(1); return }
        const start = performance.now()
        const dur = 1400
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur)
          const eased = 1 - Math.pow(1 - t, 3)
          setProgress(eased)
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    io.observe(statsRef.current)
    return () => io.disconnect()
  }, [statsRef])
  return progress
}

// ─── Landing ──────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const { adminSession } = useAdminAuth()
  const [dark, toggleDark] = useDarkMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [faqOpen, setFaqOpen] = useState(-1)

  const parallaxRef = useRef(null)
  const showcaseRef = useRef(null)
  const statsRef = useRef(null)
  const progress = useStatCounter(statsRef)
  useReveal()

  // scroll observer
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
      if (!reduced) {
        if (parallaxRef.current) {
          const r = parallaxRef.current.getBoundingClientRect()
          const t = (window.innerHeight - r.top) / (window.innerHeight + r.height)
          parallaxRef.current.style.transform = `translateY(${((t - 0.5) * -28).toFixed(1)}px)`
        }
        if (showcaseRef.current) {
          const r = showcaseRef.current.getBoundingClientRect()
          const t = (window.innerHeight - r.top) / (window.innerHeight + r.height)
          if (t > 0 && t < 1) showcaseRef.current.style.transform = `translateY(${((t - 0.5) * -44).toFixed(1)}px)`
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navBg     = scrolled ? (dark ? 'rgba(11,17,32,0.82)'       : 'rgba(255,255,255,0.85)') : 'transparent'
  const navBorder = scrolled ? (dark ? 'rgba(255,255,255,0.07)'    : 'rgba(16,24,40,0.06)') : 'transparent'
  const navBlur   = scrolled ? 'blur(16px) saturate(1.6)' : 'none'

  // computed stats
  const stats = STATS_DEF.map(st => {
    const v = st.target * progress
    let display
    if (st.decimal)  display = v.toFixed(1) + st.suffix
    else if (st.k)   display = (v >= 1000 ? '1K' : String(Math.round(v))) + st.suffix
    else             display = String(Math.round(v)) + st.suffix
    return { display, label: st.label }
  })

  const ctaAction = () => navigate(adminSession ? '/admin/dashboard' : '/admin/login')
  const demoAction = () => navigate('/demo')
  const closeMenu = () => setMenuOpen(false)

  return (
    <div data-dark={dark ? 'true' : 'false'}
      style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', background: 'var(--bg)', minHeight: '100vh', transition: 'background 300ms var(--ease)' }}>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,24px)', transition: 'all 300ms var(--ease)', background: navBg, borderBottom: `1px solid ${navBorder}`, backdropFilter: navBlur, WebkitBackdropFilter: navBlur }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'inherit', textDecoration: 'none' }}>
            <span style={{ display: 'flex', color: 'var(--accent)' }}><LogoIcon size={24} /></span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Kampus</span>
          </a>
          <div className="rl-nav-links">
            {['features', 'how-it-works', 'testimonials', 'faq'].map(id => (
              <a key={id} href={`#${id}`} className="rl-nav-link">{id === 'how-it-works' ? 'How It Works' : id === 'faq' ? 'FAQ' : id.charAt(0).toUpperCase() + id.slice(1)}</a>
            ))}
          </div>
          <div className="rl-nav-actions">
            <button onClick={toggleDark} title="Toggle theme" className="rl-theme-btn">
              {dark
                ? <Svg size={15}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></Svg>
                : <Svg size={15}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Svg>
              }
            </button>
            <button className="rl-nav-login" onClick={ctaAction}>Log in</button>
            <button className="rl-cta-pill" onClick={ctaAction}>Get Started Free</button>
            <button className="rl-burger" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen
                ? <Svg size={22}><path d="M18 6 6 18M6 6l12 12"/></Svg>
                : <Svg size={22}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></Svg>
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE DRAWER ═══ */}
      {menuOpen && (
        <div className="rl-drawer" style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 99, background: 'var(--bg)', flexDirection: 'column', padding: 24, gap: 4 }}>
          {[['#features','Features'],['#how-it-works','How It Works'],['#testimonials','Testimonials'],['#faq','FAQ']].map(([href, label]) => (
            <a key={href} href={href} onClick={closeMenu} className="hero-seq rl-drawer-link">{label}</a>
          ))}
          <div className="hero-seq" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.26s' }}>
            <button onClick={() => { closeMenu(); ctaAction() }} style={{ width: '100%', padding: 15, borderRadius: 9999, background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer' }}>Get Started Free</button>
            <button onClick={() => { closeMenu(); ctaAction() }} style={{ width: '100%', padding: 14, borderRadius: 9999, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, cursor: 'pointer', background: 'none' }}>Log in</button>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section id="top" style={{ position: 'relative', overflow: 'hidden', background: 'var(--hero-bg)', padding: '140px 0 96px', transition: 'background 300ms var(--ease)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--hero-glow)', pointerEvents: 'none' }} />
        <div className="rl-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="">
            {/* copy */}
            <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
              <div className="rl-hero-badge-row hero-seq" style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28, animationDelay: '0.05s', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-subtle)', color: 'var(--accent-hover)', border: '1px solid var(--accent-muted)', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-display)', padding: '6px 16px 6px 12px', borderRadius: 9999, letterSpacing: '0.02em' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2.2s var(--ease) infinite' }} />
                  Built for Universities
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.22)', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-display)', padding: '6px 14px', borderRadius: 9999, letterSpacing: '0.02em' }}>
                  Open Source · MIT
                </span>
              </div>
              <h1 className="hero-seq" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(44px,6vw,80px)', lineHeight: 1.04, letterSpacing: '-0.035em', margin: '0 0 24px', color: 'var(--text-primary)', textWrap: 'balance', animationDelay: '0.17s' }}>
                Your campus,<br />
                <span style={{ background: 'linear-gradient(100deg, #0EA5E9 20%, #38BDF8 60%, #7DD3FC)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>mapped beautifully.</span>
              </h1>
              <p className="hero-seq" style={{ fontSize: 'clamp(16px,2vw,18.5px)', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 36px', textWrap: 'pretty', animationDelay: '0.29s' }}>
                Give every student an interactive 3D map of your campus — buildings, rooms, and timetables in one shareable link. No app, no login, no friction.
              </p>
              <div className="rl-hero-ctas hero-seq" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28, animationDelay: '0.41s' }}>
                <button onClick={ctaAction} className="rl-btn-primary-pill">Get started free</button>
                <button onClick={demoAction} className="rl-btn-outline-pill">
                  See live demo <ArrowIcon size={16} />
                </button>
              </div>
              <div className="rl-hero-trust hero-seq" style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-tertiary)', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.53s' }}>
                {['No credit card', '5 minute setup', 'MIT licensed · self-host free'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--success)', display: 'flex' }}><CheckIcon /></span>{t}
                  </span>
                ))}
              </div>
            </div>

            {/* visual */}
            <div className="hero-seq" style={{ position: 'relative', animationDelay: '0.35s', margin: '64px auto 0' }} ref={parallaxRef}>
              <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
                {/* browser frame */}
                <div style={{ borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 40px 80px -24px rgba(13,27,42,0.28), 0 16px 40px -16px rgba(13,27,42,0.16)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--border-light)', background: 'var(--surface)' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FC5F57' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDBC2E' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                    <span className="rl-hide-mobile" style={{ marginLeft: 12, flex: 1, maxWidth: 320, background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 6, fontSize: 11, color: 'var(--text-tertiary)', padding: '4px 10px', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      your-domain.com/map?uni=your-university
                    </span>
                  </div>
                  <img className="img-light" src="/product-light.png" alt="Kampus 3D campus map" style={{ width: '100%', height: 'auto' }} />
                  <img className="img-dark"  src="/product-dark.png"  alt="Kampus 3D campus map" style={{ width: '100%', height: 'auto' }} />
                </div>
                {/* floating phone */}
                <div style={{ position: 'absolute', bottom: '-8%', left: '-6%', width: '24%', minWidth: 96, borderRadius: 18, padding: 5, background: 'linear-gradient(150deg, var(--frame-hi), var(--frame))', boxShadow: '0 32px 64px -16px rgba(13,27,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
                  <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)', width: 34, height: 10, borderRadius: 12, background: '#000', zIndex: 2 }} />
                    <img className="img-light" src="/mobile-light.jpg" alt="Kampus mobile view" style={{ width: '100%', height: 'auto' }} />
                    <img className="img-dark"  src="/mobile-dark.jpg"  alt="Kampus mobile view" style={{ width: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS STRIP ═══ */}
      <section style={{ background: 'var(--navy)', position: 'relative', overflow: 'hidden' }} ref={statsRef}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 120% at 50% -20%, rgba(14,165,233,0.10), transparent 60%)', pointerEvents: 'none' }} />
        <div className="rl-container" style={{ position: 'relative' }}>
          <div className="rl-stats-grid" style={{ padding: 'clamp(44px,6vw,64px) 0' }}>
            {stats.map((st, i) => (
              <div key={i} className="rl-stat-cell" style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4vw,48px)', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{st.display}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY KAMPUS ═══ */}
      <section className="rl-section-pad" style={{ padding: 'clamp(88px,10vw,128px) 0', background: 'var(--bg)', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div className="rl-grid-2">
            <div data-reveal>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 16 }}>Why Kampus</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px', color: 'var(--text-primary)', textWrap: 'balance' }}>The campus experience students deserve</h2>
            </div>
            <div data-reveal style={{ transitionDelay: '120ms' }}>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)', margin: '0 0 20px', textWrap: 'pretty' }}>Every semester, thousands of students waste hours lost on unfamiliar campuses. Paper maps are outdated, Google Maps doesn't know your buildings, and native apps are expensive — nobody downloads them.</p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0, textWrap: 'pretty' }}>Kampus gives your university a beautiful, interactive 3D map that works instantly in any browser. One link that transforms how students navigate your campus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SHOWCASE ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--navy)', padding: 'clamp(88px,10vw,128px) 0' }}>
        <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 560, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(14,165,233,0.10) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div className="rl-container" style={{ position: 'relative', zIndex: 1 }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,56px)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#38BDF8', marginBottom: 16 }}>Product</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 18px', color: '#fff', textWrap: 'balance' }}>Everything your campus needs</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', textWrap: 'pretty' }}>From 3D maps to room timetables — one platform, managed from one dashboard.</p>
          </div>
          <div data-reveal style={{ maxWidth: 820, margin: '0 auto', transitionDelay: '100ms' }} ref={showcaseRef}>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 60px 120px -30px rgba(0,0,0,0.7), 0 0 80px -20px rgba(14,165,233,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'var(--navy-surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['rgba(255,255,255,0.16)','rgba(255,255,255,0.16)','rgba(255,255,255,0.16)'].map((bg, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: bg }} />
                ))}
              </div>
              <img className="img-light" src="/product-light.png" alt="Kampus 3D map product" style={{ width: '100%', height: 'auto' }} />
              <img className="img-dark"  src="/product-dark.png"  alt="Kampus 3D map product" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>
          <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 'clamp(36px,5vw,48px)', transitionDelay: '200ms' }}>
            {PILLS.map(pill => (
              <span key={pill} className="rl-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="rl-section-pad" style={{ padding: 'clamp(88px,10vw,128px) 0', background: 'var(--alt-bg)', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(44px,6vw,64px)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 16 }}>Features</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 18px', color: 'var(--text-primary)', textWrap: 'balance' }}>The complete campus platform</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', textWrap: 'pretty' }}>Everything students need to navigate campus, built into one link.</p>
          </div>
          <div className="rl-grid-3">
            {FEATURES_DEF.map((f, i) => {
              const IconComp = featureIcons[f.key]
              const delay = (i % 3) * 90
              const borderHover = f.color + '66'
              return (
                <div
                  key={f.key}
                  data-reveal
                  className="rl-feature-card"
                  style={{ padding: '32px 28px', borderRadius: 16, border: '1px solid var(--border-light)', background: 'var(--surface)', boxShadow: 'var(--card-shadow)', transition: 'all 250ms var(--ease)', position: 'relative', overflow: 'hidden', transitionDelay: `${delay}ms` }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = borderHover }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '' }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 12, marginBottom: 20, background: f.color + '1F', color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text-primary)', margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, textWrap: 'pretty' }}>{f.desc}</p>
                </div>
              )
            })}

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="rl-section-pad" style={{ padding: 'clamp(88px,10vw,128px) 0', background: 'var(--bg)', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(48px,7vw,80px)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 18px', color: 'var(--text-primary)' }}>Live in three steps</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>From sign-up to a live campus map in an afternoon.</p>
          </div>
          <div className="rl-grid-3" style={{ gap: 'clamp(36px,5vw,56px)', position: 'relative' }}>
            <div className="rl-hide-mobile" style={{ position: 'absolute', top: 36, left: '18%', right: '18%', height: 1, background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)' }} />
            {STEPS.map((step, i) => (
              <div key={i} data-reveal style={{ textAlign: 'center', position: 'relative', zIndex: 1, transitionDelay: `${step.delay}ms` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(52px,6vw,72px)', lineHeight: 1, letterSpacing: '-0.04em', WebkitTextFillColor: 'transparent', WebkitTextStroke: '1.5px var(--accent)', opacity: 0.45, marginBottom: 20 }}>{step.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--text-primary)', margin: '0 0 10px' }}>{step.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 280, margin: '0 auto', textWrap: 'pretty' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="rl-section-pad" style={{ padding: 'clamp(88px,10vw,128px) 0', background: 'var(--alt-bg)', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,56px)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, color: 'var(--text-primary)' }}>Loved by campus teams</h2>
          </div>
          <div className="rl-grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} data-reveal className="rl-testimonial-card" style={{ padding: '34px 30px', borderRadius: 16, border: '1px solid var(--border-light)', background: 'var(--surface)', boxShadow: 'var(--card-shadow)', transition: 'all 250ms var(--ease)', display: 'flex', flexDirection: 'column', transitionDelay: `${t.delay}ms` }}>
                <div style={{ fontSize: 44, lineHeight: 0.6, color: 'var(--accent)', opacity: 0.28, fontFamily: 'Georgia, serif', marginBottom: 20 }}>"</div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 28px', flex: 1, textWrap: 'pretty' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--accent)', flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="rl-section-pad" style={{ padding: 'clamp(88px,10vw,128px) 0', background: 'var(--bg)', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div className="rl-faq-grid">
            <div className="rl-faq-sticky" data-reveal>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 16 }}>FAQ</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 18px', color: 'var(--text-primary)' }}>Questions?<br />Answers.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 340, margin: 0, textWrap: 'pretty' }}>Everything you need to know about Kampus 3D. Can't find it here? <a href="#faq" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>Reach out to us</a>.</p>
            </div>
            <div data-reveal style={{ transitionDelay: '100ms' }}>
              {FAQS.map((faq, i) => {
                const open = faqOpen === i
                return (
                  <div key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <button onClick={() => setFaqOpen(open ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', textAlign: 'left', gap: 16, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <span style={{ fontSize: 16.5, fontWeight: 600, fontFamily: 'var(--font-display)', lineHeight: 1.4, color: open ? 'var(--accent)' : 'var(--text-primary)', transition: 'color 200ms var(--ease)' }}>{faq.q}</span>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: open ? 'var(--accent)' : 'var(--accent-subtle)', color: open ? '#fff' : 'var(--accent)', transform: open ? 'rotate(45deg)' : 'none', transition: 'all 300ms var(--spring)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </span>
                    </button>
                    <div style={{ overflow: 'hidden', maxHeight: open ? 260 : 0, opacity: open ? 1 : 0, transition: 'max-height 320ms var(--spring), opacity 320ms var(--ease)' }}>
                      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, padding: '0 40px 24px 0', margin: 0, textWrap: 'pretty' }}>{faq.a}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OPEN SOURCE ═══ */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(88px,10vw,128px) 0', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div data-reveal style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.22)', padding: '6px 16px', borderRadius: 9999, fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 24, letterSpacing: '0.04em' }}>
              MIT Licensed
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px,4.5vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 18px', color: 'var(--text-primary)', textWrap: 'balance' }}>100% open source</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 36px', textWrap: 'pretty' }}>Fork it, self-host it, contribute to it. No vendor lock-in, no hidden fees, no conditions. Deploy your own instance in minutes on Vercel — for free.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
              <a href="https://github.com/BTAG16/3D-University" target="_blank" rel="noopener noreferrer" className="rl-btn-primary-pill" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                View on GitHub
              </a>
              <a href="https://vercel.com/new/clone?repository-url=https://github.com/BTAG16/3D-University" target="_blank" rel="noopener noreferrer" className="rl-btn-outline-pill" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Deploy to Vercel <ArrowIcon size={15} />
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, textAlign: 'left' }}>
              {[
                { icon: '⚖️', title: 'MIT License',     desc: 'Use commercially, modify freely, no strings attached.' },
                { icon: '🔌', title: 'No vendor lock-in', desc: 'Your data, your infrastructure, your domain.' },
                { icon: '🤝', title: 'PRs welcome',      desc: 'Found a bug or have a feature idea? Open a pull request.' },
              ].map(item => (
                <div key={item.title} style={{ padding: '20px', borderRadius: 12, border: '1px solid var(--border-light)', background: 'var(--surface)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--navy)', padding: 'clamp(88px,10vw,136px) 0', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(14,165,233,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="rl-container" data-reveal style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(34px,5vw,56px)', letterSpacing: '-0.03em', lineHeight: 1.08, color: '#fff', maxWidth: 640, margin: '0 auto 20px', textWrap: 'balance' }}>Ready to put your campus on the map?</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.7 }}>Free setup, free hosting, free support. Your students deserve a better map.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={ctaAction} className="rl-btn-white-pill">Get started free</button>
            <button onClick={demoAction} className="rl-btn-ghost-pill">
              See live demo <ArrowIcon size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: 'var(--alt-bg)', padding: 'clamp(48px,7vw,72px) 0 28px', borderTop: '1px solid var(--border-light)', transition: 'background 300ms var(--ease)' }}>
        <div className="rl-container">
          <div className="rl-footer-grid" style={{ marginBottom: 'clamp(40px,6vw,56px)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ color: 'var(--accent)', display: 'flex' }}><LogoIcon size={20} /></span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>Kampus</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 260, margin: 0 }}>Interactive 3D campus maps for universities. Open source and free.</p>
            </div>
            {[
              { title: 'Product',  links: [['#features','Features'],['#how-it-works','How It Works'],['/demo','Live Demo']] },
              { title: 'Company', links: [['#top','About'],['#top','Blog'],['#top','Contact']] },
              { title: 'Legal',   links: [['/privacy','Privacy Policy'],['/terms','Terms of Service'],['#top','Cookies']] },
            ].map(col => (
              <div key={col.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: 6 }}>{col.title}</div>
                {col.links.map(([href, label]) => (
                  <a key={label} href={href} className="rl-footer-link"
                    onClick={href.startsWith('/') ? (e) => { e.preventDefault(); navigate(href) } : undefined}
                  >{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>© 2026 Kampus 3D. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <a href="/privacy" onClick={e => { e.preventDefault(); navigate('/privacy') }} className="rl-footer-link" style={{ fontSize: 13 }}>Privacy</a>
              <a href="/terms" onClick={e => { e.preventDefault(); navigate('/terms') }} className="rl-footer-link" style={{ fontSize: 13 }}>Terms</a>
              <button onClick={() => navigate('/super-admin')} style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontFamily: 'var(--font-body)', padding: 0 }}>Super Admin</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
