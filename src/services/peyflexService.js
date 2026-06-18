// src/services/peyflexService.js
import axios from 'axios'

export const peyflexService = {
  // ✅ Use proxy for development
  BASE_URL: import.meta.env.DEV ? '/peyflex-api' : 'https://client.peyflex.com.ng/api',
  
  // Your API key (from .env)
  API_KEY: import.meta.env.VITE_PEYFLEX_API_KEY,
  
  // Check if API is configured
  isConfigured: () => {
    return !!peyflexService.API_KEY
  },

  // Check if in live mode
  isLiveMode: () => {
    return import.meta.env.VITE_IS_LIVE_MODE === 'true' || 
           import.meta.env.NODE_ENV === 'production'
  },

  // ✅ Get wallet balance
  async getBalance() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.BASE_URL}/balance`,
        headers: {
          'Authorization': `Token ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Balance response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting balance:', error)
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || 'Server error',
          status: error.response.status,
          data: error.response.data
        }
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network Error - Please check your internet connection'
        }
      } else {
        return { 
          success: false, 
          message: error.message || 'An error occurred'
        }
      }
    }
  },

  // ✅ Get airtime networks
  async getAirtimeNetworks() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.BASE_URL}/airtime/networks`,
        headers: {
          'Authorization': `Token ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error getting networks:', error)
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || 'Server error',
          status: error.response.status
        }
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network Error - Please check your internet connection'
        }
      } else {
        return { 
          success: false, 
          message: error.message || 'An error occurred'
        }
      }
    }
  },

  // ✅ Send airtime
  async sendAirtime(phoneNumber, amount, network = 'mtn') {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      const response = await axios({
        method: 'POST',
        url: `${this.BASE_URL}/airtime/`,
        headers: {
          'Authorization': `Token ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          phone: formattedPhone,
          amount: amount,
          network: network
        }
      })
      
      console.log('Airtime response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error sending airtime:', error)
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || 'Server error',
          data: error.response.data
        }
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network Error - Please check your internet connection'
        }
      } else {
        return { 
          success: false, 
          message: error.message || 'An error occurred'
        }
      }
    }
  },

  // ✅ Send bulk airtime
  async sendBulkAirtime(recipients, network = 'mtn') {
    try {
      const formattedRecipients = recipients.map(r => ({
        phone: this.formatPhoneNumber(r.phone),
        amount: r.amount
      }))
      
      const response = await axios({
        method: 'POST',
        url: `${this.BASE_URL}/airtime/bulk/`,
        headers: {
          'Authorization': `Token ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          recipients: formattedRecipients,
          network: network
        }
      })
      
      console.log('Bulk airtime response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error sending bulk airtime:', error)
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data?.message || 'Server error'
        }
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network Error - Please check your internet connection'
        }
      } else {
        return { 
          success: false, 
          message: error.message || 'An error occurred'
        }
      }
    }
  },

  // Format phone number
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
    }
    if (cleaned.startsWith('234')) {
      cleaned = cleaned.substring(3)
    }
    return cleaned
  },

  // Detect network from phone number
  detectNetwork(phone) {
    const prefix = phone.replace(/\D/g, '').substring(0, 4)
    const mtnPrefixes = ['0803', '0806', '0810', '0813', '0814', '0816', '0703', '0706']
    const gloPrefixes = ['0805', '0807', '0811', '0815', '0905']
    const airtelPrefixes = ['0802', '0808', '0812', '0901', '0902', '0907', '0701']
    const nineMobilePrefixes = ['0809', '0817', '0818', '0909']
    
    if (mtnPrefixes.includes(prefix)) return 'mtn'
    if (gloPrefixes.includes(prefix)) return 'glo'
    if (airtelPrefixes.includes(prefix)) return 'airtel'
    if (nineMobilePrefixes.includes(prefix)) return '9mobile'
    
    return 'mtn'
  },

  // Process single recharge
  async processAirtimeRecharge(vehicle, plan, userEmail, onComplete) {
    try {
      if (!vehicle || !plan) {
        onComplete({
          success: false,
          message: 'Missing vehicle or plan information'
        })
        return
      }

      if (!vehicle.sim_card_number) {
        onComplete({
          success: false,
          message: 'This tracker does not have a SIM card assigned'
        })
        return
      }

      const network = this.detectNetwork(vehicle.sim_card_number)
      
      const result = await this.sendAirtime(
        vehicle.sim_card_number,
        plan.price,
        network
      )
      
      if (result.status === 'SUCCESS' || result.success) {
        const currentExpiry = vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry) : new Date()
        const newExpiry = new Date(currentExpiry)
        newExpiry.setDate(newExpiry.getDate() + plan.days)
        
        onComplete({
          success: true,
          message: `✅ ₦${plan.price} airtime sent to ${vehicle.sim_card_number}!`,
          newExpiry: newExpiry.toISOString().split('T')[0],
          transaction_ref: result.transaction_ref || result.reference,
          airtime_sent: plan.price,
          network: network
        })
      } else {
        onComplete({
          success: false,
          message: result.message || 'Airtime delivery failed. Please check balance.'
        })
      }
    } catch (error) {
      console.error('Peyflex recharge error:', error)
      onComplete({
        success: false,
        message: 'Failed to process recharge. Please try again.'
      })
    }
  },

  // Process cash recharge (manual)
  async processCashRecharge(vehicle, plan) {
    try {
      return {
        success: true,
        message: `✅ Cash payment recorded for ${vehicle.vehicle_id}`,
        reference: `CASH-${Date.now()}`,
        amount: plan.price,
        days: plan.days
      }
    } catch (error) {
      console.error('Cash recharge error:', error)
      return {
        success: false,
        message: 'Failed to process cash payment'
      }
    }
  },

  // Process bulk recharge
  async processBulkRecharge(vehicles, plan, onComplete) {
    try {
      const network = this.detectNetwork(vehicles[0].sim_card_number)
      const recipients = vehicles.map(v => ({
        phone: v.sim_card_number,
        amount: plan.price
      }))
      
      const result = await this.sendBulkAirtime(recipients, network)
      
      if (result.status === 'SUCCESS' || result.success) {
        onComplete({
          success: true,
          message: `✅ Bulk recharge successful! ${vehicles.length} trackers recharged.`,
          count: vehicles.length,
          transaction_ref: result.transaction_ref || result.reference
        })
      } else {
        onComplete({
          success: false,
          message: result.message || 'Bulk airtime delivery failed.'
        })
      }
    } catch (error) {
      console.error('Peyflex bulk recharge error:', error)
      onComplete({
        success: false,
        message: 'Failed to process bulk recharge. Please try again.'
      })
    }
  }
}