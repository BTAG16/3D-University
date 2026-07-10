import { useRef, useEffect, useState } from 'react'
import { Icon } from '../icons'

// Renders at this virtual size then CSS-scaled to fit the container
const SIM_W = 860
const SIM_H = 490

// ─── Shared demo data ─────────────────────────────────────────────────────────

const EVENT_CAT = {
  lecture:     { label: 'Lecture',     bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  social:      { label: 'Social',      bg: 'rgba(34,197,94,0.12)',   color: '#16A34A' },
  alert:       { label: 'Alert',       bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
  maintenance: { label: 'Maintenance', bg: 'rgba(245,158,11,0.12)',  color: '#D97706' },
  'open-day':  { label: 'Open Day',    bg: 'rgba(168,85,247,0.12)', color: '#9333EA' },
}

const CAT_COLORS = {
  'Engineering':    ['rgba(34,211,238,0.14)',  '#0891B2'],
  'Library':        ['rgba(250,204,21,0.16)',  '#A16207'],
  'Academic':       ['rgba(192,132,252,0.16)', '#7C3AED'],
  'Administration': ['rgba(96,165,250,0.16)',  '#2563EB'],
  'Residence':      ['rgba(74,222,128,0.16)',  '#15803D'],
}
const catBadge = (cat) => CAT_COLORS[cat] || ['var(--accent-subtle)', 'var(--accent)']

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    icon: 'layers' },
  { id: 'buildings', label: 'Buildings',   icon: 'building' },
  { id: 'rooms',     label: 'Rooms',       icon: 'door' },
  { id: 'events',    label: 'Events',      icon: 'calendar' },
  { id: 'link',      label: 'Public Link', icon: 'link' },
  { id: 'settings',  label: 'Settings',    icon: 'settings' },
]

const DEMO_BUILDINGS = [
  { name: 'Administration Building', category: 'Administration', rooms: 12, desc: 'Main admin offices including Registrar, Financial Aid, and Student Services.', coords: '51.5246, -0.1340' },
  { name: 'University Library',      category: 'Library',        rooms: 24, desc: 'Central library with study spaces, computer labs, and extensive book collection.', coords: '51.5238, -0.1310' },
  { name: 'Student Dormitory',       category: 'Residence',      rooms: 48, desc: 'On-campus housing with modern amenities and comfortable common areas.', coords: '51.5260, -0.1360' },
  { name: 'Engineering Block',       category: 'Engineering',    rooms: 31, desc: 'Science and engineering labs, lecture theatres, and faculty offices.', coords: '51.5215, -0.1305' },
]

const DEMO_ROOMS = [
  { number: 'A101', name: 'Main Reading Room',  type: 'Library Hall', isOffice: false, hasSchedule: false },
  { number: 'A102', name: 'Computer Lab A',     type: 'Computer Lab', isOffice: false, hasSchedule: true  },
  { number: 'A201', name: 'Head Librarian',     type: 'Office',       isOffice: true,  hasSchedule: false },
  { number: 'B101', name: 'Quiet Study Zone',   type: 'Study Area',   isOffice: false, hasSchedule: false },
  { number: 'B102', name: 'Group Study Room 1', type: 'Study Room',   isOffice: false, hasSchedule: true  },
  { number: 'B103', name: 'Seminar Room A',     type: 'Seminar Room', isOffice: false, hasSchedule: true  },
]

const DEMO_EVENTS = [
  { title: 'Freshers Fair 2026',          category: 'open-day',    building: 'Student Union',      startsAt: '10 Sep 2026, 09:00', endsAt: '10 Sep 2026, 17:00', isPublished: true,  status: 'upcoming', desc: 'Annual welcome event for all new students across campus.' },
  { title: 'CS Lecture: ML Fundamentals', category: 'lecture',     building: 'Engineering Block',  startsAt: '10 Jul 2026, 14:00', endsAt: '10 Jul 2026, 16:00', isPublished: true,  status: 'active',   desc: null },
  { title: 'Library Maintenance',         category: 'maintenance', building: 'University Library', startsAt: '12 Jul 2026, 08:00', endsAt: '12 Jul 2026, 18:00', isPublished: true,  status: 'upcoming', desc: 'Library closed for scheduled maintenance.' },
  { title: 'Student Welcome Party',       category: 'social',      building: null,                 startsAt: '05 Jul 2026, 19:00', endsAt: '05 Jul 2026, 22:00', isPublished: false, status: 'ended',    desc: null },
]

// ─── Shared sidebar ───────────────────────────────────────────────────────────

function SimSidebar({ active }) {
  return (
    <aside style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px 16px', borderBottom: '1px solid var(--border-light)', minHeight: 69 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="compass" size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, lineHeight: 1.2, color: 'var(--text-primary)' }}>Kampus</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 148 }}>University Demo</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 9, fontSize: 14, fontWeight: isActive ? 600 : 500, background: isActive ? 'var(--accent-subtle)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--text-secondary)', whiteSpace: 'nowrap', minHeight: 38 }}>
              <span style={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}><Icon name={item.icon} size={18} /></span>
              <span>{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div style={{ padding: 10, borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 9, fontSize: 13.5, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
          </span>
          Collapse
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 8px', marginTop: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, flexShrink: 0, position: 'relative' }}>
            A
            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: 'var(--success, #12B76A)', border: '2px solid var(--surface)' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>Admin</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Log out</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Responsive scaler ────────────────────────────────────────────────────────

function ScaledPreview({ children }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(0.6)

  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / SIM_W)
    })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: Math.round(SIM_H * scale), overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: SIM_W, height: SIM_H,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        pointerEvents: 'none', overflow: 'hidden',
        display: 'flex', background: 'var(--bg)',
        fontFamily: 'var(--font-body)', color: 'var(--text-primary)',
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── Buildings preview ────────────────────────────────────────────────────────

export function AdminBuildingsPreview() {
  return (
    <ScaledPreview>
      <SimSidebar active="buildings" />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', background: 'var(--bg)', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            Buildings <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 6 }}>4</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', minHeight: 40 }}>
            <Icon name="plus" size={15} color="#fff" /> Add Building
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', height: 42, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <Icon name="search" size={15} color="var(--text-tertiary)" />
            <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Search buildings…</span>
          </div>
          <div style={{ height: 42, padding: '0 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13.5, display: 'flex', alignItems: 'center' }}>All categories</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {DEMO_BUILDINGS.map((b, i) => {
            const [badgeBg, badgeColor] = catBadge(b.category)
            return (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', padding: 20, boxShadow: 'var(--card-shadow, 0 1px 4px rgba(0,0,0,0.07))', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>{b.coords}</div>
                  </div>
                  <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 9999, fontSize: 11.5, fontWeight: 600, background: badgeBg, color: badgeColor, whiteSpace: 'nowrap', flexShrink: 0 }}>{b.category}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{b.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                    <Icon name="door" size={13} /> {b.rooms} rooms
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['edit', 'arrowRight', 'trash'].map(ic => (
                      <div key={ic} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                        <Icon name={ic} size={14} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </ScaledPreview>
  )
}

// ─── Rooms preview ────────────────────────────────────────────────────────────

export function AdminRoomsPreview() {
  return (
    <ScaledPreview>
      <SimSidebar active="rooms" />
      <main style={{ flex: 1, background: 'var(--bg)', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 32px', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Rooms</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Building:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 500 }}>
              <Icon name="building" size={14} />
              University Library
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <Icon name="plus" size={14} color="#fff" /> Add Room
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 32px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            {DEMO_ROOMS.length} rooms · {DEMO_ROOMS.filter(r => r.isOffice).length} offices · {DEMO_ROOMS.filter(r => r.hasSchedule).length} with schedule
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {DEMO_ROOMS.map((r, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, border: `1px solid ${r.isOffice ? 'rgba(14,165,233,0.35)' : 'var(--border-light)'}`, padding: '14px 16px', boxShadow: 'var(--card-shadow, 0 1px 4px rgba(0,0,0,0.07))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{r.number}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {r.isOffice && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 600 }}>★ Office</span>}
                    {r.hasSchedule && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'rgba(34,197,94,0.1)', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Icon name="calendar" size={9} /> Sched
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.type}</div>
              </div>
            ))}
            <div style={{ borderRadius: 12, border: '2px dashed var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 90, opacity: 0.6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={16} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>Add room</span>
            </div>
          </div>
        </div>
      </main>
    </ScaledPreview>
  )
}

// ─── Events preview ───────────────────────────────────────────────────────────

export function AdminEventsPreview() {
  const EVT_STATUS = {
    upcoming: { label: 'Upcoming', bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
    active:   { label: 'Active',   bg: 'rgba(34,197,94,0.12)',   color: '#16A34A' },
    ended:    { label: 'Ended',    bg: 'rgba(148,163,184,0.12)', color: '#64748B' },
  }

  return (
    <ScaledPreview>
      <SimSidebar active="events" />
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: 'var(--bg)', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Events <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 6 }}>4</span>
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', margin: 0 }}>Live updates shown on the student public map.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-display)', minHeight: 40, whiteSpace: 'nowrap' }}>
            <Icon name="plus" size={15} color="#fff" /> Add Event
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEMO_EVENTS.map((ev, i) => {
            const cat    = EVENT_CAT[ev.category] || EVENT_CAT.social
            const status = ev.isPublished ? (EVT_STATUS[ev.status] || EVT_STATUS.ended) : { label: 'Draft', bg: 'rgba(148,163,184,0.12)', color: '#64748B' }
            return (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '16px 18px', boxShadow: 'var(--card-shadow, 0 1px 4px rgba(0,0,0,0.07))', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 4, borderRadius: 4, flexShrink: 0, alignSelf: 'stretch', background: cat.color, minHeight: 20 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)' }}>{ev.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: cat.bg, color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: status.bg, color: status.color, fontWeight: 600 }}>{status.label}</span>
                  </div>
                  {ev.building && (
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="building" size={12} /> {ev.building}
                    </div>
                  )}
                  {ev.desc && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>{ev.desc}</p>}
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="calendar" size={12} />
                    {ev.startsAt}{ev.endsAt ? ` → ${ev.endsAt}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ev.isPublished ? 'var(--success, #12B76A)' : 'var(--text-tertiary)' }}>
                    <Icon name="zap" size={14} />
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                    <Icon name="edit" size={14} />
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                    <Icon name="trash" size={14} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </ScaledPreview>
  )
}
