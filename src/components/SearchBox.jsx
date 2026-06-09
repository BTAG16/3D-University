import { useState } from 'react'
import { Icon } from '../icons'

function SearchBox({ value, onChange, placeholder = 'Search buildings...', dark = false }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', display: 'flex', alignItems: 'center',
      }}>
        <Icon name="search" size={14} color={dark ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)'} />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '9px 12px 9px 34px',
          border: `1px solid ${focused
            ? 'var(--accent)'
            : dark ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'var(--font-body)',
          color: dark ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)',
          background: dark ? 'rgba(255,255,255,0.06)' : 'var(--bg)',
          outline: 'none',
          boxShadow: focused ? `0 0 0 3px ${dark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.1)'}` : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      />
    </div>
  )
}

export default SearchBox
