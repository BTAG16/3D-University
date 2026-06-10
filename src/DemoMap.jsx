import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import Modal from './components/Modal'
import BuildingForm from './components/BuildingForm'
import { Icon } from './icons'
import { getOfficeRoomsForBuilding, getAllRoomsForBuilding } from './demoRoomsData'
import RoomTimetable from './components/RoomTimetable'
import './components/RoomsList.css'
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
  const [sheetState, setSheetState] = useState('peek')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBuildings, setFilteredBuildings] = useState(buildings)
  const [isMobile, setIsMobile] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
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
    setShowRoomsList(false)
    setOfficeRooms(getOfficeRoomsForBuilding(building.id))
    if (mapRef.current?.clearDirections) mapRef.current.clearDirections()
    if (isMobile) setSheetState('card')
  }

  const handleShowDirections = () => {
    if (!userLocation) { alert('Enable location first.'); handleGetLocation(); return }
    mapRef.current?.stopFpvTour()
    tourStartedRef.current = false
    setFpvTour(null)
    setShowDirections(true)
    setRouteData(null)
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

  // ─── Building detail sidebar panel ─────────────────────────────────────
  const BuildingDetailPanel = () => (
    <>
      <button onClick={() => { setSelectedBuilding(null); setOfficeRooms([]); if (isMobile) setSheetState('list') }} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '13px 16px', width: '100%', textAlign: 'left',
        background: 'none', border: 'none', borderBottom: `1px solid ${D.border}`,
        cursor: 'pointer', fontSize: 13, color: D.accent, fontFamily: 'var(--font-display)', fontWeight: 500, flexShrink: 0,
      }}>
        ← All buildings
      </button>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${D.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="building" size={22} color={D.accent} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: '0 0 4px', color: D.text, lineHeight: 1.2 }}>{selectedBuilding.name}</h2>
            <span style={{ fontSize: 12, color: D.textDim, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', padding: '2px 8px', borderRadius: 9999, display: 'inline-block' }}>{selectedBuilding.category}</span>
          </div>
        </div>

        {selectedBuilding.description && (
          <p style={{ fontSize: 13, color: D.textDim, lineHeight: 1.6, marginBottom: 14 }}>{selectedBuilding.description}</p>
        )}

        {selectedBuilding.hours && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: D.textDim }}>
            <Icon name="calendar" size={14} color={D.textMut} />
            {selectedBuilding.hours}
          </div>
        )}

        {userLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, color: D.accent }}>
            <Icon name="mapPin" size={14} color={D.accent} />
            {calcDist(userLocation.latitude, userLocation.longitude, selectedBuilding.coordinates[1], selectedBuilding.coordinates[0])} away
          </div>
        )}

        {selectedBuilding.facilities?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {selectedBuilding.facilities.map((f, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: D.textDim, fontWeight: 500 }}>{f}</span>
            ))}
          </div>
        )}

        {selectedBuilding.departments?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {selectedBuilding.departments.map((d, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, background: `${D.accent}15`, color: D.accent, fontWeight: 500 }}>{d}</span>
            ))}
          </div>
        )}

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

        {officeRooms.length > 0 && (
          <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: D.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="door" size={13} color={D.textMut} /> Key Offices ({officeRooms.length})
            </h4>
            {officeRooms.map(o => (
              <div key={o.id} style={{ padding: '10px 0', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {o.room_number && <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, minWidth: 44, flexShrink: 0 }}>{o.room_number}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: D.text }}>{o.room_name}</div>
                  {o.purpose && <div style={{ fontSize: 12, color: D.textDim, marginTop: 2 }}>{o.purpose}</div>}
                  {o.hours && <div style={{ fontSize: 11, color: D.textMut, marginTop: 2 }}>{o.hours}</div>}
                </div>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 9999, background: `${D.accent}15`, color: D.accent, fontWeight: 700, flexShrink: 0 }}>Office</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
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
        padding: '0 14px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: `1px solid ${D.border2}`, borderRadius: 8, padding: '7px', cursor: 'pointer', color: D.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="arrowRight" size={14} color={D.textDim} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="compass" size={16} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: D.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Campus Explorer</div>
            {!isMobile && <div style={{ fontSize: 11, color: D.textMut, marginTop: 1 }}>Demo · Interactive Tour</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={handleGetLocation} title="My Location" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: isMobile ? '8px' : '7px 12px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Icon name="navigation" size={14} color={D.textDim} />
            {!isMobile && 'My Location'}
          </button>
          <button onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', cursor: 'pointer' }}>
            <Icon name={dark ? 'sun' : 'moon'} size={14} color={D.textDim} />
          </button>
          <button onClick={handleAddBuilding} title="Add building" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: isMobile ? '8px' : '7px 12px', borderRadius: 8, border: `1px solid ${D.accent}`, background: 'rgba(14,165,233,0.12)', color: D.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Icon name="plus" size={14} color={D.accent} />
            {!isMobile && (userAddedBuilding ? 'Added (1/1)' : 'Add Building')}
          </button>
        </div>
      </header>

      {/* Body */}
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
              <BuildingDetailPanel />
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
                          dark={dark}
                        />
                        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                          {isDemo ? (
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(14,165,233,0.15)', color: D.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo</span>
                          ) : (
                            <>
                              <button onClick={e => { e.stopPropagation(); handleEditBuilding(b) }} style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 5, padding: '4px', cursor: 'pointer', color: D.textDim, display: 'flex' }}>
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

              {/* Transit nudge */}
              {routeData?.duration > 12 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '7px 10px', marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: '#d97706' }}>Long walk (~{routeData.duration} min)</span>
                  <button onClick={handleOpenTransit} style={{ color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, padding: 0, whiteSpace: 'nowrap' }}>
                    Transit / taxi →
                  </button>
                </div>
              )}

              {fpvTour && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 3, background: D.border2, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: D.accent, borderRadius: 2, width: `${((fpvTour.stepIndex + 1) / fpvTour.totalSteps) * 100}%`, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: D.textMut, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Step {fpvTour.stepIndex + 1}/{fpvTour.totalSteps}</span>
                    <span>{routeData?.distance} km · ~{routeData?.duration} min</span>
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

                {routeData?.duration > 12 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12 }}>
                    <span style={{ color: '#d97706' }}>Long walk (~{routeData.duration} min)</span>
                    <button onClick={handleOpenTransit} style={{ color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, padding: 0, whiteSpace: 'nowrap' }}>Transit / taxi →</button>
                  </div>
                )}

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
              <div style={{
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
                {/* Drag handle */}
                <div
                  onClick={() => {
                    if (sheetState === 'peek') setSheetState('list')
                    else if (sheetState === 'list') setSheetState('peek')
                    else if (sheetState === 'card') setSheetState('detail')
                    else setSheetState('card')
                  }}
                  style={{ padding: '10px 0 6px', display: 'flex', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: D.border2 }} />
                </div>

                {/* Search bar */}
                <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
                  <SearchBox
                    value={searchQuery}
                    onChange={(q) => { setSearchQuery(q); if (sheetState === 'peek') setSheetState('list') }}
                    dark={dark}
                  />
                </div>

                {/* Content */}
                {(sheetState === 'peek' || sheetState === 'list') && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 16px', display: sheetState === 'peek' ? 'none' : 'block' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 0 8px' }}>
                      Buildings ({filteredBuildings.length})
                    </div>
                    {filteredBuildings.length === 0 ? (
                      <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 16 }}>No buildings found</p>
                    ) : filteredBuildings.map(b => (
                      <BuildingCard
                        key={b.id}
                        building={b}
                        distance={userLocation ? calcDist(userLocation.latitude, userLocation.longitude, b.coordinates[1], b.coordinates[0]) : null}
                        onClick={() => handleBuildingClick(b)}
                        selected={selectedBuilding?.id === b.id}
                        dark={dark}
                      />
                    ))}
                  </div>
                )}

                {sheetState === 'card' && selectedBuilding && <MobileQuickCard />}
                {sheetState === 'detail' && selectedBuilding && <BuildingDetailPanel />}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Rooms list modal */}
      {selectedBuilding && showRoomsList && (
        <Modal onClose={() => setShowRoomsList(false)}>
          <DemoRoomsList
            buildingId={selectedBuilding.id}
            buildingName={selectedBuilding.name}
            onClose={() => setShowRoomsList(false)}
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
function DemoRoomsList({ buildingId, buildingName }) {
  const [timetableRoom, setTimetableRoom] = useState(null)
  const rooms = getAllRoomsForBuilding(buildingId)
  const sorted = [...rooms].sort((a, b) => {
    if (a.is_office && !b.is_office) return -1
    if (!a.is_office && b.is_office) return 1
    return a.room_number.localeCompare(b.room_number, undefined, { numeric: true })
  })
  const scheduleCount = sorted.filter(r => r.timetable).length

  return (
    <div className="rooms-list-modal">
      {/* Header */}
      <div className="rooms-list-header">
        {timetableRoom ? (
          <div className="header-timetable">
            <button className="btn-back" onClick={() => setTimetableRoom(null)}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>←</span>
              <span>All Rooms</span>
            </button>
            <div className="header-timetable-meta">
              <span className="header-room-number">{timetableRoom.room_number}</span>
              <span className="header-room-name">{timetableRoom.room_name}</span>
            </div>
          </div>
        ) : (
          <div className="header-main">
            <div className="header-icon-wrap">
              <Icon name="door" size={15} />
            </div>
            <div>
              <h2 className="header-title">Rooms in {buildingName}</h2>
              <p className="header-meta">
                {sorted.length} rooms
                {sorted.filter(r => r.is_office).length > 0 && ` · ${sorted.filter(r => r.is_office).length} offices`}
                {scheduleCount > 0 && ` · ${scheduleCount} with schedule`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timetable panel */}
      {timetableRoom ? (
        <div className="timetable-panel">
          {timetableRoom.purpose && <p className="timetable-panel-purpose">{timetableRoom.purpose}</p>}
          {timetableRoom.hours && <p className="timetable-panel-hours">{timetableRoom.hours}</p>}
          <RoomTimetable timetable={timetableRoom.timetable} />
        </div>
      ) : (

      /* Grid view */
      <div className="rooms-list-content">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <Icon name="door" size={36} color="var(--text-tertiary)" />
            <h3>No Rooms Found</h3>
          </div>
        ) : (
          <div className="rooms-grid">
            {sorted.map(r => (
              <div key={r.id} className={`room-card ${r.is_office ? 'office' : ''}`}>
                <div className="room-card-header">
                  <span className="room-number">{r.room_number}</span>
                  <div className="room-card-actions">
                    {r.is_office && (
                      <span className="office-badge">
                        ★ Office
                      </span>
                    )}
                    {r.timetable && (
                      <button
                        className="btn-schedule"
                        onClick={() => setTimetableRoom(r)}
                        title="View weekly schedule"
                      >
                        <Icon name="calendar" size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="room-name">{r.room_name}</div>
                {r.purpose && <p className="room-purpose">{r.purpose}</p>}
                {r.hours && <p className="room-hours"><strong>Hours:</strong> {r.hours}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  )
}

export default DemoMap
