import { useRef, useState, useEffect } from 'react'

export default function Reveal({ children, delay = 0, direction = 'up', style = {}, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el) }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const offsets = {
    up:    'translateY(28px)',
    down:  'translateY(-28px)',
    left:  'translateX(28px)',
    right: 'translateX(-28px)',
    none:  'none',
  }

  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : offsets[direction],
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      willChange: 'opacity, transform',
      ...style,
    }}>
      {children}
    </div>
  )
}
