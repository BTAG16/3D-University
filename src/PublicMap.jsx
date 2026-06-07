import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dbService } from './lib/dbService'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import Modal from './components/Modal'
import RoomsList from './components/RoomsList'
import IndoorNavModal from './components/IndoorNavModal'
import { useToast } from './components/Toast'
import { Icon } from './icons'
import { useDarkMode } from './hooks'

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
  const D = dark ? DARK : LIGHT
  const [university, setUniversity] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [buildings, setBuildings] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBuildings, setFilteredBuildings] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showModal, setShowModal] = useState(true)
  const [showRoomsList, setShowRoomsList] = useState(false)
  const [officeRooms, setOfficeRooms] = useState([])
  const [showIndoorNav, setShowIndoorNav] = useState(false)
  const [indoorNavUrl, setIndoorNavUrl] = useState('')
  const [routeData, setRouteData] = useState(null)
  const [fpvTour, setFpvTour] = useState(null)
  const tourStartedRef = useRef(false)
  const mapRef = useRef(null)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) setShowSidebar(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
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
    setShowModal(true)
    setShowRoomsList(false)
    if (mapRef.current?.clearDirections) mapRef.current.clearDirections()
    if (isMobile) setShowSidebar(false)
    try {
      const r = await dbService.getRooms(building.id)
      if (r.success) setOfficeRooms(r.data.filter(x => x.is_office))
    } catch { /* ignore */ }
  }

  const handleOpenIndoorNav = () => {
    setIndoorNavUrl(selectedBuilding?.mappedin_url || 'https://app.mappedin.com/map/69332462a1aaeb000b3132d2?embedded=true')
    setShowIndoorNav(true)
  }

  const handleShowDirections = () => {
    if (!userLocation) { toast.warning('Enable your location first.'); handleGetLocation(); return }
    mapRef.current?.stopFpvTour()
    tourStartedRef.current = false
    setFpvTour(null)
    setShowDirections(true)
    setShowModal(false)
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

  const handleCloseDirections = () => {
    mapRef.current?.stopFpvTour()
    tourStartedRef.current = false
    setFpvTour(null)
    setShowDirections(false)
    setRouteData(null)
    setSelectedBuilding(null)
    setShowModal(true)
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

  // ─── Building detail modal content ──────────────────────────────────────
  const BuildingDetail = () => (
    <div style={{ color: 'var(--text-primary)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{selectedBuilding.name}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>{selectedBuilding.category}</p>
      {selectedBuilding.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>{selectedBuilding.description}</p>
      )}

      {/* Navigation actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Indoor Nav', icon: 'navigation', onClick: handleOpenIndoorNav },
          { label: 'Directions', icon: 'compass', onClick: handleShowDirections, disabled: !userLocation },
          { label: 'Google Maps', icon: 'mapPin', onClick: handleOpenInGoogleMaps },
          { label: 'View Rooms', icon: 'door', onClick: () => setShowRoomsList(true) },
        ].map(a => (
          <button key={a.label} onClick={a.onClick} disabled={a.disabled} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
            borderRadius: 8, border: '1px solid var(--border)', cursor: a.disabled ? 'default' : 'pointer',
            background: 'transparent', color: a.disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 500, opacity: a.disabled ? 0.5 : 1,
          }}>
            <Icon name={a.icon} size={13} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Office rooms */}
      {(officeRooms.length > 0 || (selectedBuilding.key_offices?.length > 0 && officeRooms.length === 0)) && (
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="door" size={13} />
            Office Rooms ({officeRooms.length || selectedBuilding.key_offices.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(officeRooms.length > 0 ? officeRooms : selectedBuilding.key_offices || []).map((o, i) => (
              <div key={o.id || i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <strong style={{ fontSize: 13 }}>{o.room_name || o.name}</strong>
                  {(o.room_number || o.roomNumber) && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{o.room_number || o.roomNumber}</span>}
                </div>
                {o.purpose && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 3px' }}>{o.purpose}</p>}
                {o.hours && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="calendar" size={11} />{o.hours}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities */}
      {selectedBuilding.facilities?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Facilities</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedBuilding.facilities.map((f, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 500 }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Departments */}
      {selectedBuilding.departments?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Departments</h3>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {selectedBuilding.departments.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}

      {selectedBuilding.hours && (
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Hours</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{selectedBuilding.hours}</p>
        </div>
      )}

      {userLocation && (
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="mapPin" size={12} />
          {calcDist(userLocation.latitude, userLocation.longitude, selectedBuilding.coordinates[1], selectedBuilding.coordinates[0])} away
        </p>
      )}
    </div>
  )

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: D.bg, color: D.text, overflow: 'hidden' }}>

      {/* Header */}
      <header style={{
        flexShrink: 0, background: D.surface, borderBottom: `1px solid ${D.border}`,
        padding: '0 18px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="compass" size={14} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{university.name}</div>
            {university.city && <div style={{ fontSize: 11, color: D.textMut }}>{university.city}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={handleGetLocation} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer' }}>
            <Icon name="navigation" size={13} color={D.textDim} />
            {!isMobile && 'My Location'}
          </button>
          <button onClick={toggleDark} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer' }}>
            <Icon name={dark ? 'sun' : 'moon'} size={13} color={D.textDim} />
          </button>
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer' }}>
            <Icon name="share" size={13} color={D.textDim} />
            {!isMobile && 'Share'}
          </button>
          {isMobile && (
            <button onClick={() => setShowSidebar(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${D.border2}`, background: showSidebar ? 'rgba(14,165,233,0.15)' : 'transparent', color: showSidebar ? D.accent : D.textDim, fontSize: 12, cursor: 'pointer' }}>
              <Icon name="layers" size={13} color={showSidebar ? D.accent : D.textDim} />
            </button>
          )}
        </div>
      </header>

      {/* Body: sidebar + map */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Sidebar */}
        {(!isMobile || showSidebar) && (
          <aside style={{
            width: isMobile ? '100%' : sidebarW,
            flexShrink: 0,
            background: D.surface,
            borderRight: `1px solid ${D.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: isMobile ? 'absolute' : 'relative',
            inset: isMobile ? 0 : undefined,
            zIndex: isMobile ? 10 : undefined,
          }}>
            <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${D.border}` }}>
              <SearchBox value={searchQuery} onChange={setSearchQuery} dark />
            </div>
            <div style={{ padding: '10px 12px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Buildings ({filteredBuildings.length})
              </span>
              {isMobile && (
                <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.textDim, padding: 4 }}>
                  <Icon name="x" size={16} color={D.textDim} />
                </button>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px' }}>
              {filteredBuildings.length === 0 ? (
                <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 24 }}>No results found</p>
              ) : filteredBuildings.map(b => (
                <BuildingCard
                  key={b.id}
                  building={b}
                  distance={userLocation ? calcDist(userLocation.latitude, userLocation.longitude, b.coordinates[1], b.coordinates[0]) : null}
                  onClick={handleBuildingClick}
                  selected={selectedBuilding?.id === b.id}
                  dark
                />
              ))}
            </div>
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
          />

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
                  <div style={{ fontSize: 11, color: D.textMut, marginTop: 4, textAlign: 'right' }}>
                    {routeData?.distance} km · ~{routeData?.duration} min walk
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
        </div>
      </div>

      {/* Building detail modal */}
      {selectedBuilding && showModal && !showRoomsList && (
        <Modal onClose={() => {
          setSelectedBuilding(null)
          setShowDirections(false)
          setRouteData(null)
          setShowModal(true)
          setShowRoomsList(false)
          if (mapRef.current?.clearDirections) mapRef.current.clearDirections()
        }}>
          <BuildingDetail />
        </Modal>
      )}

      {/* Share modal */}
      {showShareModal && (
        <Modal onClose={() => setShowShareModal(false)}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>Share This Map</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={window.location.href} readOnly style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
              <button onClick={copyLink} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Copy</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rooms list modal */}
      {selectedBuilding && showRoomsList && (
        <Modal onClose={() => setShowRoomsList(false)}>
          <RoomsList
            buildingId={selectedBuilding.id}
            buildingName={selectedBuilding.name}
            onClose={() => setShowRoomsList(false)}
          />
        </Modal>
      )}

      {/* Indoor nav modal */}
      {showIndoorNav && (
        <IndoorNavModal onClose={() => { setShowIndoorNav(false); setIndoorNavUrl('') }} mappedInUrl={indoorNavUrl} />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default PublicMap
