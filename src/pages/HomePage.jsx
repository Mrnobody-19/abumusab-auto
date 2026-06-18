import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroCarSVG from '../components/home/HeroCarSVG'
import ServiceCard from '../components/home/ServiceCard'
import StatCard from '../components/home/StatCard'
import TestimonialCard from '../components/home/TestimonialCard'
import ceoImage from '../assets/IMG-20260605-WA0016-removebg-preview.png'

const servicesData = [
  { icon: '⚡', title: 'ECU Programming', desc: 'Advanced electronic control unit programming and remapping for performance and efficiency.' },
  { icon: '📡', title: 'Radar Calibration', desc: 'Precision calibration of ADAS radar systems, sensors and forward collision warning.' },
  { icon: '🔑', title: 'Key Programming', desc: 'All vehicle key fob programming, transponder coding and immobilizer bypass solutions.' },
  { icon: '🛰️', title: 'Vehicle Tracking', desc: 'Real-time GPS fleet tracking, geofencing, route optimization and live monitoring.' },
  { icon: '🔬', title: 'Advanced Diagnostics', desc: 'Comprehensive OBD-II diagnostics, fault code analysis and live data monitoring.' },
  { icon: '🔧', title: 'Auto Electrical', desc: 'Full vehicle electrical fault diagnosis, wiring harness repair and system integration.' },
  { icon: '🛡️', title: 'Immobilizer Systems', desc: 'Immobilizer programming, bypass and security system installation for all vehicle brands.' },
  { icon: '🚛', title: 'Fleet Management', desc: 'Complete fleet solutions — tracking, scheduling, reporting and maintenance management.' }
]

const statsData = [
  { value: '2,500', suffix: '+', label: 'ECU Jobs Completed' },
  { value: '150', suffix: '+', label: 'Fleet Vehicles Tracked' },
  { value: '98', suffix: '%', label: 'Customer Satisfaction' },
  { value: '22', suffix: '+', label: 'Years of Expertise' }
]

const testimonialsData = [
  {
    stars: 5,
    text: '"Abu Mus\'ab completely transformed our fleet operations. The GPS tracking system and ECU work on our 30-vehicle fleet has saved us thousands in fuel and maintenance costs."',
    author: 'Ahmad Mansour',
    role: 'Fleet Manager, Express Logistics',
    initial: 'AM'
  },
  {
    stars: 5,
    text: '"The radar calibration and ADAS recalibration on my BMW was flawless. Professional, precise, and the fastest turnaround I\'ve experienced from any automotive workshop."',
    author: 'Khalid Jabir',
    role: 'Private Client · BMW 7 Series',
    initial: 'KJ'
  },
  {
    stars: 5,
    text: '"Lost two keys for my Range Rover — they had new keys programmed and the immobilizer fully recoded in under 2 hours. Extraordinary technical knowledge."',
    author: 'Fatimah Ibrahim',
    role: 'Private Client · Land Rover',
    initial: 'FI'
  }
]

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="site-nav">
        <div className="nav-logo">
          <span className="nav-logo-main">ABU MUS'AB</span>
          <span className="nav-logo-sub">Automotive Solutions</span>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="#">Fleet Solutions</Link>
          <Link to="#">About</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="#">Contact</Link>
        </div>
        <div className="nav-cta">
          <Link to="/portal" className="btn-outline" style={{ padding: '9px 20px', fontSize: 12 }}>Customer Portal</Link>
          <Link to="#" className="btn-primary" style={{ padding: '9px 20px', fontSize: 12 }}>Book Service</Link>
        </div>
        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Fleet Solutions</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>About</Link>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        <div className="mobile-nav-cta">
          <Link to="/portal" className="btn-outline" style={{ padding: '11px 20px', fontSize: 13 }}>Customer Portal</Link>
          <Link to="#" className="btn-primary" style={{ padding: '11px 20px', fontSize: 13 }}>Book Service</Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-grid"></div>
        <div className="glow-orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(10,111,255,0.12), transparent 60%)', top: '10%', right: '20%' }}></div>
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,195,255,0.08), transparent 60%)', bottom: '10%', right: '40%' }}></div>

        <div className="hero-content" style={{ paddingTop: 80 }}>
          <div className="tag" style={{ marginBottom: 24 }}>Next-Gen Automotive Technology</div>
          <h1 className="hero-title">
            Precision<br />
            <span>Engineering</span><br />
            Redefined
          </h1>
          <p className="hero-desc">From ECU programming to advanced ADAS calibration — Abu Mus'ab Automotive Solutions delivers cutting-edge vehicle technology services trusted by individuals and fleet operators.</p>
          <div className="hero-btns">
            <Link to="/services" className="btn-primary">Explore Services</Link>
            <Link to="#" className="btn-outline">Fleet Solutions →</Link>
          </div>
          <div className="hero-stats">
            <div><div className="h-stat-num">500<span>+</span></div><div className="h-stat-label">Vehicles Serviced</div></div>
            <div><div className="h-stat-num">22<span>+</span></div><div className="h-stat-label">Years Experience</div></div>
            <div><div className="h-stat-num">98<span>%</span></div><div className="h-stat-label">Client Satisfaction</div></div>
          </div>
        </div>

        <HeroCarSVG />

        {/* Floating Data Chips */}
        <div className="data-chip" style={{ top: 130, right: '52%', animation: 'float 5s ease-in-out 0.5s infinite' }}>
          <div className="dc-label">ECU Status</div>
          <div className="dc-value">OPTIMAL</div>
          <div className="dc-sub">All parameters nominal</div>
        </div>
        <div className="data-chip" style={{ top: 220, right: '38%', animation: 'float 5s ease-in-out 1.2s infinite' }}>
          <div className="dc-label">Live Tracking</div>
          <div className="dc-value">ACTIVE</div>
          <div className="dc-sub">GPS · 42 satellites</div>
        </div>
        <div className="data-chip" style={{ bottom: 180, right: '48%', animation: 'float 5s ease-in-out 2s infinite' }}>
          <div className="dc-label">Engine Temp</div>
          <div className="dc-value" style={{ color: '#22c55e' }}>92°C</div>
          <div className="dc-sub">Normal range</div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section grid-bg">
        <div style={{ textAlign: 'center' }}>
          <div className="section-eyebrow">What We Do</div>
          <h2 className="section-title" style={{ margin: '0 auto' }}>Our Specialist Services</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>Advanced automotive technology solutions for modern vehicles and fleet operations.</p>
        </div>
        <div className="services-grid">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <div style={{ padding: '0 60px 80px' }}>
        <div className="stats-section">
          <div className="glow-orb" style={{ width: 500, height: 300, background: 'radial-gradient(circle, rgba(10,111,255,0.1), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="section-eyebrow">Numbers That Matter</div>
            <h2 className="section-title">Proven Track Record</h2>
          </div>
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </div>

            {/* CEO Section with Image */}
      <section className="ceo-section">
        <div className="ceo-image-wrapper">
          <div className="ceo-image-frame">
            {/* CEO Image */}
            <img 
              src={ceoImage}
              alt="Abu Mus'ab Al-Hajj - Founder & CEO of Abu Mus'ab Automotive Solutions"
              className="ceo-image"
            />
            <div className="ceo-silhouette" style={{ display: 'none' }}></div>
            <div className="ceo-frame-deco"></div>
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: '40%', height: '40%', borderBottom: '2px solid rgba(10,111,255,0.4)', borderLeft: '2px solid rgba(10,111,255,0.4)', borderRadius: '0 0 0 24px' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(10,111,255,0.03) 4px, rgba(10,111,255,0.03) 5px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: 'var(--font-tech)', fontSize: 10, color: 'rgba(0,195,255,0.6)', letterSpacing: '0.15em' }}>IDENTITY VERIFIED</div>
            <div style={{ position: 'absolute', top: 30, left: 20, fontFamily: 'var(--font-tech)', fontSize: 10, color: 'rgba(10,111,255,0.5)', letterSpacing: '0.1em' }}>SEC.CLEARANCE ████</div>
          </div>
          <div className="ceo-badge">
            <div className="ceo-badge-name">Muhammad Ahmad Muhammad "Abu Mus'ab"</div>
            <div className="ceo-badge-title">Founder & Chief Executive Officer</div>
          </div>
        </div>
        <div>
          <div className="tag" style={{ marginBottom: 20 }}>Leadership</div>
          <h2 className="section-title">Driven by Passion,<br />Powered by Expertise</h2>
          <blockquote className="ceo-quote">"We don't just fix vehicles — we engineer their future. Every job we take on is a statement of our commitment to precision, technology, and customer trust."</blockquote>
          <p className="section-sub">With over 22 years in automotive technology, our founder brings unparalleled expertise in ECU systems, advanced diagnostics, and fleet management solutions to every client engagement.</p>
          <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--white)' }}>22<span style={{ color: 'var(--blue-neon)' }}>+</span></div><div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Years Experience</div></div>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--white)' }}>50<span style={{ color: 'var(--blue-neon)' }}>+</span></div><div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Vehicle Brands Covered</div></div>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--white)' }}>100<span style={{ color: 'var(--blue-neon)' }}>%</span></div><div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Certified Technicians</div></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div style={{ textAlign: 'center' }}>
          <div className="section-eyebrow">Client Feedback</div>
          <h2 className="section-title">What Clients Say</h2>
        </div>
        <div className="testi-grid">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="nav-logo">
              <span className="nav-logo-main">ABU MUS'AB</span>
              <span className="nav-logo-sub">Automotive Solutions</span>
            </div>
            <p className="footer-brand-desc">Premium automotive technology services delivering ECU programming, advanced diagnostics, fleet management, and ADAS calibration to individuals and corporate clients.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <div className="social-icon">𝕏</div>
              <div className="social-icon">in</div>
              <div className="social-icon">▶</div>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Services</div>
            <div className="footer-links">
              <Link to="#">ECU Programming</Link>
              <Link to="#">Radar Calibration</Link>
              <Link to="#">Key Programming</Link>
              <Link to="#">ADAS Calibration</Link>
              <Link to="#">Auto Electrical</Link>
              <Link to="#">Vehicle Diagnostics</Link>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Fleet Solutions</div>
            <div className="footer-links">
              <Link to="#">GPS Tracking</Link>
              <Link to="#">Fleet Management</Link>
              <Link to="#">Route Optimization</Link>
              <Link to="#">Maintenance Plans</Link>
              <Link to="#">Custom Reporting</Link>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-links">
              <Link to="#">Workshop Location</Link>
              <Link to="#">+971 XX XXX XXXX</Link>
              <Link to="#">info@abumusab.auto</Link>
              <Link to="#">Book Appointment</Link>
              <Link to="#">Emergency Support</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Abu Mus'ab Automotive Solutions. All Rights Reserved.</div>
          <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)' }}>Privacy Policy · Terms of Service · Cookie Policy</div>
        </div>
      </footer>

      <style jsx>{`
        .homepage {
          background: var(--bg-deep);
        }
        .hero {
          position: relative;
          height: 100vh;
          min-height: 700px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: radial-gradient(ellipse 80% 60% at 60% 50%, rgba(10, 60, 180, 0.15), transparent),
                      radial-gradient(ellipse 50% 80% at 80% 80%, rgba(0, 195, 255, 0.06), transparent);
        }
        .hero-bg-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: linear-gradient(rgba(10, 111, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 111, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          padding: 0 60px;
          max-width: 700px;
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 5vw, 68px);
          font-weight: 800;
          line-height: 1.05;
          color: var(--white);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 24px;
        }
        .hero-title span {
          color: var(--blue-neon);
        }
        .hero-desc {
          font-size: 16px;
          color: var(--silver);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 500px;
        }
        .hero-btns {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .hero-stats {
          display: flex;
          gap: 40px;
        }
        .h-stat-num {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--white);
        }
        .h-stat-num span {
          color: var(--blue-neon);
        }
        .h-stat-label {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .services-section {
          padding: 100px 60px;
          position: relative;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 56px;
        }
        .stats-section {
          padding: 80px 60px;
          margin: 0 60px;
          background: rgba(8, 15, 32, 0.8);
          border: 1px solid var(--border);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          margin-top: 48px;
        }
        .ceo-section {
          padding: 100px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .ceo-image-wrapper {
          position: relative;
        }
        .ceo-image-frame {
          width: 100%;
          aspect-ratio: 4/5;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(10, 60, 180, 0.3), rgba(0, 195, 255, 0.1));
          border: 1px solid rgba(10, 111, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        /* CEO Image Styles */
        .ceo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          position: relative;
          z-index: 1;
        }
        /* Optional: Add a subtle glow overlay on the image */
        .ceo-image-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 60%, rgba(0, 195, 255, 0.08) 100%);
          pointer-events: none;
          z-index: 2;
        }
        .ceo-silhouette {
          width: 80%;
          height: 80%;
          background: linear-gradient(180deg, #1a3a6a 0%, #0a1a40 100%);
          border-radius: 50% 50% 0 0 / 60% 60% 0 0;
          position: absolute;
          bottom: 0;
        }
        .ceo-frame-deco {
          position: absolute;
          top: -1px;
          right: -1px;
          width: 40%;
          height: 40%;
          border-top: 2px solid var(--blue-neon);
          border-right: 2px solid var(--blue-neon);
          border-radius: 0 24px 0 0;
          z-index: 3;
        }
        .ceo-badge {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: rgba(2, 8, 16, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(10, 111, 255, 0.4);
          border-radius: 12px;
          padding: 14px 18px;
          z-index: 3;
        }
        .ceo-badge-name {
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
        }
        .ceo-badge-title {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--blue-neon);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .ceo-quote {
          font-size: 20px;
          color: var(--white);
          line-height: 1.6;
          font-style: italic;
          margin: 24px 0;
          padding-left: 20px;
          border-left: 3px solid var(--blue-neon);
        }
        .testimonials-section {
          padding: 100px 60px;
        }
        .testi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(10, 111, 255, 0.12);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        @media (max-width: 1024px) {
          .hero-content { padding: 0 28px; max-width: 520px; }
          .services-section { padding: 80px 28px; }
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-section { padding: 60px 40px; margin: 0 28px; }
          .ceo-section { padding: 60px 28px; gap: 40px; }
          .testimonials-section { padding: 60px 28px; }
        }
        @media (max-width: 768px) {
          .hero { height: auto; min-height: 100vh; align-items: flex-start; padding-top: 120px; padding-bottom: 60px; }
          .hero-content { padding: 0 20px; max-width: 100%; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .services-section { padding: 60px 20px; }
          .services-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
          .stats-section { padding: 40px 24px; margin: 0 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .ceo-section { grid-template-columns: 1fr; padding: 60px 20px; gap: 32px; }
          .ceo-image-wrapper { max-width: 320px; margin: 0 auto; }
          .ceo-quote { font-size: 16px; }
          .testimonials-section { padding: 60px 20px; }
          .testi-grid { grid-template-columns: 1fr; gap: 16px; }
        }
        @media (max-width: 480px) {
          .services-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  )
}

export default HomePage