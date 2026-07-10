import { useState, useEffect, useRef } from 'react'

// Animated simulation cursor for auto-demo previews.
// steps: [{ x, y, move: ms, hold: ms, click?: bool, action?: string }]
// scale: applied to x/y so cursor renders in the outer (scaled) container space
// onAction: called with step.action string when the step's cursor arrives
export default function SimCursor({ steps = [], scale = 1, onAction }) {
  const [idx, setIdx] = useState(0)
  const [ripple, setRipple] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!steps.length) return
    let current = 0
    let cancelled = false

    const run = () => {
      if (cancelled) return
      const step = steps[current]
      setIdx(current)

      // After cursor finishes moving: fire action + show click ripple
      if (step.click || step.action) {
        const actionTimer = setTimeout(() => {
          if (cancelled) return
          if (step.click) {
            setRipple(true)
            setTimeout(() => { if (!cancelled) setRipple(false) }, 450)
          }
          if (step.action && onAction) onAction(step.action)
        }, step.move)
        timerRef.current = actionTimer
      }

      const nextTimer = setTimeout(() => {
        if (cancelled) return
        current = (current + 1) % steps.length
        run()
      }, step.move + step.hold)
      timerRef.current = nextTimer
    }

    run()
    return () => { cancelled = true; clearTimeout(timerRef.current) }
  }, [steps, onAction]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!steps.length) return null
  const step = steps[idx]
  const cx = step.x * scale
  const cy = step.y * scale

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {/* Cursor arrow */}
      <div style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: 'translate(-1px, -1px)',
        transition: `left ${step.move}ms cubic-bezier(0.4,0,0.2,1), top ${step.move}ms cubic-bezier(0.4,0,0.2,1)`,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
      }}>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path d="M1.5 1.5L1.5 17L5.5 12.5L8.5 19.5L10.5 18.5L7.5 11.5L13.5 11.5Z"
            fill="white" stroke="#111827" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      {/* Click ripple */}
      {ripple && (
        <div style={{
          position: 'absolute',
          left: cx - 10,
          top: cy - 10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'rgba(14,165,233,0.22)',
          border: '1.5px solid rgba(14,165,233,0.65)',
          animation: 'sc-ripple 0.45s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes sc-ripple {
          0%   { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
