import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dbService } from './lib/dbService'
import { supabase } from './lib/supabase'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import Modal from './components/Modal'
import RoomsList from './components/RoomsList'
import IndoorNavModal from './components/IndoorNavModal'
import { CookieConsent } from './components/CookieConsent'
import { useToast } from './components/Toast'
import { Icon } from './icons'
import { useDarkMode } from './hooks'

const EVENT_CATS = {
  lecture:     { label: 'Lecture',     bg: 'rgba(14,165,233,0.15)',  color: '#0EA5E9' },
  social:      { label: 'Social',      bg: 'rgba(34,197,94,0.15)',   color: '#16A34A' },
  alert:       { label: 'Alert',       bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  maintenance: { label: 'Maintenance', bg: 'rgba(245,158,11,0.15)',  color: '#D97706' },
  'open-day':  { label: 'Open Day',    bg: 'rgba(168,85,247,0.15)', color: '#9333EA' },
}
const isActive  = (e) => { const now = new Date(); return new Date(e.starts_at) <= now && (!e.ends_at || new Date(e.ends_at) >= now) }
const isUpcoming = (e) => new Date(e.starts_at) > new Date()

const DARK = {
  bg:      '#0A0A0C',
  surface: '#111114',
  surface2:'#18181C',
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text:    'rgba(255,255,255,0.92)',
  textDim: 'rgba(255,255,255,0.5)',
  textMut: 'rgba(255,255,255,0.3)',
  accent:  '#0EA5E9',
}
const LIGHT = {
  bg:      '#EEF2F7',
  surface: '#FFFFFF',
  surface2:'#F1F5F9',
  border:  'rgba(0,0,0,0.08)',
  border2: 'rgba(0,0,0,0.14)',
  text:    '#0F172A',
  textDim: '#475569',
  textMut: '#94A3B8',
  accent:  '#0EA5E9',
}

function PublicMap() {
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [dark, toggleDark] = useDarkMode()
  const [university, setUniversity] = useState(null)
  const [error, setError] = useState(null)

  const savedSettings = university ? JSON.parse(localStorage.getItem(`universitySettings_${university.id}`) || '{}') : {}
  const dynamicAccent = savedSettings.accentColor || (dark ? DARK.accent : LIGHT.accent)
  
  const D = {
    ...(dark ? DARK : LIGHT),
    accent: dynamicAccent
  }
  const [loading, setLoading] = useState(true)
  const [buildings, setBuildings] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [sheetState, setSheetState] = useState('peek') // 'peek' | 'list' | 'card' | 'detail'
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBuildings, setFilteredBuildings] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showRoomsList, setShowRoomsList] = useState(false)
  const [officeRooms, setOfficeRooms] = useState([])
  const [showIndoorNav, setShowIndoorNav] = useState(false)
  const [indoorNavUrl, setIndoorNavUrl] = useState('')
  const [routeData, setRouteData] = useState(null)
  const [fpvTour, setFpvTour] = useState(null)
  const [events, setEvents] = useState([])
  const [showEventsDrawer, setShowEventsDrawer] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const activeBuildingIds = useMemo(
    () => new Set(events.filter(isActive).map(e => e.building_id).filter(Boolean)),
    [events]
  )
  const tourStartedRef = useRef(false)
  const mapRef = useRef(null)
  const sheetRef = useRef(null)
  const sheetStateRef = useRef(sheetState)
  const touchDrag = useRef({ active: false, startY: 0, startTx: 0, moved: false })

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Keep sheetStateRef in sync so touch handlers always see the current value
  useEffect(() => { sheetStateRef.current = sheetState }, [sheetState])

  // Non-passive touchmove listener — needed to call preventDefault and block page scroll while dragging
  useEffect(() => {
    const onMove = (e) => {
      if (!touchDrag.current.active) return
      e.preventDefault()
      const dy = e.touches[0].clientY - touchDrag.current.startY
      if (Math.abs(dy) > 5) touchDrag.current.moved = true
      const sheet = sheetRef.current
      if (!sheet) return
      const maxTx = sheet.offsetHeight - 68
      const newTx = Math.max(0, Math.min(maxTx, touchDrag.current.startTx + dy))
      sheet.style.transform = `translateY(${newTx}px)`
    }
    document.addEventListener('touchmove', onMove, { passive: false })
    return () => document.removeEventListener('touchmove', onMove)
  }, [])

  useEffect(() => {
    const load = async () => {
      const uniId = searchParams.get('uni')
      if (!uniId) {
        setError('University ID is required. Please use the link provided by your university.')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        let result = await dbService.getUniversity(uniId)
        if (!result.success) {
          const all = await dbService.getAllUniversities()
          if (all.success && all.data) {
            const found = all.data.find(u =>
              u.id === uniId || u.name.toLowerCase().replace(/\s+/g, '').includes(uniId.toLowerCase())
            )
            if (found) result = await dbService.getUniversity(found.id)
          }
        }
        if (!result.success || !result.data) {
          setError('University not found. The ID may have changed.')
          setLoading(false)
          return
        }
        setUniversity(result.data)
        const sorted = (result.data.buildings || []).sort((a, b) => {
          if (a.is_admin_building && !b.is_admin_building) return -1
          if (!a.is_admin_building && b.is_admin_building) return 1
          return 0
        })
        setBuildings(sorted)
        setFilteredBuildings(sorted)
        setLoading(false)
      } catch (err) {
        setError('Failed to load university data. Please try again.')
        setLoading(false)
      }
    }
    load()
  }, [searchParams])

  useEffect(() => {
    const search = async () => {
      if (!searchQuery) { setFilteredBuildings(buildings); return }
      if (!university) return
      try {
        const result = await dbService.searchBuildingsAndRooms(searchQuery, university.id)
        if (result.success) {
          const ids = new Set()
          const matched = []
          result.data.buildings?.forEach(b => { if (!ids.has(b.id)) { ids.add(b.id); matched.push(b) } })
          result.data.rooms?.forEach(r => {
            if (r.building_id && !ids.has(r.building_id)) {
              const b = buildings.find(x => x.id === r.building_id)
              if (b) { ids.add(b.id); matched.push(b) }
            }
          })
          setFilteredBuildings(matched)
        }
      } catch {
        setFilteredBuildings(buildings.filter(b =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      }
    }
    search()
  }, [searchQuery, buildings, university])

  // Load events + subscribe to realtime updates
  useEffect(() => {
    if (!university) return
    const uniId = university.id
    dbService.getEvents(uniId).then(r => { if (r.success) setEvents(r.data || []) })
    const channel = supabase
      .channel(`events:${uniId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `university_id=eq.${uniId}` }, payload => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.is_published) setEvents(prev => [...prev, payload.new].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)))
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => {
            const without = prev.filter(e => e.id !== payload.new.id)
            if (payload.new.is_published) return [...without, payload.new].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
            return without
          })
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(e => e.id !== payload.old.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [university])

  // Show welcome message on first visit
  useEffect(() => {
    if (!university) return
    const uniId = university.id
    const msg = university.welcome_message
    if (msg && !localStorage.getItem(`welcomed_${uniId}`)) {
      setTimeout(() => setShowWelcome(true), 1400)
    }
  }, [university])

  // Reset tour flag when directions panel closes
  useEffect(() => {
    if (!showDirections) tourStartedRef.current = false
  }, [showDirections])

  // Auto-start FPV tour once route data arrives
  useEffect(() => {
    if (showDirections && routeData?.steps?.length && !tourStartedRef.current) {
      tourStartedRef.current = true
      setFpvTour({ step: null, stepIndex: 0, totalSteps: routeData.steps.length, paused: false })
      mapRef.current?.startFpvTour(routeData, {
        onStep: (step, idx) => setFpvTour(t => t ? { ...t, step, stepIndex: idx } : t),
        onComplete: () => { setFpvTour(null); tourStartedRef.current = false; handleCloseDirections() },
      })
    }
  }, [showDirections, routeData])

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) { toast.error('Geolocation not supported.'); return }
    toast.info('Getting your location...')
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); toast.success('Location found!') },
      () => toast.error('Unable to get location. Enable location services.')
    )
  }

  const handleBuildingClick = async (building) => {
    setSelectedBuilding(building)
    setShowDirections(false)
    setRouteData(null)
    setShowRoomsList(false)
    if (mapRef.current?.clearDirections) mapRef.current.clearDirections()
    if (isMobile) setSheetState('card')
    try {
      const r = await dbService.getRooms(building.id)
      if (r.success) setOfficeRooms(r.data.filter(x => x.is_office))
    } catch { /* ignore */ }
  }

  const handleOpenIndoorNav = () => {
    setIndoorNavUrl(selectedBuilding?.mappedin_url || '')
    setShowIndoorNav(true)
  }

  const handleShowDirections = () => {
    if (!userLocation) { toast.warning('Enable your location first.'); handleGetLocation(); return }
    mapRef.current?.stopFpvTour()
    tourStartedRef.current = false
    setFpvTour(null)
    setShowDirections(true)
    toast.info('Calculating route…')
  }

  const handleOpenInGoogleMaps = () => {
    if (!selectedBuilding) return
    const [lng, lat] = selectedBuilding.coordinates
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${lat},${lng}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, '_blank')
  }

  const handleOpenTransit = () => {
    if (!selectedBuilding) return
    const [lng, lat] = selectedBuilding.coordinates
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${lat},${lng}&travelmode=transit`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, '_blank')
  }

  const handleCloseDirections = () => {
    mapRef.current?.stopFpvTour()
    tourStartedRef.current = false
    setFpvTour(null)
    setShowDirections(false)
    setRouteData(null)
    setSelectedBuilding(null)
    if (isMobile) setSheetState('peek')
    if (mapRef.current?.clearDirections) mapRef.current.clearDirections()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${university.name} Campus Map`, text: `Explore ${university.name}`, url: window.location.href })
    } else {
      setShowShareModal(true)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
    setShowShareModal(false)
  }

  const calcDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180
    const df = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(df/2)**2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2)**2
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return d < 1000 ? `${Math.round(d)}m` : `${(d/1000).toFixed(1)}km`
  }

  // ─── Loading / error states ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: D.bg, color: D.textDim, gap: 16 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${D.border2}`, borderTopColor: D.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Loading campus map…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: D.bg, color: D.text, gap: 12, padding: '0 24px', textAlign: 'center' }}>
      <Icon name="alertCircle" size={40} color="#ef4444" />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>Could not load this campus</h1>
      <p style={{ color: D.textDim, fontSize: 14, margin: 0 }}>{typeof error === 'string' ? error : 'Something went wrong.'}</p>
    </div>
  )

  const sidebarW = 300

  // ─── Building detail sidebar panel ─────────────────────────────────────
  const BuildingDetailPanel = () => (
    <>
      {/* Back button */}
      <button onClick={() => { setSelectedBuilding(null); setOfficeRooms([]); if (isMobile) setSheetState('list') }} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '13px 16px', width: '100%', textAlign: 'left',
        background: 'none', border: 'none', borderBottom: `1px solid ${D.border}`,
        cursor: 'pointer', fontSize: 13, color: D.accent, fontFamily: 'var(--font-display)', fontWeight: 500, flexShrink: 0,
      }}>
        ← All buildings
      </button>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {/* Header: icon + name + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${D.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="building" size={22} color={D.accent} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: '0 0 4px', color: D.text, lineHeight: 1.2 }}>{selectedBuilding.name}</h2>
            <span style={{ fontSize: 12, color: D.textDim, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', padding: '2px 8px', borderRadius: 9999, display: 'inline-block' }}>{selectedBuilding.category}</span>
          </div>
        </div>

        {/* Description */}
        {selectedBuilding.description && (
          <p style={{ fontSize: 13, color: D.textDim, lineHeight: 1.6, marginBottom: 14 }}>{selectedBuilding.description}</p>
        )}

        {/* Hours */}
        {selectedBuilding.hours && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: D.textDim }}>
            <Icon name="calendar" size={14} color={D.textMut} />
            {selectedBuilding.hours}
          </div>
        )}

        {/* Distance */}
        {userLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, color: D.accent }}>
            <Icon name="mapPin" size={14} color={D.accent} />
            {calcDist(userLocation.latitude, userLocation.longitude, selectedBuilding.coordinates[1], selectedBuilding.coordinates[0])} away
          </div>
        )}

        {/* Facilities */}
        {selectedBuilding.facilities?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {selectedBuilding.facilities.map((f, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: D.textDim, fontWeight: 500 }}>{f}</span>
            ))}
          </div>
        )}

        {/* Departments */}
        {selectedBuilding.departments?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {selectedBuilding.departments.map((d, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, background: `${D.accent}15`, color: D.accent, fontWeight: 500 }}>{d}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <button onClick={handleShowDirections} disabled={!userLocation} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font-display)', cursor: userLocation ? 'pointer' : 'not-allowed',
            background: userLocation ? D.accent : D.border2, color: '#fff', border: 'none',
            opacity: userLocation ? 1 : 0.6, transition: 'opacity 0.15s',
          }}>
            <Icon name="navigation" size={15} color="#fff" /> Get Directions
          </button>
          <button onClick={handleOpenIndoorNav} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', background: 'transparent', color: D.accent, border: `1px solid ${D.border}`,
          }}>
            <Icon name="layers" size={15} color={D.accent} /> Indoor Navigation
          </button>
          <button onClick={() => setShowRoomsList(true)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', background: 'transparent', color: D.text, border: `1px solid ${D.border}`,
          }}>
            <Icon name="door" size={15} color={D.textDim} /> View Rooms
          </button>
          <button onClick={handleOpenInGoogleMaps} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', background: 'transparent', color: D.textDim, border: `1px solid ${D.border}`,
          }}>
            <Icon name="mapPin" size={15} color={D.textDim} /> Open in Google Maps
          </button>
        </div>

        {/* Office rooms */}
        {(officeRooms.length > 0 || selectedBuilding.key_offices?.length > 0) && (() => {
          const rooms = officeRooms.length > 0 ? officeRooms : (selectedBuilding.key_offices || [])
          return rooms.length > 0 ? (
            <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: D.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="door" size={13} color={D.textMut} /> Key Offices ({rooms.length})
              </h4>
              {rooms.map((o, i) => (
                <div key={o.id || i} style={{ padding: '10px 0', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {(o.room_number || o.roomNumber) && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, minWidth: 44, flexShrink: 0 }}>{o.room_number || o.roomNumber}</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: D.text }}>{o.room_name || o.name}</div>
                    {o.purpose && <div style={{ fontSize: 12, color: D.textDim, marginTop: 2 }}>{o.purpose}</div>}
                    {o.hours && <div style={{ fontSize: 11, color: D.textMut, marginTop: 2 }}>{o.hours}</div>}
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 9999, background: `${D.accent}15`, color: D.accent, fontWeight: 700, flexShrink: 0 }}>Office</span>
                </div>
              ))}
            </div>
          ) : null
        })()}
        {/* Events for this building */}
        {(() => {
          const bEvts = events.filter(e => e.building_id === selectedBuilding.id)
          if (!bEvts.length) return null
          return (
            <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: 16, marginTop: 8 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: D.text, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="calendar" size={13} color={D.textMut} /> Events ({bEvts.length})
              </h4>
              {bEvts.map(e => {
                const cat = EVENT_CATS[e.category] || EVENT_CATS.social
                const active = isActive(e)
                return (
                  <div key={e.id} style={{ padding: '10px 0', borderBottom: `1px solid ${D.border}`, display: 'flex', gap: 10 }}>
                    <div style={{ width: 3, borderRadius: 3, flexShrink: 0, alignSelf: 'stretch', background: cat.color, minHeight: 16 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{e.title}</span>
                        {active && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 9999, background: 'rgba(34,197,94,0.15)', color: '#16A34A', fontWeight: 700 }}>Now</span>}
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 9999, background: cat.bg, color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                      </div>
                      <div style={{ fontSize: 11, color: D.textMut }}>
                        {new Date(e.starts_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        {e.ends_at ? ` – ${new Date(e.ends_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}` : ''}
                      </div>
                      {e.description && <p style={{ fontSize: 11.5, color: D.textDim, margin: '4px 0 0', lineHeight: 1.4 }}>{e.description}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </>
  )

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: D.bg, color: D.text, overflow: 'hidden', '--accent': D.accent, '--accent-subtle': `color-mix(in srgb, ${D.accent} 15%, transparent)` }}>

      {/* Header */}
      <header style={{
        flexShrink: 0, background: D.surface, borderBottom: `1px solid ${D.border}`,
        padding: '0 14px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, overflow: 'hidden', background: university.logo_url ? D.surface2 : D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: university.logo_url ? `1px solid ${D.border}` : 'none' }}>
            {university.logo_url
              ? <img src={university.logo_url} alt={university.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = D.accent }} />
              : <Icon name="compass" size={16} color="#fff" />
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{university.name}</div>
            {university.city && !isMobile && <div style={{ fontSize: 11, color: D.textMut, marginTop: 1 }}>{university.city}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={handleGetLocation} title="My Location" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: isMobile ? '0' : '7px 12px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', minWidth: isMobile ? 36 : 'auto', minHeight: isMobile ? 36 : 'auto' }}>
            <Icon name="navigation" size={14} color={D.textDim} />
            {!isMobile && 'My Location'}
          </button>
          <button onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', cursor: 'pointer', minWidth: 36, minHeight: 36 }}>
            <Icon name={dark ? 'sun' : 'moon'} size={14} color={D.textDim} />
          </button>
          {events.length > 0 && (() => {
            const activeCount = events.filter(isActive).length
            return (
              <button onClick={() => setShowEventsDrawer(v => !v)} title="Campus Events" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: isMobile ? '0' : '7px 12px', borderRadius: 8, border: `1px solid ${activeCount > 0 ? D.accent : D.border2}`, background: activeCount > 0 ? `${D.accent}15` : 'transparent', color: activeCount > 0 ? D.accent : D.textDim, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', minWidth: isMobile ? 36 : 'auto', minHeight: isMobile ? 36 : 'auto', position: 'relative', transition: 'all 200ms ease' }}>
                <Icon name="calendar" size={14} color={activeCount > 0 ? D.accent : D.textDim} />
                {!isMobile && 'Events'}
                {activeCount > 0 && <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: D.accent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${D.surface}` }}>{activeCount}</span>}
              </button>
            )
          })()}
          <button onClick={handleShare} title="Share" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: isMobile ? '0' : '7px 12px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', minWidth: isMobile ? 36 : 'auto', minHeight: isMobile ? 36 : 'auto' }}>
            <Icon name="share" size={14} color={D.textDim} />
            {!isMobile && 'Share'}
          </button>
        </div>
      </header>

      {/* Body: sidebar + map */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Sidebar — desktop only */}
        {!isMobile && (
          <aside style={{
            width: sidebarW,
            flexShrink: 0,
            background: D.surface,
            borderRight: `1px solid ${D.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {selectedBuilding && !showDirections ? (
              showRoomsList
                ? <RoomsList buildingId={selectedBuilding.id} buildingName={selectedBuilding.name} onClose={() => setShowRoomsList(false)} />
                : <BuildingDetailPanel />
            ) : (
              <>
                <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${D.border}` }}>
                  <SearchBox value={searchQuery} onChange={setSearchQuery} dark={dark} />
                </div>
                <div style={{ padding: '10px 12px 6px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Buildings ({filteredBuildings.length})
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                  {filteredBuildings.length === 0 ? (
                    <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 24 }}>No results found</p>
                  ) : filteredBuildings.map(b => (
                    <BuildingCard
                      key={b.id}
                      building={b}
                      distance={userLocation ? calcDist(userLocation.latitude, userLocation.longitude, b.coordinates[1], b.coordinates[0]) : null}
                      onClick={handleBuildingClick}
                      selected={selectedBuilding?.id === b.id}
                      dark={dark}
                    />
                  ))}
                </div>
              </>
            )}
          </aside>
        )}

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapComponent
            ref={mapRef}
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            userLocation={userLocation}
            onBuildingClick={handleBuildingClick}
            showDirections={showDirections}
            destinationCoords={selectedBuilding?.coordinates}
            darkMode={dark}
            onRouteDataChange={setRouteData}
            activeBuildingIds={activeBuildingIds}
          />

          {/* Events drawer */}
          {showEventsDrawer && (
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: isMobile ? '100%' : 320, background: D.surface, borderLeft: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', zIndex: 15, boxShadow: dark ? '-4px 0 24px rgba(0,0,0,0.5)' : '-4px 0 24px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: D.text }}>Campus Events</div>
                  <div style={{ fontSize: 12, color: D.textDim, marginTop: 2 }}>
                    {events.filter(isActive).length} active · {events.filter(isUpcoming).length} upcoming
                  </div>
                </div>
                <button onClick={() => setShowEventsDrawer(false)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: D.textDim }}>
                  <Icon name="x" size={16} color={D.textDim} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 16px', WebkitOverflowScrolling: 'touch' }}>
                {events.length === 0 ? (
                  <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 32 }}>No events scheduled</p>
                ) : (['active', 'upcoming', 'past']).map(section => {
                  const sEvts = events.filter(e =>
                    section === 'active' ? isActive(e) :
                    section === 'upcoming' ? isUpcoming(e) :
                    !isActive(e) && !isUpcoming(e)
                  )
                  if (!sEvts.length) return null
                  return (
                    <div key={section} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: D.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 0 6px' }}>
                        {section === 'active' ? 'Happening now' : section === 'upcoming' ? 'Coming up' : 'Ended'}
                      </div>
                      {sEvts.map(e => {
                        const cat = EVENT_CATS[e.category] || EVENT_CATS.social
                        const bld = buildings.find(b => b.id === e.building_id)
                        return (
                          <div key={e.id} onClick={() => { if (bld) { handleBuildingClick(bld); setShowEventsDrawer(false) } }} style={{ background: dark ? 'rgba(255,255,255,0.04)' : D.surface2, borderRadius: 10, padding: '11px 12px', marginBottom: 7, border: `1px solid ${D.border}`, cursor: bld ? 'pointer' : 'default', display: 'flex', gap: 10, transition: 'opacity 150ms ease' }}>
                            <div style={{ width: 3, borderRadius: 3, flexShrink: 0, alignSelf: 'stretch', background: cat.color, minHeight: 14 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{e.title}</span>
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 9999, background: cat.bg, color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                              </div>
                              {bld && <div style={{ fontSize: 11, color: D.textDim, marginBottom: 2 }}>{bld.name}</div>}
                              {e.description && <p style={{ fontSize: 11.5, color: D.textDim, margin: '0 0 3px', lineHeight: 1.4 }}>{e.description}</p>}
                              <div style={{ fontSize: 11, color: D.textMut }}>
                                {new Date(e.starts_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                                {e.ends_at ? ` – ${new Date(e.ends_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}` : ''}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* FPV Tour HUD */}
          {showDirections && selectedBuilding && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              background: dark ? 'rgba(17,17,20,0.92)' : 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(18px)',
              border: `1px solid ${D.border2}`, borderRadius: 14,
              padding: '14px 16px', maxWidth: 400, width: 'calc(100% - 32px)', zIndex: 10,
              boxShadow: `0 8px 32px rgba(0,0,0,${dark ? '0.5' : '0.12'})`,
            }}>
              {/* Instruction row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: fpvTour ? 10 : 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={routeData ? 'navigation' : 'loader'} size={16} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: D.text, lineHeight: 1.35, marginBottom: 2 }}>
                    {fpvTour?.step?.instruction ?? (routeData ? `En route to ${selectedBuilding.name}` : 'Calculating route…')}
                  </div>
                  {fpvTour && (
                    <div style={{ fontSize: 12, color: D.textDim }}>
                      Step {fpvTour.stepIndex + 1} / {fpvTour.totalSteps}
                      {fpvTour.step?.distance ? ` · ${fpvTour.step.distance}m` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Transit nudge */}
              {routeData?.duration > 12 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '7px 10px', marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: '#d97706' }}>Long walk (~{routeData.duration} min)</span>
                  <button onClick={handleOpenTransit} style={{ color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, padding: 0, whiteSpace: 'nowrap' }}>
                    Transit / taxi →
                  </button>
                </div>
              )}

              {/* Progress bar */}
              {fpvTour && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 3, background: D.border2, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: D.accent, borderRadius: 2,
                      width: `${((fpvTour.stepIndex + 1) / fpvTour.totalSteps) * 100}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: D.textMut, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Step {fpvTour.stepIndex + 1}/{fpvTour.totalSteps}</span>
                    <span>{routeData?.distance} km · ~{routeData?.duration} min</span>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div style={{ display: 'flex', gap: 6 }}>
                {fpvTour && (
                  <>
                    <button onClick={() => {
                      if (fpvTour.paused) { mapRef.current?.resumeFpvTour(); setFpvTour(t => ({ ...t, paused: false })) }
                      else { mapRef.current?.pauseFpvTour(); setFpvTour(t => ({ ...t, paused: true })) }
                    }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', color: D.text, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <Icon name={fpvTour.paused ? 'play' : 'pause'} size={12} color={D.text} />
                      {fpvTour.paused ? 'Resume' : 'Pause'}
                    </button>
                    <button onClick={() => mapRef.current?.skipFpvStep()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer' }}>
                      <Icon name="chevronRight" size={12} color={D.textDim} />
                      Skip
                    </button>
                  </>
                )}
                <button onClick={handleOpenInGoogleMaps} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer' }}>
                  <Icon name="mapPin" size={12} color={D.textDim} />
                  {!isMobile && 'Maps'}
                </button>
                <button onClick={handleCloseDirections} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
                  <Icon name="x" size={12} color="#ef4444" />
                  Exit
                </button>
              </div>
            </div>
          )}

          {/* ── Mobile bottom sheet ── */}
          {isMobile && !showDirections && (() => {
            const translateY = {
              peek:   'calc(85dvh - 68px)',
              list:   'calc(85dvh - 48dvh)',
              card:   'calc(85dvh - 224px)',
              detail: '0dvh',
            }[sheetState] ?? 'calc(85dvh - 68px)'

            const MobileQuickCard = () => (
              <div style={{ padding: '0 16px 20px', overflowY: 'auto', flex: 1 }}>
                {/* Building row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: `${D.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="building" size={20} color={D.accent} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedBuilding.name}</div>
                    <div style={{ fontSize: 12, color: D.textDim, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <span>{selectedBuilding.category}</span>
                      {routeData && <><span>·</span><span style={{ color: D.accent, fontWeight: 600 }}>~{routeData.duration} min walk</span></>}
                    </div>
                  </div>
                  <button onClick={() => setSheetState('detail')} style={{ background: 'none', border: `1px solid ${D.border2}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: D.textDim, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Details
                  </button>
                </div>

                {/* Long walk nudge */}
                {routeData?.duration > 12 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12 }}>
                    <span style={{ color: '#d97706' }}>Long walk (~{routeData.duration} min)</span>
                    <button onClick={handleOpenTransit} style={{ color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, padding: 0, whiteSpace: 'nowrap' }}>Transit / taxi →</button>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleShowDirections} disabled={!userLocation} style={{ flex: 1, padding: '12px', borderRadius: 10, background: userLocation ? D.accent : D.border2, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: userLocation ? 'pointer' : 'not-allowed', opacity: userLocation ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Icon name="navigation" size={15} color="#fff" />
                    {userLocation ? 'Navigate' : 'Enable Location'}
                  </button>
                  <button onClick={handleOpenInGoogleMaps} style={{ width: 46, height: 46, borderRadius: 10, background: 'transparent', border: `1px solid ${D.border2}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="mapPin" size={16} color={D.textDim} />
                  </button>
                </div>
              </div>
            )

            return (
              <div ref={sheetRef} style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '85dvh',
                background: D.surface,
                borderRadius: '18px 18px 0 0',
                border: `1px solid ${D.border2}`,
                borderBottom: 'none',
                transform: `translateY(${translateY})`,
                transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
                display: 'flex', flexDirection: 'column',
                zIndex: 10,
                overflow: 'hidden',
                boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
              }}>
                {/* Drag handle — draggable up/down, tap cycles state */}
                <div
                  onTouchStart={(e) => {
                    const sheet = sheetRef.current
                    if (!sheet) return
                    const h = sheet.offsetHeight
                    const state = sheetStateRef.current
                    const txMap = {
                      peek:   h - 68,
                      list:   h - Math.round(window.innerHeight * 0.48),
                      card:   h - 224,
                      detail: 0,
                    }
                    touchDrag.current = {
                      active: true,
                      startY: e.touches[0].clientY,
                      startTx: txMap[state] ?? (h - 68),
                      moved: false,
                    }
                    sheet.style.transition = 'none'
                  }}
                  onTouchEnd={(e) => {
                    if (!touchDrag.current.active) return
                    touchDrag.current.active = false
                    const sheet = sheetRef.current

                    if (!touchDrag.current.moved) {
                      // Tap: cycle state
                      if (sheet) { sheet.style.transition = ''; sheet.style.transform = '' }
                      const cur = sheetStateRef.current
                      if (cur === 'peek') setSheetState('list')
                      else if (cur === 'list') setSheetState('peek')
                      else if (cur === 'card') setSheetState('detail')
                      else setSheetState('card')
                      return
                    }

                    // Snap to nearest state
                    const finalDy = e.changedTouches[0].clientY - touchDrag.current.startY
                    const finalTx = touchDrag.current.startTx + finalDy
                    const h = sheet ? sheet.offsetHeight : window.innerHeight * 0.85
                    const cur = sheetStateRef.current
                    const candidates = [
                      { state: 'peek', tx: h - 68 },
                      { state: 'list', tx: h - Math.round(window.innerHeight * 0.48) },
                    ]
                    if (cur === 'card' || cur === 'detail') {
                      candidates.push({ state: 'card', tx: h - 224 })
                      candidates.push({ state: 'detail', tx: 0 })
                    }
                    const best = candidates.reduce((a, b) =>
                      Math.abs(b.tx - finalTx) < Math.abs(a.tx - finalTx) ? b : a
                    )
                    if (sheet) {
                      sheet.style.transition = 'transform 0.32s cubic-bezier(0.16,1,0.3,1)'
                      sheet.style.transform = `translateY(${best.tx}px)`
                    }
                    setSheetState(best.state)
                    // Let React take over after the snap animation ends
                    setTimeout(() => {
                      if (sheet) { sheet.style.transition = ''; sheet.style.transform = '' }
                    }, 340)
                  }}
                  style={{ padding: '16px 0 12px', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'grab', flexShrink: 0, touchAction: 'none' }}
                >
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: D.border2 }} />
                </div>

                {/* Search bar — always visible */}
                <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
                  <SearchBox
                    value={searchQuery}
                    onChange={(q) => { setSearchQuery(q); if (sheetState === 'peek') setSheetState('list') }}
                    dark={dark}
                  />
                </div>

                {/* Content */}
                {(sheetState === 'peek' || sheetState === 'list') && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 16px', display: sheetState === 'peek' ? 'none' : 'block', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 0 8px' }}>
                      Buildings ({filteredBuildings.length})
                    </div>
                    {filteredBuildings.length === 0 ? (
                      <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 16 }}>No results found</p>
                    ) : filteredBuildings.map(b => (
                      <BuildingCard
                        key={b.id}
                        building={b}
                        distance={userLocation ? calcDist(userLocation.latitude, userLocation.longitude, b.coordinates[1], b.coordinates[0]) : null}
                        onClick={handleBuildingClick}
                        selected={selectedBuilding?.id === b.id}
                        dark={dark}
                      />
                    ))}
                  </div>
                )}

                {sheetState === 'card' && selectedBuilding && <MobileQuickCard />}
                {sheetState === 'detail' && selectedBuilding && (
                  showRoomsList
                    ? <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <RoomsList buildingId={selectedBuilding.id} buildingName={selectedBuilding.name} onClose={() => setShowRoomsList(false)} />
                      </div>
                    : <BuildingDetailPanel />
                )}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Share modal */}
      {showShareModal && (
        <Modal onClose={() => setShowShareModal(false)}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>Share This Map</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={window.location.href} readOnly style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
              <button onClick={copyLink} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: D.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Copy</button>
            </div>
          </div>
        </Modal>
      )}


      {/* Indoor nav modal */}
      {showIndoorNav && (
        <IndoorNavModal onClose={() => { setShowIndoorNav(false); setIndoorNavUrl('') }} mappedInUrl={indoorNavUrl} dark={dark} />
      )}

      {/* Welcome message — first visit only */}
      {showWelcome && university && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            background: D.surface,
            borderRadius: isMobile ? '22px 22px 0 0' : 20,
            padding: isMobile ? '28px 22px calc(28px + env(safe-area-inset-bottom))' : '32px 28px',
            maxWidth: isMobile ? '100%' : 420,
            width: '100%',
            boxShadow: `0 24px 80px rgba(0,0,0,${dark ? '0.6' : '0.22'})`,
            border: `1px solid ${D.border}`,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${D.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icon name="compass" size={24} color={D.accent} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, margin: '0 0 8px', color: D.text, letterSpacing: '-0.01em' }}>
              Welcome to {university.name}
            </h2>
            <p style={{ fontSize: 14.5, color: D.textDim, lineHeight: 1.6, margin: '0 0 24px' }}>
              {university.welcome_message}
            </p>
            <button onClick={() => {
              setShowWelcome(false)
              localStorage.setItem(`welcomed_${university.id}`, '1')
            }} style={{
              width: '100%', height: 48, borderRadius: 12, border: 'none',
              background: D.accent, color: '#fff',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}>
              Explore campus
            </button>
          </div>
        </div>
      )}

      {/* Cookie consent — only when university has it enabled (default: on) */}
      {university != null && university.cookies_enabled !== false && <CookieConsent />}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default PublicMap
