import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setIsLoading(true)
    setError('')
    
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-grid"></div>
      <div className="login-orb-1"></div>
      <div className="login-orb-2"></div>

      <div className="login-card">
        <div className="login-logo-area">
          <div className="login-logo-icon">🔐</div>
          <div className="login-brand-main">ABU MUS'AB</div>
          <div className="login-brand-sub">Automotive Solutions</div>
        </div>

        <h2 className="login-title">Admin Login</h2>
        <p className="login-subtitle">Sign in to access the Executive Dashboard</p>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="login-role-badge">Executive Access Required</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="loginUser">Email Address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">📧</span>
              <input 
                className={`login-input ${error && !email ? 'error' : ''}`}
                id="loginUser"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="loginPass">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔑</span>
              <input 
                className={`login-input ${error && !password ? 'error' : ''}`}
                id="loginPass"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="login-show-pw"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error-msg show">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`}>
            <span className="login-btn-text">Sign In to Dashboard</span>
            <div className="login-btn-spinner"></div>
          </button>
        </form>

        <div className="login-divider"><span>Access Info</span></div>

        <div className="login-hint">
          <strong>Demo Credentials (Create in Supabase Auth)</strong><br />
          Email: <strong>admin@abumusab.com</strong><br />
          Password: <strong>Create your own password in Supabase Auth</strong>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-tech)', 
              fontSize: 12, 
              color: 'var(--text-muted)',
              transition: 'color 0.2s'
            }}
          >
            ← Back to Homepage
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: var(--bg-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .login-bg-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: linear-gradient(rgba(10, 111, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 111, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .login-orb-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10, 111, 255, 0.12), transparent 65%);
          top: -200px;
          right: -100px;
          pointer-events: none;
        }
        .login-orb-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 195, 255, 0.08), transparent 65%);
          bottom: -100px;
          left: -80px;
          pointer-events: none;
        }
        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          margin: 20px;
          background: rgba(6, 14, 30, 0.97);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 48px 44px;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(10, 111, 255, 0.08);
          animation: slideIn 0.4s ease;
        }
        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue-primary), var(--blue-neon), var(--blue-primary), transparent);
          border-radius: 0 0 50% 50%;
        }
        .login-logo-area {
          text-align: center;
          margin-bottom: 36px;
        }
        .login-logo-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, rgba(10, 111, 255, 0.2), rgba(0, 195, 255, 0.1));
          border: 1px solid rgba(10, 111, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 0 40px rgba(10, 111, 255, 0.2);
        }
        .login-brand-main {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.1em;
        }
        .login-brand-sub {
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--blue-neon);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .login-title {
          font-family: var(--font-head);
          font-size: 22px;
          font-weight: 800;
          color: var(--white);
          text-align: center;
          margin-bottom: 6px;
        }
        .login-subtitle {
          font-family: var(--font-tech);
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          letter-spacing: 0.05em;
          margin-bottom: 32px;
        }
        .login-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(10, 111, 255, 0.1);
          border: 1px solid rgba(10, 111, 255, 0.25);
          color: var(--blue-neon);
          font-family: var(--font-tech);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
        }
        .login-role-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--blue-neon);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .login-field {
          margin-bottom: 18px;
        }
        .login-label {
          font-family: var(--font-tech);
          font-size: 11px;
          font-weight: 600;
          color: var(--silver);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          opacity: 0.5;
        }
        .login-input {
          width: 100%;
          background: rgba(8, 20, 50, 0.8);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 13px 14px 13px 44px;
          color: var(--white);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input::placeholder {
          color: var(--text-muted);
        }
        .login-input:focus {
          border-color: rgba(10, 111, 255, 0.6);
          box-shadow: 0 0 0 3px rgba(10, 111, 255, 0.1);
          background: rgba(10, 30, 70, 0.6);
        }
        .login-input.error {
          border-color: rgba(239, 68, 68, 0.6);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
        }
        .login-show-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 16px;
          padding: 4px;
          transition: color 0.2s;
        }
        .login-show-pw:hover {
          color: var(--silver);
        }
        .login-error-msg {
          display: none;
          font-family: var(--font-tech);
          font-size: 11px;
          color: #ef4444;
          margin-top: 6px;
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          align-items: center;
          gap: 8px;
        }
        .login-error-msg.show {
          display: flex;
        }
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #0a6fff, #0055cc);
          border: 1px solid rgba(10, 111, 255, 0.6);
          color: #fff;
          font-family: var(--font-tech);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 15px;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 8px;
          box-shadow: 0 4px 24px rgba(10, 111, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover {
          box-shadow: 0 6px 36px rgba(10, 111, 255, 0.5);
          transform: translateY(-1px);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .login-btn.loading {
          pointer-events: none;
          opacity: 0.8;
        }
        .login-btn-spinner {
          display: none;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .login-btn.loading .login-btn-text {
          opacity: 0;
        }
        .login-btn.loading .login-btn-spinner {
          display: block;
        }
        .login-hint {
          margin-top: 24px;
          padding: 14px 16px;
          background: rgba(10, 111, 255, 0.06);
          border: 1px solid rgba(10, 111, 255, 0.15);
          border-radius: 10px;
          font-family: var(--font-tech);
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.7;
        }
        .login-hint strong {
          color: var(--silver);
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .login-divider span {
          font-family: var(--font-tech);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default LoginPage