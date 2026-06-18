import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ value, suffix, label }) => {
  return (
    <motion.div
      className="stat-item"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="stat-num">{value}<span>{suffix}</span></div>
      <div className="stat-divider"></div>
      <div className="stat-label">{label}</div>
      <style jsx>{`
        .stat-item {
          text-align: center;
        }
        .stat-num {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 800;
          color: var(--white);
        }
        .stat-num span {
          color: var(--blue-neon);
        }
        .stat-divider {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, var(--blue-primary), var(--blue-neon));
          margin: 10px auto 0;
        }
        .stat-label {
          font-family: var(--font-tech);
          font-size: 13px;
          color: var(--silver);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 6px;
        }
        @media (max-width: 768px) {
          .stat-num {
            font-size: 32px;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default StatCard