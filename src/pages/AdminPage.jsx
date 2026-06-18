import React, { useState } from 'react'

const adminData = {
  revenue: { monthly: '₦2.4M', vsLastMonth: '+18%' },
  activeCustomers: 284,
  jobsCompleted: 63,
  workshopUtilization: 84,
  avgCompletionTime: 3.2,
  customerSatisfaction: 97
}

const recentJobs = [
  { customer: 'Ahmed M.', service: 'ECU Remap', vehicle: 'BMW 5 Series', status: 'Complete', statusClass: 'success' },
  { customer: 'Fatima K.', service: 'Key Program', vehicle: 'Toyota Camry', status: 'In Progress', statusClass: 'info' },
  { customer: 'Ibrahim D.', service: 'ADAS Calib.', vehicle: 'Mercedes GLC', status: 'Scheduled', statusClass: 'pending' },
  { customer: 'Aisha O.', service: 'Diagnostics', vehicle: 'Range Rover', status: 'Complete', statusClass: 'success' },
  { customer: 'Musa T.', service: 'GPS Install', vehicle: 'Ford Ranger', status: 'In Progress', statusClass: 'info' }
]

const topCustomers = [
  { name: 'Express Logistics', jobs: 12, spent: '₦480K', plan: 'Fleet Pro', planClass: 'info' },
  { name: 'City Transport Co.', jobs: 8, spent: '₦310K', plan: 'Fleet Pro', planClass: 'info' },
  { name: 'Al-Nour Delivery', jobs: 6, spent: '₦220K', plan: 'Fleet Std', planClass: 'success' },
  { name: 'Khalid Al-Rashid', jobs: 5, spent: '₦185K', plan: 'Premium', planClass: 'pending' },
  { name: 'Nasira Holdings', jobs: 4, spent: '₦160K', plan: 'Fleet Std', planClass: 'success' }
]

const AdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-page">
      {/* Mobile Topbar */}
      <div className="dash-mobile-topbar">
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>Executive Portal</div>
        <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰ Menu</button>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`dash-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-logo">
            <div className="nav-logo-main" style={{ fontSize: 12 }}>ABU MUS'AB</div>
            <div className="nav-logo-sub">Executive Portal</div>
          </div>
          <div className="sidebar-section">Overview</div>
          <div className="sidebar-item active"><span className="sidebar-icon">📊</span>Dashboard</div>
          <div className="sidebar-item"><span className="sidebar-icon">💰</span>Revenue</div>
          <div className="sidebar-item"><span className="sidebar-icon">🛰️</span>Fleet Tracking</div>
          <div className="sidebar-section">Management</div>
          <div className="sidebar-item"><span className="sidebar-icon">👥</span>Customers<span className="sidebar-badge">12</span></div>
          <div className="sidebar-item"><span className="sidebar-icon">👔</span>Staff</div>
          <div className="sidebar-item"><span className="sidebar-icon">🔧</span>Workshop Jobs</div>
          <div className="sidebar-item"><span className="sidebar-icon">📦</span>Inventory</div>
          <div className="sidebar-section">Reports</div>
          <div className="sidebar-item"><span className="sidebar-icon">📈</span>Analytics</div>
          <div className="sidebar-item"><span className="sidebar-icon">📄</span>Invoices</div>
          <div className="sidebar-item"><span className="sidebar-icon">⚙️</span>Settings</div>
        </aside>

        {/* Main Content */}
        <main className="dash-main">
          <div className="dash-topbar">
            <div className="topbar-title">Executive Dashboard</div>
            <div className="topbar-controls">
              <div className="tbc">This Month ▾</div>
              <div className="live-badge"><div className="live-dot"></div>All systems operational</div>
            </div>
          </div>

          <div className="admin-main">
            <div className="admin-header">
              <div>
                <div className="admin-greeting">Good morning, <span>Abu Mus'ab</span> 👋</div>
                <div className="admin-subtext">Wednesday, 3 June 2025 · Workshop open · 3 jobs in progress</div>
              </div>
              <div className="admin-actions">
                <a className="btn-outline" href="#" style={{ padding: '9px 18px', fontSize: 12 }}>+ New Job</a>
                <a className="btn-primary" href="#" style={{ padding: '9px 18px', fontSize: 12 }}>View Reports</a>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="admin-kpi">
              <div className="akpi blue">
                <div className="akpi-icon">🚗</div>
                <div className="akpi-label">Total Vehicles Tracked</div>
                <div className="akpi-val">47</div>
                <div className="akpi-change up">↑ 4 this month</div>
              </div>
              <div className="akpi green">
                <div className="akpi-icon">💰</div>
                <div className="akpi-label">Monthly Revenue</div>
                <div className="akpi-val">{adminData.revenue.monthly}</div>
                <div className="akpi-change up">{adminData.revenue.vsLastMonth}</div>
              </div>
              <div className="akpi purple">
                <div className="akpi-icon">👥</div>
                <div className="akpi-label">Active Customers</div>
                <div className="akpi-val">{adminData.activeCustomers}</div>
                <div className="akpi-change up">↑ 12 new</div>
              </div>
              <div className="akpi orange">
                <div className="akpi-icon">🔧</div>
                <div className="akpi-label">Jobs Completed</div>
                <div className="akpi-val">{adminData.jobsCompleted}</div>
                <div className="akpi-change down">↓ 5% vs last month</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="admin-charts">
              {/* Revenue Chart */}
              <div className="chart-card">
                <div className="cc-header">
                  <div className="cc-title">Revenue Analytics — 2025</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="cc-period">2025 vs 2024</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--blue-neon)' }}>
                        <div style={{ width: 20, height: 2, background: 'var(--blue-neon)' }}></div>2025
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)' }}>
                        <div style={{ width: 20, height: 0, borderTop: '1px dashed var(--text-muted)' }}></div>2024
                      </div>
                    </div>
                  </div>
                </div>
                <div className="line-chart">
                  <svg className="line-chart-svg" viewBox="0 0 600 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0a6fff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0a6fff" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0a6fff" />
                        <stop offset="100%" stopColor="#00c3ff" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(30,60,120,0.2)" strokeWidth="1"/>
                    <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(30,60,120,0.2)" strokeWidth="1"/>
                    <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(30,60,120,0.2)" strokeWidth="1"/>
                    <polyline fill="none" stroke="rgba(100,140,200,0.35)" strokeWidth="1.5" strokeDasharray="6,4" points="0,110 50,100 100,95 150,100 200,90 250,85 300,80 350,75 400,70 450,65 500,60 550,55"/>
                    <path fill="url(#areaGrad)" d="M0,130 L0,95 L50,85 L100,90 L150,75 L200,65 L250,60 L300,50 L350,45 L400,40 L450,38 L500,30 L550,25 L600,20 L600,130 Z"/>
                    <polyline fill="none" stroke="url(#speedGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points="0,95 50,85 100,90 150,75 200,65 250,60 300,50 350,45 400,40 450,38 500,30 550,25"/>
                    <circle cx="550" cy="25" r="4" fill="#00c3ff" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="chart-x-labels">
                  <span className="cx-label">Jan</span><span className="cx-label">Feb</span><span className="cx-label">Mar</span>
                  <span className="cx-label">Apr</span><span className="cx-label">May</span><span className="cx-label">Jun</span>
                </div>
              </div>

              {/* Service Mix */}
              <div className="chart-card">
                <div className="cc-header">
                  <div className="cc-title">Service Mix</div>
                  <div className="cc-period">This month</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <svg viewBox="0 0 100 100" width="120" height="120">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(10,111,255,0.1)" strokeWidth="18"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#0a6fff" strokeWidth="18" strokeDasharray="85 220" strokeDashoffset="55"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#00c3ff" strokeWidth="18" strokeDasharray="55 220" strokeDashoffset="-30"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#22c55e" strokeWidth="18" strokeDasharray="40 220" strokeDashoffset="-85"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="25 220" strokeDashoffset="-125"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#a78bfa" strokeWidth="18" strokeDasharray="15 220" strokeDashoffset="-150"/>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                    <div className="dl-item" style={{ justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="dl-swatch" style={{ background: '#0a6fff' }}></div>ECU Programming</span>
                      <span style={{ fontWeight: 700, color: 'var(--white)' }}>38%</span>
                    </div>
                    <div className="dl-item" style={{ justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="dl-swatch" style={{ background: '#00c3ff' }}></div>Tracking/Fleet</span>
                      <span style={{ fontWeight: 700, color: 'var(--white)' }}>25%</span>
                    </div>
                    <div className="dl-item" style={{ justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="dl-swatch" style={{ background: '#22c55e' }}></div>Diagnostics</span>
                      <span style={{ fontWeight: 700, color: 'var(--white)' }}>18%</span>
                    </div>
                    <div className="dl-item" style={{ justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="dl-swatch" style={{ background: '#f59e0b' }}></div>Key Programming</span>
                      <span style={{ fontWeight: 700, color: 'var(--white)' }}>11%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Row */}
            <div className="admin-tables">
              <div className="data-table-card">
                <div className="dt-header">
                  <div className="dt-title">Recent Workshop Jobs</div>
                  <div className="dt-action">View All →</div>
                </div>
                <table className="dt-table">
                  <thead>
                    <tr><th>Customer</th><th>Service</th><th>Vehicle</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job, idx) => (
                      <tr key={idx}>
                        <td>{job.customer}</td>
                        <td>{job.service}</td>
                        <td>{job.vehicle}</td>
                        <td><span className={`status-pill sp-${job.statusClass}`}>{job.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="data-table-card">
                <div className="dt-header">
                  <div className="dt-title">Top Customers — June</div>
                  <div className="dt-action">View All →</div>
                </div>
                <table className="dt-table">
                  <thead>
                    <tr><th>Name</th><th>Jobs</th><th>Spent</th><th>Plan</th></tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer, idx) => (
                      <tr key={idx}>
                        <td>{customer.name}</td>
                        <td>{customer.jobs}</td>
                        <td>{customer.spent}</td>
                        <td><span className={`status-pill sp-${customer.planClass}`}>{customer.plan}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workshop Performance */}
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 14 }}>Workshop Performance Metrics</div>
            <div className="workshop-metrics">
              <div className="wm-card">
                <div className="wm-title">Workshop Utilization</div>
                <div className="wm-val">{adminData.workshopUtilization}%</div>
                <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: `${adminData.workshopUtilization}%` }}></div></div>
                <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)' }}>5 of 6 bays occupied</div>
              </div>
              <div className="wm-card">
                <div className="wm-title">Avg Job Completion Time</div>
                <div className="wm-val">{adminData.avgCompletionTime}<span style={{ fontSize: 16, color: 'var(--silver)', fontFamily: 'var(--font-tech)' }}>hrs</span></div>
                <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: 68, background: 'linear-gradient(90deg,#059669,#22c55e)' }}></div></div>
                <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)' }}>↓ 0.4hrs from target</div>
              </div>
              <div className="wm-card">
                <div className="wm-title">Customer Satisfaction</div>
                <div className="wm-val">{adminData.customerSatisfaction}%</div>
                <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: adminData.customerSatisfaction, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}></div></div>
                <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)' }}>Based on 47 reviews</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .admin-page {
          background: #030912;
          min-height: 100vh;
        }
        .admin-layout {
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
        .admin-main {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .admin-greeting {
          font-family: var(--font-head);
          font-size: 26px;
          font-weight: 800;
          color: var(--white);
        }
        .admin-greeting span {
          color: var(--blue-neon);
        }
        .admin-subtext {
          font-family: var(--font-tech);
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .admin-actions {
          display: flex;
          gap: 12px;
        }
        .admin-kpi {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .akpi {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 22px;
          position: relative;
          overflow: hidden;
        }
        .akpi::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
        }
        .akpi.blue::after { background: linear-gradient(90deg, #0a6fff, #00c3ff); }
        .akpi.green::after { background: linear-gradient(90deg, #059669, #22c55e); }
        .akpi.purple::after { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
        .akpi.orange::after { background: linear-gradient(90deg, #d97706, #fbbf24); }
        .akpi-label {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .akpi-val {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 800;
          color: var(--white);
        }
        .akpi-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-tech);
          font-size: 11px;
          margin-top: 6px;
          padding: 3px 8px;
          border-radius: 100px;
        }
        .akpi-change.up {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
        }
        .akpi-change.down {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }
        .akpi-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 28px;
          opacity: 0.15;
        }
        .admin-charts {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .chart-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 22px;
        }
        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .cc-title {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
        }
        .cc-period {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
        }
        .line-chart {
          position: relative;
          height: 160px;
        }
        .line-chart-svg {
          width: 100%;
          height: 100%;
        }
        .chart-x-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }
        .cx-label {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
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
        .admin-tables {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .data-table-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .dt-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dt-title {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
        }
        .dt-action {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--blue-neon);
          cursor: pointer;
        }
        .dt-table {
          width: 100%;
          border-collapse: collapse;
        }
        .dt-table th {
          padding: 10px 20px;
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: left;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
        }
        .dt-table td {
          padding: 12px 20px;
          font-family: var(--font-tech);
          font-size: 13px;
          color: var(--silver);
          border-bottom: 1px solid rgba(30, 60, 120, 0.1);
        }
        .dt-table tr:last-child td {
          border-bottom: none;
        }
        .dt-table tr:hover td {
          background: rgba(10, 111, 255, 0.04);
          color: var(--white);
        }
        .status-pill {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 100px;
          font-weight: 600;
        }
        .sp-success {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
        }
        .sp-pending {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
        }
        .sp-info {
          background: rgba(10, 111, 255, 0.12);
          color: #60a5fa;
        }
        .workshop-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .wm-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 18px 20px;
        }
        .wm-title {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .wm-val {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--white);
        }
        .progress-bar-outer {
          background: rgba(10, 111, 255, 0.1);
          border-radius: 100px;
          height: 6px;
          margin: 8px 0;
        }
        .progress-bar-inner {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, var(--blue-primary), var(--blue-neon));
        }
        @media (max-width: 1024px) {
          .admin-kpi { grid-template-columns: repeat(2, 1fr); }
          .admin-charts { grid-template-columns: 1fr; }
          .admin-tables { grid-template-columns: 1fr; }
          .workshop-metrics { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; height: auto; }
          .dash-sidebar { display: none; width: 100%; position: fixed; top: 52px; left: 0; bottom: 0; z-index: 100; overflow-y: auto; }
          .dash-sidebar.mobile-open { display: flex; }
          .dash-mobile-topbar { display: flex; }
          .admin-main { padding: 14px; }
          .admin-header { flex-direction: column; gap: 16px; align-items: flex-start; }
          .admin-greeting { font-size: 20px; }
          .admin-actions { flex-wrap: wrap; }
          .admin-kpi { grid-template-columns: 1fr 1fr; gap: 12px; }
          .akpi-val { font-size: 28px; }
          .workshop-metrics { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .admin-kpi { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default AdminPage