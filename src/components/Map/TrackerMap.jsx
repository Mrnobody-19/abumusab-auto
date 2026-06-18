import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons for different vehicle types
const movingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const parkedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const alertIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const idleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom vehicle marker with pulsing effect
const createCustomIcon = (status, isSelected = false) => {
  let color
  switch(status) {
    case 'moving': color = '#22c55e'; break
    case 'parked': color = '#3b82f6'; break
    case 'alert': color = '#ef4444'; break
    case 'idle': color = '#94a3b8'; break
    default: color = '#6b7280'
  }
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" fill="${color}" fill-opacity="0.3"/>
    </svg>
  `
  
  return new L.DivIcon({
    html: `<div style="position: relative;">
              <div style="width: 32px; height: 32px;">${svg}</div>
              <div style="position: absolute; top: 0; left: 0; width: 32px; height: 32px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            </div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Component to center map on selected vehicle
function CenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, 14)
    }
  }, [map, position])
  return null
}

// Component to fit bounds to show all vehicles
function FitBounds({ vehicles }) {
  const map = useMap()
  useEffect(() => {
    const locations = vehicles.filter(v => v.latitude && v.longitude)
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(v => [v.latitude, v.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      // Default to Abuja, Nigeria if no vehicles with location
      map.setView([9.0765, 7.3986], 12)
    }
  }, [map, vehicles])
  return null
}

const TrackerMap = ({ vehicles, selectedVehicle, onMarkerClick }) => {
  const [pathHistory, setPathHistory] = React.useState([])
  const [mapCenter, setMapCenter] = React.useState([9.0765, 7.3986]) // Abuja coordinates
  const [mapZoom, setMapZoom] = React.useState(12)
  
  // Update path history when selected vehicle changes
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.id) {
      // In a real app, you'd fetch location history from API
      // For now, we'll create a simulated path
      const mockHistory = []
      if (selectedVehicle.latitude && selectedVehicle.longitude) {
        for (let i = 0; i < 10; i++) {
          mockHistory.push([
            selectedVehicle.latitude + (Math.random() - 0.5) * 0.01,
            selectedVehicle.longitude + (Math.random() - 0.5) * 0.01
          ])
        }
        mockHistory.push([selectedVehicle.latitude, selectedVehicle.longitude])
        setPathHistory(mockHistory)
      }
    }
  }, [selectedVehicle])

  // Get icon based on vehicle status
  const getVehicleIcon = (vehicle) => {
    if (vehicle.status === 'moving') return movingIcon
    if (vehicle.status === 'alert') return alertIcon
    if (vehicle.status === 'idle') return idleIcon
    return parkedIcon
  }

  // Format time for popup
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <div className="tracker-map-wrapper">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', minHeight: '500px', borderRadius: '12px' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Dark theme tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        
        {/* Vehicle Markers */}
        {vehicles.map(vehicle => (
          vehicle.latitude && vehicle.longitude && (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={getVehicleIcon(vehicle)}
              eventHandlers={{
                click: () => onMarkerClick(vehicle)
              }}
            >
              <Popup className="custom-popup">
                <div className="map-popup">
                  <div className="popup-header">
                    <strong className="popup-vehicle-id">{vehicle.vehicle_id}</strong>
                    <span className={`popup-status status-${vehicle.status}`}>
                      {vehicle.status === 'moving' ? '🟢 Moving' : 
                       vehicle.status === 'parked' ? '🟡 Parked' : 
                       vehicle.status === 'alert' ? '🔴 Alert' : '⚪ Idle'}
                    </span>
                  </div>
                  <div className="popup-details">
                    <div className="popup-row">
                      <span className="popup-label">Vehicle:</span>
                      <span className="popup-value">{vehicle.name}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-label">Model:</span>
                      <span className="popup-value">{vehicle.model || '—'}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-label">Driver:</span>
                      <span className="popup-value">{vehicle.driver_name || 'Unassigned'}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-label">Speed:</span>
                      <span className="popup-value" style={{ color: vehicle.speed > 80 ? '#ef4444' : '#22c55e' }}>
                        {vehicle.speed || 0} km/h
                      </span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-label">Last Update:</span>
                      <span className="popup-value">{formatTime(vehicle.last_update)}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-label">Coordinates:</span>
                      <span className="popup-value coord">
                        {vehicle.latitude.toFixed(4)}°, {vehicle.longitude.toFixed(4)}°
                      </span>
                    </div>
                  </div>
                  <button 
                    className="popup-btn"
                    onClick={() => onMarkerClick(vehicle)}
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        
        {/* Path History Line for selected vehicle */}
        {pathHistory.length > 1 && (
          <Polyline
            positions={pathHistory}
            color="#00c3ff"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
        
        {/* Center map on selected vehicle */}
        {selectedVehicle && selectedVehicle.latitude && selectedVehicle.longitude && (
          <CenterMap position={[selectedVehicle.latitude, selectedVehicle.longitude]} />
        )}
        
        {/* Auto-fit bounds to show all vehicles */}
        <FitBounds vehicles={vehicles} />
      </MapContainer>
      
      <style jsx>{`
        .tracker-map-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #030912;
          height: 100%;
          min-height: 500px;
        }
        
        :global(.custom-popup .leaflet-popup-content-wrapper) {
          background: rgba(6, 14, 30, 0.98);
          border: 1px solid rgba(10, 111, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        
        :global(.custom-popup .leaflet-popup-tip) {
          background: rgba(6, 14, 30, 0.98);
          border: 1px solid rgba(10, 111, 255, 0.3);
        }
        
        :global(.map-popup) {
          font-family: var(--font-tech);
          font-size: 12px;
          min-width: 220px;
          padding: 4px;
        }
        
        :global(.popup-header) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.2);
        }
        
        :global(.popup-vehicle-id) {
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.5px;
        }
        
        :global(.popup-status) {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
        }
        
        :global(.popup-status.status-moving) {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        
        :global(.popup-status.status-parked) {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        
        :global(.popup-status.status-alert) {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        
        :global(.popup-status.status-idle) {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
        }
        
        :global(.popup-details) {
          margin-bottom: 12px;
        }
        
        :global(.popup-row) {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 11px;
        }
        
        :global(.popup-label) {
          color: var(--text-muted);
        }
        
        :global(.popup-value) {
          color: var(--silver);
          font-weight: 500;
        }
        
        :global(.popup-value.coord) {
          font-family: monospace;
          font-size: 10px;
        }
        
        :global(.popup-btn) {
          width: 100%;
          background: linear-gradient(135deg, rgba(10, 111, 255, 0.15), rgba(0, 195, 255, 0.05));
          border: 1px solid rgba(10, 111, 255, 0.3);
          color: var(--blue-neon);
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-tech);
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s;
          margin-top: 4px;
        }
        
        :global(.popup-btn:hover) {
          background: rgba(10, 111, 255, 0.25);
          transform: translateY(-1px);
        }
        
        @keyframes ping {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default TrackerMap