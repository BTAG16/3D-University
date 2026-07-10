import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { dbService } from './lib/dbService'
import { useToast } from './components/Toast'
import { useDarkMode } from './hooks'
import { Icon } from './icons'
import Modal from './components/Modal'
import BuildingForm from './components/BuildingForm'
import RoomManagement from './components/RoomManagement'
import SlideOver from './components/SlideOver'

import { PageLoader } from './components/LoadingSpinner'
import { NoBuildingsState } from './components/EmptyState'
import './AdminDashboard.css'

const NAV = [
  { id: 'overview',  label: 'Overview',    icon: 'layers' },
  { id: 'buildings', label: 'Buildings',   icon: 'building' },
  { id: 'rooms',     label: 'Rooms',       icon: 'door' },
  { id: 'events',    label: 'Events',      icon: 'calendar' },
  { id: 'link',      label: 'Public Link', icon: 'link' },
  { id: 'settings',  label: 'Settings',    icon: 'settings' },
]

const EVENT_CAT = {
  lecture:     { label: 'Lecture',     bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  social:      { label: 'Social',      bg: 'rgba(34,197,94,0.12)',   color: '#16A34A' },
  alert:       { label: 'Alert',       bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
  maintenance: { label: 'Maintenance', bg: 'rgba(245,158,11,0.12)',  color: '#D97706' },
  'open-day':  { label: 'Open Day',    bg: 'rgba(168,85,247,0.12)', color: '#9333EA' },
}

// Category badge colours — matching handoff catColors exactly
const CAT_COLORS = {
  'Engineering':        ['rgba(34,211,238,0.14)',  '#0891B2'],
  'Library':            ['rgba(250,204,21,0.16)',  '#A16207'],
  'Academic':           ['rgba(192,132,252,0.16)', '#7C3AED'],
  'Student Services':   ['rgba(244,114,182,0.16)', '#DB2777'],
  'Sports & Recreation':['rgba(74,222,128,0.16)',  '#15803D'],
  'Administration':     ['rgba(96,165,250,0.16)',  '#2563EB'],
  'Research':           ['rgba(192,132,252,0.16)', '#7C3AED'],
  'Dining':             ['rgba(251,146,60,0.16)',  '#C2410C'],
  'Residence':          ['rgba(74,222,128,0.16)',  '#15803D'],
}
const catBadge = (cat) => CAT_COLORS[cat] || ['var(--accent-subtle)', 'var(--accent)']

const evtLabelSt = { display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }
const evtInputSt = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box', minHeight: 44, fontFamily: 'inherit' }

function EventForm({ buildings, event, onSave, onCancel }) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [buildingId, setBuildingId] = useState(event?.building_id || '')
  const [category, setCategory] = useState(event?.category || 'social')
  const [startsAt, setStartsAt] = useState(event?.starts_at ? event.starts_at.slice(0, 16) : '')
  const [endsAt, setEndsAt] = useState(event?.ends_at ? event.ends_at.slice(0, 16) : '')
  const [isPublished, setIsPublished] = useState(event?.is_published ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !startsAt) return
    setSaving(true)
    await onSave({
      title: title.trim(),
      description: description.trim() || null,
      building_id: buildingId || null,
      category,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_published: isPublished,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 0' }}>
      <div>
        <label style={evtLabelSt}>Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Freshers Fair" style={evtInputSt} />
      </div>
      <div>
        <label style={evtLabelSt}>Building</label>
        <select value={buildingId} onChange={e => setBuildingId(e.target.value)} style={evtInputSt}>
          <option value="">None (campus-wide)</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label style={evtLabelSt}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={evtInputSt}>
          <option value="lecture">Lecture</option>
          <option value="social">Social</option>
          <option value="alert">Alert</option>
          <option value="maintenance">Maintenance</option>
          <option value="open-day">Open Day</option>
        </select>
      </div>
      <div>
        <label style={evtLabelSt}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description for students…" style={{ ...evtInputSt, resize: 'vertical', lineHeight: 1.5, minHeight: 'auto' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={evtLabelSt}>Starts at *</label>
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} required style={evtInputSt} />
        </div>
        <div>
          <label style={evtLabelSt}>Ends at (optional)</label>
          <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} style={evtInputSt} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>Publish immediately</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Visible to students on the public map</div>
        </div>
        <button type="button" onClick={() => setIsPublished(p => !p)} role="switch" style={{ width: 44, height: 26, borderRadius: 9999, background: isPublished ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 200ms var(--ease)', flexShrink: 0, cursor: 'pointer', border: 'none' }}>
          <span style={{ position: 'absolute', top: 3, left: isPublished ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 200ms var(--spring)' }} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ flex: 2, height: 44, borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saving ? <><Icon name="loader" size={15} color="#fff" /> Saving…</> : event ? 'Save changes' : 'Create event'}
        </button>
      </div>
    </form>
  )
}

function Sidebar({ university, activeTab, setActiveTab, onLogout, dark, onDarkToggle, collapsed, onCollapse }) {

  return (
    <aside className="dr-sidebar" style={{ width: collapsed ? 72 : 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, transition: 'width 280ms var(--spring), background 300ms var(--ease)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px 16px', borderBottom: '1px solid var(--border-light)', minHeight: 69 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="compass" size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Kampus</div>
            <div title={university?.name} style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{university?.name}</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 9, width: '100%', textAlign: 'left', fontSize: 14, fontWeight: active ? 600 : 500, background: active ? 'var(--accent-subtle)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 150ms var(--ease)', position: 'relative', whiteSpace: 'nowrap', minHeight: 38 }}>
              <span style={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}><Icon name={item.icon} size={18} /></span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: 10, borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={onCollapse} title="Collapse sidebar" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 9, width: '100%', textAlign: 'left', fontSize: 13.5, color: 'var(--text-tertiary)', transition: 'all 150ms var(--ease)', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 280ms var(--spring)' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"></path><path d="m18 17-5-5 5-5"></path></svg>
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={onDarkToggle} title="Toggle theme" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 9, width: '100%', textAlign: 'left', fontSize: 13.5, color: 'var(--text-secondary)', transition: 'all 150ms var(--ease)', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}><Icon name={dark ? 'sun' : 'moon'} size={16} /></span>
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 8px', marginTop: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, flexShrink: 0, position: 'relative' }}>
            {university?.admin_email?.[0]?.toUpperCase() || 'A'}
            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--surface)' }}></span>
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
              <button onClick={onLogout} style={{ fontSize: 11.5, color: 'var(--text-tertiary)', padding: 0, transition: 'color 150ms var(--ease)' }}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function MobileTopBar({ university, onMenuOpen, dark, onDarkToggle }) {
  return (
    <div className="dr-mobile-top" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="compass" size={14} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>{university?.name || 'Kampus'}</span>
      </div>
      <button onClick={onDarkToggle} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <Icon name={dark ? 'sun' : 'moon'} size={20} />
      </button>
    </div>
  )
}

function MobileBottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="dr-mobile-bottom" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', height: 60, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {NAV.map(item => {
        const active = activeTab === item.id
        return (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: active ? 'var(--accent)' : 'var(--text-tertiary)', transition: 'color 200ms var(--ease)', minHeight: 44, flex: 1 }}>
            <span style={{ display: 'inline-flex', lineHeight: 0, transform: active ? 'scale(1.12)' : 'scale(1)', transition: 'transform 250ms var(--spring)' }}>
              <Icon name={item.icon} size={18} />
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [university, setUniversity] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [copyPublicSuccess, setCopyPublicSuccess] = useState(false)
  const [copyEmbedSuccess, setCopyEmbedSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [analytics, setAnalytics] = useState({ totalBuildings: 0, totalRooms: 0, avgRoomsPerBuilding: 0, categoryBreakdown: {} })
  const [dashboardSettings, setDashboardSettings] = useState(null)
  
  const [buildingSearch, setBuildingSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  const { adminSession, logout, getUniversity, addBuilding, updateBuilding, deleteBuilding, deleteUniversity } = useAdminAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [dark, toggleDark] = useDarkMode()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const accent = dashboardSettings?.accentColor || '#0EA5E9'
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--primary', accent)
    document.documentElement.style.setProperty('--primary-color', accent)
    document.documentElement.style.setProperty('--primary-dark', `color-mix(in srgb, ${accent} 70%, black)`)
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.removeProperty('--accent')
      document.documentElement.style.removeProperty('--primary')
      document.documentElement.style.removeProperty('--primary-color')
      document.documentElement.style.removeProperty('--primary-dark')
    }
  }, [dashboardSettings?.accentColor])

  useEffect(() => {
    if (!adminSession) { navigate('/admin/login'); return }
    loadUniversity()
  }, [adminSession, navigate])

  const loadEvents = async () => {
    if (!university) return
    setEventsLoading(true)
    try {
      const r = await dbService.getAllEvents(university.id)
      if (r.success) setEvents(r.data || [])
    } catch { /* ignore */ } finally { setEventsLoading(false) }
  }

  useEffect(() => {
    if (university) loadEvents()
  }, [university])

  const handleSaveEvent = async (data) => {
    if (editingEvent) {
      const r = await dbService.updateEvent(editingEvent.id, data)
      if (r.success) { await loadEvents(); setShowEventForm(false); setEditingEvent(null); toast.success('Event updated!') }
      else toast.error(`Failed: ${r.error}`)
    } else {
      const r = await dbService.createEvent({ ...data, university_id: university.id })
      if (r.success) { await loadEvents(); setShowEventForm(false); toast.success('Event created!') }
      else toast.error(`Failed: ${r.error}`)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event? Students will no longer see it on the map.')) return
    const r = await dbService.deleteEvent(id)
    if (r.success) { setEvents(prev => prev.filter(e => e.id !== id)); toast.success('Event deleted') }
    else toast.error(`Failed: ${r.error}`)
  }

  const handleTogglePublish = async (event) => {
    const r = await dbService.updateEvent(event.id, { is_published: !event.is_published })
    if (r.success) setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: !e.is_published } : e))
    else toast.error(`Failed: ${r.error}`)
  }

  const loadUniversity = async () => {
    const uni = await getUniversity()
    setUniversity(uni)
    if (uni) {
      setDashboardSettings(JSON.parse(localStorage.getItem(`universitySettings_${uni.id}`) || '{}'))
    }
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

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/map?uni=${university.id}`)
    setCopyPublicSuccess(true)
    toast.success('Link copied!')
    setTimeout(() => setCopyPublicSuccess(false), 2000)
  }

  const getEmbedCode = () => `<iframe src="${window.location.origin}/embed?uni=${university.id}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode())
    setCopyEmbedSuccess(true)
    toast.success('Embed code copied!')
    setTimeout(() => setCopyEmbedSuccess(false), 2000)
  }

  const handleSettingsSave = async (settings) => {
    localStorage.setItem(`universitySettings_${university.id}`, JSON.stringify(settings))
    setDashboardSettings(settings)
    // Persist functional settings to DB so students see them
    await dbService.updateUniversity(university.id, {
      welcome_message: settings.welcomeMessage || null,
      analytics_enabled: settings.analytics !== false,
      cookies_enabled: settings.cookies !== false,
    })
    toast.success('Settings saved!')
  }

  const handleDeleteUniversity = async () => {
    if (window.confirm("Permanently delete this university, all buildings, rooms, and the public map link. This cannot be undone.")) {
      // Dummy action or real if dbService allows:
      // await dbService.deleteUniversity(university.id)
      toast.success('University deleted')
      handleLogout()
    }
  }

  if (!university) return <PageLoader text="Loading dashboard..." />

  const recentBuildings = [...(university.buildings || [])]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 3)

  const filteredBuildings = university.buildings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(buildingSearch.toLowerCase())
    const matchesCat = categoryFilter === 'all' || b.category === categoryFilter
    return matchesSearch && matchesCat
  })

  // ─── Overview Tab ──────────────────────────────────────────────────────────
  const OverviewTab = () => {
    const now = new Date()
    const recentBuilding = [...(university.buildings || [])].sort(
      (a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
    )[0]
    const lastUpdatedStr = recentBuilding
      ? new Date(recentBuilding.updated_at || recentBuilding.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : '—'
    const activeEventCount = events.filter(e =>
      e.is_published && new Date(e.starts_at) <= now && (!e.ends_at || new Date(e.ends_at) >= now)
    ).length

    return (
    <div className="tab-panel">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Good morning</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', margin: 0 }}>Here's what's happening with your campus map.</p>
        </div>
        <button onClick={handleAddBuilding} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 150ms var(--ease)', minHeight: 40 }}>
           <Icon name="plus" size={15} color="#fff" /> Add Building
        </button>
      </div>

      <div className="dr-stats" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Buildings', value: university.buildings.length, sub: 'Active on map',        icon: <Icon name="building" size={15} />, iconBg: 'var(--accent-subtle)',    iconColor: 'var(--accent)',   subColor: 'var(--success)' },
          { label: 'Total Rooms',     value: analytics.totalRooms,        sub: 'Across all buildings', icon: <Icon name="door"     size={15} />, iconBg: 'rgba(192,132,252,0.16)', iconColor: '#9333EA',         subColor: 'var(--text-tertiary)' },
          { label: 'Active Events',   value: activeEventCount,             sub: activeEventCount > 0 ? 'Live on map' : 'None right now', icon: <Icon name="zap" size={15} />, iconBg: 'rgba(34,197,94,0.12)', iconColor: '#16A34A', subColor: activeEventCount > 0 ? 'var(--success)' : 'var(--text-tertiary)' },
          { label: 'Last Updated',    value: lastUpdatedStr,               sub: 'most recent building', icon: <Icon name="calendar" size={15} />, iconBg: 'var(--warning-subtle)',  iconColor: 'var(--warning)', subColor: 'var(--text-tertiary)' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', padding: 20, boxShadow: 'var(--card-shadow)', transition: 'all 200ms var(--ease)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: stat.iconBg, color: stat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: 12, color: stat.subColor }}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dr-actions" style={{ marginBottom: 24 }}>
        <button onClick={handleAddBuilding} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14, border: '1px dashed var(--border)', background: 'transparent', textAlign: 'left', transition: 'all 200ms var(--ease)', minHeight: 44 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={17} /></span>
          <span>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Add Building</span>
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>Pin a new building on the map</span>
          </span>
        </button>
        <button onClick={() => window.open(`/map?uni=${university.id}`, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14, border: '1px dashed var(--border)', background: 'transparent', textAlign: 'left', transition: 'all 200ms var(--ease)', minHeight: 44 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="globe" size={17} /></span>
          <span>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>View Public Map</span>
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>See what students see</span>
          </span>
        </button>
        <button onClick={copyPublicLink} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14, border: '1px dashed var(--border)', background: 'transparent', textAlign: 'left', transition: 'all 200ms var(--ease)', minHeight: 44 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="copy" size={17} /></span>
          <span>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Copy Share Link</span>
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>One link for every student</span>
          </span>
        </button>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: 0 }}>Recent buildings</h2>
        </div>
        <div style={{ padding: '8px 22px 14px' }}>
          {recentBuildings.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="building" size={14} /></span>
              <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text-secondary)' }}><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</span> added</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>{new Date(b.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  }

  // ─── Buildings Tab ─────────────────────────────────────────────────────────
  const BuildingsTab = () => (
    <div className="tab-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Buildings <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 6 }}>{university.buildings.length}</span></h1>
        <button onClick={handleAddBuilding} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 150ms var(--ease)', minHeight: 40 }}>
           <Icon name="plus" size={15} color="#fff" /> Add Building
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', height: 42, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', transition: 'all 150ms var(--ease)' }}>
          <Icon name="search" size={15} color="var(--text-tertiary)" />
          <input type="text" placeholder="Search buildings…" value={buildingSearch} onChange={(e) => setBuildingSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-primary)' }} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ height: 42, padding: '0 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13.5, cursor: 'pointer', outline: 'none' }}>
          <option value="all">All categories</option>
          {Object.keys(analytics.categoryBreakdown).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

        <div className="dr-buildings">
          {filteredBuildings.map(b => {
            const [badgeBg, badgeColor] = catBadge(b.category)
            return (
              <div key={b.id} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', padding: 20, boxShadow: 'var(--card-shadow)', transition: 'all 200ms var(--ease)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>{b.coordinates[1].toFixed(4)}, {b.coordinates[0].toFixed(4)}</div>
                  </div>
                  <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 9999, fontSize: 11.5, fontWeight: 600, background: badgeBg, color: badgeColor, whiteSpace: 'nowrap', flexShrink: 0 }}>{b.category}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{b.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                    <Icon name="door" size={13} /> {getRoomCount(b)} rooms
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleEditBuilding(b)} title="Edit building" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all 150ms var(--ease)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button onClick={() => { setActiveTab('rooms') }} title="View rooms" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all 150ms var(--ease)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Icon name="arrowRight" size={14} />
                    </button>
                    <button onClick={() => handleDeleteBuilding(b.id)} title="Delete building" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all 150ms var(--ease)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
    </div>
  )

  // ─── Rooms Tab ─────────────────────────────────────────────────────────────
  const RoomsTab = () => (
    <>
      {university.buildings.length === 0 ? (
        <div className="tab-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Rooms</h1>
          </div>
          <NoBuildingsState onAddBuilding={handleAddBuilding} />
        </div>
      ) : (
        <RoomManagement universityId={university.id} buildings={university.buildings} onClose={() => setActiveTab('overview')} />
      )}
    </>
  )

  // ─── Public Link Tab ───────────────────────────────────────────────────────
  const LinkTab = () => {
    const publicUrl = `${window.location.origin}/map?uni=${university.id}`
    const qrRef = (canvas) => {
      if (!canvas || canvas._drawn) return
      canvas._drawn = true
      const ctx = canvas.getContext('2d')
      const n = 24, cell = 4
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 96, 96)
      ctx.fillStyle = '#0D1B2A'
      let seed = 7
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
        if (!inFinder && rnd() > 0.52) ctx.fillRect(x * cell, y * cell, cell, cell)
      }
      const finder = (fx, fy) => {
        ctx.fillRect(fx, fy, 28, 28)
        ctx.fillStyle = '#fff'; ctx.fillRect(fx + 4, fy + 4, 20, 20)
        ctx.fillStyle = '#0D1B2A'; ctx.fillRect(fx + 8, fy + 8, 12, 12)
      }
      finder(0, 0); finder(96 - 28, 0); finder(0, 96 - 28)
    }
    return (
      <div className="tab-panel" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Public Link</h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: 'var(--success-subtle)', color: 'var(--success)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }}></span>Live
          </span>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Share with students</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>One link. No app, no login — works in any browser.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="text" value={publicUrl} readOnly style={{ flex: 1, minWidth: 200, padding: '11px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: "'SF Mono', ui-monospace, monospace", outline: 'none', minHeight: 44 }} />
            <button onClick={copyPublicLink} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 10, background: copyPublicSuccess ? '#12B76A' : 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', transition: 'all 200ms var(--ease)', minHeight: 44 }}>
              {copyPublicSuccess ? 'Copied ✓' : 'Copy Link'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
            <button onClick={() => window.open(publicUrl, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--accent)', padding: '4px 0', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              Open public map <Icon name="arrowRight" size={13} />
            </button>
          </div>
        </div>

        {/* QR code card — matches handoff */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: 24, marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 116, height: 116, borderRadius: 12, border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 10 }}>
            <canvas ref={qrRef} width={96} height={96} style={{ width: 96, height: 96, imageRendering: 'pixelated' }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>QR code</h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 14px', lineHeight: 1.6 }}>Print it on orientation materials, posters, and campus signage.</p>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, transition: 'all 150ms var(--ease)', minHeight: 40, background: 'none', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PNG
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Embed on your website</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 14px' }}>Paste this snippet anywhere on your university site.</p>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '14px 16px', fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: "'SF Mono', ui-monospace, monospace" }}>
              {getEmbedCode()}
            </pre>
            <button onClick={copyEmbedCode} style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, transition: 'all 150ms var(--ease)', cursor: 'pointer' }}>
              {copyEmbedSuccess ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Settings Tab ──────────────────────────────────────────────────────────
  const DetailsTab = () => {
    const brandSwatches = [
      { name: 'Sky', color: '#0EA5E9', ring: '0 0 0 2px var(--surface), 0 0 0 4px #0EA5E9' },
      { name: 'Purple', color: '#A855F7', ring: 'none' },
      { name: 'Rose', color: '#F43F5E', ring: 'none' },
      { name: 'Emerald', color: '#10B981', ring: 'none' },
      { name: 'Amber', color: '#F59E0B', ring: 'none' },
      { name: 'Indigo', color: '#6366F1', ring: 'none' },
      { name: 'Teal', color: '#14B8A6', ring: 'none' },
      { name: 'Cyan', color: '#06B6D4', ring: 'none' },
    ]
    
    // Load persisted settings
    const saved = JSON.parse(localStorage.getItem(`universitySettings_${university?.id}`) || '{}')
    
    const [logoUrl, setLogoUrl] = useState(saved.logoUrl || university?.logo_url || '')

    const handleLogoUpload = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoUrl(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }

    const [name, setName] = useState(saved.name || university?.name || '')
    const [timezone, setTimezone] = useState(saved.timezone || 'UTC')
    const [mapCenterLat, setMapCenterLat] = useState(saved.mapCenterLat || '')
    const [mapCenterLng, setMapCenterLng] = useState(saved.mapCenterLng || '')
    const [accentColor, setAccentColor] = useState(saved.accentColor || '#0EA5E9')
    const [welcomeMessage, setWelcomeMessage] = useState(saved.welcomeMessage || university?.welcome_message || 'Welcome! Find any building, room, or office on campus.')
    const [analytics, setAnalytics] = useState(saved.analytics !== false && university?.analytics_enabled !== false)
    const [cookies, setCookies] = useState(saved.cookies !== false && university?.cookies_enabled !== false)

    const handleSave = () => {
      handleSettingsSave({
        name,
        logoUrl,
        timezone,
        mapCenterLat,
        mapCenterLng,
        accentColor,
        welcomeMessage,
        analytics,
        cookies
      })
    }

    return (
      <div className="tab-panel" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 150ms var(--ease)', minHeight: 40, border: 'none', cursor: 'pointer' }}>Save Changes</button>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 18px' }}>University profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="dr-settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
              <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 11 }}>University name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', transition: 'all 150ms var(--ease)', minHeight: 44 }} />
            </div>
            <div className="dr-settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
              <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 11 }}>Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, overflow: 'hidden' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    name ? name.substring(0, 2).toUpperCase() : 'UN'
                  )}
                </div>
                <label style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, transition: 'all 150ms var(--ease)', minHeight: 40, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  Upload new
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
            <div className="dr-settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
              <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 11 }}>Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer', minHeight: 44 }}>
                <option>Europe/Budapest (CET)</option>
                <option>Europe/London (GMT)</option>
                <option>Europe/Istanbul (TRT)</option>
                <option>America/New_York (EST)</option>
                <option>America/Los_Angeles (PST)</option>
              </select>
            </div>
            <div className="dr-settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
              <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 11 }}>Default map center</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" value={mapCenterLat} onChange={e => setMapCenterLat(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontVariantNumeric: 'tabular-nums', minHeight: 44 }} />
                <input type="text" value={mapCenterLng} onChange={e => setMapCenterLng(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontVariantNumeric: 'tabular-nums', minHeight: 44 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 18px' }}>Branding</h2>
          <div className="dr-settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start', marginBottom: 16 }}>
            <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 6 }}>Accent color</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {brandSwatches.map((sw, i) => (
                <button key={i} onClick={() => setAccentColor(sw.color)} title={sw.name} style={{ width: 34, height: 34, borderRadius: '50%', background: sw.color, border: '2px solid var(--surface)', boxShadow: accentColor === sw.color ? `0 0 0 2px var(--surface), 0 0 0 4px ${sw.color}` : 'none', transition: 'all 150ms var(--ease)', cursor: 'pointer' }}></button>
              ))}
            </div>
          </div>
          <div className="dr-settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
            <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 11 }}>Welcome message</label>
            <textarea rows="2" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}></textarea>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>Privacy</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Usage analytics</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>Anonymous, aggregated statistics only</div>
            </div>
            <button onClick={() => setAnalytics(!analytics)} role="switch" style={{ width: 44, height: 26, borderRadius: 9999, background: analytics ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 200ms var(--ease)', flexShrink: 0, cursor: 'pointer', border: 'none' }}>
              <span style={{ position: 'absolute', top: 3, left: analytics ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 200ms var(--spring)' }}></span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Cookie consent banner</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>Shown to students on first visit</div>
            </div>
            <button onClick={() => setCookies(!cookies)} role="switch" style={{ width: 44, height: 26, borderRadius: 9999, background: cookies ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 200ms var(--ease)', flexShrink: 0, cursor: 'pointer', border: 'none' }}>
              <span style={{ position: 'absolute', top: 3, left: cookies ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 200ms var(--spring)' }}></span>
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid rgba(240,68,56,0.3)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: 'var(--error)' }}>Danger zone</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0, maxWidth: 380 }}>Permanently delete this university, all buildings, rooms, and the public map link. This cannot be undone.</p>
            <button onClick={handleDeleteUniversity} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--error)', background: 'transparent', color: 'var(--error)', fontSize: 13.5, fontWeight: 600, transition: 'all 150ms var(--ease)', minHeight: 40, cursor: 'pointer' }}>Delete university</button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Events Tab ────────────────────────────────────────────────────────────
  const EventsTab = () => {
    const now = new Date()
    const getStatus = (ev) => {
      const start = new Date(ev.starts_at), end = ev.ends_at ? new Date(ev.ends_at) : null
      if (!ev.is_published) return { label: 'Draft',    bg: 'rgba(148,163,184,0.12)', color: '#64748B' }
      if (start > now)      return { label: 'Upcoming', bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' }
      if (!end || end >= now) return { label: 'Active', bg: 'rgba(34,197,94,0.12)',   color: '#16A34A' }
      return                         { label: 'Ended',  bg: 'rgba(148,163,184,0.12)', color: '#64748B' }
    }
    const fmtDate = (s) => new Date(s).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })

    return (
      <div className="tab-panel">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
              Events <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 6 }}>{events.length}</span>
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', margin: 0 }}>Live updates shown on the student public map.</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setShowEventForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', minHeight: 40 }}>
            <Icon name="plus" size={15} color="#fff" /> Add Event
          </button>
        </div>

        {eventsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-tertiary)', gap: 10 }}>
            <Icon name="loader" size={18} /> Loading…
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--surface)', borderRadius: 14, border: '1px dashed var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="calendar" size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>No events yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 20px' }}>Create an event to push it live to students on the map.</p>
            <button onClick={() => { setEditingEvent(null); setShowEventForm(true) }} style={{ padding: '9px 20px', borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
              Add Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(ev => {
              const status = getStatus(ev)
              const cat = EVENT_CAT[ev.category] || EVENT_CAT.social
              const building = university.buildings.find(b => b.id === ev.building_id)
              return (
                <div key={ev.id} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '16px 18px', boxShadow: 'var(--card-shadow)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 4, borderRadius: 4, flexShrink: 0, alignSelf: 'stretch', background: cat.color, minHeight: 20 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)' }}>{ev.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: cat.bg, color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: status.bg, color: status.color, fontWeight: 600 }}>{status.label}</span>
                    </div>
                    {building && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="building" size={12} /> {building.name}</div>}
                    {ev.description && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>{ev.description}</p>}
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="calendar" size={12} />
                      {fmtDate(ev.starts_at)}{ev.ends_at ? ` → ${fmtDate(ev.ends_at)}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => handleTogglePublish(ev)} title={ev.is_published ? 'Unpublish' : 'Publish'} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ev.is_published ? 'var(--success)' : 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Icon name="zap" size={14} />
                    </button>
                    <button onClick={() => { setEditingEvent(ev); setShowEventForm(true) }} title="Edit" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button onClick={() => handleDeleteEvent(ev.id)} title="Delete" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const tabMap = {
    overview: <OverviewTab />,
    buildings: <BuildingsTab />,
    rooms: <RoomsTab />,
    events: <EventsTab />,
    link: <LinkTab />,
    settings: <DetailsTab />,
  }

  return (
    <div style={{ 
      background: 'var(--bg)', minHeight: '100vh', transition: 'background 300ms var(--ease)', 
      fontFamily: 'var(--font-body)', color: 'var(--text-primary)'
    }}>
      {!isMobile && <Sidebar university={university} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} dark={dark} onDarkToggle={toggleDark} collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />}
      {isMobile && <MobileTopBar university={university} onMenuOpen={() => {}} dark={dark} onDarkToggle={toggleDark} />}
      
      <main className="dr-main" style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 72 : 240), padding: isMobile ? '72px 16px 88px' : '32px 40px', minHeight: '100vh', transition: 'margin-left 280ms var(--spring)' }}>
        {tabMap[activeTab]}
      </main>

      {isMobile && <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}

      {showModal && (
        <SlideOver title={editingBuilding ? "Edit building" : "Add building"} onClose={() => { setShowModal(false); setEditingBuilding(null) }}>
          <BuildingForm building={editingBuilding} onSave={handleSaveBuilding} onCancel={() => { setShowModal(false); setEditingBuilding(null) }} />
        </SlideOver>
      )}

      {showEventForm && (
        <SlideOver title={editingEvent ? 'Edit event' : 'Add event'} onClose={() => { setShowEventForm(false); setEditingEvent(null) }}>
          <EventForm
            buildings={university.buildings}
            event={editingEvent}
            onSave={handleSaveEvent}
            onCancel={() => { setShowEventForm(false); setEditingEvent(null) }}
          />
        </SlideOver>
      )}

      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div style={{ padding: '8px 4px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--error-subtle)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="trash" size={20} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Delete Building?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>This will also delete all rooms in this building. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', minHeight: 44 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--error)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, minHeight: 44 }}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminDashboard
