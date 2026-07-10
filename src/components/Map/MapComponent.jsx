import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapComponent.css'

const getBearing = (from, to) => {
  const rad = Math.PI / 180
  const dLng = (to[0] - from[0]) * rad
  const lat1 = from[1] * rad, lat2 = to[1] * rad
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) / rad + 360) % 360
}

const MapComponent = forwardRef(({
  buildings = [],
  selectedBuilding,
  userLocation,
  onBuildingClick,
  showDirections = false,
  destinationCoords = null,
  darkMode = false,
  onRouteDataChange = null,
  activeBuildingIds = new Set()
}, ref) => {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const tourRef = useRef({ active: false, paused: false, timeoutId: null, nextAdvance: null })

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

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

    const center = buildings.length > 0
      ? [
          buildings.reduce((sum, b) => sum + b.coordinates[0], 0) / buildings.length,
          buildings.reduce((sum, b) => sum + b.coordinates[1], 0) / buildings.length
        ]
      : [0, 0]

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

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
      const t = tourRef.current
      if (t.timeoutId) clearTimeout(t.timeoutId)
      t.active = false
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

  // Fetch and display directions
  useEffect(() => {
    if (!mapRef.current || !showDirections || !userLocation || !destinationCoords) {
      return
    }

    const fetchDirections = async () => {
      const start = `${userLocation.longitude},${userLocation.latitude}`
      const end = `${destinationCoords[0]},${destinationCoords[1]}`
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
          if (onRouteDataChange) {
            onRouteDataChange(nextRouteData)
          }

          if (mapRef.current.getLayer('route')) {
            mapRef.current.removeLayer('route')
            mapRef.current.removeSource('route')
          }

          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          })

          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#667eea',
              'line-width': 4,
              'line-opacity': 0.8
            }
          })

          const coordinates = route.geometry.coordinates
          const bounds = coordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          )

          mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            pitch: 45
          })
        }
      } catch (error) {
        console.error('Error fetching directions:', error)
        if (onRouteDataChange) {
          onRouteDataChange(null)
        }
      }
    }

    fetchDirections()
  }, [showDirections, userLocation, destinationCoords, mapboxToken, onRouteDataChange])

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
