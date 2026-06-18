import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const servicesData = [
  {
    id: 1,
    number: '01',
    icon: '⚡',
    title: 'ECU Programming',
    desc: 'Expert electronic control unit reprogramming, tuning, and software updates for all vehicle systems including engine management, transmission and body control modules.',
    features: ['ECM / TCM / BCM Programming', 'Performance remapping & tuning', 'Cloning & virgin module programming', 'Software version updates', 'DTC fault clearing & diagnosis'],
    price: 'Starting from consultation'
  },
  {
    id: 2,
    number: '02',
    icon: '📡',
    title: 'Radar Calibration',
    desc: 'Precision static and dynamic calibration of adaptive cruise control radar, blind spot monitoring, and forward collision warning systems to manufacturer specifications.',
    features: ['ACC Radar static & dynamic calibration', 'Blind spot radar alignment', 'Cross-traffic alert calibration', 'All OEM tools & targets', 'Post-windshield replacement'],
    price: 'From ₦45,000'
  },
  {
    id: 3,
    number: '03',
    icon: '🔑',
    title: 'Key Programming',
    desc: 'Complete automotive key programming solutions including transponder keys, smart keys, proximity fobs, and full lost-key scenarios across all major vehicle manufacturers.',
    features: ['All key lost scenarios', 'Transponder & smart key coding', 'Remote fob programming', 'EEPROM & OBD programming', 'Immobilizer PIN extraction'],
    price: 'From ₦25,000'
  },
  {
    id: 4,
    number: '04',
    icon: '🛰️',
    title: 'Vehicle Tracking',
    desc: 'Professional GPS tracker installation with real-time monitoring, geofencing, speed alerts, route history, and a dedicated web and mobile management portal for individuals and fleets.',
    features: ['Real-time GPS tracking', 'Geofencing & zone alerts', 'Speed & behavior monitoring', 'Mobile & web dashboard', 'Fleet analytics reporting'],
    price: 'Subscriptions from ₦5,000/mo'
  },
  {
    id: 5,
    number: '05',
    icon: '🔬',
    title: 'Advanced Diagnostics',
    desc: 'Comprehensive vehicle health checks using industry-leading diagnostic platforms to pinpoint and resolve complex electrical, mechanical, and software faults with precision.',
    features: ['Multi-system fault code scan', 'Live data stream analysis', 'Oscilloscope diagnostics', 'Network communication testing', 'Printed diagnostic report'],
    price: 'From ₦15,000'
  },
  {
    id: 6,
    number: '06',
    icon: '🔧',
    title: 'Auto Electrical Repairs',
    desc: 'Full vehicle electrical fault diagnosis and repair covering charging systems, wiring harnesses, lighting circuits, CAN bus issues, and all electronic component failures.',
    features: ['Charging & starting systems', 'Wiring harness repair', 'CAN bus fault diagnosis', 'Comfort & body electronics', 'Component testing & replacement'],
    price: 'From ₦20,000'
  }
]

const processSteps = [
  { number: '01', title: 'Book & Consult', desc: 'Contact us or book online. Our team will assess your needs and schedule your appointment.' },
  { number: '02', title: 'Diagnosis', desc: 'Full vehicle scan and inspection using factory-level diagnostic equipment and software.' },
  { number: '03', title: 'Solution Plan', desc: 'We present a detailed report and clear pricing before any work begins. No surprises.' },
  { number: '04', title: 'Precision Work', desc: 'Certified technicians carry out all work using manufacturer-approved procedures and parts.' },
  { number: '05', title: 'Quality Check', desc: 'Post-service verification testing and a final diagnostic report delivered to you.' }
]

const ServicesPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="services-page">
      {/* Navigation */}
      <nav className="site-nav">
        <div className="nav-logo">
          <span className="nav-logo-main">ABU MUS'AB</span>
          <span className="nav-logo-sub">Automotive Solutions</span>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services" style={{ color: 'var(--blue-neon)' }}>Services</Link>
          <Link to="#">Fleet</Link>
          <Link to="#">About</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="#">Contact</Link>
        </div>
        <div className="nav-cta">
          <Link to="#" className="btn-primary" style={{ padding: '9px 20px', fontSize: 12 }}>Book Now</Link>
        </div>
        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/services" style={{ color: 'var(--blue-neon)' }} onClick={() => setMobileMenuOpen(false)}>Services</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Fleet</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>About</Link>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
        <Link to="#" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        <div className="mobile-nav-cta">
          <Link to="#" className="btn-primary" style={{ padding: '11px 20px', fontSize: 13 }}>Book Now</Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="services-hero">
        <div className="tag" style={{ marginBottom: 20 }}>Full-Spectrum Automotive Technology</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 64px)', maxWidth: 700, margin: '0 auto 20px' }}>Our Services</h1>
        <p className="section-sub" style={{ margin: '0 auto' }}>Comprehensive automotive technology services delivered by certified specialists with manufacturer-grade equipment and cutting-edge diagnostic tools.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--white)' }}>50<span style={{ color: 'var(--blue-neon)' }}>+</span></div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Brands Supported</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--white)' }}>24<span style={{ color: 'var(--blue-neon)' }}>hr</span></div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Average Turnaround</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--white)' }}>5yr<span style={{ color: 'var(--blue-neon)' }}>+</span></div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Warranty on Work</div>
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="svc-page-grid">
        {servicesData.map((service, index) => (
          <motion.div
            key={service.id}
            className="svc-big-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
          >
            <div className="svc-card-header">
              <div className="svc-card-num">{service.number}</div>
              <div className="svc-card-icon-area">{service.icon}</div>
              <div className="svc-card-title">{service.title}</div>
              <div className="svc-card-desc">{service.desc}</div>
            </div>
            <div className="svc-card-body">
              <div className="svc-features">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="svc-feature">{feature}</div>
                ))}
              </div>
            </div>
            <div className="svc-card-footer">
              <div className="svc-price">{service.price}</div>
              <Link to="#" className="svc-btn">Enquire →</Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Process Section */}
      <section className="process-section">
        <div style={{ textAlign: 'center' }}>
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-title">Our Service Process</h2>
        </div>
        <div className="process-steps">
          {processSteps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-circle">{step.number}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <div style={{ padding: '0 60px 80px' }}>
        <div className="cta-banner">
          <div className="cta-glow"></div>
          <div className="section-eyebrow">Ready to Book?</div>
          <h2 className="section-title">Get Your Vehicle Serviced Today</h2>
          <p className="section-sub" style={{ margin: '0 auto 32px' }}>Professional service, transparent pricing, and guaranteed results. Serving individuals and fleet clients.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="#" className="btn-primary">Book an Appointment</Link>
            <Link to="#" className="btn-outline">Call Us Now</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .services-page {
          background: var(--bg-deep);
          min-height: 100vh;
        }
        .services-hero {
          padding: 100px 60px 80px;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10, 60, 180, 0.2), transparent);
          text-align: center;
          position: relative;
        }
        .services-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-bright), transparent);
        }
        .svc-page-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 80px 60px;
        }
        .svc-big-card {
          background: rgba(8, 15, 32, 0.95);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.35s;
          position: relative;
        }
        .svc-big-card:hover {
          border-color: rgba(10, 111, 255, 0.6);
          box-shadow: 0 30px 80px rgba(10, 111, 255, 0.15);
        }
        .svc-card-header {
          padding: 28px 28px 20px;
          position: relative;
          background: linear-gradient(135deg, rgba(10, 60, 180, 0.15), transparent);
        }
        .svc-card-icon-area {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: rgba(10, 111, 255, 0.1);
          border: 1px solid rgba(10, 111, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin-bottom: 20px;
        }
        .svc-card-num {
          position: absolute;
          top: 20px;
          right: 24px;
          font-family: var(--font-display);
          font-size: 40px;
          font-weight: 800;
          color: rgba(10, 111, 255, 0.08);
          line-height: 1;
        }
        .svc-card-title {
          font-family: var(--font-head);
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 10px;
        }
        .svc-card-desc {
          font-size: 13px;
          color: var(--silver);
          line-height: 1.65;
        }
        .svc-card-body {
          padding: 0 28px 28px;
        }
        .svc-features {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .svc-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--silver-light);
        }
        .svc-feature::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--blue-neon);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .svc-card-footer {
          border-top: 1px solid var(--border);
          padding: 16px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .svc-price {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
        }
        .svc-btn {
          font-family: var(--font-tech);
          font-size: 12px;
          font-weight: 700;
          color: var(--blue-neon);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .process-section {
          padding: 80px 60px;
        }
        .process-steps {
          display: flex;
          gap: 0;
          margin-top: 56px;
          position: relative;
        }
        .process-steps::before {
          content: '';
          position: absolute;
          top: 35px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-bright), transparent);
        }
        .process-step {
          flex: 1;
          text-align: center;
          padding: 0 20px;
        }
        .step-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 20px;
          background: rgba(8, 15, 32, 0.9);
          border: 1px solid var(--border-bright);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--blue-neon);
          position: relative;
          z-index: 1;
        }
        .step-title {
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }
        .step-desc {
          font-size: 12px;
          color: var(--silver);
          line-height: 1.5;
        }
        .cta-banner {
          background: linear-gradient(135deg, rgba(10, 40, 120, 0.5), rgba(5, 15, 40, 0.8));
          border: 1px solid rgba(10, 111, 255, 0.4);
          border-radius: 24px;
          padding: 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          background: radial-gradient(circle, rgba(10, 111, 255, 0.2), transparent 70%);
        }
        @media (max-width: 1024px) {
          .services-hero { padding: 100px 28px 60px; }
          .svc-page-grid { padding: 60px 28px; gap: 18px; }
          .process-section { padding: 60px 28px; }
        }
        @media (max-width: 768px) {
          .services-hero { padding: 80px 20px 50px; }
          .svc-page-grid { padding: 40px 20px; grid-template-columns: 1fr; }
          .process-steps { flex-direction: column; gap: 24px; }
          .process-steps::before { display: none; }
          .process-step { display: flex; gap: 16px; text-align: left; align-items: flex-start; }
          .step-circle { margin: 0; flex-shrink: 0; width: 48px; height: 48px; font-size: 16px; }
          .cta-banner { padding: 40px 24px; margin: 0 20px; }
          [style*="padding:0 60px 80px"] { padding: 0 20px 60px !important; }
        }
      `}</style>
    </div>
  )
}

export default ServicesPage