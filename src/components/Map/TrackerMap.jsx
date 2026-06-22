// src/components/Map/TrackerMap.jsx

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

// Custom marker icons
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
      map.setView([9.0765, 7.3986], 12)
    }
  }, [map, vehicles])
  return null
}

const TrackerMap = ({ vehicles, selectedVehicle, onMarkerClick }) => {
  const [pathHistory, setPathHistory] = React.useState([])

  useEffect(() => {
    if (selectedVehicle && selectedVehicle.id) {
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

  const getVehicleIcon = (vehicle) => {
    if (vehicle.status === 'moving') return movingIcon
    if (vehicle.status === 'alert') return alertIcon
    if (vehicle.status === 'idle') return idleIcon
    return parkedIcon
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <div className="tracker-map-wrapper">
      <MapContainer
        center={[9.0765, 7.3986]}
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '500px', borderRadius: '12px' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        
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
                    
                    {/* ADDRESS SECTION - NEW */}
                    {vehicle.formatted_address && (
                      <div className="popup-address">
                        <div className="popup-row">
                          <span className="popup-label">📍 Location:</span>
                          <span className="popup-value address-text">{vehicle.formatted_address}</span>
                        </div>
                        {vehicle.address?.road && (
                          <div className="popup-row address-detail">
                            <span className="popup-label">🛣️ Road:</span>
                            <span className="popup-value">{vehicle.address.road}</span>
                          </div>
                        )}
                        {vehicle.address?.town && (
                          <div className="popup-row address-detail">
                            <span className="popup-label">🏙️ Town:</span>
                            <span className="popup-value">{vehicle.address.town}</span>
                          </div>
                        )}
                        {vehicle.address?.state && (
                          <div className="popup-row address-detail">
                            <span className="popup-label">🏛️ State:</span>
                            <span className="popup-value">{vehicle.address.state}</span>
                          </div>
                        )}
                        {vehicle.address?.country && (
                          <div className="popup-row address-detail">
                            <span className="popup-label">🌍 Country:</span>
                            <span className="popup-value">{vehicle.address.country}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
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
        
        {pathHistory.length > 1 && (
          <Polyline
            positions={pathHistory}
            color="#00c3ff"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
        
        {selectedVehicle && selectedVehicle.latitude && selectedVehicle.longitude && (
          <CenterMap position={[selectedVehicle.latitude, selectedVehicle.longitude]} />
        )}
        
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
          min-width: 260px;
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
          margin-bottom: 4px;
          font-size: 11px;
        }
        
        :global(.popup-label) {
          color: var(--text-muted);
          font-weight: 400;
        }
        
        :global(.popup-value) {
          color: var(--silver);
          font-weight: 500;
        }
        
        :global(.popup-value.coord) {
          font-family: monospace;
          font-size: 10px;
        }
        
        /* Address Styles */
        :global(.popup-address) {
          background: rgba(10, 111, 255, 0.05);
          border-radius: 6px;
          padding: 6px 8px;
          margin: 4px 0 8px 0;
          border-left: 2px solid #0a6fff;
        }
        
        :global(.popup-address .popup-row) {
          margin-bottom: 2px;
        }
        
        :global(.popup-address .address-text) {
          color: #0a6fff;
          font-weight: 500;
          text-align: right;
          font-size: 10px;
          max-width: 140px;
        }
        
        :global(.popup-address .address-detail .popup-value) {
          color: #94a3b8;
          font-size: 10px;
          text-align: right;
          max-width: 120px;
        }
        
        :global(.popup-address .address-detail .popup-label) {
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