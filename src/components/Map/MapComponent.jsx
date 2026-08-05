import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapComponent.css'

// Module-level cache: keyed by "startLng,startLat;endLng,endLat"
// Persists across re-renders and tab switches for the lifetime of the page.
const directionsCache = new Map()

const getBearing = (from, to) => {
  const rad = Math.PI / 180
  const dLng = (to[0] - from[0]) * rad
  const lat1 = from[1] * rad, lat2 = to[1] * rad
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) / rad + 360) % 360
}

// [lng, lat] pairs in, meters out
const getDistanceMeters = (from, to) => {
  const R = 6371e3
  const rad = Math.PI / 180
  const f1 = from[1] * rad, f2 = to[1] * rad
  const df = (to[1] - from[1]) * rad, dl = (to[0] - from[0]) * rad
  const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Live-nav tuning: how close (meters) counts as "arrived" at a step's waypoint,
// and the minimum GPS displacement before recomputing camera bearing (avoids
// the camera spinning on GPS jitter while the user is standing still).
const STEP_ARRIVAL_RADIUS_M = 18
const MIN_BEARING_DISPLACEMENT_M = 3

// Trims a route line to start at the user's current fix instead of the
// original route start, so the line visually "shrinks" as they walk it.
// Snaps to the nearest existing vertex rather than projecting onto the
// nearest segment — simpler, and walking-profile geometry from Mapbox is
// dense enough that this reads as smooth in practice.
const trimRouteToPosition = (coordinates, fix) => {
  if (!coordinates?.length) return [fix]
  let closestIdx = 0, closestDist = Infinity
  for (let i = 0; i < coordinates.length; i++) {
    const d = getDistanceMeters(fix, coordinates[i])
    if (d < closestDist) { closestDist = d; closestIdx = i }
  }
  return [fix, ...coordinates.slice(closestIdx)]
}

const MapComponent = forwardRef(({
  buildings = [],
  selectedBuilding,
  userLocation,
  onBuildingClick,
  showDirections = false,
  destinationCoords = null,
  darkMode = false,
  accentColor = '#0EA5E9',
  onRouteDataChange = null,
  activeBuildingIds = new Set(),
  initialCenter = null,
}, ref) => {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const tourRef = useRef({ active: false, paused: false, timeoutId: null, nextAdvance: null })
  const liveNavRef = useRef({ active: false, steps: [], coords: [], stepIndex: 0, lastFix: null, bearing: 0 })
  // Last-applied route geometry, kept so it can be redrawn after a style
  // reload (dark-mode toggle) wipes all style-owned sources/layers.
  const routeGeometryRef = useRef(null)

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

  // Draws (or, if the 'route' source already exists, cheaply updates) the
  // route line. Shared by the initial directions fetch and by live-nav's
  // per-fix trimming so both paths stay in sync with routeGeometryRef.
  const applyRouteGeometry = (geometry) => {
    const map = mapRef.current
    if (!map) return
    routeGeometryRef.current = geometry
    const doApply = () => {
      if (!mapRef.current) return
      const src = mapRef.current.getSource('route')
      if (src) {
        src.setData({ type: 'Feature', properties: {}, geometry })
      } else {
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry }
        })
        mapRef.current.addLayer({
          id: 'route', type: 'line', source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': accentColor, 'line-width': 4, 'line-opacity': 0.8 }
        })
      }
    }
    if (map.isStyleLoaded()) doApply()
    else map.once('load', doApply)
  }

  useImperativeHandle(ref, () => ({
    flyTo: (coordinates, zoom = 16) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coordinates,
          zoom,
          pitch: 45,
          speed: 1.2,
          curve: 1.5
        })
      }
    },
    clearDirections: () => {
      if (mapRef.current && mapRef.current.getLayer('route')) {
        mapRef.current.removeLayer('route')
        mapRef.current.removeSource('route')
      }
      routeGeometryRef.current = null
      if (onRouteDataChange) {
        onRouteDataChange(null)
      }
    },
    getMap: () => mapRef.current,

    startFpvTour: (routeData, { onStep, onComplete } = {}) => {
      const map = mapRef.current
      if (!map || !routeData) return
      const t = tourRef.current
      if (t.timeoutId) clearTimeout(t.timeoutId)
      t.active = true; t.paused = false; t.timeoutId = null; t.nextAdvance = null

      const { steps, geometry } = routeData
      const coords = geometry.coordinates

      const schedule = (fn, delay) => {
        if (t.timeoutId) clearTimeout(t.timeoutId)
        t.nextAdvance = fn
        t.timeoutId = setTimeout(() => {
          t.timeoutId = null
          if (t.active && !t.paused) { t.nextAdvance = null; fn() }
          // if paused, leave t.nextAdvance set so resumeFpvTour can call it
        }, delay)
      }

      const advance = (i) => {
        if (!t.active) return
        if (i >= steps.length) {
          const last = coords[coords.length - 1]
          map.flyTo({ center: last, zoom: 18, pitch: 50, bearing: 0, duration: 2500 })
          schedule(() => { onComplete?.(); t.active = false }, 2700)
          return
        }
        const step = steps[i]
        onStep?.(step, i)
        const stepCoord = step.location || coords[Math.floor((i / steps.length) * coords.length)]
        const nextCoord = steps[i + 1]?.location ||
          coords[Math.min(Math.floor(((i + 1) / steps.length) * coords.length), coords.length - 1)]
        const bearing = getBearing(stepCoord, nextCoord)
        const dur = Math.min(Math.max((step.distance || 60) * 50, 1500), 8000)
        map.easeTo({ center: stepCoord, bearing, pitch: 68, zoom: 19, duration: dur, essential: true })
        schedule(() => advance(i + 1), dur + 400)
      }

      const start = steps[0]?.location || coords[0]
      const initBearing = coords.length > 2 ? getBearing(coords[0], coords[Math.min(3, coords.length - 1)]) : 0
      map.flyTo({ center: start, zoom: 17, pitch: 62, bearing: initBearing, duration: 2500 })
      schedule(() => advance(0), 2700)
    },

    stopFpvTour: () => {
      const t = tourRef.current
      if (t.timeoutId) { clearTimeout(t.timeoutId); t.timeoutId = null }
      t.active = false; t.paused = false; t.nextAdvance = null
    },

    pauseFpvTour: () => {
      const t = tourRef.current
      if (!t.active || t.paused) return
      t.paused = true
      if (t.timeoutId) { clearTimeout(t.timeoutId); t.timeoutId = null }
      mapRef.current?.stop()
    },

    resumeFpvTour: () => {
      const t = tourRef.current
      if (!t.active || !t.paused) return
      t.paused = false
      if (t.nextAdvance) { const fn = t.nextAdvance; t.nextAdvance = null; fn() }
    },

    skipFpvStep: () => {
      const t = tourRef.current
      if (!t.active) return
      if (t.timeoutId) { clearTimeout(t.timeoutId); t.timeoutId = null }
      mapRef.current?.stop()
      t.paused = false
      if (t.nextAdvance) { const fn = t.nextAdvance; t.nextAdvance = null; fn() }
    },

    // Live walking navigation: camera follows real GPS fixes (fed in via
    // updateLiveLocation) instead of the FPV tour's scripted timer.
    startLiveNav: (routeData, { onStepChange, onArrive } = {}) => {
      const map = mapRef.current
      if (!map || !routeData?.steps?.length) return
      liveNavRef.current = {
        active: true,
        steps: routeData.steps,
        coords: routeData.geometry?.coordinates || [],
        stepIndex: 0,
        lastFix: null,
        bearing: 0,
        onStepChange: onStepChange || null,
        onArrive: onArrive || null,
      }
    },

    updateLiveLocation: ({ latitude, longitude }) => {
      const map = mapRef.current
      const nav = liveNavRef.current
      if (!map || !nav.active) return

      const fix = [longitude, latitude]
      const step = nav.steps[nav.stepIndex]

      // Advance to the next step once we're within arrival radius of this
      // step's waypoint. Steps only carry a single maneuver point, so this
      // is a simple proximity check, not a full off-route/reroute system.
      if (step?.location && getDistanceMeters(fix, step.location) <= STEP_ARRIVAL_RADIUS_M) {
        const nextIndex = nav.stepIndex + 1
        if (nextIndex >= nav.steps.length) {
          nav.active = false
          nav.onArrive?.()
        } else {
          nav.stepIndex = nextIndex
          nav.onStepChange?.(nav.steps[nextIndex], nextIndex)
        }
      }

      // Only recompute bearing once the user has actually moved enough to
      // give a meaningful course-over-ground — otherwise GPS jitter while
      // stationary would spin the camera. This is a v1 stand-in for real
      // device-heading; it freezes while the user isn't moving.
      if (!nav.lastFix || getDistanceMeters(nav.lastFix, fix) >= MIN_BEARING_DISPLACEMENT_M) {
        if (nav.lastFix) nav.bearing = getBearing(nav.lastFix, fix)
        nav.lastFix = fix
      }

      // Shrink the route line behind the user as they walk it.
      if (nav.coords?.length) {
        applyRouteGeometry({ type: 'LineString', coordinates: trimRouteToPosition(nav.coords, fix) })
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat(fix)
      }
      map.easeTo({ center: fix, bearing: nav.bearing, pitch: 70, zoom: 19, duration: 600, essential: true })
    },

    stopLiveNav: () => {
      liveNavRef.current.active = false
    },
  }))

  const getMapStyle = () =>
    darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/outdoors-v12'

  // Initialize map
  useEffect(() => {
    if (!mapboxToken) {
      console.error('Mapbox access token is required')
      return
    }

    mapboxgl.accessToken = mapboxToken

    const center = initialCenter
      ?? (buildings.length > 0
        ? [
            buildings.reduce((sum, b) => sum + b.coordinates[0], 0) / buildings.length,
            buildings.reduce((sum, b) => sum + b.coordinates[1], 0) / buildings.length
          ]
        : [0, 0])

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(),
      center,
      zoom: 15,
      pitch: 45,
      bearing: 0,
      antialias: true
    })

    map.on('load', () => {
      const layers = map.getStyle().layers
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      )?.id

      if (!map.getLayer('add-3d-buildings')) map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': darkMode ? '#2d3748' : '#c8d0dc',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      )

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    })

    mapRef.current = map

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    })

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current)
    }

    const handleWindowResize = () => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    }
    window.addEventListener('resize', handleWindowResize)

    // When the tab becomes visible again the WebGL canvas needs a resize tick
    // to clear the brief render stutter Mapbox shows after being paused.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && mapRef.current) {
        mapRef.current.resize()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      const t = tourRef.current
      if (t.timeoutId) clearTimeout(t.timeoutId)
      t.active = false
      liveNavRef.current.active = false
      map.remove()
    }
  }, [mapboxToken, buildings.length])

  // Update map style when dark mode changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyle())
      
      // Re-add custom layers after style loads
      mapRef.current.once('styledata', () => {
        const map = mapRef.current
        const layers = map.getStyle().layers
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
        )?.id

        if (!map.getLayer('add-3d-buildings')) {
          map.addLayer(
            {
              id: 'add-3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': darkMode ? '#2d3748' : '#c8d0dc',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
              }
            },
            labelLayerId
          )
        }

        // setStyle() wipes all style-owned sources/layers, including the
        // route — redraw it from the last-known geometry so an in-progress
        // route (preview or live-nav, possibly already trimmed) survives a
        // theme toggle instead of silently vanishing.
        if (routeGeometryRef.current && !map.getLayer('route')) {
          map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: routeGeometryRef.current }
          })
          map.addLayer({
            id: 'route', type: 'line', source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': accentColor, 'line-width': 4, 'line-opacity': 0.8 }
          })
        }
      })
    }
  }, [darkMode])

  // Update markers when buildings change
  useEffect(() => {
    if (!mapRef.current || buildings.length === 0) return

    // Cleanup old markers
    markersRef.current.forEach(({ marker }) => marker.remove())
    markersRef.current = []

    buildings.forEach((building) => {
      const isAdminBuilding = building.is_admin_building

      const el = document.createElement('div')
      el.className = `building-marker${isAdminBuilding ? ' admin-marker' : ''}`
      el.innerHTML = `
        <div class="marker-chip">${building.name}</div>
        <div class="marker-stem"></div>
        <div class="marker-dot-wrap">
          <div class="marker-dot"></div>
        </div>
      `

      el.addEventListener('click', () => {
        onBuildingClick(building)
      })

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(building.coordinates)
        .addTo(mapRef.current)

      markersRef.current.push({ marker, building, element: el })
    })


  }, [buildings, onBuildingClick])



  // Add / remove event pulse rings without recreating markers
  useEffect(() => {
    markersRef.current.forEach(({ building, element }) => {
      const wrap = element.querySelector('.marker-dot-wrap')
      if (!wrap) return
      const existing = wrap.querySelector('.event-pulse')
      const shouldHave = activeBuildingIds.has(building.id)
      if (shouldHave && !existing) {
        const pulse = document.createElement('div')
        pulse.className = 'event-pulse'
        wrap.prepend(pulse)
      } else if (!shouldHave && existing) {
        existing.remove()
      }
    })
  }, [activeBuildingIds])

  // Highlight selected building
  useEffect(() => {
    if (!mapRef.current || !selectedBuilding) return

    mapRef.current.flyTo({
      center: selectedBuilding.coordinates,
      zoom: 18,
      pitch: 60,
      speed: 1.2,
      curve: 1.5
    })
  }, [selectedBuilding])

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    const el = document.createElement('div')
    el.className = 'user-marker'
    el.innerHTML = `
      <div class="user-marker-pulse"></div>
      <div class="user-marker-dot"></div>
    `

    const marker = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(mapRef.current)

    userMarkerRef.current = marker

    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 16
    })
  }, [userLocation])

  // Auto-draw route whenever user location + destination are both available
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear route when either location or destination is missing
    if (!userLocation || !destinationCoords) {
      const doClear = () => {
        if (!mapRef.current) return
        if (map.getLayer('route')) { map.removeLayer('route'); map.removeSource('route') }
      }
      if (map.isStyleLoaded()) doClear()
      else map.once('load', doClear)
      routeGeometryRef.current = null
      if (onRouteDataChange) onRouteDataChange(null)
      return
    }

    const fetchDirections = async () => {
      const start = `${userLocation.longitude},${userLocation.latitude}`
      const end = `${destinationCoords[0]},${destinationCoords[1]}`
      const cacheKey = `${start};${end}`

      // Serve from cache — avoids redundant API calls on re-renders and tab-switch reconnects.
      if (directionsCache.has(cacheKey)) {
        const cached = directionsCache.get(cacheKey)
        if (onRouteDataChange) onRouteDataChange(cached)
        applyRouteGeometry(cached.geometry)
        return
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&overview=full&steps=true&language=en&access_token=${mapboxToken}`

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const steps = route.legs?.[0]?.steps?.map((step, index) => ({
            id: `${index}-${step.maneuver?.instruction || 'step'}`,
            instruction: step.maneuver?.instruction || 'Continue',
            distance: Math.round(step.distance || 0),
            duration: Math.round((step.duration || 0) / 60),
            location: step.maneuver?.location
          })) || []

          const nextRouteData = {
            distance: (route.distance / 1000).toFixed(2),
            duration: Math.round(route.duration / 60),
            geometry: route.geometry,
            steps
          }

          directionsCache.set(cacheKey, nextRouteData)
          if (onRouteDataChange) onRouteDataChange(nextRouteData)
          applyRouteGeometry(route.geometry)
        }
      } catch (error) {
        console.error('Error fetching directions:', error)
        if (onRouteDataChange) onRouteDataChange(null)
      }
    }

    fetchDirections()
  }, [userLocation, destinationCoords, accentColor, mapboxToken, onRouteDataChange])

  if (!mapboxToken) {
    return (
      <div className="map-error">
        <p>Mapbox access token is required.</p>
        <p>Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file.</p>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="map" />
})

MapComponent.displayName = 'MapComponent'

export default MapComponent
