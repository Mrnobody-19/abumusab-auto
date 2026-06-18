import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { peyflexService as paymentService } from '../services/peyflexService'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import AddTrackerModal from '../components/AddTrackerModal'

const ExecutiveDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeTrackers: 0,
    expiringSoon: 0,
    expiredTrackers: 0,
    totalRecharges: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentTransactions: []
  })
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchBalance()
    fetchVehicles()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
      if (vehiclesError) throw vehiclesError

      const totalVehicles = vehiclesData?.length || 0
      const activeTrackers = vehiclesData?.filter(v => v.tracker_status === 'active').length || 0
      const expiringSoon = vehiclesData?.filter(v => v.tracker_status === 'expiring_soon').length || 0
      const expiredTrackers = vehiclesData?.filter(v => v.tracker_status === 'expired').length || 0

      // Get monthly revenue
      const firstDayOfMonth = new Date()
      firstDayOfMonth.setDate(1)
      firstDayOfMonth.setHours(0, 0, 0, 0)

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('recharge_history')
        .select('amount')
        .gte('processed_at', firstDayOfMonth.toISOString())
        .eq('status', 'success')
      if (monthlyError) throw monthlyError

      const monthlyRevenue = monthlyData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0

      // Get all time revenue
      const { data: allTimeData, error: allTimeError } = await supabase
        .from('recharge_history')
        .select('amount')
        .eq('status', 'success')
      if (allTimeError) throw allTimeError

      const totalRevenue = allTimeData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0
      const totalRecharges = allTimeData?.length || 0

      // Get recent transactions
      const { data: recentTransactions, error: recentError } = await supabase
        .from('recharge_history')
        .select(`
          id,
          amount,
          status,
          processed_at,
          vehicle_id,
          vehicles:vehicle_id (
            vehicle_id,
            name
          )
        `)
        .eq('status', 'success')
        .order('processed_at', { ascending: false })
        .limit(10)
      if (recentError) throw recentError

      setStats({
        totalVehicles,
        activeTrackers,
        expiringSoon,
        expiredTrackers,
        totalRecharges,
        totalRevenue,
        monthlyRevenue,
        recentTransactions: recentTransactions || []
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    }
  }

  const fetchBalance = async () => {
    try {
      const result = await paymentService.getBalance()
      if (result.success) {
        setBalance(result.balance || result.data?.balance)
      } else {
        setBalance(null)
      }
    } catch (err) {
      console.error('Error fetching balance:', err)
      setBalance(null)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#22c55e'
      case 'expiring_soon': return '#f59e0b'
      case 'expired': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return '✅ Active'
      case 'expiring_soon': return '⚠️ Expiring'
      case 'expired': return '❌ Expired'
      default: return status || 'Unknown'
    }
  }

  const tabs = ['All', 'Active', 'Expiring', 'Expired']
  const filteredVehicles = activeTab === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.tracker_status === activeTab.toLowerCase())

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            background: #030912;
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
    <div className="executive-dashboard">
      {/* Mobile Topbar */}
      <div className="dash-mobile-topbar">
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>
          Executive Dashboard
        </div>
        <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰ Menu</button>
      </div>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className={`dash-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-logo">
            <div className="nav-logo-main">ABU MUS'AB</div>
            <div className="nav-logo-sub">Executive Control</div>
          </div>
          <div className="sidebar-section">Navigation</div>
          <div className="sidebar-item active">
            <span className="sidebar-icon">📊</span>Dashboard
          </div>
          <div className="sidebar-item" onClick={() => navigate('/live-tracking')}>
            <span className="sidebar-icon">📍</span>Live Tracking
            <span className="sidebar-badge">LIVE</span>
          </div>
          <div className="sidebar-item" onClick={() => setShowAddModal(true)}>
            <span className="sidebar-icon">➕</span>Add Tracker
          </div>
          <div className="sidebar-section">Fleet</div>
          <div className="sidebar-item"><span className="sidebar-icon">🚗</span>All Vehicles</div>
          <div className="sidebar-item"><span className="sidebar-icon">📡</span>Active Trackers</div>
          <div className="sidebar-item"><span className="sidebar-icon">⛽</span>Recharges</div>
          <div className="sidebar-section">Analytics</div>
          <div className="sidebar-item"><span className="sidebar-icon">📈</span>Reports</div>
          <div className="sidebar-item"><span className="sidebar-icon">💰</span>Revenue</div>
        </aside>

        {/* Main Content */}
        <main className="dash-main">
          <div className="dash-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div className="topbar-title">📊 Executive Dashboard</div>
              <div className="live-badge">
                <div className="live-dot"></div>
                LIVE · {vehicles.length} vehicles
              </div>
            </div>
            <div className="topbar-controls">
              <button className="tbc" onClick={() => navigate('/live-tracking')}>
                📍 Live Tracking
              </button>
              <button className="tbc primary" onClick={() => setShowAddModal(true)}>
                ➕ Add Tracker
              </button>
            </div>
          </div>

          <div className="dash-content">
            {error && (
              <div className="error-banner">
                ⚠️ {error}
                <button onClick={fetchDashboardData}>Retry</button>
              </div>
            )}

            {/* KPI Bar */}
            <div className="kpi-bar">
              <div className="kpi-card">
                <div className="kpi-label">Total Fleet</div>
                <div className="kpi-val">{stats.totalVehicles}</div>
                <div className="kpi-sub">Registered vehicles</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Active Trackers</div>
                <div className="kpi-val green">{stats.activeTrackers}</div>
                <div className="kpi-sub">
                  {((stats.activeTrackers / (stats.totalVehicles || 1)) * 100).toFixed(1)}% active
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Expiring Soon</div>
                <div className="kpi-val yellow">{stats.expiringSoon}</div>
                <div className="kpi-sub">Need attention</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Expired</div>
                <div className="kpi-val red">{stats.expiredTrackers}</div>
                <div className="kpi-sub">Require recharge</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Monthly Revenue</div>
                <div className="kpi-val blue">{formatCurrency(stats.monthlyRevenue)}</div>
                <div className="kpi-sub">This month</div>
              </div>
            </div>

            {/* Second Row KPI */}
            <div className="kpi-bar second-row">
              <div className="kpi-card">
                <div className="kpi-label">Total Revenue</div>
                <div className="kpi-val blue">{formatCurrency(stats.totalRevenue)}</div>
                <div className="kpi-sub">All time</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total Recharges</div>
                <div className="kpi-val yellow">{stats.totalRecharges}</div>
                <div className="kpi-sub">All time</div>
              </div>
              <div className={`kpi-card ${balance !== null ? 'has-balance' : ''}`}>
                <div className="kpi-label">Peyflex Balance</div>
                <div className="kpi-val" style={{ color: balance !== null ? '#22c55e' : 'var(--text-muted)' }}>
                  {balance !== null ? formatCurrency(balance) : 'N/A'}
                </div>
                <div className="kpi-sub">
                  <button className="refresh-balance" onClick={fetchBalance}>
                    Refresh ↻
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Status Table */}
            <div className="vehicles-section">
              <div className="section-header">
                <h3>🚗 Vehicle Tracker Status</h3>
                <div className="vp-count">{vehicles.length} total</div>
              </div>
              
              <div className="vp-filters">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`vp-filter ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="vehicles-table-container">
                {filteredVehicles.length === 0 ? (
                  <p className="no-vehicles">No vehicles found</p>
                ) : (
                  <table className="vehicles-table">
                    <thead>
                      <tr>
                        <th>Vehicle ID</th>
                        <th>Name</th>
                        <th>Model</th>
                        <th>Driver</th>
                        <th>SIM</th>
                        <th>Status</th>
                        <th>Plan</th>
                        <th>Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.map(vehicle => (
                        <tr key={vehicle.id}>
                          <td>
                            <span className="vehicle-id">{vehicle.vehicle_id}</span>
                          </td>
                          <td>{vehicle.name || '—'}</td>
                          <td>{vehicle.model || '—'}</td>
                          <td>{vehicle.driver_name || 'Unassigned'}</td>
                          <td className="sim">{vehicle.sim_card_number || '—'}</td>
                          <td>
                            <span 
                              className={`tracker-status ${vehicle.tracker_status}`}
                              style={{
                                background: `${getStatusColor(vehicle.tracker_status)}22`,
                                color: getStatusColor(vehicle.tracker_status)
                              }}
                            >
                              {getStatusText(vehicle.tracker_status)}
                            </span>
                          </td>
                          <td>{vehicle.tracker_plan || '—'}</td>
                          <td>
                            <span className={`expiry-date ${vehicle.tracker_expiry ? 
                              (new Date(vehicle.tracker_expiry) < new Date() ? 'expired' : 'active') : ''}`}>
                              {vehicle.tracker_expiry 
                                ? new Date(vehicle.tracker_expiry).toLocaleDateString()
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="transactions-section">
              <div className="section-header">
                <h3>📋 Recent Transactions</h3>
                <button className="view-all">View All →</button>
              </div>
              <div className="transactions-table-container">
                {stats.recentTransactions.length === 0 ? (
                  <p className="no-transactions">No recent transactions</p>
                ) : (
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <span className="vehicle-id">{tx.vehicles?.vehicle_id || 'N/A'}</span>
                            <span className="vehicle-name">{tx.vehicles?.name || 'Unknown'}</span>
                          </td>
                          <td className="amount">{formatCurrency(tx.amount)}</td>
                          <td>
                            <span className={`status-badge ${tx.status?.toLowerCase() || 'pending'}`}>
                              {tx.status || 'Pending'}
                            </span>
                          </td>
                          <td className="date">{formatDate(tx.processed_at || tx.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Tracker Modal */}
      <AddTrackerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchVehicles()
          fetchDashboardData()
        }}
      />

      <style jsx>{`
        .executive-dashboard {
          background: #030912;
          min-height: 100vh;
        }

        .dash-mobile-topbar {
          display: none;
          background: rgba(4, 12, 28, 0.98);
          border-bottom: 1px solid var(--border);
          padding: 12px 16px;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sidebar-toggle-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--white);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .dash-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .dash-sidebar {
          width: 240px;
          min-width: 240px;
          background: rgba(4, 12, 28, 0.98);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          overflow-y: auto;
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
          font-size: 8px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: auto;
          animation: pulse 1.5s infinite;
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
          flex-wrap: wrap;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 10;
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
          gap: 12px;
          flex-wrap: wrap;
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
          transition: all 0.2s;
        }

        .tbc:hover {
          background: rgba(10, 111, 255, 0.1);
          border-color: rgba(10, 111, 255, 0.3);
        }

        .tbc.primary {
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

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .dash-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 20px;
          overflow-y: auto;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          color: #ef4444;
          font-family: var(--font-tech);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-banner button {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-tech);
        }

        .kpi-bar {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .kpi-bar.second-row {
          grid-template-columns: repeat(3, 1fr);
        }

        .kpi-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }

        .kpi-card.has-balance {
          border-color: rgba(34, 197, 94, 0.3);
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
        .kpi-val.blue { color: var(--blue-neon); }

        .kpi-sub {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .refresh-balance {
          background: none;
          border: none;
          color: var(--blue-neon);
          font-size: 11px;
          cursor: pointer;
          font-family: var(--font-tech);
          padding: 0;
        }

        .refresh-balance:hover {
          text-decoration: underline;
        }

        .vehicles-section {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          margin: 0;
        }

        .vp-count {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--blue-neon);
        }

        .vp-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .vp-filter {
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 6px 16px;
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--silver);
          cursor: pointer;
          transition: all 0.2s;
        }

        .vp-filter:hover {
          background: rgba(10, 111, 255, 0.1);
        }

        .vp-filter.active {
          background: rgba(10, 111, 255, 0.15);
          border-color: var(--blue-neon);
          color: var(--blue-neon);
        }

        .vehicles-table-container {
          overflow-x: auto;
        }

        .vehicles-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-tech);
        }

        .vehicles-table thead th {
          text-align: left;
          padding: 10px 12px;
          color: var(--text-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }

        .vehicles-table tbody td {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 12px;
          color: var(--silver);
        }

        .vehicles-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .vehicle-id {
          font-weight: 600;
          color: var(--white);
          font-size: 13px;
        }

        .sim {
          font-family: monospace;
          font-size: 11px;
        }

        .tracker-status {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .tracker-status.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .tracker-status.expiring_soon {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .tracker-status.expired {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .expiry-date {
          font-size: 12px;
        }

        .expiry-date.active {
          color: #22c55e;
        }

        .expiry-date.expired {
          color: #ef4444;
        }

        .no-vehicles {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .transactions-section {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 24px;
        }

        .view-all {
          background: none;
          border: none;
          color: var(--blue-neon);
          font-family: var(--font-tech);
          font-size: 13px;
          cursor: pointer;
        }

        .view-all:hover {
          text-decoration: underline;
        }

        .no-transactions {
          color: var(--text-muted);
          font-family: var(--font-tech);
          text-align: center;
          padding: 30px 0;
        }

        .transactions-table-container {
          overflow-x: auto;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-tech);
        }

        .transactions-table thead th {
          text-align: left;
          padding: 10px 16px;
          color: var(--text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }

        .transactions-table tbody td {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
          color: var(--silver);
        }

        .transactions-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .vehicle-name {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
        }

        .amount {
          font-weight: 600;
          color: var(--white);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-badge.success {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .status-badge.failed {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .date {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .kpi-bar { grid-template-columns: repeat(3, 1fr); }
          .kpi-bar.second-row { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .dash-mobile-topbar { display: flex; }
          .dash-layout { flex-direction: column; height: auto; }
          .dash-sidebar { 
            display: none; 
            width: 100%; 
            position: fixed; 
            top: 52px; 
            left: 0; 
            bottom: 0; 
            z-index: 100; 
            overflow-y: auto; 
            background: rgba(4, 12, 28, 0.98);
          }
          .dash-sidebar.mobile-open { display: flex; }
          .dash-main { height: auto; }
          .dash-topbar { padding: 12px 16px; flex-direction: column; align-items: stretch; }
          .topbar-title { font-size: 15px; }
          .topbar-controls { gap: 8px; flex-wrap: wrap; }
          .tbc { font-size: 11px; padding: 5px 10px; }
          .dash-content { padding: 14px; gap: 14px; }
          .kpi-bar { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .kpi-bar.second-row { grid-template-columns: repeat(2, 1fr); }
          .kpi-val { font-size: 22px; }
          .vehicles-section { padding: 14px; }
          .transactions-section { padding: 14px; }
          .vehicles-table thead th,
          .vehicles-table tbody td {
            padding: 8px 10px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .kpi-bar { grid-template-columns: 1fr; }
          .kpi-bar.second-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default ExecutiveDashboard