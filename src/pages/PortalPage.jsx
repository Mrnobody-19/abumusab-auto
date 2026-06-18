import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const customerData = {
  name: 'Ahmed Khalid',
  plan: 'Premium Member',
  memberSince: 'Jan 2023',
  vehicle: {
    name: 'Toyota Land Cruiser 300',
    plate: 'ABJ · AKH-2024',
    speed: 68,
    odometer: 47230,
    fuelLevel: 78,
    engineTemp: 91,
    location: 'Airport Road, Abuja · Nigeria'
  },
  totalServices: 24,
  totalSpent: '₦620K',
  points: 1240,
  subscription: {
    plan: 'Premium Fleet Plan',
    price: '₦15,000',
    nextBilling: '1 July 2025',
    status: 'active'
  }
}

const serviceHistory = [
  { icon: '⚡', title: 'ECU Remapping', date: '18 May 2025 · Workshop', cost: '₦85,000', status: 'Complete' },
  { icon: '📡', title: 'Radar Calibration (ACC)', date: '02 Apr 2025 · Workshop', cost: '₦45,000', status: 'Complete' },
  { icon: '🔧', title: 'Full Vehicle Diagnostics', date: '15 Feb 2025 · Workshop', cost: '₦15,000', status: 'Complete' },
  { icon: '🛰️', title: 'GPS Tracker Installation', date: '10 Jan 2025 · Workshop', cost: '₦35,000', status: 'Complete' }
]

const reminders = [
  { icon: '🔴', title: 'Engine Oil Change', due: 'OVERDUE by 230km', percentage: 105, type: 'urgent' },
  { icon: '🟡', title: 'Tyre Rotation', due: 'Due in 800km', percentage: 84, type: 'soon' },
  { icon: '🟢', title: 'Brake Fluid Service', due: 'Due in 8,500km', percentage: 35, type: 'ok' },
  { icon: '🟢', title: 'ADAS Recalibration', due: 'Due in 6 months', percentage: 20, type: 'ok' }
]

const subscriptionFeatures = [
  'Real-time GPS tracking', 'Unlimited geofences', 'Speed & behavior alerts',
  'Advanced fleet analytics', '24/7 customer support', 'Route optimization'
]

const navItems = [
  { id: 'vehicles', icon: '🚗', label: 'My Vehicles' },
  { id: 'tracking', icon: '🛰️', label: 'Live Tracking' },
  { id: 'history', icon: '🔧', label: 'Service History' },
  { id: 'book', icon: '📅', label: 'Book Service' },
  { id: 'subscription', icon: '💳', label: 'Subscription' },
  { id: 'reminders', icon: '🔔', label: 'Reminders' },
  { id: 'support', icon: '📞', label: 'Support' }
]

const PortalPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('vehicles')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="portal-page">
      {/* Navigation */}
      <nav className="site-nav">
        <div className="nav-logo">
          <span className="nav-logo-main">ABU MUS'AB</span>
          <span className="nav-logo-sub">Customer Portal</span>
        </div>
        <div className="nav-links">
          <Link to="#">My Vehicles</Link>
          <Link to="#">Service History</Link>
          <Link to="#">Subscription</Link>
          <Link to="#">Support</Link>
        </div>
        <div className="nav-cta">
          <div style={{ fontFamily: 'var(--font-tech)', fontSize: 12, color: 'var(--silver)', padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>🔔 3</div>
          <Link to="/" className="btn-outline" style={{ padding: '9px 20px', fontSize: 12 }}>Sign Out</Link>
        </div>
        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>My Vehicles</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Service History</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Subscription</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Support</Link>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="portal-mobile-topbar">
        <div className="portal-user-mini">
          <div className="portal-mini-avatar">{customerData.name.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 12, fontWeight: 600 }}>{customerData.name}</div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, color: 'var(--text-muted)' }}>{customerData.plan}</div>
          </div>
        </div>
        <button className="sidebar-toggle-btn" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>☰ Menu</button>
      </div>

      {/* Hero Section */}
      <div className="portal-hero">
        <div className="tag" style={{ marginBottom: 16 }}>Welcome back</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>My Vehicle Dashboard</h1>
        <p className="section-sub" style={{ margin: '0 auto' }}>Track your vehicle live, view service history, and manage your subscription.</p>
      </div>

      <div className="portal-layout">
        {/* Sidebar */}
        <aside className={`portal-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="portal-user-card">
            <div className="portal-avatar">{customerData.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="portal-user-name">{customerData.name}</div>
            <div className="portal-user-plan">🏆 {customerData.plan}</div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Member since {customerData.memberSince}</div>
          </div>
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`portal-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.id); setMobileSidebarOpen(false) }}
            >
              <span className="pni-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Quick Stats</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-tech)', fontSize: 12, color: 'var(--silver)' }}>Total Services</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{customerData.totalServices}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-tech)', fontSize: 12, color: 'var(--silver)' }}>Total Spent</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{customerData.totalSpent}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-tech)', fontSize: 12, color: 'var(--silver)' }}>Points</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--blue-neon)' }}>{customerData.points}</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="portal-content">
          {/* My Vehicle Card */}
          <div>
            <div className="pc-section-title">My Vehicle — Live Tracking</div>
            <div className="my-vehicle-card">
              <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(10,111,255,0.1), transparent 70%)', pointerEvents: 'none' }}></div>
              <div className="mvc-header">
                <div>
                  <div className="mvc-name">{customerData.vehicle.name}</div>
                  <div className="mvc-plate">{customerData.vehicle.plate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="vi-status moving" style={{ display: 'inline-flex', padding: '5px 14px', fontSize: 12 }}>🟢 Moving</div>
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Last updated: 12 seconds ago</div>
                </div>
              </div>
              <div className="mvc-stats">
                <div><div className="mvc-stat-val">{customerData.vehicle.speed}</div><div className="mvc-stat-label">Speed (km/h)</div></div>
                <div><div className="mvc-stat-val">{customerData.vehicle.odometer.toLocaleString()}</div><div className="mvc-stat-label">Odometer (km)</div></div>
                <div><div className="mvc-stat-val">{customerData.vehicle.fuelLevel}%</div><div className="mvc-stat-label">Fuel Level</div></div>
                <div><div className="mvc-stat-val">{customerData.vehicle.engineTemp}°C</div><div className="mvc-stat-label">Engine Temp</div></div>
              </div>
              <div className="vc-map">
                <div className="vc-map-grid"></div>
                <div className="vc-pin">
                  <div style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,195,255,0.4)', animation: 'pingRing 2s ease-out infinite' }}></div>
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'rgba(10,111,255,0.6)', letterSpacing: '0.1em' }}>📍 {customerData.vehicle.location}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <Link to="#" className="btn-outline" style={{ padding: '8px 18px', fontSize: 12 }}>🗺️ Full Map</Link>
                <Link to="#" className="btn-outline" style={{ padding: '8px 18px', fontSize: 12 }}>🛤️ Route History</Link>
                <Link to="#" className="btn-outline" style={{ padding: '8px 18px', fontSize: 12 }}>📊 Trip Reports</Link>
                <Link to="#" className="btn-primary" style={{ padding: '8px 18px', fontSize: 12 }}>🔔 Set Alert</Link>
              </div>
            </div>
          </div>

          {/* Service History + Reminders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Service History */}
            <div>
              <div className="pc-section-title">Recent Service History</div>
              <div className="service-history-card">
                {serviceHistory.map((service, idx) => (
                  <div key={idx} className="sh-row">
                    <div className="sh-icon">{service.icon}</div>
                    <div className="sh-info">
                      <div className="sh-title">{service.title}</div>
                      <div className="sh-date">{service.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="sh-cost">{service.cost}</div>
                      <div className="sh-status"><span className="status-pill sp-success">{service.status}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Reminders */}
            <div>
              <div className="pc-section-title">Maintenance Reminders</div>
              <div className="reminder-card">
                {reminders.map((reminder, idx) => (
                  <div key={idx} className="rem-item">
                    <div className={`rem-icon ${reminder.type}`}>{reminder.icon}</div>
                    <div>
                      <div className="rem-title">{reminder.title}</div>
                      <div className={`rem-due ${reminder.type}`}>{reminder.due}</div>
                    </div>
                    <div className="rem-progress-outer">
                      <div className="rem-progress-label">{reminder.percentage}%</div>
                      <div className="progress-bar-outer">
                        <div 
                          className="progress-bar-inner" 
                          style={{ 
                            width: `${Math.min(reminder.percentage, 100)}%`,
                            background: reminder.type === 'urgent' ? 'linear-gradient(90deg,#ef4444,#f87171)' : 
                                      reminder.type === 'soon' ? 'linear-gradient(90deg,#d97706,#fbbf24)' : undefined
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div>
            <div className="pc-section-title">My Subscription</div>
            <div className="sub-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="sub-tier">{customerData.subscription.plan}</div>
                  <div className="sub-price">{customerData.subscription.price}<span>/month</span></div>
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Next billing: {customerData.subscription.nextBilling}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="status-pill sp-success" style={{ fontSize: 12, padding: '5px 14px' }}>✓ Active</div>
                  <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Auto-renews</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginTop: 16 }}>
                {subscriptionFeatures.map((feature, idx) => (
                  <div key={idx} className="sub-feat">{feature}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <Link to="#" className="btn-outline" style={{ padding: '9px 20px', fontSize: 12 }}>Manage Plan</Link>
                <Link to="#" className="btn-outline" style={{ padding: '9px 20px', fontSize: 12 }}>View Invoices</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .portal-page {
          background: var(--bg-deep);
          min-height: 100vh;
        }
        .site-nav {
          position: relative;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 60px;
          border-bottom: 1px solid rgba(30, 80, 160, 0.2);
          background: rgba(2, 8, 16, 0.7);
          backdrop-filter: blur(20px);
        }
        .portal-hero {
          background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(10, 60, 180, 0.2), transparent);
          padding: 80px 60px 60px;
          text-align: center;
        }
        .portal-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          padding: 0 60px 80px;
        }
        .portal-sidebar {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-self: start;
        }
        .portal-user-card {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 8px;
        }
        .portal-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          margin: 0 auto 12px;
          background: linear-gradient(135deg, var(--blue-primary), var(--blue-neon));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          border: 2px solid rgba(10, 111, 255, 0.4);
        }
        .portal-user-name {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
        }
        .portal-user-plan {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--blue-neon);
          margin-top: 4px;
        }
        .portal-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-tech);
          font-size: 12px;
          font-weight: 600;
          color: var(--silver);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .portal-nav-item:hover {
          background: rgba(10, 111, 255, 0.08);
          color: var(--white);
        }
        .portal-nav-item.active {
          background: rgba(10, 111, 255, 0.12);
          color: var(--blue-neon);
        }
        .pni-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        .portal-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .pc-section-title {
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 14px;
        }
        .my-vehicle-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .mvc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .mvc-name {
          font-family: var(--font-head);
          font-size: 20px;
          font-weight: 800;
          color: var(--white);
        }
        .mvc-plate {
          font-family: var(--font-display);
          font-size: 13px;
          color: var(--blue-neon);
          margin-top: 4px;
        }
        .vi-status.moving {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          padding: 2px 8px;
          border-radius: 100px;
          font-family: var(--font-tech);
          font-size: 10px;
          font-weight: 600;
        }
        .mvc-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .mvc-stat-val {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--white);
        }
        .mvc-stat-label {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .vc-map {
          height: 80px;
          background: rgba(4, 10, 25, 0.8);
          border-radius: 10px;
          border: 1px solid var(--border);
          margin-top: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vc-map-grid {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(10, 111, 255, 0.05) 15px, rgba(10, 111, 255, 0.05) 16px), repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(10, 111, 255, 0.05) 15px, rgba(10, 111, 255, 0.05) 16px);
        }
        .vc-pin {
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--blue-neon);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--blue-neon);
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .service-history-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .sh-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(30, 60, 120, 0.12);
          transition: background 0.2s;
          cursor: pointer;
        }
        .sh-row:last-child {
          border-bottom: none;
        }
        .sh-row:hover {
          background: rgba(10, 111, 255, 0.05);
        }
        .sh-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(10, 111, 255, 0.1);
          border: 1px solid rgba(10, 111, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .sh-info {
          flex: 1;
        }
        .sh-title {
          font-family: var(--font-tech);
          font-size: 13px;
          font-weight: 600;
          color: var(--white);
        }
        .sh-date {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .sh-cost {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
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
        .reminder-card {
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .rem-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(30, 60, 120, 0.12);
        }
        .rem-item:last-child {
          border-bottom: none;
        }
        .rem-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .rem-icon.urgent {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .rem-icon.soon {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .rem-icon.ok {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .rem-title {
          font-family: var(--font-tech);
          font-size: 13px;
          font-weight: 600;
          color: var(--white);
        }
        .rem-due {
          font-family: var(--font-tech);
          font-size: 11px;
          margin-top: 3px;
        }
        .rem-due.urgent { color: #ef4444; }
        .rem-due.soon { color: #f59e0b; }
        .rem-due.ok { color: #22c55e; }
        .rem-progress-outer {
          margin-left: auto;
          width: 80px;
        }
        .rem-progress-label {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          text-align: right;
          margin-bottom: 4px;
        }
        .progress-bar-outer {
          background: rgba(10, 111, 255, 0.1);
          border-radius: 100px;
          height: 6px;
        }
        .progress-bar-inner {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, var(--blue-primary), var(--blue-neon));
        }
        .sub-card {
          background: linear-gradient(135deg, rgba(10, 40, 120, 0.5), rgba(5, 15, 40, 0.9));
          border: 1px solid rgba(10, 111, 255, 0.5);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .sub-card::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(10, 111, 255, 0.15), transparent 70%);
        }
        .sub-tier {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--blue-neon);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .sub-price {
          font-family: var(--font-display);
          font-size: 40px;
          font-weight: 800;
          color: var(--white);
        }
        .sub-price span {
          font-size: 18px;
          color: var(--silver);
        }
        .sub-feat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--silver-light);
        }
        .sub-feat::before {
          content: '✓';
          color: var(--blue-neon);
          font-weight: 700;
        }
        .portal-mobile-topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          margin-bottom: 16px;
          background: rgba(6, 14, 30, 0.95);
          border: 1px solid var(--border);
          border-radius: 14px;
        }
        .portal-mobile-topbar .portal-user-mini {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .portal-mini-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-primary), var(--blue-neon));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        @media (max-width: 1024px) {
          .site-nav { padding: 16px 28px; }
          .portal-hero { padding: 70px 28px 50px; }
          .portal-layout { padding: 0 28px 60px; grid-template-columns: 240px 1fr; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-cta { display: none; }
          .mobile-menu-btn { display: flex; }
          .site-nav { padding: 14px 20px; }
          .portal-hero { padding: 60px 20px 40px; }
          .portal-layout { grid-template-columns: 1fr; padding: 0 20px 60px; }
          .portal-sidebar { position: static; display: none; }
          .portal-sidebar.mobile-open { display: flex; }
          .portal-mobile-topbar { display: flex; }
          .mvc-stats { grid-template-columns: repeat(2, 1fr); }
          [style*="display:grid;grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  )
}

export default PortalPage