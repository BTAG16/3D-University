import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { dbService } from './lib/dbService'
import { supabase } from './lib/supabase'
import { useToast } from './components/Toast'
import { useDarkMode, useIsMobile } from './hooks'
import { Icon } from './icons'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const NAV = [
  { id: 'overview',     label: 'Overview',     icon: 'layers'   },
  { id: 'universities', label: 'Universities',  icon: 'building' },
  { id: 'analytics',    label: 'Analytics',     icon: 'zap'      },
  { id: 'map',          label: 'Global Map',    icon: 'globe'    },
]

// ── Global Map ──────────────────────────────────────────────────────────────
function GlobalMap({ universities, dark }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

    const unisWithCoords = universities.filter(u => u.markerLat && u.markerLng)

    // Auto-center: if we have universities, center on them; else world view
    let center = [0, 20]
    let zoom = 1.5
    if (unisWithCoords.length === 1) {
      center = [unisWithCoords[0].markerLng, unisWithCoords[0].markerLat]
      zoom = 13
    } else if (unisWithCoords.length > 1) {
      const avgLng = unisWithCoords.reduce((s, u) => s + u.markerLng, 0) / unisWithCoords.length
      const avgLat = unisWithCoords.reduce((s, u) => s + u.markerLat, 0) / unisWithCoords.length
      center = [avgLng, avgLat]
      zoom = 4
    }

    const map = new mapboxgl.Map({
      container: el,
      style: dark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
    })
    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      unisWithCoords.forEach((uni, idx) => {
        const colors = ['#0EA5E9', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#60a5fa']
        const color = colors[idx % colors.length]

        const markerEl = document.createElement('div')
        markerEl.style.cssText = [
          'width:38px', 'height:38px', 'border-radius:50%',
          `background:${color}`, 'border:3px solid #fff',
          'display:flex', 'align-items:center', 'justify-content:center',
          'cursor:pointer', `box-shadow:0 2px 12px ${color}55`,
          'font-size:14px', 'color:#fff', 'font-weight:700',
          'font-family:system-ui,sans-serif',
          'transition:transform 150ms ease',
        ].join(';')
        markerEl.title = uni.name
        markerEl.innerHTML = (uni.name || 'U').charAt(0).toUpperCase()
        markerEl.onmouseenter = () => { markerEl.style.transform = 'scale(1.15)' }
        markerEl.onmouseleave = () => { markerEl.style.transform = 'scale(1)' }

        const buildingCount = uni.buildingCount || 0
        const roomCount = uni.buildings?.reduce((s, b) => s + (b.rooms?.[0]?.count || 0), 0) || 0

        const popup = new mapboxgl.Popup({ offset: 24, closeButton: false, maxWidth: '220px' })
          .setHTML(`
            <div style="font-family:system-ui,sans-serif;padding:4px 0">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#111">${uni.name}</div>
              <div style="color:#666;font-size:12px;margin-bottom:8px">${uni.city || ''}</div>
              <div style="display:flex;gap:12px;font-size:12px">
                <span style="color:#0EA5E9;font-weight:600">${buildingCount} buildings</span>
                <span style="color:#888">${roomCount} rooms</span>
              </div>
              <div style="color:#999;font-size:11px;margin-top:6px">
                Joined ${new Date(uni.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          `)

        new mapboxgl.Marker({ element: markerEl })
          .setLngLat([uni.markerLng, uni.markerLat])
          .setPopup(popup)
          .addTo(map)
      })

      // If multiple, fit bounds
      if (unisWithCoords.length > 1) {
        const bounds = unisWithCoords.reduce(
          (b, u) => b.extend([u.markerLng, u.markerLat]),
          new mapboxgl.LngLatBounds(
            [unisWithCoords[0].markerLng, unisWithCoords[0].markerLat],
            [unisWithCoords[0].markerLng, unisWithCoords[0].markerLat]
          )
        )
        map.fitBounds(bounds, { padding: 80, maxZoom: 13 })
      }
    })

    return () => { map.remove(); mapRef.current = null }
  }, []) // mount only — parent passes key={dark} to remount on theme change

  const noCoords = universities.filter(u => u.markerLat && u.markerLng).length === 0

  if (noCoords) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-tertiary)' }}>
        <Icon name="globe" size={40} color="var(--text-tertiary)" />
        <p style={{ fontSize: 14, margin: 0 }}>No campus coordinates found.</p>
        <p style={{ fontSize: 12, margin: 0, color: 'var(--text-tertiary)' }}>Admins need to add buildings with coordinates in their dashboard.</p>
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

// ── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, color = 'var(--accent)', labelKey = 'label', valueKey = 'value' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
      {data.map((d, i) => {
        const h = Math.max(6, Math.round((d[valueKey] / max) * 68))
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${d[labelKey]}: ${d[valueKey]}`}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{d[valueKey] > 0 ? d[valueKey] : ''}</div>
            <div style={{ width: '100%', height: h, borderRadius: 4, background: color, opacity: d[valueKey] === 0 ? 0.15 : 1 }} />
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', textAlign: 'center' }}>{d[labelKey]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const toast = useToast()
  const navigate = useNavigate()
  const [dark, toggleDark] = useDarkMode()
  const isMobile = useIsMobile()

  const [universities, setUniversities] = useState([])
  const [stats, setStats] = useState({ totalUniversities: 0, totalBuildings: 0, totalAdmins: 0, totalRooms: 0, totalEvents: 0 })
  const [analytics, setAnalytics] = useState({
    avgBuildingsPerUniversity: 0,
    avgRoomsPerBuilding: 0,
    mostActiveUniversities: [],
    monthlyGrowth: [],
    cityBreakdown: [],
    categoryDistribution: [],
  })
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(600)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  const { adminSession, logout, extendSuperAdminSession } = useAdminAuth()

  useEffect(() => {
    if (!adminSession) { navigate('/admin'); return }
    if (!adminSession.user.isSuperAdmin) { navigate('/admin/dashboard'); return }
    loadData()
  }, [adminSession, navigate])

  useEffect(() => {
    if (!adminSession?.user?.isSuperAdmin) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { handleLogout(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [adminSession])

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleExtendSession = () => {
    const r = extendSuperAdminSession()
    if (r.success) { setTimeRemaining(600); toast.success('Session extended by 10 minutes') }
    else toast.error('Failed to extend session')
  }

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch universities WITH building coordinates (admin buildings prioritised)
      const [{ data: uniData, error: uniErr }, statsRes] = await Promise.all([
        supabase
          .from('universities')
          .select('*, buildings(id, name, coordinates, is_admin_building, category, rooms(count))')
          .order('created_at', { ascending: false }),
        dbService.getStats(),
      ])

      if (uniErr) { console.error('Universities fetch error:', uniErr); setLoading(false); return }

      const list = (uniData || []).map(uni => {
        const buildings = uni.buildings || []
        // Prefer admin building, else first building with coordinates
        const marker = buildings.find(b => b.is_admin_building && b.coordinates) || buildings.find(b => b.coordinates)
        return {
          ...uni,
          buildingCount: buildings.length,
          markerLng: marker?.coordinates?.[0] ?? null,
          markerLat: marker?.coordinates?.[1] ?? null,
        }
      })

      setUniversities(list)

      if (statsRes.success) {
        setStats({
          totalUniversities: statsRes.data.totalUniversities,
          totalBuildings: statsRes.data.totalBuildings,
          totalAdmins: statsRes.data.totalAdmins,
          totalRooms: statsRes.data.totalRooms,
          totalEvents: statsRes.data.totalEvents,
        })
        computeAnalytics(list, statsRes.data)
      }
    } catch (err) {
      console.error('loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  const computeAnalytics = (unis, s) => {
    const avgBuildings = unis.length > 0 ? (s.totalBuildings / unis.length).toFixed(1) : 0
    const avgRooms = s.totalBuildings > 0 ? (s.totalRooms / s.totalBuildings).toFixed(1) : 0

    // Most active (by building count)
    const mostActive = [...unis]
      .sort((a, b) => b.buildingCount - a.buildingCount)
      .slice(0, 6)
      .map(u => ({ name: u.name, buildingCount: u.buildingCount, city: u.city }))

    // Monthly growth — last 6 months
    const now = new Date()
    const monthlyGrowth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const label = d.toLocaleDateString('en', { month: 'short' })
      const count = unis.filter(u => {
        const c = new Date(u.created_at)
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
      }).length
      return { label, value: count }
    })

    // City breakdown
    const cityMap = {}
    unis.forEach(u => { const c = u.city || 'Unknown'; cityMap[c] = (cityMap[c] || 0) + 1 })
    const cityBreakdown = Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([city, count]) => ({ label: city, value: count }))

    // Building category distribution across all buildings
    const catMap = {}
    unis.forEach(u => (u.buildings || []).forEach(b => {
      if (b.category) catMap[b.category] = (catMap[b.category] || 0) + 1
    }))
    const categoryDistribution = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }))

    setAnalytics({ avgBuildingsPerUniversity: avgBuildings, avgRoomsPerBuilding: avgRooms, mostActive, monthlyGrowth, cityBreakdown, categoryDistribution })
  }

  const handleLogout = async () => { await logout(); navigate('/admin') }

  const isTimerCritical = timeRemaining <= 120

  // ── Tokens ──
  const bg      = 'var(--bg)'
  const surface = 'var(--surface)'
  const border  = 'var(--border)'
  const textPri = 'var(--text-primary)'
  const textSec = 'var(--text-secondary)'
  const textTer = 'var(--text-tertiary)'
  const accent  = 'var(--accent)'
  const navy    = 'var(--navy)'

  if (loading) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${border}`, borderTopColor: accent, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ color: textSec, fontSize: 14, margin: 0 }}>Loading dashboard…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <>
      {isMobile && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }} />
      )}
      <aside style={{
        position: isMobile ? 'fixed' : 'relative', top: 0, left: 0, bottom: 0, zIndex: 50,
        width: 232, flexShrink: 0, background: navy,
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="compass" size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>Kampus</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Super Admin</div>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 11px', borderRadius: 8, marginBottom: 2,
                background: activeTab === item.id ? 'rgba(14,165,233,0.18)' : 'transparent',
                border: `1px solid ${activeTab === item.id ? 'rgba(14,165,233,0.3)' : 'transparent'}`,
                color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: 13.5, fontFamily: 'var(--font-display)', fontWeight: 500,
                cursor: 'pointer', textAlign: 'left', transition: 'all 120ms ease',
              }}
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon name={item.icon} size={14} color={activeTab === item.id ? accent : 'rgba(255,255,255,0.4)'} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Session timer */}
        <div style={{ padding: '10px 10px 0' }}>
          <div style={{
            padding: '10px 11px', borderRadius: 8, marginBottom: 8,
            background: isTimerCritical ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isTimerCritical ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Session</span>
              <span style={{ fontSize: 14, fontFamily: "'SF Mono',ui-monospace,monospace", fontWeight: 700, color: isTimerCritical ? '#EF4444' : '#fff', letterSpacing: '0.06em' }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <button onClick={handleExtendSession} style={{
            width: '100%', padding: '8px', borderRadius: 7, marginBottom: 6,
            background: 'rgba(14,165,233,0.14)', border: '1px solid rgba(14,165,233,0.28)',
            color: accent, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <Icon name="play" size={11} color={accent} /> Extend +10 min
          </button>
        </div>

        {/* Dark mode + logout */}
        <div style={{ padding: '0 8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={toggleDark} style={{
            width: '100%', padding: '9px 11px', borderRadius: 8,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name={dark ? 'sun' : 'moon'} size={14} color="rgba(255,255,255,0.45)" />
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '9px 11px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="logOut" size={14} color="#EF4444" /> Sign out
          </button>
        </div>
      </aside>
    </>
  )

  return (
    <div style={{ height: '100dvh', display: 'flex', overflow: 'hidden', background: bg, color: textPri, fontFamily: 'var(--font-body)' }}>

      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && <Sidebar />}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ flexShrink: 0, height: 54, background: surface, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, zIndex: 10 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 7, minWidth: 34, minHeight: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Icon name="menu" size={15} color={textSec} />
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: textPri }}>{NAV.find(n => n.id === activeTab)?.label}</div>
            {!isMobile && <div style={{ fontSize: 11, color: textTer, marginTop: 1 }}>{adminSession?.user?.email}</div>}
          </div>
          <button onClick={loadData} title="Refresh" style={{ minWidth: 32, minHeight: 32, borderRadius: 7, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="navigation" size={13} color={textSec} />
          </button>
          <button
            onClick={() => window.location.href = `mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'admin@your-domain.com'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', height: 32, borderRadius: 7, border: `1px solid ${border}`, background: 'transparent', color: textSec, fontSize: 12.5, cursor: 'pointer', flexShrink: 0 }}
          >
            <Icon name="mail" size={13} color={textSec} />
            {!isMobile && 'Contact'}
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,2.5vw,24px)' }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={{ maxWidth: 860 }}>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Universities', value: stats.totalUniversities, icon: 'globe',    color: '#0EA5E9' },
                  { label: 'Buildings',    value: stats.totalBuildings,    icon: 'building', color: '#a78bfa' },
                  { label: 'Rooms',        value: stats.totalRooms,        icon: 'door',     color: '#34d399' },
                  { label: 'Live Events',  value: stats.totalEvents,       icon: 'calendar', color: '#f472b6' },
                  { label: 'Admin Accounts', value: stats.totalAdmins,    icon: 'userPlus', color: '#fb923c' },
                ].map(s => (
                  <div key={s.label} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={s.icon} size={14} color={s.color} />
                      </div>
                      <span style={{ fontSize: 12, color: textTer }}>{s.label}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: textPri, lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Mini analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 20 }}>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, color: textTer, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Avg buildings / campus</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: accent }}>{analytics.avgBuildingsPerUniversity}</div>
                </div>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, color: textTer, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Avg rooms / building</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#a78bfa' }}>{analytics.avgRoomsPerBuilding}</div>
                </div>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, color: textTer, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>On map</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#34d399' }}>
                    {universities.filter(u => u.markerLat && u.markerLng).length}
                    <span style={{ fontSize: 13, fontWeight: 400, color: textTer }}> / {universities.length}</span>
                  </div>
                </div>
              </div>

              {/* Recent universities */}
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="calendar" size={14} color={textTer} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: textPri }}>Recently Joined</span>
                </div>
                {universities.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: textTer, fontSize: 14 }}>No universities yet</div>
                ) : universities.slice(0, 5).map(uni => (
                  <div key={uni.id} style={{ padding: '11px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: accent }}>
                      {(uni.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uni.name}</div>
                      <div style={{ fontSize: 11.5, color: textTer }}>{uni.city} · {uni.buildingCount} buildings</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11.5, color: textTer }}>{new Date(uni.created_at).toLocaleDateString()}</span>
                      <button onClick={() => setSelectedUniversity(uni)} style={{ width: 28, height: 28, borderRadius: 6, background: `${accent}14`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="search" size={12} color={accent} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── UNIVERSITIES ── */}
          {activeTab === 'universities' && (
            <div style={{ maxWidth: 860 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: textPri, marginBottom: 14 }}>
                All Universities <span style={{ fontSize: 13, fontWeight: 500, color: textTer }}>({universities.length})</span>
              </div>
              {universities.length === 0 ? (
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                  <Icon name="building" size={36} color={textTer} />
                  <p style={{ color: textSec, marginTop: 12, fontSize: 14 }}>No universities yet. Admins will appear here after registration.</p>
                </div>
              ) : universities.map(uni => (
                <div key={uni.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '13px 15px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: accent }}>
                    {(uni.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uni.name}</div>
                    <div style={{ fontSize: 11.5, color: textTer, marginTop: 2 }}>
                      {uni.city}
                      {uni.buildingCount > 0 && ` · ${uni.buildingCount} buildings`}
                      {` · joined ${new Date(uni.created_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  {uni.markerLat && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,211,153,0.12)', color: '#34d399', fontWeight: 600, flexShrink: 0 }}>on map</span>
                  )}
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button onClick={() => setSelectedUniversity(uni)} title="Details" style={{ width: 32, height: 32, borderRadius: 7, background: `${accent}14`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="search" size={13} color={accent} />
                    </button>
                    <button onClick={() => window.open(`/map?uni=${uni.id}`, '_blank')} title="Public map" style={{ width: 32, height: 32, borderRadius: 7, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="externalLink" size={13} color={textSec} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => {
                        if (window.confirm(`Permanently delete "${uni.name}"?\nThis will remove all buildings, rooms, and admin accounts.`)) {
                          dbService.deleteUniversity(uni.id).then(r => {
                            if (r.success) { toast.success('University deleted'); loadData() }
                            else toast.error(r.error)
                          })
                        }
                      }}
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon name="trash" size={13} color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div style={{ maxWidth: 860 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: textPri, marginBottom: 16 }}>Platform Analytics</div>

              {/* Monthly growth */}
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name="calendar" size={14} color={textTer} /> Registrations — last 6 months
                </div>
                <BarChart data={analytics.monthlyGrowth} color={accent} />
              </div>

              {/* 2-col: most active + city breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12, marginBottom: 12 }}>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textSec, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon name="building" size={14} color={textTer} /> Top universities by buildings
                  </div>
                  {analytics.mostActive.length === 0 ? (
                    <p style={{ color: textTer, fontSize: 13 }}>No data yet</p>
                  ) : analytics.mostActive.map((uni, i) => {
                    const maxB = analytics.mostActive[0]?.buildingCount || 1
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ width: 18, fontSize: 11, fontWeight: 700, color: textTer, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{uni.name}</div>
                          <div style={{ height: 5, borderRadius: 3, background: border, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: accent, borderRadius: 3, width: `${(uni.buildingCount / maxB) * 100}%` }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 11.5, color: textTer, flexShrink: 0, minWidth: 20, textAlign: 'right' }}>{uni.buildingCount}</span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textSec, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon name="mapPin" size={14} color={textTer} /> Universities by city
                  </div>
                  {analytics.cityBreakdown.length === 0 ? (
                    <p style={{ color: textTer, fontSize: 13 }}>No data yet</p>
                  ) : analytics.cityBreakdown.map((city, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                      <span style={{ color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{city.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 60, height: 4, borderRadius: 2, background: border, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#a78bfa', borderRadius: 2, width: `${(city.value / analytics.cityBreakdown[0].value) * 100}%` }} />
                        </div>
                        <span style={{ color: textTer, minWidth: 16, textAlign: 'right' }}>{city.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Building categories */}
              {analytics.categoryDistribution.length > 0 && (
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textSec, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon name="layers" size={14} color={textTer} /> Building categories across all campuses
                  </div>
                  <BarChart data={analytics.categoryDistribution} color="#34d399" />
                </div>
              )}

              {/* Platform health */}
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textSec, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name="shield" size={14} color={textTer} /> Platform health
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                  {[
                    { label: 'Avg buildings / campus', value: analytics.avgBuildingsPerUniversity, good: parseFloat(analytics.avgBuildingsPerUniversity) > 3 },
                    { label: 'Avg rooms / building',   value: analytics.avgRoomsPerBuilding,        good: parseFloat(analytics.avgRoomsPerBuilding) > 5  },
                    { label: 'Campuses with map pins', value: `${universities.filter(u => u.markerLat).length} / ${universities.length}`, good: universities.length === 0 || universities.every(u => u.markerLat) },
                    { label: 'Published events',       value: stats.totalEvents, good: true },
                    { label: 'Total data points',      value: stats.totalUniversities + stats.totalBuildings + stats.totalRooms + stats.totalEvents, good: true },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '12px', borderRadius: 9, background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${border}` }}>
                      <div style={{ fontSize: 11.5, color: textTer, marginBottom: 6 }}>{m.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: textPri, marginBottom: 4 }}>{m.value}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: m.good ? '#34d399' : '#fb923c', background: m.good ? 'rgba(52,211,153,0.12)' : 'rgba(251,146,60,0.12)', padding: '2px 7px', borderRadius: 99 }}>
                        {m.good ? 'Good' : 'Low'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── GLOBAL MAP ── */}
          {activeTab === 'map' && (
            <div style={{ height: 'calc(100dvh - 130px)', minHeight: 400, borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}` }}>
              <GlobalMap
                key={dark ? 'dark' : 'light'}
                universities={universities}
                dark={dark}
              />
            </div>
          )}

        </main>
      </div>

      {/* ── University detail modal ── */}
      {selectedUniversity && (
        <div onClick={() => setSelectedUniversity(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: surface, borderRadius: 16, padding: 24, maxWidth: 460, width: '100%', border: `1px solid ${border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: textPri, margin: '0 0 2px' }}>{selectedUniversity.name}</h2>
                <div style={{ fontSize: 12, color: textTer }}>{selectedUniversity.city}</div>
              </div>
              <button onClick={() => setSelectedUniversity(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textTer, padding: 4 }}>
                <Icon name="x" size={18} color={textTer} />
              </button>
            </div>
            {[
              ['University ID', selectedUniversity.id],
              ['Buildings', selectedUniversity.buildingCount],
              ['Rooms', selectedUniversity.buildings?.reduce((s, b) => s + (b.rooms?.[0]?.count || 0), 0) || 0],
              ['Joined', new Date(selectedUniversity.created_at).toLocaleString()],
              ['Map pin', selectedUniversity.markerLat ? `${selectedUniversity.markerLat.toFixed(4)}, ${selectedUniversity.markerLng.toFixed(4)}` : 'No buildings yet'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${border}`, fontSize: 13, gap: 12 }}>
                <span style={{ color: textSec, flexShrink: 0 }}>{label}</span>
                <span style={{ color: textPri, fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', fontSize: label === 'University ID' ? 11 : 13 }}>{String(val)}</span>
              </div>
            ))}

            {/* Categories from buildings */}
            {(() => {
              const cats = {}
              ;(selectedUniversity.buildings || []).forEach(b => { if (b.category) cats[b.category] = (cats[b.category] || 0) + 1 })
              const entries = Object.entries(cats)
              if (entries.length === 0) return null
              return (
                <div style={{ padding: '9px 0', borderBottom: `1px solid ${border}` }}>
                  <div style={{ fontSize: 12.5, color: textSec, marginBottom: 8 }}>Building categories</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {entries.map(([cat, cnt]) => (
                      <span key={cat} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 99, background: `${accent}14`, color: accent, fontWeight: 500 }}>{cat} ({cnt})</span>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => window.open(`/map?uni=${selectedUniversity.id}`, '_blank')}
                style={{ flex: 1, padding: '11px', borderRadius: 9, background: accent, color: '#fff', border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              >
                <Icon name="externalLink" size={14} color="#fff" /> View Map
              </button>
              {selectedUniversity.markerLat && (
                <button
                  onClick={() => { setActiveTab('map'); setSelectedUniversity(null) }}
                  style={{ padding: '11px 14px', borderRadius: 9, background: 'transparent', border: `1px solid ${border}`, color: textSec, fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <Icon name="globe" size={14} color={textSec} /> Show on map
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
