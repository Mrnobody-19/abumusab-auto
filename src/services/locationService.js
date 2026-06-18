import { supabase } from '../lib/supabase'

export const locationService = {
  // Update vehicle location (called from SMS webhook or API)
  async updateLocation(vehicleId, latitude, longitude, speed, heading) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        latitude,
        longitude,
        speed,
        heading,
        status: speed > 5 ? 'moving' : speed > 0 ? 'idle' : 'parked',
        last_update: new Date().toISOString()
      })
      .eq('id', vehicleId)
      .select()
    
    if (error) throw error
    
    // Record location history
    await supabase
      .from('location_history')
      .insert({
        vehicle_id: vehicleId,
        latitude,
        longitude,
        speed,
        heading,
        recorded_at: new Date().toISOString()
      })
    
    return data
  },
  
  // Get location history for a vehicle
  async getLocationHistory(vehicleId, hours = 24) {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    
    const { data, error } = await supabase
      .from('location_history')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .gte('recorded_at', cutoff.toISOString())
      .order('recorded_at', { ascending: true })
    
    if (error) throw error
    return data
  },
  
  // Get all vehicles with recent locations
  async getActiveVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .not('latitude', 'is', null)
      .gte('last_update', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (error) throw error
    return data
  },
  
  // Subscribe to real-time location updates
  subscribeToLocations(callback) {
    return supabase
      .channel('locations-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vehicles', filter: 'latitude=not.is.null' },
        (payload) => callback(payload.new)
      )
      .subscribe()
  }
}