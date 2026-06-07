const Svg = ({ children, size = 20, style = {}, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
    strokeLinejoin="round" style={{ flexShrink: 0, ...style }} className={className}>
    {children}
  </svg>
)

const ICONS = {
  mapPin:       (s) => <Svg size={s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>,
  menu:         (s) => <Svg size={s}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></Svg>,
  x:            (s) => <Svg size={s}><path d="M18 6 6 18M6 6l12 12"/></Svg>,
  arrowRight:   (s) => <Svg size={s}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Svg>,
  check:        (s) => <Svg size={s}><path d="M20 6 9 17l-5-5"/></Svg>,
  search:       (s) => <Svg size={s}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Svg>,
  globe:        (s) => <Svg size={s}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></Svg>,
  compass:      (s) => <Svg size={s}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></Svg>,
  layers:       (s) => <Svg size={s}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.5-8.97 4.08a2 2 0 0 1-1.66 0L2 17.5"/><path d="m22 12.5-8.97 4.08a2 2 0 0 1-1.66 0L2 12.5"/></Svg>,
  calendar:     (s) => <Svg size={s}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Svg>,
  link:         (s) => <Svg size={s}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Svg>,
  building:     (s) => <Svg size={s}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01M12 14h.01"/></Svg>,
  userPlus:     (s) => <Svg size={s}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></Svg>,
  share:        (s) => <Svg size={s}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></Svg>,
  zap:          (s) => <Svg size={s}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></Svg>,
  chevronRight: (s) => <Svg size={s}><path d="m9 18 6-6-6-6"/></Svg>,
  chevronDown:  (s) => <Svg size={s}><path d="m6 9 6 6 6-6"/></Svg>,
  door:         (s) => <Svg size={s}><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/></Svg>,
  navigation:   (s) => <Svg size={s}><polygon points="3 11 22 2 13 21 11 13 3 11"/></Svg>,
  shield:       (s) => <Svg size={s}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></Svg>,
  sun:          (s) => <Svg size={s}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></Svg>,
  moon:         (s) => <Svg size={s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Svg>,
  externalLink: (s) => <Svg size={s}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></Svg>,
  copy:         (s) => <Svg size={s}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Svg>,
  logOut:       (s) => <Svg size={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>,
  trash:        (s) => <Svg size={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Svg>,
  edit:         (s) => <Svg size={s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>,
  plus:         (s) => <Svg size={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>,
  settings:     (s) => <Svg size={s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>,
  alertCircle:  (s) => <Svg size={s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>,
  mail:         (s) => <Svg size={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>,
  loader:       (s) => <Svg size={s}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></Svg>,
  pause:        (s) => <Svg size={s}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></Svg>,
  play:         (s) => <Svg size={s}><polygon points="5 3 19 12 5 21"/></Svg>,
}

export const Icon = ({ name, size = 20, color }) => {
  if (!ICONS[name]) return null
  return color
    ? <span style={{ display: 'inline-flex', alignItems: 'center', color, lineHeight: 0, flexShrink: 0 }}>{ICONS[name](size)}</span>
    : ICONS[name](size)
}

export const Reveal = ({ children, delay = 0, direction = 'up', style = {}, className = '' }) => {
  const ref = { current: null }
  return (
    <div ref={r => { ref.current = r }} className={className} style={style}>
      {children}
    </div>
  )
}

export default Icon
