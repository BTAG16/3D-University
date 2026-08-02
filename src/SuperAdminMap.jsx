import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { dbService } from './lib/dbService'
import MapComponent from './components/Map/MapComponent'
import BuildingCard from './components/BuildingCard'
import SearchBox from './components/SearchBox'
import { Icon } from './icons'
import { useDarkMode, useIsMobile } from './hooks'

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

function SuperAdminMap() {
  const navigate = useNavigate()
  const { adminSession } = useAdminAuth()
  const [dark, toggleDark] = useDarkMode()
  const D = dark ? DARK : LIGHT
  const isMobile = useIsMobile()

  const [universities, setUniversities] = useState([])
  const [displayBuildings, setDisplayBuildings] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUniversities, setFilteredUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!adminSession) { navigate('/admin'); return }
    if (!adminSession.user.isSuperAdmin) { navigate('/admin/dashboard'); return }
  }, [adminSession, navigate])

  useEffect(() => {
    if (isMobile) setShowSidebar(false)
  }, [isMobile])

  useEffect(() => { loadUniversities() }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredUniversities(universities.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    } else {
      setFilteredUniversities(universities)
    }
  }, [searchQuery, universities])

  // Same mechanism PublicMap uses: markers (MapComponent.css) read --accent
  // off the document root, so this keeps marker styling in sync with theme.
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', D.accent)
    document.documentElement.style.setProperty('--accent-subtle', `color-mix(in srgb, ${D.accent} 15%, transparent)`)
  }, [D.accent])

  const loadUniversities = async () => {
    try {
      setLoading(true)

      const universitiesResult = await dbService.getAllUniversities()
      if (!universitiesResult.success) {
        console.error('Failed to load universities:', universitiesResult.error)
        setLoading(false)
        return
      }

      const universitiesList = universitiesResult.data || []

      const universitiesWithBuildings = await Promise.all(
        universitiesList.map(async (uni) => {
          const detailResult = await dbService.getUniversity(uni.id)
          return detailResult.success ? detailResult.data : uni
        })
      )

      setUniversities(universitiesWithBuildings)
      setFilteredUniversities(universitiesWithBuildings)

      // One marker per university, anchored at its admin building (or first building)
      const buildings = universitiesWithBuildings
        .filter(uni => uni.buildings && uni.buildings.length > 0)
        .map(uni => {
          const adminBuilding = uni.buildings.find(b => b.is_admin_building)
          const displayBuilding = adminBuilding || uni.buildings[0]
          return {
            id: uni.id,
            name: uni.name,
            category: uni.city,
            coordinates: displayBuilding.coordinates,
            universityData: uni,
          }
        })

      setDisplayBuildings(buildings)
      setLoading(false)
    } catch (error) {
      console.error('Error loading universities:', error)
      setLoading(false)
    }
  }

  const handleUniversityClick = (building) => {
    setSelectedUniversity(building.universityData)
    if (isMobile) setShowSidebar(false)
  }

  const handleViewDashboard = (universityId) => {
    window.open(`/map?uni=${universityId}`, '_blank')
  }

  const handleBackToDashboard = () => navigate('/super-admin/dashboard')

  if (loading) return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: D.bg, color: D.textDim, gap: 16 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${D.border2}`, borderTopColor: D.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Loading global map…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const selectedDisplayBuilding = selectedUniversity
    ? displayBuildings.find(b => b.id === selectedUniversity.id)
    : null

  // ─── Selected university detail panel ─────────────────────────────────
  const UniversityDetailPanel = () => (
    <>
      <button onClick={() => setSelectedUniversity(null)} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '13px 16px', width: '100%', textAlign: 'left',
        background: 'none', border: 'none', borderBottom: `1px solid ${D.border}`,
        cursor: 'pointer', fontSize: 13, color: D.accent, fontFamily: 'var(--font-display)', fontWeight: 500, flexShrink: 0,
      }}>
        ← All universities
      </button>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${D.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="building" size={22} color={D.accent} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: '0 0 4px', color: D.text, lineHeight: 1.2 }}>{selectedUniversity.name}</h2>
            <span style={{ fontSize: 12, color: D.textDim, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', padding: '2px 8px', borderRadius: 9999, display: 'inline-block' }}>{selectedUniversity.city}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: `1px solid ${D.border}` }}>
            <span style={{ color: D.textDim }}>Total Buildings</span>
            <span style={{ color: D.text, fontWeight: 600 }}>{selectedUniversity.buildings?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: `1px solid ${D.border}` }}>
            <span style={{ color: D.textDim }}>Created</span>
            <span style={{ color: D.text, fontWeight: 600 }}>{new Date(selectedUniversity.created_at).toLocaleDateString()}</span>
          </div>
          {selectedUniversity.buildings?.some(b => b.is_admin_building) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: D.accent, padding: '8px 0' }}>
              <Icon name="building" size={13} color={D.accent} />
              Admin building designated
            </div>
          )}
        </div>

        <button onClick={() => handleViewDashboard(selectedUniversity.id)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-display)', cursor: 'pointer',
          background: D.accent, color: '#fff', border: 'none',
        }}>
          <Icon name="externalLink" size={15} color="#fff" /> View University Map
        </button>
      </div>
    </>
  )

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: D.bg, color: D.text, overflow: 'hidden' }}>

      {/* Header */}
      <header style={{
        flexShrink: 0, background: D.surface, borderBottom: `1px solid ${D.border}`,
        padding: '0 14px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button onClick={handleBackToDashboard} title="Back to dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, border: `1px solid ${D.border2}`, background: 'transparent', color: D.textDim, cursor: 'pointer', flexShrink: 0, fontSize: 15 }}>
            ←
          </button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="compass" size={16} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>Global University Map</div>
            {!isMobile && <div style={{ fontSize: 11, color: D.textMut, marginTop: 1 }}>{universities.length} universities</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${D.border2}`, background: 'transparent', cursor: 'pointer', minWidth: 36, minHeight: 36 }}>
            <Icon name={dark ? 'sun' : 'moon'} size={14} color={D.textDim} />
          </button>
        </div>
      </header>

      {/* Body: sidebar + map */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {(!isMobile || showSidebar) && (
          <aside style={{
            width: isMobile ? '100%' : 300,
            flexShrink: 0,
            background: D.surface,
            borderRight: isMobile ? 'none' : `1px solid ${D.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...(isMobile ? { position: 'absolute', inset: 0, zIndex: 15 } : {}),
          }}>
            {isMobile && (
              <div style={{ padding: '10px 12px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>Universities</span>
                <button onClick={() => setShowSidebar(false)} style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: D.textDim }}>
                  <Icon name="x" size={16} color={D.textDim} />
                </button>
              </div>
            )}

            {selectedUniversity ? (
              <UniversityDetailPanel />
            ) : (
              <>
                <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${D.border}` }}>
                  <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search universities..." dark={dark} />
                </div>
                <div style={{ padding: '10px 12px 6px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Universities ({filteredUniversities.length})
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                  {filteredUniversities.length === 0 ? (
                    <p style={{ color: D.textMut, fontSize: 13, textAlign: 'center', marginTop: 24 }}>No universities found</p>
                  ) : filteredUniversities.map(university => (
                    <BuildingCard
                      key={university.id}
                      building={{ name: university.name, category: university.city }}
                      onClick={() => {
                        const building = displayBuildings.find(b => b.id === university.id)
                        if (building) handleUniversityClick(building)
                      }}
                      selected={selectedUniversity?.id === university.id}
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
            buildings={displayBuildings}
            selectedBuilding={selectedDisplayBuilding}
            onBuildingClick={handleUniversityClick}
            darkMode={dark}
            accentColor={D.accent}
          />
        </div>

        {isMobile && !showSidebar && (
          <button onClick={() => setShowSidebar(true)} style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 9999,
            background: D.surface, border: `1px solid ${D.border2}`, color: D.text, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: `0 8px 24px rgba(0,0,0,${dark ? '0.5' : '0.15'})`, zIndex: 10,
          }}>
            <Icon name="search" size={14} color={D.textDim} />
            Universities
          </button>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default SuperAdminMap
