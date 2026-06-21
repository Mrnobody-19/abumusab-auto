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
  
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState('fleet')
  const [autoOpenMap, setAutoOpenMap] = useState(false)
  
  const vehiclesRef = useRef([])
  const subscriptionRef = useRef(null)
  const pollingCleanupRef = useRef(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setMobileView('fleet')
      } else {
        setMobileView('map')
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
          
          if (isMobile) {
            setAutoOpenMap(true)
            setMobileView('map')
            setTimeout(() => setAutoOpenMap(false), 2000)
          }
          
          setCommandStatus({
            type: 'success',
            message: `📍 ${vehicle.vehicle_id} location updated`
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
  }, [isMobile])

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
    if (isMobile) {
      setMobileView('map')
    }
  }

  const sendGetLocation = async (vehicle) => {
    if (!vehicle.sim_card_number) {
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}`)
      return
    }
    
    setCommandLoading(true)
    setCommandStatus({ type: 'loading', message: `Requesting location...` })
    
    try {
      const result = await smsService.getLocationForVehicle(vehicle.id)
      if (result.success) {
        setCommandStatus({ type: 'success', message: `✅ Location request sent` })
      } else {
        setCommandStatus({ type: 'error', message: `❌ Failed: ${result.error}` })
      }
    } catch (error) {
      setCommandStatus({ type: 'error', message: `❌ Failed: ${error.message}` })
    }
    setCommandLoading(false)
    setTimeout(() => setCommandStatus(null), 5000)
  }

  const sendCommand = async (command, vehicle, commandName) => {
    if (!vehicle.sim_card_number) {
      alert(`⚠️ No SIM card assigned to ${vehicle.vehicle_id}`)
      return
    }
    
    setCommandLoading(true)
    setCommandStatus({ type: 'loading', message: `Sending ${commandName}...` })
    
    try {
      const result = await smsService.sendCommandToVehicle(vehicle.id, command)
      if (result.success) {
        setCommandStatus({ type: 'success', message: `✅ ${commandName} sent` })
      } else {
        setCommandStatus({ type: 'error', message: `❌ Failed: ${result.error}` })
      }
    } catch (error) {
      setCommandStatus({ type: 'error', message: `❌ Failed: ${error.message}` })
    }
    setCommandLoading(false)
    setTimeout(() => setCommandStatus(null), 5000)
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

  const switchMobileView = (view) => {
    setMobileView(view)
    if (view === 'map') {
      setAutoOpenMap(true)
      setTimeout(() => setAutoOpenMap(false), 1000)
    }
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
        </div>
        <style>{`
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #030912;
            color: white;
          }
          .loading-content { text-align: center; }
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

      {!isMobile ? (
        /* ====== DESKTOP LAYOUT ====== */
        <div className="main-layout">
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
                  <p>Add vehicles to start tracking</p>
                  <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
                </div>
              </div>
            )}
          </div>

          {/* Fleet Command Center - Desktop */}
          <div 
            className="sidebar"
            style={{ width: showSidebar ? sidebarWidth : 0 }}
          >
            {showSidebar && (
              <div 
                className="resize-handle"
                onMouseDown={handleResizeStart}
              >
                <div className="resize-line"></div>
              </div>
            )}

            {/* Header */}
            <div className="sidebar-header">
              <div className="sidebar-title">
                <span className="title-icon">🚛</span>
                <div>
                  <h2>Fleet Command</h2>
                  <span className="title-sub">Real-time monitoring & control</span>
                </div>
              </div>
              <div className="header-actions">
                <button 
                  className="close-sidebar"
                  onClick={() => setShowSidebar(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-modern">
              <div className="stat-card-modern">
                <span className="stat-number">{selectedStats?.total || 0}</span>
                <span className="stat-label-modern">Total Fleet</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-number" style={{ color: '#22c55e' }}>{selectedStats?.online || 0}</span>
                <span className="stat-label-modern">Online</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-number" style={{ color: '#22c55e' }}>{selectedStats?.moving || 0}</span>
                <span className="stat-label-modern">Moving</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-number" style={{ color: '#f59e0b' }}>{selectedStats?.parked || 0}</span>
                <span className="stat-label-modern">Parked</span>
              </div>
            </div>

            {/* Tracker Status */}
            <div className="tracker-status-modern">
              <div className="status-chip">
                <span className="chip-dot active"></span>
                Active <span className="chip-count">{selectedStats?.active || 0}</span>
              </div>
              <div className="status-chip">
                <span className="chip-dot expiring"></span>
                Expiring <span className="chip-count">{selectedStats?.expiring || 0}</span>
              </div>
              <div className="status-chip">
                <span className="chip-dot expired"></span>
                Expired <span className="chip-count">{selectedStats?.expired || 0}</span>
              </div>
            </div>

            {/* Search */}
            <div className="search-modern">
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

            {/* Filters */}
            <div className="filters-modern">
              <button 
                className={`filter-modern ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All <span className="filter-count">{vehicles.length}</span>
              </button>
              <button 
                className={`filter-modern moving ${statusFilter === 'moving' ? 'active' : ''}`}
                onClick={() => setStatusFilter('moving')}
              >
                <span className="dot green"></span> Moving
              </button>
              <button 
                className={`filter-modern parked ${statusFilter === 'parked' ? 'active' : ''}`}
                onClick={() => setStatusFilter('parked')}
              >
                <span className="dot yellow"></span> Parked
              </button>
              <button 
                className={`filter-modern alert ${statusFilter === 'alert' ? 'active' : ''}`}
                onClick={() => setStatusFilter('alert')}
              >
                <span className="dot red"></span> Alert
              </button>
            </div>

            {/* Vehicle List */}
            <div className="vehicle-list-modern">
              {filteredVehicles.length === 0 ? (
                <div className="empty-state">
                  <p>No vehicles found</p>
                </div>
              ) : (
                filteredVehicles.map(vehicle => {
                  const hasLiveLocation = vehicle.latitude && vehicle.longitude
                  const isSelected = selectedVehicle?.id === vehicle.id
                  const statusColor = getStatusColor(vehicle.status)
                  const statusIcon = vehicle.status === 'moving' ? '🚗' : 
                                   vehicle.status === 'parked' ? '🅿️' : 
                                   vehicle.status === 'alert' ? '⚠️' : '💤'
                  
                  return (
                    <div 
                      key={vehicle.id}
                      className={`vehicle-card-modern ${isSelected ? 'selected' : ''} ${hasLiveLocation ? 'online' : 'offline'}`}
                      onClick={() => handleMarkerClick(vehicle)}
                      style={{
                        borderColor: isSelected ? statusColor : 'transparent'
                      }}
                    >
                      <div className="vehicle-card-header">
                        <div className="vehicle-name-id">
                          <span className="status-dot-modern" style={{ background: statusColor }}></span>
                          <span className="vehicle-id-modern">{vehicle.vehicle_id}</span>
                          <span className="status-badge-modern">{hasLiveLocation ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                        <span className="vehicle-speed-modern" style={{ color: vehicle.speed > 80 ? '#ef4444' : '#22c55e' }}>
                          {vehicle.speed || 0} km/h
                        </span>
                      </div>
                      <div className="vehicle-card-body">
                        <span className="vehicle-name">{vehicle.name || 'Unnamed'}</span>
                        <span className="vehicle-driver">👤 {vehicle.driver_name || 'No driver'}</span>
                      </div>
                      <div className="vehicle-status-text-modern">
                        <span>{statusIcon}</span>
                        <span>
                          {vehicle.status === 'moving' ? 'Vehicle is moving' : 
                           vehicle.status === 'parked' ? 'Vehicle is stationary' : 
                           vehicle.status === 'alert' ? 'Emergency condition' : 'Vehicle is idle'}
                        </span>
                      </div>
                      {hasLiveLocation && (
                        <div className="vehicle-coords-modern">
                          📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                        </div>
                      )}
                      <div className="vehicle-meta-modern">
                        <span>📱 {vehicle.sim_card_number || 'No SIM'}</span>
                        <span>🔑 {vehicle.tracker_password || '123456'}</span>
                        <span>📅 {vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry).toLocaleDateString() : 'No expiry'}</span>
                      </div>
                      <div className="vehicle-actions-modern">
                        <button 
                          className="action-modern location"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendGetLocation(vehicle)
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                        >
                          📍 Get Location
                        </button>
                        <button 
                          className="action-modern stop"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendCommand('cutoil', vehicle, 'STOP')
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                        >
                          🛑 Stop
                        </button>
                        <button 
                          className="action-modern start"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendCommand('resume', vehicle, 'START')
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
                        >
                          ▶️ Start
                        </button>
                        <button 
                          className="action-modern status"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendCommand('status', vehicle, 'STATUS')
                          }}
                          disabled={commandLoading || !vehicle.sim_card_number}
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
            <div className="sidebar-footer-modern">
              <span>© 2026 Fleet Tracker</span>
              <span className="footer-version-modern">v2.0</span>
            </div>
          </div>
        </div>
      ) : (
        /* ====== MOBILE LAYOUT ====== */
        <div className="mobile-layout">
          <div className="mobile-header">
            <div className="mobile-title">
              <span className="title-icon">🚛</span>
              <span>Fleet Command</span>
            </div>
            <button className="mobile-refresh" onClick={handleRefresh}>⟳</button>
          </div>

          <div className="mobile-tabs">
            <button 
              className={`mobile-tab ${mobileView === 'fleet' ? 'active' : ''}`}
              onClick={() => switchMobileView('fleet')}
            >
              📋 Fleet ({vehicles.length})
            </button>
            <button 
              className={`mobile-tab ${mobileView === 'map' ? 'active' : ''}`}
              onClick={() => switchMobileView('map')}
            >
              🗺️ Map
            </button>
          </div>

          <div className="mobile-content">
            {mobileView === 'fleet' && (
              <div className="mobile-fleet">
                <div className="mobile-stats">
                  <div className="mobile-stat">
                    <span className="mobile-stat-value">{selectedStats?.total || 0}</span>
                    <span className="mobile-stat-label">Total</span>
                  </div>
                  <div className="mobile-stat">
                    <span className="mobile-stat-value" style={{ color: '#22c55e' }}>{selectedStats?.online || 0}</span>
                    <span className="mobile-stat-label">Online</span>
                  </div>
                  <div className="mobile-stat">
                    <span className="mobile-stat-value" style={{ color: '#22c55e' }}>{selectedStats?.moving || 0}</span>
                    <span className="mobile-stat-label">Moving</span>
                  </div>
                  <div className="mobile-stat">
                    <span className="mobile-stat-value" style={{ color: '#f59e0b' }}>{selectedStats?.parked || 0}</span>
                    <span className="mobile-stat-label">Parked</span>
                  </div>
                </div>

                <div className="mobile-search">
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="mobile-search-clear" onClick={() => setSearchTerm('')}>✕</button>
                  )}
                </div>

                <div className="mobile-filters">
                  <button 
                    className={`mobile-filter ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >All</button>
                  <button 
                    className={`mobile-filter ${statusFilter === 'moving' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('moving')}
                  >Moving</button>
                  <button 
                    className={`mobile-filter ${statusFilter === 'parked' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('parked')}
                  >Parked</button>
                  <button 
                    className={`mobile-filter ${statusFilter === 'alert' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('alert')}
                  >Alert</button>
                </div>

                <div className="mobile-vehicle-list">
                  {filteredVehicles.map(vehicle => {
                    const hasLiveLocation = vehicle.latitude && vehicle.longitude
                    const statusColor = getStatusColor(vehicle.status)
                    
                    return (
                      <div 
                        key={vehicle.id}
                        className="mobile-vehicle-item"
                        onClick={() => {
                          handleMarkerClick(vehicle)
                          switchMobileView('map')
                        }}
                      >
                        <div className="mobile-vehicle-header">
                          <div className="mobile-vehicle-id">
                            <span className="status-dot" style={{ background: statusColor }}></span>
                            {vehicle.vehicle_id}
                            {hasLiveLocation && <span className="live-badge">●</span>}
                          </div>
                          <span className="mobile-vehicle-speed">{vehicle.speed || 0} km/h</span>
                        </div>
                        <div className="mobile-vehicle-details">
                          <span>{vehicle.name || 'Unnamed'}</span>
                          <span>👤 {vehicle.driver_name || 'No driver'}</span>
                        </div>
                        <div className="mobile-vehicle-actions">
                          <button 
                            className="mobile-action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              sendGetLocation(vehicle)
                            }}
                            disabled={commandLoading || !vehicle.sim_card_number}
                          >📍</button>
                          <button 
                            className="mobile-action-btn stop"
                            onClick={(e) => {
                              e.stopPropagation()
                              sendCommand('cutoil', vehicle, 'STOP')
                            }}
                            disabled={commandLoading || !vehicle.sim_card_number}
                          >🛑</button>
                          <button 
                            className="mobile-action-btn start"
                            onClick={(e) => {
                              e.stopPropagation()
                              sendCommand('resume', vehicle, 'START')
                            }}
                            disabled={commandLoading || !vehicle.sim_card_number}
                          >▶️</button>
                          <button 
                            className="mobile-action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              sendCommand('status', vehicle, 'STATUS')
                            }}
                            disabled={commandLoading || !vehicle.sim_card_number}
                          >📊</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {mobileView === 'map' && (
              <div className="mobile-map">
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
                      <h3>No Vehicles</h3>
                      <p>Add vehicles to start tracking</p>
                      <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
                    </div>
                  </div>
                )}
                <div className="mobile-map-controls">
                  <button 
                    className="map-control-btn"
                    onClick={() => setMapLayer(mapLayer === 'satellite' ? 'roadmap' : 'satellite')}
                  >
                    {mapLayer === 'satellite' ? '🛰️' : '🗺️'}
                  </button>
                  <button 
                    className="map-control-btn"
                    onClick={() => switchMobileView('fleet')}
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="map-controls">
          <button 
            className="control-btn"
            onClick={() => setMapLayer(mapLayer === 'satellite' ? 'roadmap' : 'satellite')}
          >
            {mapLayer === 'satellite' ? '🛰️' : '🗺️'}
          </button>
          <button 
            className="control-btn"
            onClick={handleRefresh}
          >
            ⟳
          </button>
        </div>
      )}

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

        .no-vehicles-map {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #030912;
        }
        .no-vehicles-content {
          text-align: center;
          color: white;
        }
        .no-vehicles-content .empty-icon {
          font-size: 60px;
          display: block;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .no-vehicles-content h3 {
          font-size: 20px;
          font-family: var(--font-head, sans-serif);
          margin-bottom: 8px;
        }
        .no-vehicles-content p {
          color: #94a3b8;
          margin-bottom: 16px;
          font-family: var(--font-tech, monospace);
        }
        .refresh-btn {
          background: linear-gradient(135deg, #0a6fff, #0055cc);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        /* ====== SIDEBAR MODERN ====== */
        .sidebar {
          height: 100vh;
          background: linear-gradient(180deg, #0a1628, #060e1e);
          border-left: 1px solid rgba(10, 111, 255, 0.08);
          display: flex;
          flex-direction: column;
          position: relative;
          min-width: 380px;
          max-width: 600px;
          overflow: hidden;
        }

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
        .resize-handle:hover .resize-line {
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

        .sidebar-header {
          padding: 18px 24px 14px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        .sidebar-title {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .sidebar-title .title-icon {
          font-size: 24px;
        }
        .sidebar-title h2 {
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin: 0;
          font-family: var(--font-head, sans-serif);
        }
        .title-sub {
          font-size: 10px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          display: block;
        }
        .close-sidebar {
          background: rgba(10, 111, 255, 0.06);
          border: none;
          color: #4a5a7a;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .close-sidebar:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        /* Stats Grid Modern */
        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 14px 20px 10px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.06);
          flex-shrink: 0;
        }
        .stat-card-modern {
          text-align: center;
          background: rgba(8, 20, 50, 0.3);
          border-radius: 8px;
          padding: 10px 8px;
          border: 1px solid rgba(10, 111, 255, 0.04);
        }
        .stat-number {
          display: block;
          font-size: 22px;
          font-weight: 700;
          font-family: var(--font-display, sans-serif);
          color: white;
        }
        .stat-label-modern {
          font-size: 9px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 2px;
        }

        /* Tracker Status Modern */
        .tracker-status-modern {
          display: flex;
          gap: 12px;
          padding: 8px 20px 12px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.06);
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .status-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-tech, monospace);
          font-size: 11px;
          color: #94a3b8;
          background: rgba(8, 20, 50, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(10, 111, 255, 0.04);
        }
        .chip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .chip-dot.active { background: #22c55e; }
        .chip-dot.expiring { background: #f59e0b; }
        .chip-dot.expired { background: #ef4444; }
        .chip-count {
          color: white;
          font-weight: 600;
          margin-left: 2px;
        }

        /* Search Modern */
        .search-modern {
          position: relative;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.06);
          flex-shrink: 0;
        }
        .search-modern .search-icon {
          position: absolute;
          left: 32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          opacity: 0.4;
        }
        .search-modern input {
          width: 100%;
          background: rgba(8, 20, 50, 0.4);
          border: 1px solid rgba(10, 111, 255, 0.06);
          border-radius: 8px;
          padding: 8px 12px 8px 36px;
          color: white;
          font-size: 12px;
          outline: none;
          font-family: var(--font-tech, monospace);
        }
        .search-modern input:focus {
          border-color: rgba(10, 111, 255, 0.2);
        }
        .search-modern input::placeholder {
          color: #4a5a7a;
        }
        .search-modern .search-clear {
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #4a5a7a;
          cursor: pointer;
        }

        /* Filters Modern */
        .filters-modern {
          display: flex;
          gap: 6px;
          padding: 8px 20px 12px;
          border-bottom: 1px solid rgba(10, 111, 255, 0.06);
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .filter-modern {
          background: rgba(8, 20, 50, 0.3);
          border: 1px solid rgba(10, 111, 255, 0.04);
          border-radius: 16px;
          padding: 4px 12px;
          color: #94a3b8;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-tech, monospace);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .filter-modern:hover {
          background: rgba(10, 111, 255, 0.06);
        }
        .filter-modern.active {
          background: rgba(10, 111, 255, 0.12);
          border-color: rgba(10, 111, 255, 0.2);
          color: #0a6fff;
        }
        .filter-modern.moving.active {
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }
        .filter-modern.parked.active {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        .filter-modern.alert.active {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .filter-count {
          background: rgba(255, 255, 255, 0.05);
          padding: 0 6px;
          border-radius: 10px;
          font-size: 9px;
          margin-left: 2px;
        }
        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot.green { background: #22c55e; }
        .dot.yellow { background: #f59e0b; }
        .dot.red { background: #ef4444; }

        /* Vehicle List Modern */
        .vehicle-list-modern {
          flex: 1;
          overflow-y: auto;
          padding: 10px 16px;
        }
        .vehicle-list-modern::-webkit-scrollbar {
          width: 3px;
        }
        .vehicle-list-modern::-webkit-scrollbar-thumb {
          background: rgba(10, 111, 255, 0.3);
          border-radius: 4px;
        }

        .vehicle-card-modern {
          background: rgba(8, 20, 50, 0.25);
          border: 1px solid rgba(10, 111, 255, 0.04);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vehicle-card-modern:hover {
          background: rgba(10, 111, 255, 0.04);
        }
        .vehicle-card-modern.selected {
          border-color: #0a6fff;
          background: rgba(10, 111, 255, 0.06);
        }
        .vehicle-card-modern.online {
          border-color: rgba(34, 197, 94, 0.08);
        }
        .vehicle-card-modern.offline {
          border-color: rgba(74, 90, 122, 0.08);
        }

        .vehicle-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .vehicle-name-id {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot-modern {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .vehicle-id-modern {
          font-size: 14px;
          font-weight: 600;
          color: white;
          font-family: var(--font-head, sans-serif);
        }
        .status-badge-modern {
          font-size: 8px;
          font-weight: 600;
          padding: 1px 8px;
          border-radius: 10px;
          font-family: var(--font-tech, monospace);
        }
        .vehicle-card-modern.online .status-badge-modern {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
        }
        .vehicle-card-modern.offline .status-badge-modern {
          color: #4a5a7a;
          background: rgba(74, 90, 122, 0.12);
        }
        .vehicle-speed-modern {
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-tech, monospace);
        }

        .vehicle-card-body {
          display: flex;
          gap: 14px;
          font-size: 11px;
          color: #94a3b8;
          font-family: var(--font-tech, monospace);
          margin-bottom: 4px;
        }
        .vehicle-name { color: #94a3b8; }
        .vehicle-driver { color: #4a5a7a; }

        .vehicle-status-text-modern {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          margin-bottom: 4px;
        }

        .vehicle-coords-modern {
          font-size: 10px;
          color: #0a6fff;
          font-family: monospace;
          opacity: 0.7;
          margin-bottom: 4px;
        }

        .vehicle-meta-modern {
          display: flex;
          gap: 12px;
          font-size: 10px;
          color: #2a3a5a;
          font-family: var(--font-tech, monospace);
          padding: 6px 0;
          border-top: 1px solid rgba(10, 111, 255, 0.04);
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .vehicle-actions-modern {
          display: flex;
          gap: 6px;
        }
        .action-modern {
          flex: 1;
          background: rgba(8, 20, 50, 0.3);
          border: 1px solid rgba(10, 111, 255, 0.04);
          color: #94a3b8;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-family: var(--font-tech, monospace);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          font-weight: 500;
        }
        .action-modern:hover:not(:disabled) {
          background: rgba(10, 111, 255, 0.08);
          color: white;
        }
        .action-modern.location:hover:not(:disabled) {
          color: #0a6fff;
          background: rgba(10, 111, 255, 0.1);
        }
        .action-modern.stop:hover:not(:disabled) {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .action-modern.start:hover:not(:disabled) {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }
        .action-modern.status:hover:not(:disabled) {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }
        .action-modern:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #4a5a7a;
        }

        .sidebar-footer-modern {
          padding: 10px 20px;
          border-top: 1px solid rgba(10, 111, 255, 0.04);
          display: flex;
          justify-content: space-between;
          font-family: var(--font-tech, monospace);
          font-size: 10px;
          color: #1a2a4a;
          flex-shrink: 0;
        }
        .footer-version-modern {
          color: #0a6fff;
        }

        .command-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 18px;
          border-radius: 10px;
          color: white;
          z-index: 9999;
          animation: slideDown 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .command-toast.loading { background: linear-gradient(135deg, rgba(10, 111, 255, 0.9), rgba(0, 195, 255, 0.9)); }
        .command-toast.success { background: linear-gradient(135deg, rgba(5, 150, 105, 0.95), rgba(16, 185, 129, 0.95)); }
        .command-toast.error { background: linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(239, 68, 68, 0.95)); }
        .toast-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 14px;
          margin-left: auto;
        }

        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }

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
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .control-btn:hover {
          background: rgba(10, 111, 255, 0.2);
        }

        /* ====== MOBILE STYLES ====== */
        .mobile-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background: #030912;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(6, 14, 30, 0.95);
          border-bottom: 1px solid rgba(10, 111, 255, 0.1);
          flex-shrink: 0;
          z-index: 10;
        }
        .mobile-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-head, sans-serif);
          font-size: 16px;
          font-weight: 700;
          color: white;
        }
        .mobile-title .title-icon { font-size: 20px; }
        .mobile-refresh {
          background: rgba(10, 111, 255, 0.1);
          border: 1px solid rgba(10, 111, 255, 0.2);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-tabs {
          display: flex;
          background: rgba(6, 14, 30, 0.95);
          border-bottom: 1px solid rgba(10, 111, 255, 0.1);
          flex-shrink: 0;
          z-index: 10;
        }
        .mobile-tab {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        .mobile-tab.active {
          color: #0a6fff;
          border-bottom-color: #0a6fff;
        }

        .mobile-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .mobile-fleet {
          height: 100%;
          overflow-y: auto;
          padding: 12px 16px;
          background: #030912;
        }
        .mobile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .mobile-stat {
          text-align: center;
          background: rgba(8, 20, 50, 0.4);
          border-radius: 8px;
          padding: 10px;
          border: 1px solid rgba(10, 111, 255, 0.05);
        }
        .mobile-stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-display, sans-serif);
          color: white;
        }
        .mobile-stat-label {
          font-size: 9px;
          color: #4a5a7a;
          font-family: var(--font-tech, monospace);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .mobile-search {
          position: relative;
          margin-bottom: 10px;
        }
        .mobile-search input {
          width: 100%;
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid rgba(10, 111, 255, 0.1);
          border-radius: 8px;
          padding: 10px 12px;
          color: white;
          font-size: 13px;
          outline: none;
          font-family: var(--font-tech, monospace);
        }
        .mobile-search input:focus { border-color: #0a6fff; }
        .mobile-search input::placeholder { color: #4a5a7a; }
        .mobile-search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #4a5a7a;
          cursor: pointer;
          font-size: 14px;
        }

        .mobile-filters {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .mobile-filter {
          background: rgba(8, 20, 50, 0.4);
          border: 1px solid rgba(10, 111, 255, 0.08);
          border-radius: 16px;
          padding: 5px 14px;
          color: #94a3b8;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-tech, monospace);
        }
        .mobile-filter.active {
          background: rgba(10, 111, 255, 0.15);
          border-color: #0a6fff;
          color: #0a6fff;
        }

        .mobile-vehicle-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-vehicle-item {
          background: rgba(8, 20, 50, 0.3);
          border: 1px solid rgba(10, 111, 255, 0.06);
          border-radius: 10px;
          padding: 12px 14px;
          cursor: pointer;
        }
        .mobile-vehicle-item:active { transform: scale(0.98); }
        .mobile-vehicle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .mobile-vehicle-id {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          font-family: var(--font-head, sans-serif);
        }
        .mobile-vehicle-speed {
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-tech, monospace);
          color: #22c55e;
        }
        .mobile-vehicle-details {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #94a3b8;
          font-family: var(--font-tech, monospace);
          margin-bottom: 8px;
        }
        .mobile-vehicle-actions {
          display: flex;
          gap: 6px;
        }
        .mobile-action-btn {
          flex: 1;
          background: rgba(10, 111, 255, 0.08);
          border: 1px solid rgba(10, 111, 255, 0.06);
          color: #94a3b8;
          padding: 6px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          text-align: center;
        }
        .mobile-action-btn:active:not(:disabled) { transform: scale(0.95); }
        .mobile-action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .mobile-vehicle-item .live-badge {
          font-size: 7px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          padding: 1px 6px;
          border-radius: 8px;
          border: 1px solid rgba(34, 197, 94, 0.2);
          margin-left: 4px;
        }
        .mobile-vehicle-item .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .mobile-map {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .mobile-map > div {
          width: 100% !important;
          height: 100% !important;
        }
        .mobile-map-controls {
          position: absolute;
          bottom: 20px;
          right: 16px;
          z-index: 500;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .map-control-btn {
          background: rgba(6, 14, 30, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(10, 111, 255, 0.2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-layout { display: none; }
        }

        @media (max-width: 480px) {
          .mobile-stats { grid-template-columns: repeat(2, 1fr); }
          .mobile-vehicle-actions { flex-wrap: wrap; }
          .mobile-action-btn { min-width: 44px; }
          .command-toast {
            top: 60px;
            left: 12px;
            right: 12px;
            transform: none;
            max-width: none;
            font-size: 12px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default LiveTracking