import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { peyflexService as paymentService } from '../services/peyflexService'
import { supabase } from '../lib/supabase'  // ✅ FIXED: Changed path

const ExecutiveDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeTrackers: 0,
    totalRecharges: 0,
    totalRevenue: 0,
    recentTransactions: []
  })
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    fetchBalance()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch vehicles count
      const { count: totalVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })

      if (vehiclesError) throw vehiclesError

      // Fetch active trackers (with valid expiry)
      const { count: activeTrackers, error: activeError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .gte('tracker_expiry', new Date().toISOString().split('T')[0])

      if (activeError) throw activeError

      // Fetch recharge stats
      const { data: recharges, error: rechargeError } = await supabase
        .from('recharges')
        .select('amount')
        .order('created_at', { ascending: false })
        .limit(100)

      if (rechargeError) throw rechargeError

      const totalRecharges = recharges?.length || 0
      const totalRevenue = recharges?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0

      // Fetch recent transactions
      const { data: recentTransactions, error: recentError } = await supabase
        .from('recharges')
        .select(`
          id,
          amount,
          status,
          created_at,
          vehicles (
            vehicle_id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) throw recentError

      setStats({
        totalVehicles: totalVehicles || 0,
        activeTrackers: activeTrackers || 0,
        totalRecharges,
        totalRevenue,
        recentTransactions: recentTransactions || []
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const result = await paymentService.getBalance()
      if (result.success) {
        setBalance(result.balance || result.data?.balance)
      } else {
        console.warn('Could not fetch balance:', result.message)
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="executive-dashboard">
      <div className="dashboard-header">
        <h2>📊 Executive Dashboard</h2>
        <p className="welcome-text">Welcome back, {user?.email || 'Admin'}!</p>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ Error loading data: {error}
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.totalVehicles}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📡</div>
          <div className="stat-content">
            <h3>{stats.activeTrackers}</h3>
            <p>Active Trackers</p>
            <span className="stat-sub">
              {((stats.activeTrackers / (stats.totalVehicles || 1)) * 100).toFixed(1)}% active
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.totalRecharges}</h3>
            <p>Total Recharges</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`stat-card balance-card ${balance !== null ? 'has-balance' : 'no-balance'}`}>
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>{balance !== null ? formatCurrency(balance) : 'N/A'}</h3>
            <p>Peyflex Balance</p>
            <button className="refresh-balance" onClick={fetchBalance}>
              Refresh ↻
            </button>
          </div>
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
                      <span className="vehicle-id">
                        {tx.vehicles?.vehicle_id || 'N/A'}
                      </span>
                      <span className="vehicle-name">
                        {tx.vehicles?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="amount">{formatCurrency(tx.amount)}</td>
                    <td>
                      <span className={`status-badge ${tx.status?.toLowerCase() || 'pending'}`}>
                        {tx.status || 'Pending'}
                      </span>
                    </td>
                    <td className="date">{formatDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .executive-dashboard {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .dashboard-header h2 {
          font-family: var(--font-head);
          font-size: 28px;
          color: var(--white);
          margin: 0 0 4px 0;
        }

        .welcome-text {
          font-family: var(--font-tech);
          color: var(--silver);
          font-size: 14px;
          margin: 0;
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
          margin-bottom: 24px;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s;
        }

        .stat-card:hover {
          border-color: rgba(10, 111, 255, 0.3);
        }

        .stat-icon {
          font-size: 32px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 111, 255, 0.1);
          border-radius: 12px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content h3 {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
          margin: 0;
        }

        .stat-content p {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }

        .stat-sub {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--silver);
          display: block;
          margin-top: 2px;
        }

        .balance-card.has-balance {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .balance-card.has-balance .stat-content h3 {
          color: #22c55e;
        }

        .balance-card.no-balance .stat-content h3 {
          color: var(--silver);
        }

        .refresh-balance {
          background: none;
          border: none;
          color: var(--blue-neon);
          font-size: 10px;
          cursor: pointer;
          font-family: var(--font-tech);
          padding: 0;
          margin-top: 4px;
        }

        .refresh-balance:hover {
          text-decoration: underline;
        }

        .transactions-section {
          background: rgba(8, 20, 50, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-family: var(--font-head);
          font-size: 18px;
          color: var(--white);
          margin: 0;
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
          padding: 40px 0;
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
          padding: 12px 16px;
          color: var(--text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }

        .transactions-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
          color: var(--silver);
        }

        .transactions-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .vehicle-id {
          display: block;
          font-weight: 600;
          color: var(--white);
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

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--blue-neon);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dashboard-loading p {
          font-family: var(--font-tech);
          color: var(--text-muted);
          margin-top: 16px;
        }
      `}</style>
    </div>
  )
}

export default ExecutiveDashboard