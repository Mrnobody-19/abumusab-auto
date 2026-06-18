import { supabase } from '../lib/supabase'

export const vtuService = {
  // VTU.ng API endpoints
  BASE_URL: 'https://api.vtu.ng/v1',
  
  // Get VTU.ng balance
  async getBalance() {
    try {
      const response = await fetch(`${this.BASE_URL}/balance`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VTU_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting VTU balance:', error)
      return { success: false, message: error.message }
    }
  },

  // Send airtime to a phone number
  async sendAirtime(phoneNumber, amount, network = 'mtn') {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      const response = await fetch(`${this.BASE_URL}/airtime`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VTU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: amount,
          network: network
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error sending airtime:', error)
      return { success: false, message: error.message }
    }
  },

  // Send bulk airtime to multiple numbers
  async sendBulkAirtime(phoneNumbers, amount, network = 'mtn') {
    try {
      const formattedNumbers = phoneNumbers.map(p => this.formatPhoneNumber(p))
      
      const response = await fetch(`${this.BASE_URL}/airtime/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VTU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phones: formattedNumbers,
          amount: amount,
          network: network
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error sending bulk airtime:', error)
      return { success: false, message: error.message }
    }
  },

  // Format phone number for VTU.ng
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
    }
    return cleaned
  },

  // Detect network from phone number
  detectNetwork(phone) {
    const prefix = phone.replace(/\D/g, '').substring(0, 4)
    if (['0803', '0806', '0810', '0813', '0814', '0816', '0703', '0706'].includes(prefix)) {
      return 'mtn'
    } else if (['0805', '0807', '0811', '0815', '0905'].includes(prefix)) {
      return 'glo'
    } else if (['0802', '0808', '0812', '0901', '0902', '0907', '0701'].includes(prefix)) {
      return 'airtel'
    } else if (['0809', '0817', '0818', '0909'].includes(prefix)) {
      return '9mobile'
    }
    return 'mtn'
  },

  // Process recharge via VTU.ng
  async processRecharge(vehicle, plan, onComplete) {
    try {
      const network = this.detectNetwork(vehicle.sim_card_number)
      const amount = plan.price
      
      // Send airtime via VTU.ng
      const result = await this.sendAirtime(
        vehicle.sim_card_number,
        amount,
        network
      )
      
      if (result.success || result.status === 'success') {
        // Calculate new expiry date
        const currentExpiry = vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry) : new Date()
        const newExpiry = new Date(currentExpiry)
        newExpiry.setDate(newExpiry.getDate() + plan.days)
        
        // Update vehicle in database
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({
            tracker_status: 'active',
            tracker_expiry: newExpiry.toISOString().split('T')[0],
            tracker_plan: plan.name,
            last_airtime_recharge: new Date().toISOString().split('T')[0],
            airtime_balance: (vehicle.airtime_balance || 0) + plan.price,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicle.id)
        
        if (updateError) throw updateError
        
        // Record recharge history
        const { error: historyError } = await supabase
          .from('recharge_history')
          .insert({
            vehicle_id: vehicle.id,
            amount: plan.price,
            plan_id: plan.id,
            plan_name: plan.name,
            duration_days: plan.days,
            payment_method: 'vtu',
            transaction_ref: result.transaction_ref || `VTU-${Date.now()}`,
            status: 'completed',
            processed_at: new Date().toISOString(),
            metadata: { 
              type: 'airtime', 
              phone: vehicle.sim_card_number,
              network: network,
              provider: 'vtu.ng'
            }
          })
        
        if (historyError) throw historyError
        
        onComplete({
          success: true,
          message: `✅ ₦${amount} airtime sent to ${vehicle.sim_card_number}! Tracker active for ${plan.days} days.`,
          newExpiry: newExpiry.toISOString().split('T')[0],
          transaction_ref: result.transaction_ref
        })
      } else {
        onComplete({
          success: false,
          message: result.message || 'Airtime delivery failed. Please check VTU.ng balance.'
        })
      }
    } catch (error) {
      console.error('VTU recharge error:', error)
      onComplete({
        success: false,
        message: 'Failed to process recharge. Please try again.'
      })
    }
  },

  // Process bulk recharge via VTU.ng
  async processBulkRecharge(vehicles, plan, onComplete) {
    try {
      const network = this.detectNetwork(vehicles[0].sim_card_number)
      const amount = plan.price
      const phoneNumbers = vehicles.map(v => v.sim_card_number)
      
      // Send bulk airtime
      const result = await this.sendBulkAirtime(
        phoneNumbers,
        amount,
        network
      )
      
      if (result.success || result.status === 'success') {
        // Update all vehicles
        for (const vehicle of vehicles) {
          const currentExpiry = vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry) : new Date()
          const newExpiry = new Date(currentExpiry)
          newExpiry.setDate(newExpiry.getDate() + plan.days)
          
          await supabase
            .from('vehicles')
            .update({
              tracker_status: 'active',
              tracker_expiry: newExpiry.toISOString().split('T')[0],
              tracker_plan: plan.name,
              last_airtime_recharge: new Date().toISOString().split('T')[0],
              airtime_balance: (vehicle.airtime_balance || 0) + plan.price,
              updated_at: new Date().toISOString()
            })
            .eq('id', vehicle.id)
          
          await supabase
            .from('recharge_history')
            .insert({
              vehicle_id: vehicle.id,
              amount: plan.price,
              plan_id: plan.id,
              plan_name: plan.name,
              duration_days: plan.days,
              payment_method: 'vtu',
              transaction_ref: result.transaction_ref || `VTU-BULK-${Date.now()}`,
              status: 'completed',
              processed_at: new Date().toISOString(),
              metadata: { 
                type: 'airtime', 
                phone: vehicle.sim_card_number,
                network: network,
                provider: 'vtu.ng',
                bulk: true
              }
            })
        }
        
        onComplete({
          success: true,
          message: `✅ Bulk recharge successful! ₦${amount} airtime sent to ${vehicles.length} trackers.`,
          count: vehicles.length,
          transaction_ref: result.transaction_ref
        })
      } else {
        onComplete({
          success: false,
          message: result.message || 'Bulk airtime delivery failed. Please check VTU.ng balance.'
        })
      }
    } catch (error) {
      console.error('VTU bulk recharge error:', error)
      onComplete({
        success: false,
        message: 'Failed to process bulk recharge. Please try again.'
      })
    }
  },

  // Get VTU.ng transaction status
  async getTransactionStatus(transactionRef) {
    try {
      const response = await fetch(`${this.BASE_URL}/transaction/${transactionRef}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VTU_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting transaction status:', error)
      return { success: false, message: error.message }
    }
  }
}