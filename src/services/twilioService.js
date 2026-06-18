import { supabase } from '../lib/supabase'

export const twilioService = {
  async sendCommandWithPassword(vehicleId, command) {
    try {
      console.log(`Sending command for vehicle ${vehicleId}: ${command}`)
      
      const { data, error } = await supabase.functions.invoke('twilio-sms', {
        method: 'POST',
        body: {
          action: 'send',
          vehicleId: vehicleId,
          command: command
        }
      })
      
      if (error) {
        console.error('Invoke error:', error)
        throw error
      }
      
      console.log('Command result:', data)
      return data
    } catch (error) {
      console.error('Error:', error)
      throw new Error('Failed to send command. Please try again.')
    }
  },
  
  async getLocation(vehicleId) {
    return this.sendCommandWithPassword(vehicleId, 'position')
  },
  
  async stopEngine(vehicleId) {
    return this.sendCommandWithPassword(vehicleId, 'cutoil')
  },
  
  async startEngine(vehicleId) {
    return this.sendCommandWithPassword(vehicleId, 'resume')
  },
  
  async getStatus(vehicleId) {
    return this.sendCommandWithPassword(vehicleId, 'status')
  },
  
  async sendCustomCommand(vehicleId, customCommand) {
    return this.sendCommandWithPassword(vehicleId, customCommand)
  }
}