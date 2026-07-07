import { Icon } from '../icons'

function BuildingCard({ building, distance, onClick, selected, dark = false }) {
  const base = {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '11px 12px', borderRadius: 10, cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    marginBottom: 6,
    border: `1px solid ${dark
      ? (selected ? 'color-mix(in srgb, var(--accent) 60%, transparent)' : 'rgba(255,255,255,0.08)')
      : (selected ? 'var(--accent)' : 'var(--border)')}`,
    background: dark
      ? (selected ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'rgba(255,255,255,0.04)')
      : (selected ? 'var(--accent-subtle)' : 'var(--surface)'),
  }

  return (
    <div style={base} onClick={() => onClick(building)}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="building" size={18} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, margin: '0 0 2px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: dark ? 'rgba(255,255,255,0.92)' : 'var(--text-primary)',
        }}>
          {building.name}
        </div>
        <div style={{
          fontSize: 12, color: dark ? 'rgba(255,255,255,0.45)' : 'var(--text-secondary)',
          margin: '0 0 2px',
        }}>
          {building.category}
        </div>
        {distance && (
          <div style={{
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
            color: dark ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)',
          }}>
            <Icon name="mapPin" size={11} color={dark ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)'} />
            {distance}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuildingCard
