import { useState, useEffect, useRef, useCallback } from 'react'
import DemoMap, { initialDemoBuildings } from '../DemoMap'
import SimCursor from './SimCursor'

// DemoMap renders at this virtual resolution, then CSS-scaled to fit the frame.
// Desktop sidebar layout kicks in at window.innerWidth > 768.
// On the landing page (desktop: ~1200px viewport), isMobile=false, so sidebar shows.
const DEMO_W = 1100
const DEMO_H = 638

// At DEMO_W=1100:
//   Header: y=0–56. Sidebar: x=0–300. Building cards (70px each) from y≈140.
//   Add Building button in header (no Get Started when embedded): ~x=1063, y=28.
//   Building detail "View Rooms" button: ~y=358. Back button: ~y=82.
const MAP_SIM_STEPS = [
  // Start: idle over map
  { x: 720, y: 380, move: 500,  hold: 1400, click: false },
  // Click Library card in sidebar
  { x: 150, y: 245, move: 900,  hold: 350,  click: true,  action: 'selectLibrary'   },
  // Building detail panel — look at it
  { x: 150, y: 175, move: 300,  hold: 1800, click: false },
  // Click View Rooms
  { x: 150, y: 358, move: 700,  hold: 350,  click: true,  action: 'showRooms'       },
  // Browse rooms list
  { x: 150, y: 270, move: 400,  hold: 2000, click: false },
  // Back to building list
  { x: 150, y: 82,  move: 700,  hold: 350,  click: true,  action: 'goBack'          },
  // Click Dormitory card
  { x: 150, y: 315, move: 600,  hold: 350,  click: true,  action: 'selectDormitory' },
  // Dormitory detail
  { x: 150, y: 195, move: 300,  hold: 1500, click: false },
  // Pan cursor over map
  { x: 695, y: 310, move: 900,  hold: 900,  click: false },
  // Click Add Building in header
  { x: 1063, y: 28, move: 700,  hold: 350,  click: true,  action: 'openForm'        },
  // Hover over form fields
  { x: 680,  y: 330, move: 500,  hold: 1800, click: false },
  // Close form
  { x: 868,  y: 200, move: 500,  hold: 350,  click: true,  action: 'closeForm'      },

  // ── Navigation simulation — FPV 3D walkthrough ────────────────────────────
  // Select admin building
  { x: 150,  y: 175, move: 700,  hold: 350,  click: true,  action: 'selectAdmin' },
  // Click Get Directions — triggers real FPV tour (camera flies route in 3D)
  { x: 150,  y: 312, move: 600,  hold: 350,  click: true,  action: 'startNav'   },
  // Cursor hovers map while FPV tour plays (~27s for 5 steps at 110m each)
  { x: 640,  y: 380, move: 800,  hold: 4800, click: false },
  { x: 710,  y: 330, move: 700,  hold: 5200, click: false },
  { x: 590,  y: 295, move: 800,  hold: 5000, click: false },
  { x: 720,  y: 260, move: 700,  hold: 5200, click: false },
  { x: 650,  y: 240, move: 600,  hold: 4600, click: false },
  // FPV completes → stop nav and reset
  { x: 720,  y: 380, move: 800,  hold: 600,  click: false, action: 'stopNav'    },
]

const admin     = initialDemoBuildings[0] // Administration Building
const library   = initialDemoBuildings[1] // University Library
const dormitory = initialDemoBuildings[2] // Student Dormitory

export default function LandingDemoPreview() {
  const frameRef   = useRef(null)
  const controlRef = useRef({})
  const [scale, setScale] = useState(0.78)
  const [showCursor, setShowCursor] = useState(() => window.innerWidth > 1024)

  // Keep scale in sync with container width; hide cursor on phones/tablets
  useEffect(() => {
    if (!frameRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setScale(w / DEMO_W)
      setShowCursor(window.innerWidth > 1024)
    })
    obs.observe(frameRef.current)
    return () => obs.disconnect()
  }, [])

  const handleAction = useCallback((action) => {
    const ctrl = controlRef.current
    if (!ctrl) return
    switch (action) {
      case 'selectLibrary':   ctrl.selectBuilding?.(library);   break
      case 'selectDormitory': ctrl.selectBuilding?.(dormitory); break
      case 'selectAdmin':     ctrl.selectBuilding?.(admin);     break
      case 'showRooms':       ctrl.showRooms?.();               break
      case 'goBack':          ctrl.goBack?.();                  break
      case 'openForm':        ctrl.openForm?.();                break
      case 'closeForm':       ctrl.closeForm?.();               break
      case 'startNav':        ctrl.startNav?.(admin);           break
      case 'stopNav':         ctrl.stopNav?.(); ctrl.reset?.(); break
      default: break
    }
  }, [])

  return (
    <div
      ref={frameRef}
      style={{
        position: 'relative',
        width: '100%',
        height: Math.round(DEMO_H * scale),
        overflow: 'hidden',
        borderRadius: '0 0 12px 12px',
        background: '#0A0A0C',
      }}
    >
      {/* Scaled DemoMap — pointer-events disabled so it's display-only */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: DEMO_W,
        height: DEMO_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        pointerEvents: 'none',
      }}>
        <DemoMap embedded controlRef={controlRef} />
      </div>

      {/* Sim cursor overlay — desktop only (no mouse on phones/tablets) */}
      {showCursor && <SimCursor steps={MAP_SIM_STEPS} scale={scale} onAction={handleAction} />}
    </div>
  )
}
