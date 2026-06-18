import React from 'react'
import { motion } from 'framer-motion'

const ServiceCard = ({ icon, title, desc, index }) => {
  return (
    <motion.div
      className="service-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      <div className="sc-icon">{icon}</div>
      <div className="sc-title">{title}</div>
      <div className="sc-desc">{desc}</div>
      <div className="sc-arrow">→</div>
      <style jsx>{`
        .service-card {
          background: rgba(8, 15, 32, 0.9);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue-primary), var(--blue-neon), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .service-card:hover {
          border-color: rgba(10, 111, 255, 0.5);
          box-shadow: 0 20px 60px rgba(10, 111, 255, 0.15);
        }
        .service-card:hover::before {
          opacity: 1;
        }
        .sc-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          margin-bottom: 18px;
          background: rgba(10, 111, 255, 0.12);
          border: 1px solid rgba(10, 111, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .sc-title {
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }
        .sc-desc {
          font-size: 13px;
          color: var(--silver);
          line-height: 1.6;
        }
        .sc-arrow {
          margin-top: 16px;
          color: var(--blue-neon);
          font-size: 18px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .service-card:hover .sc-arrow {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  )
}

export default ServiceCard