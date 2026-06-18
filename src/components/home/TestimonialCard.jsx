import React from 'react'
import { motion } from 'framer-motion'

const TestimonialCard = ({ stars, text, author, role, initial }) => {
  return (
    <motion.div
      className="testi-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      <div className="testi-stars">{'★'.repeat(stars)}</div>
      <p className="testi-text">{text}</p>
      <div className="testi-author">
        <div className="testi-avatar">{initial}</div>
        <div>
          <div className="testi-name">{author}</div>
          <div className="testi-role">{role}</div>
        </div>
      </div>
      <style jsx>{`
        .testi-card {
          background: rgba(8, 15, 32, 0.8);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          transition: all 0.3s;
        }
        .testi-card:hover {
          border-color: rgba(10, 111, 255, 0.3);
        }
        .testi-stars {
          color: #f59e0b;
          font-size: 14px;
          margin-bottom: 14px;
        }
        .testi-text {
          font-size: 14px;
          color: var(--silver-light);
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .testi-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .testi-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-primary), var(--blue-neon));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
        }
        .testi-name {
          font-family: var(--font-tech);
          font-size: 13px;
          font-weight: 600;
          color: var(--white);
        }
        .testi-role {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </motion.div>
  )
}

export default TestimonialCard