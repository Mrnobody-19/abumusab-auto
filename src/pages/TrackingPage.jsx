import React, { useState } from 'react'

const fleetData = {
  vehicles: [
    { id: 'ABJ-001', name: 'ABJ-001', model: 'Toyota HiAce', speed: 72, status: 'moving', location: 'Airport Expressway, Abuja', type: 'moving' },
    { id: 'ABJ-003', name: 'ABJ-003', model: 'Ford Transit', speed: 58, status: 'moving', location: 'Garki District', type: 'moving' },
    { id: 'ABJ-009', name: 'ABJ-009', model: 'Mercedes Sprinter', speed: 112, status: 'alert', location: 'Kubwa Expressway', type: 'alert' },
    { id: 'ABJ-007', name: 'ABJ-007', model: 'VW Caddy', speed: 0, status: 'parked', location: 'Wuse II', type: 'parked' },
    { id: 'ABJ-012', name: 'ABJ-012', model: 'Nissan Urvan', speed: 45, status: 'moving', location: 'Central Business District', type: 'moving' },
    { id: 'ABJ-015', name: 'ABJ-015', model: 'Toyota Hilux', speed: 0, status: 'idle', location: 'Nyanya', type: 'idle' },
    { id: 'ABJ-018', name: 'ABJ-018', model: 'Mitsubishi L200', speed: 0, status: 'parked', location: 'Kubwa', type: 'parked' }
  ],
  totalVehicles: 47,
  movingCount: 28,
  parkedCount: 15,
  alertCount: 4,
  offlineCount: 4
}

const TrackingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(fleetData.vehicles[0])
  const [activeTab, setActiveTab] = useState('all')

  const tabs = ['All Vehicles', 'Moving', 'Parked', 'Alerts']
  const filteredVehicles = activeTab === 'all' 
    ? fleetData.vehicles 
    : fleetData.vehicles.filter(v => v.type === activeTab)

  const getStatusLabel = (status) => {
    switch(status) {
      case 'moving': return 'Moving'
      case 'parked': return 'Parked'
      case 'alert': return '⚠ Alert'
      case 'idle': return 'Idle'
      default: return status
    }
  }

  return (
    <div className="tracking-page">
      {/* Mobile Topbar */}
      <div className="dash-mobile-topbar">
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>Fleet Control</div>
        <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰ Menu</button>
      </div>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className={`dash-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-logo">
            <div className="nav-logo-main" style={{ fontSize: 12 }}>ABU MUS'AB</div>
            <div className="nav-logo-sub">Fleet Control</div>
          </div>
          <div className="sidebar-section">Navigation</div>
          <div className="sidebar-item active"><span className="sidebar-icon">🗺️</span>Live Map<span className="sidebar-badge">3</span></div>
          <div className="sidebar-item"><span className="sidebar-icon">🚗</span>All Vehicles</div>
          <div className="sidebar-item"><span className="sidebar-icon">📍</span>Geofences</div>
          <div className="sidebar-item"><span className="sidebar-icon">🛤️</span>Route History</div>
          <div className="sidebar-section">Analytics</div>
          <div className="sidebar-item"><span className="sidebar-icon">📊</span>Fleet Reports</div>
          <div className="sidebar-item"><span className="sidebar-icon">⚡</span>Speed Analytics</div>
          <div className="sidebar-item"><span className="sidebar-icon">⛽</span>Fuel Tracking</div>
          <div className="sidebar-item"><span className="sidebar-icon">🔧</span>Maintenance</div>
          <div className="sidebar-section">Settings</div>
          <div className="sidebar-item"><span className="sidebar-icon">🔔</span>Alerts</div>
          <div className="sidebar-item"><span className="sidebar-icon">👤</span>Account</div>
        </aside>

        {/* Main Content */}
        <main className="dash-main">
          <div className="dash-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="topbar-title">Live Fleet Tracking</div>
              <div className="live-badge"><div className="live-dot"></div>LIVE · Updated 2s ago</div>
            </div>
            <div className="topbar-controls">
              {tabs.map(tab => (
                <div 
                  key={tab}
                  className={`tbc ${activeTab === tab.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                >
                  {tab}
                </div>
              ))}
              <div style={{ width: 1, height: 20, background: 'var(--border)' }}></div>
              <div className="tbc">⬡ Geofences</div>
              <div className="tbc">📤 Export</div>
            </div>
          </div>

          <div className="dash-content">
            {/* KPI Bar */}
            <div className="kpi-bar">
              <div className="kpi-card">
                <div className="kpi-label">Total Fleet</div>
                <div className="kpi-val">{fleetData.totalVehicles}</div>
                <div className="kpi-sub">Registered vehicles</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Moving Now</div>
                <div className="kpi-val green">{fleetData.movingCount}</div>
                <div className="kpi-sub">Active on road</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Parked</div>
                <div className="kpi-val yellow">{fleetData.parkedCount}</div>
                <div className="kpi-sub">Engine off</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Alerts</div>
                <div className="kpi-val red">{fleetData.alertCount}</div>
                <div className="kpi-sub">Require attention</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Offline</div>
                <div className="kpi-val" style={{ color: 'var(--text-muted)' }}>{fleetData.offlineCount}</div>
                <div className="kpi-sub">No signal</div>
              </div>
            </div>

            {/* Map + Vehicle Panel */}
            <div className="map-row">
              <div className="map-container">
                <div className="map-bg"></div>
                <div className="map-roads">
                  <div className="road-h" style={{ top: '35%', left: 0, right: 0 }}></div>
                  <div className="road-h" style={{ top: '60%', left: '10%', right: '5%' }}></div>
                  <div className="road-h" style={{ top: '75%', left: '20%', right: '20%' }}></div>
                  <div className="road-v" style={{ left: '25%', top: 0, bottom: 0 }}></div>
                  <div className="road-v" style={{ left: '50%', top: 0, bottom: '40%' }}></div>
                  <div className="road-v" style={{ left: '70%', top: '20%', bottom: '10%' }}></div>
                  <div className="road-v" style={{ left: '85%', top: '10%', bottom: '20%' }}></div>
                </div>
                <div className="geo-zone" style={{ width: 180, height: 130, top: '15%', left: '20%', borderColor: 'rgba(10,111,255,0.4)' }}></div>
                <div className="geo-zone" style={{ width: 120, height: 100, top: '45%', left: '55%', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.04)' }}></div>
                
                <div className="map-pin" style={{ top: '30%', left: '30%', color: '#22c55e' }}>
                  <div className="pin-ring" style={{ color: '#22c55e' }}></div>
                  <div className="pin-dot" style={{ background: '#22c55e' }}></div>
                  <div className="pin-label">ABJ-001 · 72km/h</div>
                </div>
                <div className="map-pin" style={{ top: '25%', left: '52%', color: '#22c55e' }}>
                  <div className="pin-ring" style={{ color: '#22c55e' }}></div>
                  <div className="pin-dot" style={{ background: '#22c55e' }}></div>
                  <div className="pin-label">ABJ-003 · 58km/h</div>
                </div>
                <div className="map-pin" style={{ top: '50%', left: '68%', color: '#f59e0b' }}>
                  <div className="pin-dot" style={{ background: '#f59e0b' }}></div>
                  <div className="pin-label">ABJ-007 · PARKED</div>
                </div>
                <div className="map-pin" style={{ top: '60%', left: '40%', color: '#22c55e' }}>
                  <div className="pin-ring" style={{ color: '#22c55e' }}></div>
                  <div className="pin-dot" style={{ background: '#22c55e' }}></div>
                  <div className="pin-label">ABJ-012 · 45km/h</div>
                </div>
                <div className="map-pin" style={{ top: '42%', left: '22%', color: '#ef4444' }}>
                  <div className="pin-ring" style={{ color: '#ef4444' }}></div>
                  <div className="pin-dot" style={{ background: '#ef4444' }}></div>
                  <div className="pin-label">⚠ ABJ-009 · SPEEDING</div>
                </div>
                <div className="map-pin" style={{ top: '70%', left: '75%', color: '#94a3b8' }}>
                  <div className="pin-dot" style={{ background: '#94a3b8' }}></div>
                  <div className="pin-label">ABJ-015 · IDLE</div>
                </div>

                <div className="map-controls">
                  <div className="map-ctrl-btn">+</div>
                  <div className="map-ctrl-btn">−</div>
                  <div className="map-ctrl-btn">⊙</div>
                  <div className="map-ctrl-btn">⊞</div>
                </div>
                <div className="map-search">🔍 Search location or vehicle...</div>
                <div className="map-legend">
                  <div className="legend-item"><div className="legend-dot" style={{ background: '#22c55e' }}></div>Moving</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }}></div>Parked</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div>Alert</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: '#94a3b8' }}></div>Idle</div>
                </div>
              </div>

              {/* Vehicle List Panel */}
              <div className="vehicle-panel">
                <div className="vp-header">
                  <div className="vp-title">Fleet Vehicles</div>
                  <div className="vp-count">{fleetData.totalVehicles} total</div>
                </div>
                <div className="vehicle-list">
                  {filteredVehicles.map(vehicle => (
                    <div 
                      key={vehicle.id}
                      className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="vi-top">
                        <span className="vi-name">{vehicle.name}</span>
                        <span className={`vi-status ${vehicle.type}`} style={{ 
                          background: vehicle.type === 'alert' ? 'rgba(239,68,68,0.15)' : undefined,
                          color: vehicle.type === 'alert' ? '#ef4444' : undefined
                        }}>
                          {getStatusLabel(vehicle.type)}
                        </span>
                      </div>
                      <div className="vi-mid">
                        <span className="vi-info">🚗 {vehicle.model}</span>
                        <span className="vi-info">{vehicle.speed} km/h</span>
                      </div>
                      <div className="vi-info" style={{ marginTop: 3, color: vehicle.type === 'alert' ? '#ef4444' : undefined }}>
                        📍 {vehicle.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics Row */}
            <div className="analytics-row">
              <div className="analytics-card">
                <div className="ac-title">Fleet Speed Distribution (Today)</div>
                <div className="bar-chart">
                  <div className="bar-col" style={{ height: '30%' }}><span className="bar-label">0-30</span></div>
                  <div className="bar-col" style={{ height: '55%', background: 'rgba(10,111,255,0.25)' }}><span className="bar-label">30-50</span></div>
                  <div className="bar-col" style={{ height: '80%', background: 'rgba(10,111,255,0.35)' }}><span className="bar-label">50-70</span></div>
                  <div className="bar-col" style={{ height: '60%', background: 'rgba(10,111,255,0.3)' }}><span className="bar-label">70-90</span></div>
                  <div className="bar-col" style={{ height: '35%' }}><span className="bar-label">90-110</span></div>
                  <div className="bar-col" style={{ height: '15%', background: 'rgba(239,68,68,0.25)', borderColor: 'rgba(239,68,68,0.4)' }}><span className="bar-label">110+</span></div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="ac-title" style={{ textAlign: 'center' }}>Selected Vehicle Speed</div>
                <div className="speedometer">
                  <div className="speed-arc-container">
                    <svg className="speed-arc-svg" viewBox="0 0 140 80">
                      <defs>
                        <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0a6fff" />
                          <stop offset="100%" stopColor="#00c3ff" />
                        </linearGradient>
                      </defs>
                      <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="rgba(10,111,255,0.15)" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="url(#speedGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="190" strokeDashoffset={75 + (190 - (selectedVehicle?.speed / 120) * 190)}/>
                      <line x1="70" y1="75" x2={70 + Math.cos((selectedVehicle?.speed / 120) * Math.PI) * 40} y2={75 - Math.sin((selectedVehicle?.speed / 120) * Math.PI) * 40} stroke="#00c3ff" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="70" cy="75" r="5" fill="#00c3ff"/>
                      <text x="8" y="75" fill="rgba(100,140,200,0.6)" fontSize="7" fontFamily="monospace">0</text>
                      <text x="62" y="18" fill="rgba(100,140,200,0.6)" fontSize="7" fontFamily="monospace">60</text>
                      <text x="122" y="75" fill="rgba(100,140,200,0.6)" fontSize="7" fontFamily="monospace">120</text>
                    </svg>
                  </div>
                  <div className="speed-value">{selectedVehicle?.speed || 0}</div>
                  <div className="speed-unit">{selectedVehicle?.name} {selectedVehicle?.model}</div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="ac-title">Fleet Status</div>
                <div className="donut-wrap">
                  <svg className="donut-svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(10,111,255,0.1)" strokeWidth="20"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="219.8 220" strokeDashoffset="55" strokeLinecap="butt"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="117.8 220" strokeDashoffset="-164.8" strokeLinecap="butt"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#94a3b8" strokeWidth="20" strokeDasharray="34 220" strokeDashoffset="-282.6" strokeLinecap="butt"/>
                    <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="monospace">{fleetData.totalVehicles}</text>
                    <text x="50" y="58" textAnchor="middle" fill="rgba(100,140,200,0.7)" fontSize="8" fontFamily="monospace">TOTAL</text>
                  </svg>
                  <div className="donut-legend">
                    <div className="dl-item"><div className="dl-swatch" style={{ background: '#22c55e' }}></div>Moving ({fleetData.movingCount})</div>
                    <div className="dl-item"><div className="dl-swatch" style={{ background: '#f59e0b' }}></div>Parked ({fleetData.parkedCount})</div>
                    <div className="dl-item"><div className="dl-swatch" style={{ background: '#94a3b8' }}></div>Idle ({fleetData.offlineCount})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .tracking-page {
          background: #030912;
          min-height: 100vh;
        }
        .dash-layout {
          display: flex;
          height: 100vh;
        }
        .dash-sidebar {
          width: 240px;
          min-width: 240px;
          background: rgba(4, 12, 28, 0.98);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px 0;
        }
        .sidebar-logo {
          padding: 10px 20px 24px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .nav-logo-main {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.1em;
        }
        .nav-logo-sub {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--blue-neon);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .sidebar-section {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 8px 20px;
          margin-top: 8px;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 20px;
          font-family: var(--font-tech);
          font-size: 13px;
          font-weight: 600;
          color: var(--silver);
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
        }
        .sidebar-item:hover {
          color: var(--white);
          background: rgba(10, 111, 255, 0.06);
        }
        .sidebar-item.active {
          color: var(--blue-neon);
          background: rgba(10, 111, 255, 0.1);
        }
        .sidebar-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--blue-neon);
          border-radius: 0 3px 3px 0;
        }
        .sidebar-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        .sidebar-badge {
          margin-left: auto;
          background: var(--blue-primary);
          color: #fff;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 100px;
          font-weight: 700;
        }
        .dash-main {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .dash-topbar {
          background: rgba(4, 12, 28, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          flex-shrink: 0;
        }
        .topbar-title {
          font-family: var(--font-head);
          font-size: 18px;
          font-weight: 700;
          color: var(--white);
        }
        .topbar-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tbc {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--silver);
          padding: 7px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          background: rgba(8, 20, 50, 0.5);
        }
        .tbc.active {
          background: rgba(10, 111, 255, 0.15);
          border-color: rgba(10, 111, 255, 0.4);
          color: var(--blue-neon);
        }
        .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-tech);
          font-size: 11px;
          color: #22c55e;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        .dash-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 20px;
          overflow-y: auto;
        }
        .kpi-bar {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .kpi-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .kpi-label {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .kpi-val {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--white);
        }
        .kpi-val.green { color: #22c55e; }
        .kpi-val.red { color: #ef4444; }
        .kpi-val.yellow { color: #f59e0b; }
        .kpi-sub {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .map-row {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 16px;
        }
        .map-container {
          background: rgba(4, 10, 25, 0.98);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          min-height: 380px;
        }
        .map-bg {
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(10, 111, 255, 0.04) 40px, rgba(10, 111, 255, 0.04) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(10, 111, 255, 0.04) 40px, rgba(10, 111, 255, 0.04) 41px), radial-gradient(ellipse at 40% 50%, rgba(10, 60, 180, 0.12), transparent 60%), #030912;
          position: absolute;
          inset: 0;
        }
        .map-roads {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .road-h {
          position: absolute;
          background: rgba(20, 60, 120, 0.5);
          height: 2px;
          left: 0;
          right: 0;
        }
        .road-v {
          position: absolute;
          background: rgba(20, 60, 120, 0.5);
          width: 2px;
          top: 0;
          bottom: 0;
        }
        .map-pin {
          position: absolute;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .pin-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 12px currentColor;
        }
        .pin-label {
          font-family: var(--font-tech);
          font-size: 9px;
          font-weight: 700;
          color: var(--white);
          background: rgba(4, 12, 28, 0.9);
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
          white-space: nowrap;
        }
        .pin-ring {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid currentColor;
          opacity: 0.5;
          animation: pingRing 2s ease-out infinite;
        }
        .geo-zone {
          position: absolute;
          border-radius: 50%;
          border-style: dashed;
          border-width: 1.5px;
          background: rgba(10, 111, 255, 0.05);
        }
        .map-controls {
          position: absolute;
          top: 14px;
          left: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 10;
        }
        .map-ctrl-btn {
          width: 32px;
          height: 32px;
          background: rgba(6, 14, 30, 0.9);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          color: var(--silver);
        }
        .map-search {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 10;
          background: rgba(6, 14, 30, 0.9);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--silver);
        }
        .map-legend {
          position: absolute;
          bottom: 14px;
          left: 14px;
          z-index: 10;
          display: flex;
          gap: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--silver);
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .vehicle-panel {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .vp-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vp-title {
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
        }
        .vp-count {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--blue-neon);
        }
        .vehicle-list {
          overflow-y: auto;
          flex: 1;
          max-height: 380px;
        }
        .vehicle-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(30, 60, 120, 0.15);
          cursor: pointer;
          transition: background 0.2s;
        }
        .vehicle-item:hover {
          background: rgba(10, 111, 255, 0.06);
        }
        .vehicle-item.selected {
          background: rgba(10, 111, 255, 0.1);
          border-left: 2px solid var(--blue-neon);
        }
        .vi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .vi-name {
          font-family: var(--font-tech);
          font-size: 13px;
          font-weight: 700;
          color: var(--white);
        }
        .vi-status {
          font-family: var(--font-tech);
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
        }
        .vi-status.moving {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .vi-status.parked {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .vi-status.idle {
          background: rgba(100, 116, 139, 0.15);
          color: #94a3b8;
        }
        .vi-mid {
          display: flex;
          gap: 16px;
        }
        .vi-info {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
        }
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .analytics-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 18px 20px;
        }
        .ac-title {
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 16px;
        }
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 80px;
        }
        .bar-col {
          flex: 1;
          background: rgba(10, 111, 255, 0.15);
          border-radius: 4px 4px 0 0;
          position: relative;
          transition: all 0.3s;
          border: 1px solid rgba(10, 111, 255, 0.2);
        }
        .bar-col:hover {
          background: rgba(10, 111, 255, 0.3);
        }
        .bar-col .bar-label {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-tech);
          font-size: 9px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .speedometer {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .speed-arc-container {
          position: relative;
          width: 140px;
          height: 90px;
        }
        .speed-arc-svg {
          width: 100%;
          height: 100%;
        }
        .speed-value {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: var(--white);
          text-align: center;
          margin-top: 8px;
        }
        .speed-unit {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
        }
        .donut-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .donut-svg {
          width: 100px;
          height: 100px;
        }
        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dl-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--silver);
        }
        .dl-swatch {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }
        @media (max-width: 1024px) {
          .kpi-bar { grid-template-columns: repeat(3, 1fr); }
          .analytics-row { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .dash-layout { flex-direction: column; height: auto; }
          .dash-sidebar { display: none; width: 100%; position: fixed; top: 52px; left: 0; bottom: 0; z-index: 100; overflow-y: auto; }
          .dash-sidebar.mobile-open { display: flex; }
          .dash-mobile-topbar { display: flex; }
          .dash-main { height: auto; }
          .dash-topbar { padding: 12px 16px; flex-wrap: wrap; gap: 10px; }
          .topbar-title { font-size: 15px; }
          .topbar-controls { gap: 8px; flex-wrap: wrap; }
          .tbc { font-size: 11px; padding: 5px 10px; }
          .dash-content { padding: 14px; gap: 14px; }
          .kpi-bar { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .kpi-val { font-size: 22px; }
          .map-row { grid-template-columns: 1fr; }
          .vehicle-panel { max-height: 280px; }
          .analytics-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default TrackingPage