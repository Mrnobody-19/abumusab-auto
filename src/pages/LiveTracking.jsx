// src/pages/LiveTracking.jsx

import React, { useState, useEffect, useRef } from 'react'
import { vehicleService } from '../services/vehicleService'
import smsService from '../services/smsService'
import TrackerMap from '../components/Map/TrackerMap'

const LiveTracking = () => {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commandLoading, setCommandLoading] = useState(false)
  const [commandStatus, setCommandStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showSidebar, setShowSidebar] = useState(true)
  const [liveLocations, setLiveLocations] = useState({})
  const [mapLayer, setMapLayer] = useState('satellite')
  const [hoveredVehicle, setHoveredVehicle] = useState(null)
  const [selectedStats, setSelectedStats] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(440)
  const [isResizing, setIsResizing] = useState(false)
  const [lastCommandResult, setLastCommandResult] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const vehiclesRef = useRef([])
  const subscriptionRef = useRef(null)
  const pollingCleanupRef = useRef(null)
  const sidebarRef = useRef(null)

  const normalizePhone = (num) => {
    if (!num) return '';
    let cleaned = num.replace(/[+\s-]/g, '');
    if (cleaned.startsWith('234')) {
      cleaned = '0' + cleaned.substring(3);
    }
    if (cleaned.startsWith('0')) {
      return cleaned;
    }
    return cleaned;
  };

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    loadAllVehicles();
    
    const subscription = vehicleService.subscribeToVehicles((payload) => {
      console.log('📡 Real-time vehicle update:', payload)
      loadAllVehicles()
    })
    
    subscriptionRef.current = subscription
    
    const cleanup = smsService.startPollingMessages((locationUpdates) => {
      console.log('📍 New location updates received:', locationUpdates)
      
      const currentVehicles = vehiclesRef.current;
      
      locationUpdates.forEach(update => {
        const phoneNumber = update.from || '';
        const normalizedIncoming = normalizePhone(phoneNumber)
        
        const vehicle = currentVehicles.find(v => {
          const vehiclePhone = normalizePhone(v.sim_card_number)
          return vehiclePhone === normalizedIncoming
        })
        
        if (vehicle) {
          console.log(`🎯 Found vehicle: ${vehicle.vehicle_id}`)
          
          setVehicles(prevVehicles => 
            prevVehicles.map(v => {
              if (v.id === vehicle.id) {
                return {
                  ...v,
                  latitude: update.latitude,
                  longitude: update.longitude,
                  speed: update.speed || v.speed || 0,
                  last_update: new Date().toISOString(),
                  location_source: 'sms',
                  status: update.speed > 0 ? 'moving' : 'parked'
                }
              }
              return v
            })
          )
          
          setLiveLocations(prev => ({
            ...prev,
            [vehicle.id]: {
              latitude: update.latitude,
              longitude: update.longitude,
              speed: update.speed || 0,
              timestamp: update.timestamp,
              source: 'sms'
            }
          }))
          
          setSelectedVehicle(vehicle)
          
          setCommandStatus({
            type: 'success',
            message: `📍 ${vehicle.vehicle_id} location updated: ${update.latitude.toFixed(4)}, ${update.longitude.toFixed(4)}`
          })
          setTimeout(() => setCommandStatus(null), 5000)
        }
      })
    }, 3000)
    
    pollingCleanupRef.current = cleanup
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      if (pollingCleanupRef.current) {
        pollingCleanupRef.current()
      }
      smsService.stopPollingMessages()
    }
  }, [])

  const loadAllVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      const allVehicles = await vehicleService.getAllVehicles()
      setVehicles(allVehicles || [])
      vehiclesRef.current = allVehicles || []
      
      const stats = {
        total: allVehicles?.length || 0,
        moving: allVehicles?.filter(v => v.status === 'moving').length || 0,
        parked: allVehicles?.filter(v => v.status === 'parked').length || 0,
        alert: allVehicles?.filter(v => v.status === 'alert').length || 0,
        idle: allVehicles?.filter(v => v.status === 'idle').length || 0,
        online: allVehicles?.filter(v => v.latitude).length || 0,
        offline: allVehicles?.filter(v => !v.latitude).length || 0,
        active: allVehicles?.filter(v => v.tracker_status === 'active').length || 0,
        expiring: allVehicles?.filter(v => v.tracker_status === 'expiring_soon').length || 0,
        expired: allVehicles?.filter(v => v.tracker_status === 'expired').length || 0
      }
      setSelectedStats(stats)
    } catch (error) {
      console.error('❌ Error loading vehicles:', error)
      setError('Failed to load vehicles')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAllVehicles()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleMarkerClick = (vehicle) => {
    setSelectedVehicle(vehicle)
  }

  const sendGetLocation = async (vehicle) => {
    if (!vehicle.sim_card_number) {
      setLastCommandResult({
        type: 'error',
        message: `⚠️ No SIM card assigned to ${vehicle.vehicle_id}`
      })
      setTimeout(() => setLastCommandResult(null), 5000)
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}`)
      return
    }
    
    setCommandLoading(true)
    setCommandStatus({ type: 'loading', message: `Requesting location for ${vehicle.vehicle_id}...` })
    setLastCommandResult({ type: 'loading', message: `📡 Sending location request to ${vehicle.vehicle_id}...` })
    
    try {
      const result = await smsService.getLocationForVehicle(vehicle.id)
      if (result.success) {
        setLastCommandResult({
          type: 'success',
          message: `✅ Location request sent to ${vehicle.vehicle_id}`,
          details: `Command: position${vehicle.tracker_password || '123456'} → ${vehicle.sim_card_number}`
        })
        setCommandStatus({ type: 'success', message: `✅ Location request sent to ${vehicle.vehicle_id}` })
      } else {
        setLastCommandResult({
          type: 'error',
          message: `❌ Failed: ${result.error}`,
          details: 'Check SIM card and network connectivity'
        })
        setCommandStatus({ type: 'error', message: `❌ Failed: ${result.error}` })
      }
    } catch (error) {
      setLastCommandResult({
        type: 'error',
        message: `❌ Failed: ${error.message}`,
        details: 'Check LibreSMS connection'
      })
      setCommandStatus({ type: 'error', message: `❌ Failed: ${error.message}` })
    }
    setCommandLoading(false)
    setTimeout(() => {
      setCommandStatus(null)
      if (lastCommandResult?.type !== 'loading') {
        // Keep result visible
      }
    }, 5000)
  }

  const sendCommand = async (command, vehicle, commandName) => {
    if (!vehicle.sim_card_number) {
      setLastCommandResult({
        type: 'error',
        message: `⚠️ No SIM card assigned to ${vehicle.vehicle_id}`
      })
      setTimeout(() => setLastCommandResult(null), 5000)
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}`)
      return
    }
    
    setCommandLoading(true)
    setCommandStatus({ type: 'loading', message: `Sending ${commandName}...` })
    setLastCommandResult({ type: 'loading', message: `📡 Sending ${commandName} command to ${vehicle.vehicle_id}...` })
    
    try {
      const result = await smsService.sendCommandToVehicle(vehicle.id, command)
      if (result.success) {
        const commandMap = {
          'cutoil': 'Engine STOP',
          'resume': 'Engine START',
          'status': 'Status Request'
        }
        setLastCommandResult({
          type: 'success',
          message: `✅ ${commandName} sent to ${vehicle.vehicle_id}`,
          details: `Command: ${command}${vehicle.tracker_password || '123456'} → ${vehicle.sim_card_number}`,
          command: commandMap[command] || commandName
        })
        setCommandStatus({ type: 'success', message: `✅ ${commandName} sent to ${vehicle.vehicle_id}` })
      } else {
        setLastCommandResult({
          type: 'error',
          message: `❌ Failed: ${result.error}`,
          details: 'Check SIM card and network connectivity'
        })
        setCommandStatus({ type: 'error', message: `❌ Failed: ${result.error}` })
      }
    } catch (error) {
      setLastCommandResult({
        type: 'error',
        message: `❌ Failed: ${error.message}`,
        details: 'Check LibreSMS connection'
      })
      setCommandStatus({ type: 'error', message: `❌ Failed: ${error.message}` })
    }
    setCommandLoading(false)
    setTimeout(() => {
      setCommandStatus(null)
    }, 5000)
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'moving': return '🚗'
      case 'parked': return '🅿️'
      case 'alert': return '⚠️'
      case 'idle': return '💤'
      default: return '📍'
    }
  }

  const getStatusDescription = (status) => {
    switch(status) {
      case 'moving': return 'Vehicle is in motion'
      case 'parked': return 'Vehicle is stationary'
      case 'alert': return 'Emergency/Alert condition'
      case 'idle': return 'Vehicle is idle'
      default: return 'Unknown status'
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' || 
      vehicle.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleResizeStart = (e) => {
    setIsResizing(true)
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  const handleResizeMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX
      if (newWidth > 320 && newWidth < 650) {
        setSidebarWidth(newWidth)
      }
    }
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading fleet data...</p>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
        <style>{`
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: radial-gradient(ellipse at center, #0a1628, #030912);
            color: white;
          }
          .loading-content {
            text-align: center;
          }
          .loading-spinner {
            position: relative;
            width: 60px;
            height: 60px;
            margin: 0 auto 30px;
          }
          .spinner-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid transparent;
            animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          }
          .spinner-ring:nth-child(1) {
            border-top-color: #0a6fff;
            animation-delay: 0s;
          }
          .spinner-ring:nth-child(2) {
            border-right-color: #00c3ff;
            animation-delay: 0.2s;
          }
          .spinner-ring:nth-child(3) {
            border-bottom-color: #22c55e;
            animation-delay: 0.4s;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-text {
            font-family: var(--font-tech, monospace);
            color: #94a3b8;
            font-size: 14px;
            letter-spacing: 2px;
            margin-bottom: 20px;
          }
          .loading-bar {
            width: 200px;
            height: 2px;
            background: rgba(10, 111, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto;
          }
          .loading-progress {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #0a6fff, #00c3ff);
            border-radius: 2px;
            animation: progress 1.5s ease-in-out infinite;
          }
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="live-tracking-container">
      {/* Command Status Toast */}
      {commandStatus && (
        <div className={`command-toast ${commandStatus.type}`}>
          <div className="toast-icon">
            {commandStatus.type === 'loading' && '⏳'}
            {commandStatus.type === 'success' && '✅'}
            {commandStatus.type === 'error' && '❌'}
          </div>
          <span>{commandStatus.message}</span>
          <button className="toast-close" onClick={() => setCommandStatus(null)}>✕</button>
        </div>
      )}

      {/* Main Layout - Side by Side */}
      <div className="main-layout">
        {/* Map Section */}
        <div className="map-section">
          {vehicles.length > 0 ? (
            <TrackerMap 
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onMarkerClick={handleMarkerClick}
            />
          ) : (
            <div className="no-vehicles-map">
              <div className="no-vehicles-content">
                <div className="empty-icon">🚛</div>
                <h3>No Vehicles Found</h3>
                <p>Add vehicles in the Tracker Management page to start tracking</p>
                <button onClick={handleRefresh} className="refresh-btn">
                  <span className="btn-icon">⟳</span> Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fleet Command Center Sidebar */}
        <div 
          className={`sidebar ${!showSidebar ? 'closed' : ''}`}
          style={{ width: showSidebar ? sidebarWidth : 0 }}
          ref={sidebarRef}
        >
          {showSidebar && (
            <div 
              className="resize-handle"
              onMouseDown={handleResizeStart}
              title="Drag to resize"
            >
              <div className="resize-line"></div>
            </div>
          )}

          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-title">
              <span className="title-icon">🚛</span>
              <div>
                <h2>Fleet Command Center</h2>
                <span className="title-sub">Real-time vehicle monitoring & control</span>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="close-sidebar"
                onClick={() => setShowSidebar(false)}
                title="Hide sidebar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="stats-dashboard">
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-value">{selectedStats?.total || 0}</span>
                  <span className="stat-label">Total Fleet</span>
                </div>
              </div>
              <div className="stat-card online">
                <div className="stat-icon">📡</div>
                <div className="stat-info">
                  <span className="stat-value">{selectedStats?.online || 0}</span>
                  <span className="stat-label">Online</span>
                </div>
              </div>
              <div className="stat-card moving">
                <div className="stat-icon">🚗</div>
                <div className="stat-info">
                  <span className="stat-value">{selectedStats?.moving || 0}</span>
                  <span className="stat-label">Moving</span>
                </div>
              </div>
              <div className="stat-card parked">
                <div className="stat-icon">🅿️</div>
                <div className="stat-info">
                  <span className="stat-value">{selectedStats?.parked || 0}</span>
                  <span className="stat-label">Parked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracker Status */}
          <div className="tracker-status-bar">
            <div className="status-item">
              <span className="status-dot active"></span>
              <span className="status-label">Active</span>
              <span className="status-count">{selectedStats?.active || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-dot expiring"></span>
              <span className="status-label">Expiring</span>
              <span className="status-count">{selectedStats?.expiring || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-dot expired"></span>
              <span className="status-label">Expired</span>
              <span className="status-count">{selectedStats?.expired || 0}</span>
            </div>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by ID, name or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="sidebar-filters">
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All <span className="filter-count">{vehicles.length}</span>
            </button>
            <button 
              className={`filter-btn moving ${statusFilter === 'moving' ? 'active' : ''}`}
              onClick={() => setStatusFilter('moving')}
            >
              <span className="dot green"></span> Moving <span className="filter-count">{selectedStats?.moving || 0}</span>
            </button>
            <button 
              className={`filter-btn parked ${statusFilter === 'parked' ? 'active' : ''}`}
              onClick={() => setStatusFilter('parked')}
            >
              <span className="dot yellow"></span> Parked <span className="filter-count">{selectedStats?.parked || 0}</span>
            </button>
            <button 
              className={`filter-btn alert ${statusFilter === 'alert' ? 'active' : ''}`}
              onClick={() => setStatusFilter('alert')}
            >
              <span className="dot red"></span> Alert <span className="filter-count">{selectedStats?.alert || 0}</span>
            </button>
          </div>

          {/* Vehicle List */}
          <div className="vehicle-list">
            {filteredVehicles.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No vehicles found</p>
                <span className="empty-hint">Try adjusting your search or filters</span>
              </div>
            ) : (
              filteredVehicles.map(vehicle => {
                const hasLiveLocation = vehicle.latitude && vehicle.longitude
                const isSelected = selectedVehicle?.id === vehicle.id
                const isHovered = hoveredVehicle?.id === vehicle.id
                const statusColor = getStatusColor(vehicle.status)
                const statusIcon = getStatusIcon(vehicle.status)
                const statusDesc = getStatusDescription(vehicle.status)
                
                return (
                  <div 
                    key={vehicle.id}
                    className={`vehicle-item ${isSelected ? 'selected' : ''} ${hasLiveLocation ? 'has-location' : ''} ${isHovered ? 'hovered' : ''}`}
                    onClick={() => {
                      handleMarkerClick(vehicle)
                      const el = document.getElementById(`vehicle-${vehicle.id}`)
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    onMouseEnter={() => setHoveredVehicle(vehicle)}
                    onMouseLeave={() => setHoveredVehicle(null)}
                    id={`vehicle-${vehicle.id}`}
                    style={{
                      borderColor: isSelected ? statusColor : hasLiveLocation ? 'rgba(34, 197, 94, 0.15)' : 'rgba(10, 111, 255, 0.06)',
                      boxShadow: isSelected ? `0 0 20px ${statusColor}33` : 'none'
                    }}
                  >
                    <div className="vehicle-info">
                      <div className="vehicle-status">
                        <span 
                          className="status-dot" 
                          style={{ background: statusColor }}
                        ></span>
                        <span className="vehicle-id">{vehicle.vehicle_id}</span>
                        {hasLiveLocation ? (
                          <span className="live-badge">● LIVE</span>
                        ) : (
                          <span className="offline-badge">○ OFFLINE</span>
                        )}
                        {vehicle.speed > 80 && <span className="speed-warning" title="Speeding!">⚡</span>}
                      </div>
                      <div className="vehicle-details">
                        <span className="vehicle-name">{vehicle.name || 'Unnamed'}</span>
                        <span className="vehicle-driver">👤 {vehicle.driver_name || 'No driver'}</span>
                        <span className="vehicle-speed" style={{ color: vehicle.speed > 80 ? '#ef4444' : '#22c55e' }}>
                          ⚡ {vehicle.speed || 0} km/h
                        </span>
                      </div>
                      <div className="vehicle-status-text">
                        <span className="status-icon">{statusIcon}</span>
                        <span className="status-desc">{statusDesc}</span>
                      </div>
                      {hasLiveLocation && (
                        <div className="vehicle-coords">
                          📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                        </div>
                      )}
                      <div className="vehicle-meta">
                        <span className="meta-item">📱 {vehicle.sim_card_number || 'No SIM'}</span>
                        <span className="meta-item">🔑 {vehicle.tracker_password || '123456'}</span>
                        <span className="meta-item">📅 {vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry).toLocaleDateString() : 'No expiry'}</span>
                      </div>
                    </div>
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
                          sendCommand('cutoil', vehicle, 'STOP')
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
                          sendCommand('resume', vehicle, 'START')
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
                          sendCommand('status', vehicle, 'STATUS')
                        }}
                        disabled={commandLoading || !vehicle.sim_card_number}
                        title="Get tracker status"
                      >
                        📊 Status
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          {/* Footer */}
          <div className="sidebar-footer">
            <div className="footer-left">
              <span className="footer-text">© 2026 Fleet Tracker</span>
              <span className="footer-divider">|</span>
              <span className="footer-version">v2.0</span>
            </div>
            <div className="footer-right">
              <button 
                className={`refresh-btn-small ${isRefreshing ? 'spinning' : ''}`}
                onClick={handleRefresh}
                title="Refresh fleet data"
              >
                ⟳
              </button>
              <span className="footer-status">
                <span className="status-dot-small online"></span>
                {vehicles.filter(v => v.latitude).length} online
              </span>
            </div>
          </div>
        </div>

        {/* Show Sidebar Button */}
        {!showSidebar && (
          <button 
            className="show-sidebar-btn"
            onClick={() => setShowSidebar(true)}
          >
            <span className="btn-icon">▶</span>
            <span className="btn-text">Show Fleet</span>
          </button>
        )}
      </div>

      {/* Map Controls */}
      <div className="map-controls">
        <button 
          className="control-btn"
          onClick={() => setMapLayer(mapLayer === 'satellite' ? 'roadmap' : 'satellite')}
          title="Toggle Map Type"
        >
          {mapLayer === 'satellite' ? '🛰️' : '🗺️'}
        </button>
        <button 
          className="control-btn"
          onClick={handleRefresh}
          title="Refresh"
        >
          ⟳
        </button>
      </div>

      <style jsx>{`
        .live-tracking-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #030912;
          overflow: hidden;
        }

        .main-layout {
          display: flex;
          width: 100%;
          height: 100vh;
        }

        /* Map Section */
        .map-section {
          flex: 1;
          height: 100vh;
          position: relative;
          background: #030912;
        }

        .map-section > div {
          width: 100% !important;
          height: 100% !important;
        }

        /* No Vehicles */
        .no-vehicles-map {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at center, #0a1628, #030912);
        }

        .no-vehicles-content {
          text-align: center;
          color: white;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .no-vehicles-content .empty-icon {
          font-size: 72px;
          display: block;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-vehicles-content h3 {
          font-size: 24px;
          font-family: var(--font-head, sans-serif);
          margin-bottom: 10px;
        }

        .no-vehicles-content p {
          color: #94a3b8;
          margin-bottom: 24px;
          font-family: var(--font-tech, monospace);
        }

        .refresh-btn {
          background: linear-gradient(135deg, #0a6fff, #0055cc);
          color: white;
          border: none;
          padding: 10px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(10, 111, 255, 0.3);
        }

        .refresh-btn .btn-icon {
          font-size: 18px;
        }

        /* Sidebar */
        .sidebar {
          height: 100vh;
          background: linear-gradient(180deg, rgba(6, 14, 30, 0.98), rgba(2, 6, 16, 0.99));
          border-left: 1px solid rgba(10, 111, 255, 0.1);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          min-width: 320px;
          max-width: 650px;
        }

        .sidebar.closed {
          width: 0 !important;
          min-width: 0;
          border: none;
        }

        /* Resize Handle */
        .resize-handle {
          position: absolute;
          left: -4px;
          top: 0;
          bottom: 0;
          width: 8px;
          cursor: col-resize;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .resize-handle:hover .resize-line,
        .resize-handle:active .resize-line {
          background: rgba(10, 111, 255, 0.5);
          height: 80px;
        }

        .resize-line {
          width: 2px;
          height: 40px;
          background: rgba(10, 111, 255, 0.15);
          border-radius: 2px;
          transition: all 0.3s;
        }

        /* Sidebar Header */
        .sidebar-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-shrink: 0;
        }

        .sidebar-title {
          display: flex;
          gap: 12px;
        }

        .sidebar-title .title-icon {
          font-size: 28px;
        }

        .sidebar-title h2 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 0;
          font-family: var(--font-head, sans-serif);
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-sub {
          font-size: 11px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          display: block;
          margin-top: 2px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-sidebar {
          background: rgba(10, 111, 255, 0.08);
          border: none;
          color: #94a3b8;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-sidebar:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        /* Stats Dashboard */
        .stats-dashboard {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.05);
          flex-shrink: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(8, 20, 50, 0.3);
          border-radius: 10px;
          padding: 12px 14px;
          border: 1px solid rgba(10, 111, 255, 0.05);
          transition: all 0.2s;
        }

        .stat-card:hover {
          background: rgba(10, 111, 255, 0.05);
          transform: translateY(-1px);
        }

        .stat-card .stat-icon {
          font-size: 20px;
        }

        .stat-card .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-card .stat-value {
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-display, sans-serif);
          color: white;
        }

        .stat-card .stat-label {
          font-size: 9px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card.total .stat-value { color: #0a6fff; }
        .stat-card.online .stat-value { color: #22c55e; }
        .stat-card.moving .stat-value { color: #22c55e; }
        .stat-card.parked .stat-value { color: #f59e0b; }

        /* Tracker Status Bar */
        .tracker-status-bar {
          display: flex;
          gap: 16px;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.05);
          flex-shrink: 0;
          background: rgba(8, 20, 50, 0.2);
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-tech, monospace);
          font-size: 11px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.active { background: #22c55e; box-shadow: 0 0 8px rgba(34, 197, 94, 0.3); }
        .status-dot.expiring { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.3); }
        .status-dot.expired { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }

        .status-label {
          color: #94a3b8;
        }

        .status-count {
          color: white;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          padding: 0 8px;
          border-radius: 10px;
        }

        /* Search */
        .sidebar-search {
          padding: 12px 20px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.05);
          flex-shrink: 0;
        }

        .search-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          opacity: 0.5;
        }

        .search-wrapper input {
          width: 100%;
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid rgba(10, 111, 255, 0.1);
          border-radius: 10px;
          padding: 10px 12px 10px 36px;
          color: white;
          font-size: 13px;
          outline: none;
          font-family: var(--font-tech, monospace);
          transition: all 0.2s;
        }

        .search-wrapper input:focus {
          border-color: #0a6fff;
          box-shadow: 0 0 0 3px rgba(10, 111, 255, 0.1);
        }

        .search-wrapper input::placeholder {
          color: #4a5a7a;
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #4a5a7a;
          cursor: pointer;
          font-size: 12px;
          transition: color 0.2s;
        }

        .search-clear:hover {
          color: white;
        }

        /* Filters */
        .sidebar-filters {
          display: flex;
          gap: 6px;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.05);
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .filter-btn {
          background: rgba(8, 20, 50, 0.4);
          border: 1px solid rgba(10, 111, 255, 0.08);
          border-radius: 20px;
          padding: 6px 14px;
          color: #94a3b8;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-tech, monospace);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-btn:hover {
          background: rgba(10, 111, 255, 0.08);
        }

        .filter-btn.active {
          background: rgba(10, 111, 255, 0.15);
          border-color: #0a6fff;
          color: #0a6fff;
        }

        .filter-btn.moving.active {
          background: rgba(34, 197, 94, 0.15);
          border-color: #22c55e;
          color: #22c55e;
        }

        .filter-btn.parked.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .filter-btn.alert.active {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
          color: #ef4444;
        }

        .filter-count {
          background: rgba(255, 255, 255, 0.05);
          padding: 0 6px;
          border-radius: 10px;
          font-size: 10px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.green { background: #22c55e; }
        .dot.yellow { background: #f59e0b; }
        .dot.red { background: #ef4444; }

        /* Vehicle List */
        .vehicle-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
        }

        .vehicle-list::-webkit-scrollbar {
          width: 3px;
        }

        .vehicle-list::-webkit-scrollbar-track {
          background: rgba(10, 111, 255, 0.05);
        }

        .vehicle-list::-webkit-scrollbar-thumb {
          background: rgba(10, 111, 255, 0.3);
          border-radius: 4px;
        }

        .vehicle-item {
          background: rgba(8, 20, 50, 0.3);
          border: 1px solid rgba(10, 111, 255, 0.06);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .vehicle-item:hover {
          background: rgba(10, 111, 255, 0.06);
          transform: translateX(4px);
        }

        .vehicle-item.hovered {
          background: rgba(10, 111, 255, 0.08);
        }

        .vehicle-item.selected {
          background: rgba(10, 111, 255, 0.1);
        }

        .vehicle-item.has-location {
          border-color: rgba(34, 197, 94, 0.12);
        }

        .vehicle-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10%;
          bottom: 10%;
          width: 3px;
          background: transparent;
          border-radius: 0 3px 3px 0;
          transition: background 0.3s;
        }

        .vehicle-item.selected::before {
          background: #0a6fff;
        }

        .vehicle-item.has-location::before {
          background: rgba(34, 197, 94, 0.3);
        }

        .vehicle-info {
          margin-bottom: 10px;
        }

        .vehicle-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .vehicle-id {
          font-size: 14px;
          font-weight: 600;
          color: white;
          font-family: var(--font-head, sans-serif);
        }

        .live-badge {
          font-size: 8px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          padding: 2px 10px;
          border-radius: 10px;
          animation: pulse 1.5s infinite;
          border: 1px solid rgba(34, 197, 94, 0.2);
          font-weight: 600;
        }

        .offline-badge {
          font-size: 8px;
          color: #4a5a7a;
          background: rgba(74, 90, 122, 0.15);
          padding: 2px 10px;
          border-radius: 10px;
          font-weight: 600;
        }

        .speed-warning {
          font-size: 14px;
          animation: pulse 0.8s infinite;
        }

        .vehicle-details {
          display: flex;
          gap: 14px;
          font-size: 11px;
          color: #94a3b8;
          font-family: var(--font-tech, monospace);
          flex-wrap: wrap;
        }

        .vehicle-status-text {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          font-size: 11px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
        }

        .status-icon {
          font-size: 12px;
        }

        .status-desc {
          color: #94a3b8;
        }

        .vehicle-coords {
          font-size: 10px;
          color: #0a6fff;
          margin-top: 4px;
          font-family: monospace;
          opacity: 0.7;
        }

        .vehicle-meta {
          display: flex;
          gap: 12px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(10, 111, 255, 0.05);
          font-size: 10px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .vehicle-actions {
          display: flex;
          gap: 6px;
          margin-top: 10px;
        }

        .action-btn {
          flex: 1;
          background: rgba(10, 111, 255, 0.06);
          border: 1px solid rgba(10, 111, 255, 0.06);
          color: #94a3b8;
          padding: 6px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-family: var(--font-tech, monospace);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          text-align: center;
        }

        .action-btn:hover:not(:disabled) {
          background: rgba(10, 111, 255, 0.15);
          color: white;
          transform: translateY(-1px);
        }

        .action-btn.location:hover:not(:disabled) {
          background: rgba(10, 111, 255, 0.2);
          color: #0a6fff;
          border-color: rgba(10, 111, 255, 0.3);
        }

        .action-btn.stop:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .action-btn.start:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.2);
        }

        .action-btn.status:hover:not(:disabled) {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #4a5a7a;
        }

        .empty-state .empty-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .empty-state .empty-hint {
          font-size: 12px;
          color: #4a5a7a;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 12px 20px;
          border-top: 1px solid rgba(10, 111, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-tech, monospace);
          font-size: 10px;
          color: #2a3a5a;
          flex-shrink: 0;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-divider {
          color: #1a2a4a;
        }

        .footer-version {
          background: rgba(10, 111, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
          color: #0a6fff;
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .refresh-btn-small {
          background: none;
          border: none;
          color: #4a5a7a;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
          padding: 4px;
        }

        .refresh-btn-small:hover {
          color: white;
          transform: rotate(45deg);
        }

        .refresh-btn-small.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #4a5a7a;
        }

        .status-dot-small {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot-small.online {
          background: #22c55e;
        }

        /* Show Sidebar Button */
        .show-sidebar-btn {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(6, 14, 30, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(10, 111, 255, 0.3);
          color: white;
          padding: 14px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 50;
        }

        .show-sidebar-btn:hover {
          background: rgba(10, 111, 255, 0.2);
          transform: translateY(-50%) scale(1.05);
        }

        .show-sidebar-btn .btn-icon {
          font-size: 22px;
        }

        .show-sidebar-btn .btn-text {
          font-size: 9px;
          color: #94a3b8;
          font-family: var(--font-tech, monospace);
          writing-mode: vertical-rl;
          letter-spacing: 2px;
        }

        /* Command Toast */
        .command-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          border-radius: 12px;
          color: white;
          z-index: 9999;
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .command-toast.loading {
          background: linear-gradient(135deg, rgba(10, 111, 255, 0.9), rgba(0, 195, 255, 0.9));
        }
        .command-toast.success {
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.95), rgba(16, 185, 129, 0.95));
        }
        .command-toast.error {
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(239, 68, 68, 0.95));
        }

        .toast-icon {
          font-size: 18px;
        }

        .toast-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 16px;
          padding: 0 4px;
          transition: color 0.2s;
          margin-left: auto;
        }

        .toast-close:hover {
          color: white;
        }

        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        /* Map Controls */
        .map-controls {
          position: fixed;
          right: 20px;
          bottom: 30px;
          z-index: 500;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-btn {
          background: rgba(6, 14, 30, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(10, 111, 255, 0.2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          background: rgba(10, 111, 255, 0.2);
          transform: scale(1.05);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sidebar {
            min-width: 340px;
            max-width: 420px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            right: 0;
            top: 0;
            height: 100vh;
            width: 85% !important;
            max-width: 380px !important;
            min-width: 0 !important;
            z-index: 100;
            box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
            transform: translateX(0);
          }

          .sidebar.closed {
            transform: translateX(100%);
            width: 85% !important;
          }

          .resize-handle {
            display: none;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .command-toast {
            top: 10px;
            left: 16px;
            right: 16px;
            transform: none;
            max-width: none;
            font-size: 12px;
            padding: 10px 14px;
          }

          .map-controls {
            right: 16px;
            bottom: 20px;
          }

          .control-btn {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }

          .show-sidebar-btn {
            right: 16px;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 90% !important;
            max-width: 340px !important;
          }

          .sidebar-header {
            padding: 16px 16px;
          }
          .sidebar-title h2 {
            font-size: 15px;
          }
          .title-sub {
            font-size: 10px;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .stat-card {
            padding: 10px 12px;
          }
          .stat-card .stat-value {
            font-size: 16px;
          }
          .stat-card .stat-label {
            font-size: 8px;
          }
          .tracker-status-bar {
            padding: 8px 16px;
            gap: 10px;
          }
          .status-item {
            font-size: 10px;
          }
          .sidebar-search {
            padding: 10px 16px;
          }
          .sidebar-filters {
            padding: 8px 16px;
          }
          .filter-btn {
            font-size: 10px;
            padding: 4px 10px;
          }
          .vehicle-list {
            padding: 8px 10px;
          }
          .vehicle-item {
            padding: 10px 12px;
          }
          .vehicle-id {
            font-size: 12px;
          }
          .vehicle-details {
            font-size: 10px;
            gap: 8px;
          }
          .vehicle-actions {
            flex-wrap: wrap;
          }
          .action-btn {
            font-size: 10px;
            padding: 5px 6px;
            min-width: 0;
          }
          .sidebar-footer {
            padding: 10px 16px;
            font-size: 9px;
          }
          .vehicle-meta {
            font-size: 9px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}

export default LiveTracking