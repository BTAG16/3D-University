import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { useToast } from './components/Toast'
import { useDarkMode } from './hooks'
import { Icon } from './icons'
import Modal from './components/Modal'
import BuildingForm from './components/BuildingForm'
import RoomManagement from './components/RoomManagement'
import AdminSettings from './components/AdminSettings'
import { PageLoader } from './components/LoadingSpinner'
import { NoBuildingsState } from './components/EmptyState'
import './AdminDashboard.css'

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',  label: 'Overview',    icon: 'layers' },
  { id: 'buildings', label: 'Buildings',   icon: 'building' },
  { id: 'rooms',     label: 'Rooms',       icon: 'door' },
  { id: 'link',      label: 'Public Link', icon: 'link' },
  { id: 'settings',  label: 'Details',     icon: 'settings' },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ university, activeTab, setActiveTab, onLogout, dark, onDarkToggle }) {
  const s = {
    sidebar: {
      width: 240, minHeight: '100vh', background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '20px 20px 16px',
      borderBottom: '1px solid var(--border)',
    },
    logoMark: {
      width: 34, height: 34, borderRadius: 8,
      background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    brandName: {
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
      color: 'var(--text-primary)', lineHeight: 1.2,
    },
    uniName: {
      fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
    },
    nav: { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
    navItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
      borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 600 : 400,
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? '#fff' : 'var(--text-secondary)',
      transition: 'all 0.15s',
    }),
    footer: {
      padding: '12px 10px', borderTop: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 4,
    },
    footerBtn: {
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
      borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 400, background: 'transparent',
    },
  }

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoMark}>
          <Icon name="compass" size={18} color="#fff" />
        </div>
        <div>
          <div style={s.brandName}>Kampus</div>
          {university && <div style={s.uniName}>{university.name}</div>}
        </div>
      </div>

      <nav style={s.nav}>
        {NAV.map(item => (
          <button
            key={item.id}
            style={s.navItem(activeTab === item.id)}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon name={item.icon} size={16} color={activeTab === item.id ? '#fff' : 'currentColor'} />
            {item.label}
          </button>
        ))}
      </nav>

      <div style={s.footer}>
        <button style={{ ...s.footerBtn, color: 'var(--text-secondary)' }} onClick={onDarkToggle}>
          <Icon name={dark ? 'sun' : 'moon'} size={16} />
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <button style={{ ...s.footerBtn, color: '#ef4444' }} onClick={onLogout}>
          <Icon name="logOut" size={16} color="#ef4444" />
          Log out
        </button>
      </div>
    </aside>
  )
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
function MobileTopBar({ university, onMenuOpen }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, height: 56,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="compass" size={14} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          {university?.name || 'Kampus'}
        </span>
      </div>
      <button
        onClick={onMenuOpen}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-primary)' }}
      >
        <Icon name="menu" size={22} />
      </button>
    </div>
  )
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ activeTab, setActiveTab }) {
  const items = [
    { id: 'overview',  label: 'Home',      icon: 'layers' },
    { id: 'buildings', label: 'Buildings', icon: 'building' },
    { id: 'rooms',     label: 'Rooms',     icon: 'door' },
    { id: 'link',      label: 'Link',      icon: 'link' },
    { id: 'settings',  label: 'Details',   icon: 'settings' },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      display: 'flex', height: 56,
    }}>
      {items.map(item => {
        const active = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
          >
            <Icon name={item.icon} size={18} color={active ? 'var(--accent)' : 'var(--text-tertiary)'} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, onLogout, dark, onDarkToggle }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 220, height: '100%', background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', padding: '16px 12px',
          gap: 6,
        }}
      >
        <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: 8 }}>
          <Icon name="x" size={20} />
        </button>
        <button
          onClick={() => { onDarkToggle(); onClose() }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14 }}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={16} />
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={() => { onLogout(); onClose() }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'var(--font-body)', fontSize: 14 }}
        >
          <Icon name="logOut" size={16} color="#ef4444" />
          Log out
        </button>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
      padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: accent || 'var(--accent-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={20} color="var(--accent)" />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ─── Page header ──────────────────────────────────────────────────────────────
function PageHeader({ title, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 24,
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h1>
      {action}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [university, setUniversity] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [copyPublicSuccess, setCopyPublicSuccess] = useState(false)
  const [copyEmbedSuccess, setCopyEmbedSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedBuildings, setSelectedBuildings] = useState([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [analytics, setAnalytics] = useState({
    totalBuildings: 0,
    totalRooms: 0,
    avgRoomsPerBuilding: 0,
    categoryBreakdown: {},
  })

  const { adminSession, logout, getUniversity, addBuilding, updateBuilding, deleteBuilding } = useAdminAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [dark, toggleDark] = useDarkMode()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!adminSession) { navigate('/admin/login'); return }
    loadUniversity()
  }, [adminSession, navigate])

  const loadUniversity = async () => {
    const uni = await getUniversity()
    setUniversity(uni)
    if (uni?.buildings) calculateAnalytics(uni)
  }

  const calculateAnalytics = (uni) => {
    const buildings = uni.buildings || []
    let totalRooms = 0
    const categoryBreakdown = {}
    buildings.forEach(b => {
      const ra = b.rooms
      if (Array.isArray(ra) && ra.length > 0) {
        totalRooms += (ra[0]?.count != null) ? ra[0].count : ra.length
      }
      const cat = b.category || 'Other'
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
    })
    setAnalytics({
      totalBuildings: buildings.length,
      totalRooms,
      avgRoomsPerBuilding: buildings.length > 0 ? (totalRooms / buildings.length).toFixed(1) : 0,
      categoryBreakdown,
    })
  }

  const getRoomCount = (building) => {
    const ra = building.rooms
    if (!Array.isArray(ra) || ra.length === 0) return 0
    return (ra[0]?.count != null) ? ra[0].count : ra.length
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }
  const handleAddBuilding = () => { setEditingBuilding(null); setShowModal(true) }
  const handleEditBuilding = (b) => { setEditingBuilding(b); setShowModal(true) }

  const handleSaveBuilding = async (data) => {
    if (editingBuilding) {
      const r = await updateBuilding(editingBuilding.id, data)
      if (r.success) { await loadUniversity(); setShowModal(false); setEditingBuilding(null); toast.success('Building updated!') }
      else toast.error(`Failed: ${r.error}`)
    } else {
      const r = await addBuilding(data)
      if (r.success) { await loadUniversity(); setShowModal(false); toast.success('Building added!') }
      else toast.error(`Failed: ${r.error}`)
    }
  }

  const handleDeleteBuilding = (id) => setDeleteConfirm(id)

  const confirmDelete = async () => {
    const r = await deleteBuilding(deleteConfirm)
    if (r.success) { await loadUniversity(); setDeleteConfirm(null); toast.success('Building deleted') }
    else toast.error(`Failed: ${r.error}`)
  }

  const toggleBuildingSelection = (id) =>
    setSelectedBuildings(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedBuildings(selectedBuildings.length === university.buildings.length ? [] : university.buildings.map(b => b.id))

  const handleBulkDelete = () => {
    if (!selectedBuildings.length) { toast.warning('Select at least one building'); return }
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedBuildings.map(id => deleteBuilding(id)))
      await loadUniversity()
      setSelectedBuildings([])
      setBulkDeleteConfirm(false)
      toast.success(`${selectedBuildings.length} building(s) deleted`)
    } catch (e) { toast.error(`Failed: ${e.message}`) }
  }

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/map?uni=${university.id}`)
    setCopyPublicSuccess(true)
    toast.success('Link copied!')
    setTimeout(() => setCopyPublicSuccess(false), 2000)
  }

  const getEmbedCode = () =>
    `<iframe src="${window.location.origin}/embed?uni=${university.id}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode())
    setCopyEmbedSuccess(true)
    toast.success('Embed code copied!')
    setTimeout(() => setCopyEmbedSuccess(false), 2000)
  }

  if (!university) return <PageLoader text="Loading dashboard..." />

  const recentBuildings = [...(university.buildings || [])]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 3)

  // ─── Shared layout values ──────────────────────────────────────────────────
  const sidebarW = isMobile ? 0 : 240
  const topPad = isMobile ? 56 : 0
  const bottomPad = isMobile ? 56 : 0

  const contentStyle = {
    marginLeft: sidebarW,
    paddingTop: topPad + 32,
    paddingBottom: bottomPad + 32,
    paddingLeft: 32,
    paddingRight: 32,
    minHeight: '100vh',
    background: 'var(--bg)',
    boxSizing: 'border-box',
    maxWidth: isMobile ? '100%' : 'calc(100vw - 240px)',
  }

  const card = {
    background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
  }

  // ─── Tab: Overview ─────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <div>
      <PageHeader title="Overview" action={
        <button
          onClick={handleAddBuilding}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600 }}
        >
          <Icon name="plus" size={16} color="#fff" /> Add Building
        </button>
      } />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Buildings" value={university.buildings.length} icon="building" />
        <StatCard label="Total Rooms" value={analytics.totalRooms} icon="door" />
        <StatCard label="Avg Rooms / Building" value={analytics.avgRoomsPerBuilding} icon="layers" />
        <StatCard label="Map Status" value="Active" icon="globe" />
      </div>

      {/* Quick actions */}
      <div style={{ ...card, padding: '20px 24px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'Add Building', icon: 'plus', onClick: handleAddBuilding, primary: true },
            { label: 'Manage Rooms', icon: 'door', onClick: () => setActiveTab('rooms') },
            { label: 'Get Public Link', icon: 'link', onClick: () => setActiveTab('link') },
            { label: 'View Map', icon: 'globe', onClick: () => window.open(`/map?uni=${university.id}`, '_blank') },
          ].map(a => (
            <button key={a.label} onClick={a.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
              borderRadius: 8, border: `1px solid ${a.primary ? 'var(--accent)' : 'var(--border)'}`,
              cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              background: a.primary ? 'var(--accent)' : 'transparent',
              color: a.primary ? '#fff' : 'var(--text-secondary)',
            }}>
              <Icon name={a.icon} size={14} color={a.primary ? '#fff' : 'var(--text-secondary)'} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent buildings */}
      <div style={{ ...card, padding: '20px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Recent Buildings</h2>
        {university.buildings.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, margin: 0 }}>No buildings yet. Add your first building to get started.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentBuildings.map((b, i) => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < recentBuildings.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{b.category} · {getRoomCount(b)} rooms</div>
                </div>
                <button onClick={() => handleEditBuilding(b)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ─── Tab: Buildings ────────────────────────────────────────────────────────
  const BuildingsTab = () => (
    <div>
      <PageHeader title="Buildings" action={
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedBuildings.length > 0 && (
            <button onClick={handleBulkDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
              <Icon name="trash" size={14} color="#ef4444" /> Delete ({selectedBuildings.length})
            </button>
          )}
          <button onClick={handleAddBuilding} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600 }}>
            <Icon name="plus" size={16} color="#fff" /> Add Building
          </button>
        </div>
      } />

      {university.buildings.length === 0 ? (
        <NoBuildingsState onAddBuilding={handleAddBuilding} />
      ) : (
        <>
          <div style={{ ...card, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={selectedBuildings.length === university.buildings.length}
                onChange={toggleSelectAll}
                style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
              />
              Select all ({university.buildings.length})
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {university.buildings.map(b => (
              <div key={b.id} style={{
                ...card,
                padding: '18px 20px',
                outline: selectedBuildings.includes(b.id) ? '2px solid var(--accent)' : 'none',
                outlineOffset: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 0, flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedBuildings.includes(b.id)}
                      onChange={() => toggleBuildingSelection(b.id)}
                      style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <button onClick={() => handleEditBuilding(b)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Icon name="edit" size={13} />
                    </button>
                    <button onClick={() => handleDeleteBuilding(b.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                      <Icon name="trash" size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600 }}>Category:</span> {b.category}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {b.coordinates[1].toFixed(5)}, {b.coordinates[0].toFixed(5)}
                  </div>
                  {getRoomCount(b) > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 600 }}>Rooms:</span> {getRoomCount(b)}
                    </div>
                  )}
                  {b.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{b.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )

  // ─── Tab: Rooms ────────────────────────────────────────────────────────────
  const RoomsTab = () => (
    <div>
      <PageHeader title="Rooms" />
      {university.buildings.length === 0 ? (
        <div style={{ ...card, padding: '48px 32px', textAlign: 'center' }}>
          <Icon name="building" size={36} color="var(--text-tertiary)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0 8px' }}>No Buildings Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px' }}>Add buildings before managing rooms.</p>
          <button onClick={handleAddBuilding} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Add First Building
          </button>
        </div>
      ) : (
        <RoomManagement
          universityId={university.id}
          buildings={university.buildings}
          onClose={() => setActiveTab('overview')}
        />
      )}
    </div>
  )

  // ─── Tab: Public Link ──────────────────────────────────────────────────────
  const LinkTab = () => {
    const publicUrl = `${window.location.origin}/map?uni=${university.id}`
    return (
      <div>
        <PageHeader title="Public Link" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
          <div style={{ ...card, padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Map URL</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px' }}>Share this link with students. No login required.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={publicUrl}
                readOnly
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
              />
              <button onClick={copyPublicLink} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: copyPublicSuccess ? '#22c55e' : 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <Icon name={copyPublicSuccess ? 'check' : 'copy'} size={14} color="#fff" />
                {copyPublicSuccess ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>

          <div style={{ ...card, padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Embed Code</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px' }}>Embed the map directly on your website.</p>
            <div style={{ position: 'relative' }}>
              <pre style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {getEmbedCode()}
              </pre>
              <button onClick={copyEmbedCode} style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: copyEmbedSuccess ? '#22c55e' : 'var(--surface)', color: copyEmbedSuccess ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <Icon name={copyEmbedSuccess ? 'check' : 'copy'} size={12} color={copyEmbedSuccess ? '#fff' : 'var(--text-secondary)'} />
                {copyEmbedSuccess ? 'Copied!' : 'Copy code'}
              </button>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ─── Tab: Settings ─────────────────────────────────────────────────────────
  const DetailsTab = () => (
    <div>
      <PageHeader title="University Details" action={
        <button onClick={() => setShowSettingsModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>
          <Icon name="settings" size={14} /> Settings
        </button>
      } />
      <div style={{ ...card, padding: '24px', maxWidth: 520 }}>
        {[
          { label: 'University Name', value: university.name },
          { label: 'City', value: university.city },
          { label: 'Admin Email', value: university.admin_email },
          { label: 'University ID', value: university.id, mono: true },
          { label: 'Created', value: new Date(university.created_at).toLocaleString() },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
            padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0, minWidth: 140 }}>{row.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, fontFamily: row.mono ? 'monospace' : undefined, wordBreak: 'break-all', textAlign: 'right' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const tabMap = {
    overview: <OverviewTab />,
    buildings: <BuildingsTab />,
    rooms: <RoomsTab />,
    link: <LinkTab />,
    settings: <DetailsTab />,
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          university={university}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          dark={dark}
          onDarkToggle={toggleDark}
        />
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <MobileTopBar university={university} onMenuOpen={() => setShowMobileMenu(true)} />
      )}

      {/* Mobile drawer */}
      <MobileDrawer
        open={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onLogout={handleLogout}
        dark={dark}
        onDarkToggle={toggleDark}
      />

      {/* Main content */}
      <main style={contentStyle}>
        {tabMap[activeTab]}
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Building form modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditingBuilding(null) }}>
          <BuildingForm
            building={editingBuilding}
            onSave={handleSaveBuilding}
            onCancel={() => { setShowModal(false); setEditingBuilding(null) }}
          />
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div style={{ padding: '8px 4px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>Delete Building?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk delete confirm modal */}
      {bulkDeleteConfirm && (
        <Modal onClose={() => setBulkDeleteConfirm(false)}>
          <div style={{ padding: '8px 4px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>Delete {selectedBuildings.length} Building{selectedBuildings.length > 1 ? 's' : ''}?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>This will also delete all associated rooms. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setBulkDeleteConfirm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={confirmBulkDelete} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Delete All</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin settings modal */}
      {showSettingsModal && (
        <AdminSettings
          onClose={() => setShowSettingsModal(false)}
          adminSession={adminSession}
          onLogout={handleLogout}
          onUniversityUpdate={(patch) => setUniversity(prev => prev ? { ...prev, ...patch } : prev)}
          dark={dark}
          onDarkToggle={toggleDark}
        />
      )}
    </div>
  )
}

export default AdminDashboard
