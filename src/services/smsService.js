import { supabase } from '../lib/supabase'

export const smsService = {
  // Send command to tracker via SMS (using Termii)
  async sendCommand(phoneNumber, command) {
    const isLive = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.startsWith('pk_live_')
    
    // In test mode, simulate
    if (!isLive) {
      console.log(`[TEST] SMS to ${phoneNumber}: ${command}`)
      return { success: true, message: 'Command sent (test mode)' }
    }
    
    // Real SMS via Termii
    try {
      const response = await fetch('https://api.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': import.meta.env.VITE_TERMII_API_KEY
        },
        body: JSON.stringify({
          to: phoneNumber,
          from: 'TrackerSys',
          sms: command,
          type: 'plain',
          channel: 'generic'
        })
      })
      
      const data = await response.json()
      return { success: data.code === 'success', data }
    } catch (error) {
      console.error('SMS error:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Command to get GPS location
  async requestLocation(phoneNumber) {
    return this.sendCommand(phoneNumber, 'LOCATION')
  },
  
  // Command to stop engine (immobilizer)
  async stopEngine(phoneNumber) {
    return this.sendCommand(phoneNumber, 'STOP ENGINE')
  },
  
  // Command to start engine
  async startEngine(phoneNumber) {
    return this.sendCommand(phoneNumber, 'START ENGINE')
  },
  
  // Set geofence
  async setGeofence(phoneNumber, latitude, longitude, radius) {
    return this.sendCommand(phoneNumber, `GEOFENCE ${latitude},${longitude},${radius}`)
  },
  
  // Set tracking interval (seconds)
  async setTrackingInterval(phoneNumber, seconds) {
    return this.sendCommand(phoneNumber, `INTERVAL ${seconds}`)
  }
}