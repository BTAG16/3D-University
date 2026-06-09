import { useState, useEffect, useRef } from 'react'

export const useIsMobile = (breakpoint = 768) => {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [breakpoint])
  return mobile
}

export const useScrollReveal = (opts = {}) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el) }
    }, { threshold: 0.08, ...opts })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

export const useDarkMode = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('kampus-dark') === 'true')

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-dark', 'true')
      localStorage.setItem('kampus-dark', 'true')
    } else {
      document.documentElement.removeAttribute('data-dark')
      localStorage.setItem('kampus-dark', 'false')
    }
  }, [dark])

  const toggle = () => setDark(d => !d)
  return [dark, toggle]
}
