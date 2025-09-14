import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import Marker from '../Marker'
import Card from '../Card'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

// Mapbox access token
export const accessToken = (mapboxgl.accessToken =
  import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN)

const Map = ({ data, onLoad, onFeatureClick }) => {
  const mapContainer = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const timeIndexRef = useRef(0) // persists time index across renders

  // Move camera to a specific feature
  const moveToFeature = (feature) => {
    if (mapRef.current && feature) {
      const [lng, lat] = feature.geometry.coordinates
      mapRef.current.stop()
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 19,
        pitch: 60,
        bearing: mapRef.current.getBearing(),
        speed: 1.2,
        curve: 1.5,
        essential: true,
      })
    }
  }

  // Unified click handler
  const handleFeatureClick = (feature) => {
    moveToFeature(feature)
    onFeatureClick(feature)
  }

  useEffect(() => {
    const target = [18.93369153939181, 46.96066806491029]

    // Initialize Mapbox Standard style map
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      center: [200, 0],
      zoom: 1,
      pitch: 0,
      bearing: 0,
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: { lightPreset: 'day' }, // initial preset
      },
    }))

    map.addControl(new mapboxgl.NavigationControl())

    map.on('load', () => {
      map.flyTo({
        center: target,
        zoom: 18,
        pitch: 70,
        bearing: -110,
        speed: 0.4,
        curve: 1.5,
        essential: true,
      })
      onLoad(map)
      setMapLoaded(true)
    })

    // --- Real-Time Dynamic Lighting Based on Actual Time ---
    const getCurrentLightPreset = () => {
      const now = new Date()
      const hours = now.getHours()
      
      if (hours >= 5 && hours < 8) {
        return 'dawn' // 5 AM - 8 AM
      } else if (hours >= 8 && hours < 18) {
        return 'day' // 8 AM - 6 PM
      } else if (hours >= 18 && hours < 21) {
        return 'dusk' // 6 PM - 9 PM
      } else {
        return 'night' // 9 PM - 5 AM
      }
    }

    // Set initial lighting based on current time
    const setInitialLighting = () => {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        const currentPreset = getCurrentLightPreset()
        mapRef.current.setConfigProperty('basemap', 'lightPreset', currentPreset, {
          duration: 1000,
          easing: 'ease-in-out'
        })
        console.log('Set initial lighting to:', currentPreset)
      }
    }

    // Check and update lighting every minute
    const intervalId = setInterval(() => {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        const currentPreset = getCurrentLightPreset()
        const currentTime = new Date().toLocaleTimeString()
        
        mapRef.current.setConfigProperty('basemap', 'lightPreset', currentPreset, {
          duration: 3000,
          easing: 'ease-in-out'
        })
        
        console.log(`${currentTime} - Lighting set to: ${currentPreset}`)
      }
    }, 60000) // Check every minute

    // Set initial lighting after a short delay to ensure map is ready
    setTimeout(setInitialLighting, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <div ref={mapContainer} className='h-full w-full' />
      {mapLoaded &&
        Array.isArray(data) &&
        data.map((d, i) => (
          <Marker
            key={i}
            feature={d}
            map={mapRef.current}
            onMarkerClick={handleFeatureClick}
          >
            <Card
              feature={d}
              width={300}
              shortImage
              onClick={() => handleFeatureClick(d)}
            />
          </Marker>
        ))}
    </>
  )
}

Map.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      geometry: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
      }).isRequired,
      properties: PropTypes.object.isRequired,
    })
  ).isRequired,
  onFeatureClick: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
}

export default Map