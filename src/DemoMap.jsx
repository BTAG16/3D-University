import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import Modal from './components/Modal'
import BuildingForm from './components/BuildingForm'
import RoomsList from './components/RoomsList'
import { Icon } from './icons'
import { getOfficeRoomsForBuilding, getAllRoomsForBuilding } from './demoRoomsData'
import RoomTimetable from './components/RoomTimetable'
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

const initialDemoBuildings = [
  {
    id: 'demo-admin',
    name: 'Administration Building',
    coordinates: [19.054707436918342, 47.495248233157284],
    category: 'Administration',
    description: 'Main administrative offices including Registrar, Financial Aid, and Student Services',
    facilities: ['WiFi', 'Student Services', 'Registrar Office', 'Financial Aid'],
    departments: ['Administration', 'Student Affairs'],
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    isAdminBuilding: true,
    keyOffices: [{ id: '1', name: "Registrar's Office", purpose: 'Course registration and transcripts', hours: 'Mon-Fri: 9:00 AM - 4:00 PM', roomNumber: 'Room 101' }],
  },
  {
    id: 'demo-library',
    name: 'University Library',
    coordinates: [19.05693798689157, 47.49267737360714],
    category: 'Library',
    description: 'Central library with study spaces, computer labs, and extensive book collection',
    facilities: ['WiFi', 'Computer Lab', 'Study Rooms', 'Cafe', 'Printing Services'],
    departments: ['Library Services', 'Academic Resources'],
    hours: 'Mon-Thu: 7:00 AM - 11:00 PM, Fri: 7:00 AM - 8:00 PM',
    isAdminBuilding: false,
    keyOffices: [{ id: '1', name: 'Reference Desk', purpose: 'Research assistance and library help', hours: 'Mon-Fri: 9:00 AM - 5:00 PM', roomNumber: 'First Floor' }],
  },
  {
    id: 'demo-dormitory',
    name: 'Student Dormitory',
    coordinates: [19.053028697400013, 47.473191215229704],
    category: 'Residence',
    description: 'On-campus housing with modern amenities and common areas',
    facilities: ['WiFi', 'Laundry', 'Common Room', 'Study Lounge', '24/7 Security'],
    departments: ['Housing', 'Residential Life'],
    hours: '24/7 Access for Residents',
    isAdminBuilding: false,
    keyOffices: [{ id: '1', name: 'Resident Advisor Office', purpose: 'Dormitory support and assistance', hours: 'Available 24/7', roomNumber: 'First Floor Lobby' }],
  },
]

function DemoMap() {
  const navigate = useNavigate()
  const [dark, toggleDark] = useDarkMode()
  const D = dark ? DARK : LIGHT

  const [buildings, setBuildings] = useState(() => {
    const saved = sessionStorage.getItem('demoBuildings')
    return saved ? JSON.parse(saved) : initialDemoBuildings
  })
  const [userAddedBuilding, setUserAddedBuilding] = useState(() =>
    sessionStorage.getItem('demoUserAddedBuilding') === 'true'
  )
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBuildings, setFilteredBuildings] = useState(buildings)
  const [isMobile, setIsMobile] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showModal, setShowModal] = useState(true)
  const [showBuildingForm, setShowBuildingForm] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [showDemoBanner, setShowDemoBanner] = useState(true)
  const [showRoomsList, setShowRoomsList] = useState(false)
  const [officeRooms, setOfficeRooms] = useState([])
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
    if (!searchQuery) { setFilteredBuildings(buildings); return }
    setFilteredBuildings(buildings.filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.departments?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.facilities?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
    ))
  }, [searchQuery, buildings])

  useEffect(() => { sessionStorage.setItem('demoBuildings', JSON.stringify(buildings)) }, [buildings])

  useEffect(() => {
    if (!showDirections) tourStartedRef.current = false
  }, [showDirections])

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
    if (!('geolocation' in navigator)) { alert('Geolocation not supported.'); return }
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => alert('Unable to get location. Enable location services.')
    )
  }

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building)
    setShowDirections(false)
    setRouteData(null)
    setShowModal(true)
    setShowRoomsList(false)
    setOfficeRooms(getOfficeRoomsForBuilding(building.id))
    if (mapRef.current?.clearDirections) mapRef.current.clearDirections()
    if (isMobile) setShowSidebar(false)
  }

  const handleShowDirections = () => {
    if (!userLocation) { alert('Enable location first.'); handleGetLocation(); return }
    mapRef.current?.stopFpvTour()
    tourStartedRef.current = false
    setFpvTour(null)
    setShowDirections(true)
    setRouteData(null)
    setShowModal(false)
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

  const handleAddBuilding = () => {
    if (userAddedBuilding) { alert('Demo mode allows only 1 test building.'); return }
    setEditingBuilding(null)
    setShowBuildingForm(true)
    setShowDemoBanner(false)
  }

  const handleEditBuilding = (building) => {
    if (building.id.startsWith('demo-')) { alert('Demo buildings cannot be edited.'); return }
    setEditingBuilding(building)
    setShowBuildingForm(true)
    setShowDemoBanner(false)
  }

  const handleSaveBuilding = (data) => {
    if (editingBuilding) {
      setBuildings(prev => prev.map(b => b.id === editingBuilding.id ? { ...data, id: editingBuilding.id } : b))
      setShowBuildingForm(false)
      setEditingBuilding(null)
    } else {
      if (userAddedBuilding) { alert('Demo mode allows only 1 test building!'); return }
      setBuildings(prev => [...prev, { ...data, id: `user-${Date.now()}` }])
      setUserAddedBuilding(true)
      sessionStorage.setItem('demoUserAddedBuilding', 'true')
      setShowBuildingForm(false)
    }
  }

  const handleDeleteBuilding = (id) => {
    if (id.startsWith('demo-')) { alert('Demo buildings cannot be deleted!'); return }
    if (!window.confirm('Delete this building?')) return
    setBuildings(prev => prev.filter(b => b.id !== id))
    setUserAddedBuilding(false)
    sessionStorage.setItem('demoUserAddedBuilding', 'false')
    if (selectedBuilding?.id === id) setSelectedBuilding(null)
  }

  const calcDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180
    const df = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(df/2)**2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2)**2
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return d < 1000 ? `${Math.round(d)}m` : `${(d/1000).toFixed(1)}km`
  }

  const sidebarW = 300

  // ─── Building detail modal content ──────────────────────────────────────
  const BuildingDetail = () => (
    <div style={{ color: 'var(--text-primary)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{selectedBuilding.name}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>{selectedBuilding.category}</p>
      {selectedBuilding.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>{selectedBuilding.description}</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Directions', icon: 'compass', onClick: handleShowDirections, disabled: !userLocation },
          { label: 'Google Maps', icon: 'mapPin', onClick: handleOpenInGoogleMaps },
          { label: 'View Rooms', icon: 'door', onClick: () => { setShowModal(false); setShowRoomsList(true) } },
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

      {officeRooms.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="door" size={13} /> Key Offices ({officeRooms.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {officeRooms.map(o => (
              <div key={o.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <strong style={{ fontSize: 13 }}>{o.room_name}</strong>
                  {o.room_number && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{o.room_number}</span>}
                </div>
                {o.purpose && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 3px' }}>{o.purpose}</p>}
                {o.hours && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>{o.hours}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

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

      {selectedBuilding.hours && (
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Hours</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{selectedBuilding.hours}</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: D.bg, color: D.text, overflow: 'hidden' }}>

      {/* Demo banner */}
      {showDemoBanner && (
        <div style={{
          flexShrink: 0, background: 'linear-gradient(90deg, #0c4a6e, #075985)',
          borderBottom: `1px solid ${D.border2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 18px', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <Icon name="zap" size={15} color={D.accent} />
            <span style={{ fontSize: 13, color: D.text }}>
              <strong>Demo Mode</strong> — 3 pre-loaded buildings. Add 1 test building to try the full experience.
            </span>
          </div>
          <button onClick={() => setShowDemoBanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.textDim, padding: 4, flexShrink: 0 }}>
            <Icon name="x" size={15} color={D.textDim} />
          </button>
        </div>
      )}

      {/* Header */}
      <header style={{
        flexShrink: 0, background: D.surface, borderBottom: `1px solid ${D.border}`,
        padding: '0 18px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: `1px solid ${D.border2}`, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: D.textDim, display: 'flex', alignItems: 'center' }}>
            <Icon name="arrowRight" size={14} color={D.textDim} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="compass" size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: D.text }}>Campus Explorer</div>
            <div style={{ fontSize: 11, color: D.textMut }}>Demo University · Interactive Tour</div>
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
          <button onClick={handleAddBuilding} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${D.accent}`, background: 'rgba(14,165,233,0.12)', color: D.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Icon name="plus" size={13} color={D.accent} />
            {!isMobile && `Add Building${userAddedBuilding ? ' (1/1)' : ''}`}
          </button>
          {isMobile && (
            <button onClick={() => setShowSidebar(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${D.border2}`, background: showSidebar ? 'rgba(14,165,233,0.15)' : 'transparent', color: showSidebar ? D.accent : D.textDim, fontSize: 12, cursor: 'pointer' }}>
              <Icon name="layers" size={13} color={showSidebar ? D.accent : D.textDim} />
            </button>
          )}
        </div>
      </header>

      {/* Body */}
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
                <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 24 }}>No buildings found</p>
              ) : filteredBuildings.map(b => {
                const isDemo = b.id.startsWith('demo-')
                return (
                  <div key={b.id} style={{ position: 'relative' }}>
                    <BuildingCard
                      building={b}
                      distance={userLocation ? calcDist(userLocation.latitude, userLocation.longitude, b.coordinates[1], b.coordinates[0]) : null}
                      onClick={() => handleBuildingClick(b)}
                      selected={selectedBuilding?.id === b.id}
                      dark
                    />
                    {/* Demo badge or edit/delete */}
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                      {isDemo ? (
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(14,165,233,0.15)', color: D.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo</span>
                      ) : (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleEditBuilding(b) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 5, padding: '4px', cursor: 'pointer', color: D.textDim, display: 'flex' }}>
                            <Icon name="edit" size={11} color={D.textDim} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteBuilding(b.id) }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 5, padding: '4px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                            <Icon name="trash" size={11} color="#ef4444" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
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

              {fpvTour && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 3, background: D.border2, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: D.accent, borderRadius: 2, width: `${((fpvTour.stepIndex + 1) / fpvTour.totalSteps) * 100}%`, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: D.textMut, marginTop: 4, textAlign: 'right' }}>
                    {routeData?.distance} km · ~{routeData?.duration} min walk
                  </div>
                </div>
              )}

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
                  <Icon name="x" size={12} color="#ef4444" /> Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Building detail modal */}
      {selectedBuilding && showModal && !showBuildingForm && !showRoomsList && (
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

      {/* Rooms list modal */}
      {selectedBuilding && showRoomsList && (
        <Modal onClose={() => { setShowRoomsList(false); setShowModal(true) }}>
          <DemoRoomsList
            buildingId={selectedBuilding.id}
            buildingName={selectedBuilding.name}
            onClose={() => { setShowRoomsList(false); setShowModal(true) }}
          />
        </Modal>
      )}

      {/* Building form modal */}
      {showBuildingForm && (
        <Modal onClose={() => { setShowBuildingForm(false); setEditingBuilding(null); setShowDemoBanner(true) }}>
          <BuildingForm
            building={editingBuilding}
            onSave={handleSaveBuilding}
            onCancel={() => { setShowBuildingForm(false); setEditingBuilding(null); setShowDemoBanner(true) }}
          />
        </Modal>
      )}
    </div>
  )
}

// ─── Demo Rooms List ───────────────────────────────────────────────────────────
function DemoRoomsList({ buildingId, buildingName, onClose }) {
  const rooms = getAllRoomsForBuilding(buildingId)
  const sorted = [...rooms].sort((a, b) => {
    if (a.is_office && !b.is_office) return -1
    if (!a.is_office && b.is_office) return 1
    return a.room_number.localeCompare(b.room_number, undefined, { numeric: true })
  })

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: '0 0 2px' }}>Rooms in {buildingName}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{sorted.length} rooms · {sorted.filter(r => r.is_office).length} offices</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <Icon name="x" size={14} />
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Icon name="door" size={32} color="var(--text-tertiary)" />
          <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 12 }}>No Rooms Found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {sorted.map(r => (
            <div key={r.id} style={{
              background: 'var(--bg)', border: `1px solid ${r.is_office ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{r.room_number}</span>
                {r.is_office && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 700 }}>Office</span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>{r.room_name}</div>
              {r.purpose && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 3px' }}>{r.purpose}</p>}
              {r.hours && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>{r.hours}</p>}
              {r.timetable && <RoomTimetable timetable={r.timetable} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DemoMap
