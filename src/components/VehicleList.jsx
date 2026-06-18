import React, { useState, useEffect } from 'react'
import { vehicleService } from '../services/vehicleService'
import AddTrackerModal from './AddTrackerModal'

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadData()
    
    // Subscribe to real-time updates
    const subscription = vehicleService.subscribeToVehicles((payload) => {
      console.log('Real-time update:', payload)
      loadData() // Reload data on any change
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadData = async () => {
    try {
      const [vehiclesData, statsData] = await Promise.all([
        vehicleService.getAllVehicles(),
        vehicleService.getDashboardStats()
      ])
      setVehicles(vehiclesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuccess = (result) => {
    setSuccessMessage(result.message)
    loadData()
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading trackers...</div>
  }

  return (
    <div className="vehicle-list-container">
      {/* Success Toast */}
      {successMessage && (
        <div className="success-toast">
          ✅ {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>GPS Tracker Management</h1>
          <p>Manage all your vehicle trackers in one place</p>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          ➕ Add New Tracker
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_vehicles}</div>
            <div className="stat-label">Total Trackers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active_trackers}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.expiring_soon}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₦{stats.monthly_revenue.toLocaleString()}</div>
            <div className="stat-label">Monthly Revenue</div>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="vehicles-table">
        <table>
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Name/Model</th>
              <th>Driver</th>
              <th>SIM/IMEI</th>
              <th>Status</th>
              <th>Tracker Status</th>
              <th>Expiry Date</th>
              <th>Plan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.vehicle_id}</td>
                <td>
                  <strong>{vehicle.name}</strong><br/>
                  <small>{vehicle.model}</small>
                </td>
                <td>
                  {vehicle.driver_name}<br/>
                  <small>{vehicle.driver_phone}</small>
                </td>
                <td>
                  <small>SIM: {vehicle.sim_card_number}</small><br/>
                  <small>IMEI: {vehicle.imei_number}</small>
                </td>
                <td>
                  <span className={`status-badge status-${vehicle.status}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td>
                  <span className={`tracker-badge tracker-${vehicle.tracker_status}`}>
                    {vehicle.tracker_status}
                  </span>
                </td>
                <td>{vehicle.tracker_expiry || 'Not set'}</td>
                <td>{vehicle.tracker_plan}</td>
                <td>
                  <button className="btn-recharge">Recharge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Tracker Modal */}
      <AddTrackerModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <style jsx>{`
        .vehicle-list-container {
          padding: 24px;
          background: #030912;
          min-height: 100vh;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dashboard-header h1 {
          font-family: var(--font-head);
          font-size: 28px;
          color: var(--white);
          margin-bottom: 8px;
        }
        .dashboard-header p {
          font-family: var(--font-tech);
          color: var(--text-muted);
        }
        .btn-add {
          background: linear-gradient(135deg, #0a6fff, #0055cc);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-tech);
          font-weight: 600;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: var(--white);
        }
        .stat-label {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }
        .vehicles-table {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          padding: 16px;
          text-align: left;
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 16px;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--silver);
          border-bottom: 1px solid rgba(30, 60, 120, 0.1);
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-moving {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .status-parked {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .status-idle {
          background: rgba(100, 116, 139, 0.15);
          color: #94a3b8;
        }
        .tracker-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .tracker-active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .tracker-expiring_soon {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .tracker-expired {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        .btn-recharge {
          background: rgba(10, 111, 255, 0.15);
          border: 1px solid rgba(10, 111, 255, 0.3);
          color: var(--blue-neon);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
        }
        .success-toast {
          position: fixed;
          top: 80px;
          right: 20px;
          background: linear-gradient(135deg, #059669, #10b981);
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default VehicleList