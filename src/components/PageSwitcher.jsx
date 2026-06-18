import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PageSwitcher = ({ currentPage }) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const pages = [
    { id: 'home', label: '01 · Homepage', path: '/' },
    { id: 'services', label: '02 · Services', path: '/services' },
    { id: 'dashboard', label: '03 · Executive Dashboard', path: '/dashboard', protected: true },
    { id: 'portal', label: '04 · Customer Portal', path: '/portal' },
    { id: 'gallery', label: '05 · Gallery', path: '/gallery' }
  ]

  const handleClick = (page) => {
    if (page.protected && !user) {
      navigate('/login')
    } else {
      navigate(page.path)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="page-switcher">
      <div className="switcher-brand">AMAS UI</div>
      {pages.map(page => (
        <button
          key={page.id}
          className={`pg-btn ${currentPage === page.id ? 'active' : ''}`}
          onClick={() => handleClick(page)}
        >
          {page.label}
        </button>
      ))}
      {user && (
        <>
          <span className="admin-session-badge visible">
            👤 {user.email}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </>
      )}
    </nav>
  )
}

export default PageSwitcher