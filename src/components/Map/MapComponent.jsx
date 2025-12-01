import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapComponent.css'

const MapComponent = forwardRef(({
  buildings = [],
  selectedBuilding,
  userLocation,
  onBuildingClick,
  showDirections = false,
  destinationCoords = null,
  darkMode = false
}, ref) => {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const [routeData, setRouteData] = useState(null)

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
      setRouteData(null)
    }
  }))

  // Get map style based on time of day and dark mode
  const getMapStyle = () => {
      return 'mapbox://styles/mapbox/outdoors-v12'
  }

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
            'fill-extrusion-color': '#aaa',
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

    return () => {
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
                'fill-extrusion-color': '#aaa',
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
      const markerColor = isAdminBuilding ? '#ef4444' : '#667eea' // Red for admin, purple for others
      
      const el = document.createElement('div')
      el.className = `building-marker ${isAdminBuilding ? 'admin-marker' : ''}`
      el.innerHTML = `
        <div class="marker-icon">
          <svg width="30" height="40" viewBox="0 0 30 40">
            <path fill="${markerColor}" d="M15 0C6.716 0 0 6.716 0 15c0 10 15 25 15 25s15-15 15-25c0-8.284-6.716-15-15-15zm0 20c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z"/>
          </svg>
        </div>
        <div class="marker-label" style="${isAdminBuilding ? 'font-weight: bold;' : ''}">${building.name}</div>
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
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&access_token=${mapboxToken}`

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          setRouteData({
            distance: (route.distance / 1000).toFixed(2),
            duration: Math.round(route.duration / 60),
            geometry: route.geometry
          })

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
      }
    }

    fetchDirections()
  }, [showDirections, userLocation, destinationCoords, mapboxToken])

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
