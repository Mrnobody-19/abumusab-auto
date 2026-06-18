import { supabase } from '../lib/supabase'

export const libresmsService = {
  // LibreSMS API configuration
  BASE_URL: import.meta.env.VITE_LIBRESMS_URL || 'http://localhost:8080/api/v1',
  
  // Send SMS via LibreSMS
  async sendSMS(phoneNumber, message) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      const response = await fetch(`${this.BASE_URL}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
          // Optional: Add sender ID if your LibreSMS supports it
          // from: 'TrackerSys'
        })
      })
      
      const data = await response.json()
      console.log('📱 LibreSMS Response:', data)
      return data
    } catch (error) {
      console.error('Error sending SMS via LibreSMS:', error)
      return { success: false, message: error.message }
    }
  },
  
  // Send command to tracker
  async sendCommand(phoneNumber, command, password = '123456') {
    const fullCommand = `${password} ${command}`
    return this.sendSMS(phoneNumber, fullCommand)
  },
  
  // Get location from tracker
  async getLocation(phoneNumber) {
    return this.sendCommand(phoneNumber, 'getgps')
  },
  
  // Stop engine (immobilizer)
  async stopEngine(phoneNumber) {
    return this.sendCommand(phoneNumber, 'cutoil')
  },
  
  // Start engine
  async startEngine(phoneNumber) {
    return this.sendCommand(phoneNumber, 'resume')
  },
  
  // Get tracker status
  async getStatus(phoneNumber) {
    return this.sendCommand(phoneNumber, 'status')
  },
  
  // Set tracking interval
  async setTrackingInterval(phoneNumber, seconds) {
    return this.sendCommand(phoneNumber, `interval,${seconds}`)
  },
  
  // Format phone number for LibreSMS
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '')
    // If it starts with 0, remove it and add 234
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1)
    }
    // If it doesn't start with 234, add it
    if (!cleaned.startsWith('234') && !cleaned.startsWith('+')) {
      cleaned = '234' + cleaned
    }
    return cleaned
  },
  
  // Check LibreSMS connection
  async testConnection() {
    try {
      const response = await fetch(`${this.BASE_URL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      console.log('🔌 LibreSMS Connection:', data)
      return data
    } catch (error) {
      console.error('❌ LibreSMS Connection Error:', error)
      return { success: false, message: error.message }
    }
  }
}