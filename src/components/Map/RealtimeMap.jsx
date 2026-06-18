import React, { useState, useEffect, useRef } from 'react'
import TrackerMap from './TrackerMap'
import { locationService } from '../../services/locationService'
import { vehicleService } from '../../services/vehicleService'
import { twilioService } from '../../services/twilioService'

const RealtimeMap = () => {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commandLoading, setCommandLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showVehicleList, setShowVehicleList] = useState(true)

  useEffect(() => {
    loadAllVehicles()
  }, [])

  const loadAllVehicles = async () => {
    try {
      setLoading(true)
      // Get all vehicles from database, not just those with locations
      const allVehicles = await vehicleService.getAllVehicles()
      console.log('All vehicles loaded:', allVehicles)
      setVehicles(allVehicles || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (vehicle) => {
    setSelectedVehicle(vehicle)
  }
  
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle)
  }
  
  // NEW: Send command with vehicle password
  const sendCommandWithPassword = async (command, vehicle, commandName) => {
    if (!vehicle.sim_card_number) {
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}. Please add SIM card number first.`)
      return
    }
    
    setCommandLoading(true)
    try {
      // Use the new twilioService method that fetches password
      const result = await twilioService.sendCommandWithPassword(vehicle.id, command)
      
      if (result.success) {
        alert(`✅ Command "${commandName}" sent to ${vehicle.vehicle_id} with password`)
      } else {
        alert(`❌ Failed to send command: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Command error:', error)
      alert(`Failed to send command: ${error.message || 'Please try again.'}`)
    }
    setCommandLoading(false)
  }
  
  // NEW: Send custom command with password
  const sendCustomCommand = async (vehicle, customCommand) => {
    if (!vehicle.sim_card_number) {
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}.`)
      return
    }
    
    setCommandLoading(true)
    try {
      const result = await twilioService.sendCustomCommand(vehicle.id, customCommand)
      
      if (result.success) {
        alert(`✅ Custom command sent to ${vehicle.vehicle_id}`)
      } else {
        alert(`❌ Failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Command error:', error)
      alert(`Failed: ${error.message || 'Please try again.'}`)
    }
    setCommandLoading(false)
  }

  // Update the getLocation methods to use vehicle ID
  const sendGetLocation = async (vehicle) => {
    if (!vehicle.sim_card_number) {
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}. Please add SIM card number first.`)
      return
    }
    
    setCommandLoading(true)
    try {
      // Use vehicle ID - will auto-fetch password
      const result = await twilioService.getLocation(vehicle.id)
      
      if (result.success) {
        alert(`✅ Location request sent to ${vehicle.vehicle_id}`)
      } else {
        alert(`❌ Failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Command error:', error)
      alert(`Failed: ${error.message || 'Please try again.'}`)
    }
    setCommandLoading(false)
  }
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'moving': return '🟢'
      case 'parked': return '🟡'
      case 'alert': return '🔴'
      case 'idle': return '⚪'
      default: return '🔵'
    }
  }
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'moving': return '#22c55e'
      case 'parked': return '#f59e0b'
      case 'alert': return '#ef4444'
      case 'idle': return '#94a3b8'
      default: return '#3b82f6'
    }
  }
  
  const getStatusText = (status) => {
    switch(status) {
      case 'moving': return 'Moving'
      case 'parked': return 'Parked'
      case 'alert': return 'Alert'
      case 'idle': return 'Idle'
      default: return status || 'Unknown'
    }
  }
  
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' || 
      vehicle.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  const statusCounts = {
    all: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    parked: vehicles.filter(v => v.status === 'parked').length,
    alert: vehicles.filter(v => v.status === 'alert').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
    noLocation: vehicles.filter(v => !v.latitude).length
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading fleet data...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            background: rgba(6, 14, 30, 0.95);
            border-radius: 16px;
            color: var(--white);
            min-height: 400px;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(10, 111, 255, 0.2);
            border-top-color: var(--blue-neon);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="realtime-map-container">
      <div className="map-layout">
        {/* Map Section */}
        <div className="map-section">
          <TrackerMap 
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onMarkerClick={handleMarkerClick}
          />
        </div>
        
        {/* Vehicle List Panel */}
        <div className={`vehicle-list-panel ${showVehicleList ? 'open' : 'closed'}`}>
          <div className="panel-header">
            <div className="header-title">
              <span className="vehicle-icon">🚛</span>
              <h3>Fleet Command Center</h3>
              <span className="vehicle-count">{vehicles.length} Units</span>
            </div>
            <button 
              className="toggle-btn"
              onClick={() => setShowVehicleList(!showVehicleList)}
              title={showVehicleList ? 'Collapse panel' : 'Expand panel'}
            >
              {showVehicleList ? '⟨' : '⟩'}
            </button>
          </div>
          
          {showVehicleList && (
            <>
              {/* Stats Summary */}
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-value">{statusCounts.moving}</span>
                  <span className="stat-label">Moving</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{statusCounts.parked}</span>
                  <span className="stat-label">Parked</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{statusCounts.alert}</span>
                  <span className="stat-label">Alert</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{statusCounts.idle}</span>
                  <span className="stat-label">Idle</span>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="filters-section">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by ID, name, driver or model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                  )}
                </div>
                <div className="status-filters">
                  <button 
                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All <span className="filter-count">{statusCounts.all}</span>
                  </button>
                  <button 
                    className={`filter-btn moving ${statusFilter === 'moving' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('moving')}
                  >
                    <span className="dot green"></span> Moving <span className="filter-count">{statusCounts.moving}</span>
                  </button>
                  <button 
                    className={`filter-btn parked ${statusFilter === 'parked' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('parked')}
                  >
                    <span className="dot yellow"></span> Parked <span className="filter-count">{statusCounts.parked}</span>
                  </button>
                  <button 
                    className={`filter-btn alert ${statusFilter === 'alert' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('alert')}
                  >
                    <span className="dot red"></span> Alert <span className="filter-count">{statusCounts.alert}</span>
                  </button>
                  <button 
                    className={`filter-btn idle ${statusFilter === 'idle' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('idle')}
                  >
                    <span className="dot gray"></span> Idle <span className="filter-count">{statusCounts.idle}</span>
                  </button>
                </div>
              </div>
              
              {/* Vehicle List */}
              <div className="vehicles-list">
                {filteredVehicles.length === 0 ? (
                  <div className="no-vehicles">
                    <div className="no-vehicles-icon">🚛</div>
                    <p>No vehicles found</p>
                    <p className="no-vehicles-hint">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredVehicles.map(vehicle => (
                    <div 
                      key={vehicle.id}
                      className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div className="vehicle-header">
                        <div className="vehicle-info-left">
                          <div className="vehicle-status-indicator">
                            <span 
                              className="status-dot"
                              style={{ background: getStatusColor(vehicle.status) }}
                            ></span>
                          </div>
                          <div>
                            <div className="vehicle-id">{vehicle.vehicle_id}</div>
                            <div className="vehicle-name">{vehicle.name}</div>
                          </div>
                        </div>
                        <div className="vehicle-badges">
                          {vehicle.tracker_status === 'active' && (
                            <span className="badge active">● Active</span>
                          )}
                          {vehicle.tracker_status === 'expiring_soon' && (
                            <span className="badge warning">⚠ Expiring</span>
                          )}
                          {vehicle.tracker_status === 'expired' && (
                            <span className="badge expired">✕ Expired</span>
                          )}
                          {!vehicle.latitude && (
                            <span className="badge no-location">📍 No Signal</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Vehicle Details */}
                      <div className="vehicle-details">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-icon">🚗</span>
                            <span className="detail-label">Model</span>
                            <span className="detail-value">{vehicle.model || '—'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">👤</span>
                            <span className="detail-label">Driver</span>
                            <span className="detail-value">{vehicle.driver_name || 'Unassigned'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📱</span>
                            <span className="detail-label">SIM</span>
                            <span className="detail-value">{vehicle.sim_card_number || 'Not set'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">⚡</span>
                            <span className="detail-label">Speed</span>
                            <span className="detail-value" style={{ color: vehicle.speed > 80 ? '#ef4444' : '#22c55e' }}>
                              {vehicle.speed || 0} km/h
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">🕐</span>
                            <span className="detail-label">Last Update</span>
                            <span className="detail-value">
                              {vehicle.last_update ? new Date(vehicle.last_update).toLocaleTimeString() : 'Never'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span className="detail-label">Location</span>
                            <span className="detail-value location">
                              {vehicle.latitude && vehicle.longitude 
                                ? `${vehicle.latitude.toFixed(4)}, ${vehicle.longitude.toFixed(4)}`
                                : 'No GPS signal'}
                            </span>
                          </div>
                          <div className="detail-item full-width">
                            <span className="detail-icon">🔑</span>
                            <span className="detail-label">Password</span>
                            <span className="detail-value" style={{ color: 'var(--blue-neon)' }}>
                              {vehicle.tracker_password || '123456'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="vehicle-actions">
                        <button 
                          className="action-btn location"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendGetLocation(vehicle)
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                          title="Request current location"
                        >
                          📍 Get Location
                        </button>
                        <button 
                          className="action-btn stop"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendCommandWithPassword('cutoil', vehicle, 'STOP ENGINE')
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                          title="Emergency engine shutdown"
                        >
                          🛑 Stop
                        </button>
                        <button 
                          className="action-btn start"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendCommandWithPassword('resume', vehicle, 'START ENGINE')
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                          title="Restart engine"
                        >
                          ▶️ Start
                        </button>
                        <button 
                          className="action-btn status"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendCommandWithPassword('status', vehicle, 'GET STATUS')
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                          title="Get tracker status"
                        >
                          📊 Status
                        </button>
                      </div>
                      
                      {/* Custom Command Input */}
                      <div className="custom-command">
                        <input
                          type="text"
                          id={`custom-command-${vehicle.id}`}
                          placeholder="Custom command (e.g., interval,60)"
                          className="custom-command-input"
                          disabled={commandLoading || !vehicle.sim_card_number}
                        />
                        <button
                          className="action-btn custom"
                          onClick={(e) => {
                            e.stopPropagation()
                            const input = document.getElementById(`custom-command-${vehicle.id}`)
                            const command = input?.value.trim()
                            if (command) {
                              sendCustomCommand(vehicle, command)
                              input.value = ''
                            }
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                          title="Send custom command with password"
                        >
                          Send
                        </button>
                      </div>
                      
                      <div className="vehicle-footer">
                        <span className="plan-badge">{vehicle.tracker_plan || 'No plan'}</span>
                        <span className="expiry-info">
                          {vehicle.tracker_expiry 
                            ? `Expires: ${new Date(vehicle.tracker_expiry).toLocaleDateString()}`
                            : 'No expiry date'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .realtime-map-container {
          width: 100%;
          height: 100%;
          min-height: 70vh;
        }
        .map-layout {
          display: flex;
          gap: 20px;
          height: 100%;
          min-height: 650px;
        }
        .map-section {
          flex: 1;
          min-width: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .vehicle-list-panel {
          width: 420px;
          background: linear-gradient(145deg, rgba(6, 14, 30, 0.98), rgba(4, 10, 20, 0.98));
          border: 1px solid rgba(10, 111, 255, 0.2);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .vehicle-list-panel.closed {
          width: 60px;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: linear-gradient(135deg, rgba(10, 60, 180, 0.15), rgba(0, 195, 255, 0.05));
          border-bottom: 1px solid rgba(10, 111, 255, 0.2);
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .vehicle-icon {
          font-size: 24px;
          filter: drop-shadow(0 0 4px rgba(0, 195, 255, 0.5));
        }
        .header-title h3 {
          font-family: var(--font-head);
          font-size: 18px;
          font-weight: 700;
          color: var(--white);
          margin: 0;
          letter-spacing: 0.5px;
        }
        .vehicle-count {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--blue-neon);
          background: rgba(10, 111, 255, 0.15);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 600;
        }
        .toggle-btn {
          background: rgba(10, 111, 255, 0.15);
          border: 1px solid rgba(10, 111, 255, 0.3);
          color: var(--blue-neon);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          background: rgba(10, 111, 255, 0.3);
          transform: scale(1.05);
        }
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 16px 20px;
          background: rgba(10, 111, 255, 0.03);
          border-bottom: 1px solid rgba(10, 111, 255, 0.1);
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          display: block;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
        }
        .stat-label {
          display: block;
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        .filters-section {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.1);
        }
        .search-box {
          position: relative;
          margin-bottom: 16px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          opacity: 0.6;
        }
        .search-box input {
          width: 100%;
          background: rgba(8, 20, 50, 0.8);
          border: 1px solid rgba(10, 111, 255, 0.2);
          border-radius: 10px;
          padding: 10px 12px 10px 36px;
          color: var(--white);
          font-family: var(--font-tech);
          font-size: 13px;
          transition: all 0.2s;
        }
        .search-box input:focus {
          outline: none;
          border-color: var(--blue-neon);
          box-shadow: 0 0 0 2px rgba(10, 111, 255, 0.1);
        }
        .search-box input::placeholder {
          color: var(--text-muted);
        }
        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 14px;
        }
        .status-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .filter-btn {
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid rgba(10, 111, 255, 0.2);
          border-radius: 20px;
          padding: 6px 14px;
          font-family: var(--font-tech);
          font-size: 12px;
          font-weight: 500;
          color: var(--silver);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .filter-btn:hover {
          background: rgba(10, 111, 255, 0.1);
        }
        .filter-btn.active {
          background: rgba(10, 111, 255, 0.2);
          border-color: var(--blue-neon);
          color: var(--blue-neon);
        }
        .filter-btn.moving.active {
          background: rgba(34, 197, 94, 0.12);
          border-color: #22c55e;
          color: #22c55e;
        }
        .filter-btn.parked.active {
          background: rgba(245, 158, 11, 0.12);
          border-color: #f59e0b;
          color: #f59e0b;
        }
        .filter-btn.alert.active {
          background: rgba(239, 68, 68, 0.12);
          border-color: #ef4444;
          color: #ef4444;
        }
        .filter-count {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 0 6px;
          font-size: 10px;
          margin-left: 4px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot.green { background: #22c55e; box-shadow: 0 0 4px #22c55e; }
        .dot.yellow { background: #f59e0b; box-shadow: 0 0 4px #f59e0b; }
        .dot.red { background: #ef4444; box-shadow: 0 0 4px #ef4444; }
        .dot.gray { background: #94a3b8; }
        .vehicles-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          max-height: 480px;
          scrollbar-width: thin;
        }
        .vehicles-list::-webkit-scrollbar {
          width: 4px;
        }
        .vehicles-list::-webkit-scrollbar-track {
          background: rgba(10, 111, 255, 0.05);
          border-radius: 4px;
        }
        .vehicles-list::-webkit-scrollbar-thumb {
          background: rgba(10, 111, 255, 0.3);
          border-radius: 4px;
        }
        .vehicle-card {
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid rgba(10, 111, 255, 0.15);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vehicle-card:hover {
          background: rgba(10, 111, 255, 0.1);
          border-color: rgba(10, 111, 255, 0.35);
          transform: translateX(2px);
        }
        .vehicle-card.selected {
          background: rgba(10, 111, 255, 0.12);
          border-color: var(--blue-neon);
          box-shadow: 0 0 0 1px rgba(10, 111, 255, 0.2);
        }
        .vehicle-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .vehicle-info-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .vehicle-status-indicator {
          width: 10px;
          height: 10px;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.5s infinite;
        }
        .vehicle-id {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.5px;
        }
        .vehicle-name {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .vehicle-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .badge {
          font-family: var(--font-tech);
          font-size: 9px;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .badge.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .badge.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .badge.expired {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .badge.no-location {
          background: rgba(100, 116, 139, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(100, 116, 139, 0.3);
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .detail-grid .full-width {
          grid-column: 1 / -1;
        }
        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-tech);
          font-size: 11px;
        }
        .detail-icon {
          font-size: 12px;
          opacity: 0.7;
          width: 20px;
        }
        .detail-label {
          color: var(--text-muted);
        }
        .detail-value {
          color: var(--silver);
          margin-left: auto;
        }
        .detail-value.location {
          font-size: 10px;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vehicle-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .action-btn {
          flex: 1;
          min-width: 60px;
          background: rgba(10, 111, 255, 0.12);
          border: none;
          color: var(--blue-neon);
          padding: 6px 8px;
          border-radius: 8px;
          font-family: var(--font-tech);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover:not(:disabled) {
          background: rgba(10, 111, 255, 0.25);
          transform: translateY(-1px);
        }
        .action-btn.stop {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }
        .action-btn.stop:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.25);
        }
        .action-btn.start {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
        }
        .action-btn.start:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.25);
        }
        .action-btn.custom {
          flex: 0.5;
          min-width: 50px;
          background: rgba(10, 111, 255, 0.15);
          color: var(--blue-neon);
        }
        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .custom-command {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .custom-command-input {
          flex: 1;
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid rgba(10, 111, 255, 0.15);
          border-radius: 8px;
          padding: 6px 10px;
          color: var(--white);
          font-family: var(--font-tech);
          font-size: 11px;
          outline: none;
          transition: all 0.2s;
        }
        .custom-command-input:focus {
          border-color: var(--blue-neon);
          box-shadow: 0 0 0 2px rgba(10, 111, 255, 0.1);
        }
        .custom-command-input::placeholder {
          color: var(--text-muted);
        }
        .vehicle-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid rgba(10, 111, 255, 0.1);
          font-family: var(--font-tech);
          font-size: 10px;
        }
        .plan-badge {
          color: var(--blue-neon);
          background: rgba(10, 111, 255, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
        }
        .expiry-info {
          color: var(--text-muted);
        }
        .no-vehicles {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }
        .no-vehicles-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .no-vehicles-hint {
          font-size: 11px;
          margin-top: 8px;
          opacity: 0.7;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @media (max-width: 1024px) {
          .vehicle-list-panel {
            width: 380px;
          }
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .map-layout {
            flex-direction: column;
          }
          .vehicle-list-panel {
            width: 100%;
          }
          .vehicles-list {
            max-height: 350px;
          }
          .vehicle-actions {
            flex-wrap: wrap;
          }
          .action-btn {
            min-width: 45px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default RealtimeMap