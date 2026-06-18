import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const galleryItems = [
  { id: 1, category: 'ECU Programming', title: 'BMW E90 Engine Control Unit Remap', desc: 'Complete ECU software upgrade and performance calibration. Power output increased from 218bhp to 275bhp with improved fuel efficiency.', tags: ['BMW', 'ECU', 'Tuning'], date: 'May 2025', type: 'image', imageClass: 'gi-p1' },
  { id: 2, category: 'Radar Calibration', title: 'Mercedes GLC Radar Recalibration', desc: 'Precision radar calibration after windshield replacement. ACC system fully restored to factory specifications.', tags: ['Mercedes', 'Radar', 'ADAS'], date: 'April 2025', type: 'before-after', beforeStatus: 'Radar misaligned ±4.2°', afterStatus: 'Perfect ±0.1° tolerance', beforeIcon: '⚠️', afterIcon: '✅' },
  { id: 3, category: 'Key Programming', title: 'Range Rover Sport — All Keys Lost Recovery', desc: 'Emergency all-key-lost solution for a 2023 Range Rover Sport. New keys programmed via OBD with immobilizer reprogramming in under 90 minutes.', tags: ['Land Rover', 'Keys', 'Emergency'], date: 'Mar 2025', type: 'image', imageClass: 'gi-p3' },
  { id: 4, category: 'Diagnostics', title: 'Toyota Land Cruiser 300 — Full System Scan', desc: 'Multi-system diagnostic covering engine, transmission, ABS, airbag, and CAN bus network analysis. 34 fault codes identified and resolved.', tags: ['Toyota', 'Diagnostics'], date: 'Jun 2025', type: 'image', imageClass: 'gi-p2' },
  { id: 5, category: 'ADAS Calibration', title: 'Mercedes-Benz S-Class — ADAS Full Calibration', desc: 'Post-collision ADAS recalibration including front camera, radar, and lane departure warning systems using manufacturer-specific target patterns.', tags: ['Mercedes', 'ADAS', 'Camera'], date: 'May 2025', type: 'image', imageClass: 'gi-p5' },
  { id: 6, category: 'Auto Electrical', title: 'Wiring Harness Restoration', desc: 'Complete wiring harness repair and restoration for a BMW X5 with extensive rodent damage.', tags: ['BMW', 'Electrical', 'Harness'], date: 'Feb 2025', type: 'before-after', beforeStatus: 'Burnt wiring harness', afterStatus: 'Full rewire complete', beforeIcon: '🔴⚡', afterIcon: '✅⚡' },
  { id: 7, category: 'Fleet Management', title: 'Fleet GPS Installation — 30 Vehicle Project', desc: 'Complete fleet tracking installation for a major logistics company. 30 vehicles fitted with covert GPS units with real-time monitoring portal setup and staff training.', tags: ['Fleet', 'GPS', 'Covert'], date: 'Jan 2025', type: 'image', imageClass: 'gi-p7' },
  { id: 8, category: 'Key Programming', title: 'Audi A6 — Immobilizer Recoding After ECU Swap', desc: 'Successfully adapted the immobilizer system after an engine control unit replacement. Full synchronization of ECU, dashboard cluster, and transponder keys.', tags: ['Audi', 'Immobilizer'], date: 'Apr 2025', type: 'image', imageClass: 'gi-p4' },
  { id: 9, category: 'ECU Programming', title: 'Porsche Cayenne — Complete ECU + Maintenance', desc: 'Full service package including ECU software update, OBD diagnostics, oil service reset, and tyre pressure monitoring system calibration.', tags: ['Porsche', 'ECU', 'Maintenance'], date: 'Jun 2025', type: 'image', imageClass: 'gi-p6' }
]

const filters = ['All Projects', 'ECU Programming', 'Radar Calibration', 'Key Programming', 'Diagnostics', 'ADAS Calibration', 'Auto Electrical', 'Fleet Management']

const stats = [
  { value: '2,500', suffix: '+', label: 'Projects Completed' },
  { value: '50', suffix: '+', label: 'Vehicle Brands' },
  { value: '12', suffix: '+', label: 'Years Experience' },
  { value: '98', suffix: '%', label: 'Success Rate' }
]

const GalleryPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter)

  return (
    <div className="gallery-page">
      {/* Navigation */}
      <nav className="site-nav">
        <div className="nav-logo">
          <span className="nav-logo-main">ABU MUS'AB</span>
          <span className="nav-logo-sub">Automotive Solutions</span>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="#">Fleet</Link>
          <Link to="/gallery" style={{ color: 'var(--blue-neon)' }}>Gallery</Link>
          <Link to="#">Contact</Link>
        </div>
        <div className="nav-cta">
          <Link to="#" className="btn-primary" style={{ padding: '9px 20px', fontSize: 12 }}>Book Service</Link>
        </div>
        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Fleet</Link>
        <Link to="/gallery" style={{ color: 'var(--blue-neon)' }} onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        <div className="mobile-nav-cta">
          <Link to="#" className="btn-primary" style={{ padding: '11px 20px', fontSize: 13 }}>Book Service</Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="gallery-hero">
        <div className="tag" style={{ marginBottom: 20 }}>Our Work Speaks For Itself</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 64px)', maxWidth: 700, margin: '0 auto 20px' }}>Workshop Gallery & Portfolio</h1>
        <p className="section-sub" style={{ margin: '0 auto' }}>Real projects. Real results. Showcasing our precision work across ECU programming, ADAS calibration, key programming, and advanced vehicle diagnostics.</p>
      </div>

      {/* Stats Banner */}
      <div className="gallery-stats">
        {stats.map((stat, index) => (
          <div key={index} className="gs-stat">
            <div className="gs-num">{stat.value}<span>{stat.suffix}</span></div>
            <div className="gs-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="gallery-filters">
        {filters.map((filter, index) => (
          <button
            key={index}
            className={`gf-btn ${activeFilter === (filter === 'All Projects' ? 'all' : filter) ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter === 'All Projects' ? 'all' : filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Gallery Masonry */}
      <div className="gallery-masonry">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            className={`gallery-item ${item.type === 'before-after' ? 'ba-card' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
          >
            {item.type === 'image' ? (
              <>
                <div className={`gallery-img-placeholder ${item.imageClass}`}>
                  <div className="gi-detail"></div>
                  <div className="scan-overlay"></div>
                </div>
                <div className="gallery-item-info">
                  <div className="gi-cat">{item.category}</div>
                  <div className="gi-title">{item.title}</div>
                  <div className="gi-desc">{item.desc}</div>
                  <div className="gi-meta">
                    <div className="gi-tags">{item.tags.map((tag, idx) => <span key={idx} className="gi-tag">{tag}</span>)}</div>
                    <div className="gi-date">{item.date}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="ba-badge">Before / After</span>
                <div style={{ padding: '10px 14px' }}>
                  <div className="gi-cat">{item.category}</div>
                  <div className="gi-title">{item.title}</div>
                </div>
                <div className="ba-cols">
                  <div className="ba-col before">
                    <div className="ba-col-label">Before</div>
                    <div className="ba-visual">{item.beforeIcon}</div>
                    <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: '#ef4444', marginTop: 6 }}>{item.beforeStatus}</div>
                  </div>
                  <div className="ba-col after">
                    <div className="ba-col-label">After</div>
                    <div className="ba-visual">{item.afterIcon}</div>
                    <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: '#22c55e', marginTop: 6 }}>{item.afterStatus}</div>
                  </div>
                </div>
                <div style={{ padding: '6px 14px 14px' }}>
                  <div className="gi-date">{item.date}</div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{ padding: '0 60px 80px' }}>
        <div className="cta-banner">
          <div className="section-eyebrow">Your Vehicle Next?</div>
          <h2 className="section-title">Ready to Experience Premium Service?</h2>
          <p className="section-sub" style={{ margin: '0 auto 32px' }}>Join hundreds of satisfied clients who trust Abu Mus'ab Automotive Solutions for precision automotive technology services.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="#" className="btn-primary">Book an Appointment</Link>
            <Link to="/services" className="btn-outline">View All Services</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Abu Mus'ab Automotive Solutions. Precision Automotive Technology.</div>
          <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--blue-neon)' }}>ABU MUS'AB · AUTOMOTIVE SOLUTIONS</div>
        </div>
      </footer>

      <style jsx>{`
        .gallery-page {
          background: var(--bg-deep);
          min-height: 100vh;
        }
        .gallery-hero {
          padding: 100px 60px 60px;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(10, 50, 160, 0.2), transparent);
          text-align: center;
        }
        .gallery-stats {
          display: flex;
          justify-content: center;
          gap: 80px;
          padding: 50px 60px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin: 0 60px 60px;
        }
        .gs-stat {
          text-align: center;
        }
        .gs-num {
          font-family: var(--font-display);
          font-size: 40px;
          font-weight: 800;
          color: var(--white);
        }
        .gs-num span {
          color: var(--blue-neon);
        }
        .gs-label {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 6px;
        }
        .gallery-filters {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          padding: 0 60px 50px;
        }
        .gf-btn {
          font-family: var(--font-tech);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 9px 20px;
          border-radius: 100px;
          cursor: pointer;
          border: 1px solid var(--border);
          background: rgba(6, 14, 30, 0.8);
          color: var(--silver);
          transition: all 0.2s;
        }
        .gf-btn.active, .gf-btn:hover {
          background: rgba(10, 111, 255, 0.15);
          border-color: rgba(10, 111, 255, 0.4);
          color: var(--blue-neon);
        }
        .gallery-masonry {
          padding: 0 60px 80px;
          columns: 3;
          gap: 20px;
        }
        .gallery-item {
          break-inside: avoid;
          margin-bottom: 20px;
          background: rgba(8, 15, 32, 0.9);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }
        .gallery-item:hover {
          border-color: rgba(10, 111, 255, 0.5);
          box-shadow: 0 20px 60px rgba(10, 111, 255, 0.15);
        }
        .gallery-img-placeholder {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          position: relative;
          overflow: hidden;
        }
        .gi-p1 { height: 220px; background: linear-gradient(135deg, #0a1a40 0%, #0a3060 50%, #051020 100%); }
        .gi-p2 { height: 160px; background: linear-gradient(135deg, #0a2030 0%, #1a4060 50%, #0a1020 100%); }
        .gi-p3 { height: 280px; background: linear-gradient(135deg, #040a20 0%, #0a1a50 60%, #051530 100%); }
        .gi-p4 { height: 200px; background: linear-gradient(135deg, #0a1030 0%, #0a2050 50%, #040a20 100%); }
        .gi-p5 { height: 240px; background: linear-gradient(135deg, #060e28 0%, #0c2040 60%, #060a18 100%); }
        .gi-p6 { height: 180px; background: linear-gradient(135deg, #0a1828 0%, #0a3060 40%, #05101c 100%); }
        .gi-p7 { height: 260px; background: linear-gradient(135deg, #040d25 0%, #0a2060 50%, #030a18 100%); }
        .gi-detail {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(10, 111, 255, 0.03) 10px, rgba(10, 111, 255, 0.03) 11px);
        }
        .scan-overlay {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 195, 255, 0.02) 3px, rgba(0, 195, 255, 0.02) 4px);
          pointer-events: none;
        }
        .gallery-item-info {
          padding: 16px 18px;
        }
        .gi-cat {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--blue-neon);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .gi-title {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 6px;
        }
        .gi-desc {
          font-size: 12px;
          color: var(--silver);
          line-height: 1.5;
        }
        .gi-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }
        .gi-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .gi-tag {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          background: rgba(10, 111, 255, 0.08);
          border: 1px solid rgba(10, 111, 255, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .gi-date {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
        }
        .ba-card {
          break-inside: avoid;
          margin-bottom: 20px;
          background: rgba(8, 15, 32, 0.9);
          border: 1px solid rgba(10, 111, 255, 0.3);
          border-radius: 16px;
          overflow: hidden;
        }
        .ba-badge {
          font-family: var(--font-tech);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 14px;
          background: rgba(10, 111, 255, 0.15);
          color: var(--blue-neon);
          display: inline-block;
          margin: 14px 14px 0;
          border-radius: 6px;
          border: 1px solid rgba(10, 111, 255, 0.3);
        }
        .ba-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .ba-col {
          padding: 12px 14px;
        }
        .ba-col-label {
          font-family: var(--font-tech);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ba-col.before .ba-col-label {
          color: #ef4444;
        }
        .ba-col.after .ba-col-label {
          color: #22c55e;
        }
        .ba-visual {
          height: 90px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        .ba-col.before .ba-visual {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .ba-col.after .ba-visual {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .cta-banner {
          background: linear-gradient(135deg, rgba(10, 40, 120, 0.4), rgba(5, 15, 40, 0.8));
          border: 1px solid rgba(10, 111, 255, 0.4);
          border-radius: 24px;
          padding: 60px;
          text-align: center;
        }
        .site-footer {
          background: rgba(5, 10, 20, 0.98);
          border-top: 1px solid var(--border);
          padding: 40px 60px 30px;
        }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-copy {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        @media (max-width: 1024px) {
          .gallery-hero { padding: 80px 28px 50px; }
          .gallery-filters { padding: 0 28px 40px; }
          .gallery-masonry { padding: 0 28px 60px; columns: 2; }
          .gallery-stats { padding: 40px 28px; margin: 0 28px 40px; gap: 40px; }
        }
        @media (max-width: 768px) {
          .gallery-hero { padding: 60px 20px 40px; }
          .gallery-filters { padding: 0 20px 32px; gap: 8px; }
          .gf-btn { font-size: 11px; padding: 7px 14px; }
          .gallery-masonry { padding: 0 20px 50px; columns: 1; }
          .gallery-stats { padding: 32px 20px; margin: 0 20px 40px; gap: 20px; flex-wrap: wrap; justify-content: center; }
          .gs-num { font-size: 28px; }
          .cta-banner { padding: 40px 24px; margin: 0 20px; }
          [style*="padding:0 60px 80px"] { padding: 0 20px 60px !important; }
        }
        @media (max-width: 480px) {
          .gallery-stats { flex-direction: column; gap: 16px; align-items: center; }
        }
      `}</style>
    </div>
  )
}

export default GalleryPage