import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PageSwitcher from './components/PageSwitcher'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import LiveTracking from './pages/LiveTracking'
import PortalPage from './pages/PortalPage'
import GalleryPage from './pages/GalleryPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <PageSwitcher />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ExecutiveDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/live-tracking" element={
          <ProtectedRoute>
            <LiveTracking />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App