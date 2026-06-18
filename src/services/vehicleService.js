import { supabase } from '../lib/supabase'

export const vehicleService = {
  // Get all vehicles
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching vehicles:', error)
      throw error
    }
    return data || []
  },

  // Add new vehicle/tracker
  async addVehicle(vehicleData) {
    // First get the plan details
    const { data: plan } = await supabase
      .from('tracker_plans')
      .select('*')
      .eq('name', vehicleData.tracker_plan)
      .single()
    
    if (!plan) {
      throw new Error('Plan not found')
    }

    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + plan.days)
    
    // Insert vehicle directly (without using RPC function for now)
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        vehicle_id: vehicleData.vehicle_id.toUpperCase(),
        name: vehicleData.name,
        model: vehicleData.model,
        driver_name: vehicleData.driver_name,
        driver_phone: vehicleData.driver_phone,
        sim_card_number: vehicleData.sim_card_number,
        imei_number: vehicleData.imei_number,
        tracker_plan: vehicleData.tracker_plan,
        tracker_status: 'active',
        tracker_expiry: expiryDate.toISOString().split('T')[0],
        status: 'parked',
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('Error adding vehicle:', error)
      throw error
    }
    
    // Record initial recharge
    if (data && data[0]) {
      await supabase
        .from('recharge_history')
        .insert({
          vehicle_id: data[0].id,
          amount: plan.price,
          plan_id: plan.id,
          plan_name: plan.name,
          duration_days: plan.days,
          payment_method: 'initial',
          transaction_ref: `INIT-${vehicleData.vehicle_id}-${Date.now()}`,
          status: 'success',
          processed_at: new Date().toISOString()
        })
    }
    
    return { 
      success: true, 
      message: `Tracker ${vehicleData.vehicle_id} added successfully!`,
      vehicle: data?.[0]
    }
  },

  // Update vehicle
  async updateVehicle(id, updates) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  },

  // Delete vehicle
  async deleteVehicle(id) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Get dashboard stats
  async getDashboardStats() {
    // Get all vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
    
    if (vehiclesError) throw vehiclesError
    
    const totalVehicles = vehicles?.length || 0
    const activeTrackers = vehicles?.filter(v => v.tracker_status === 'active').length || 0
    const expiringSoon = vehicles?.filter(v => v.tracker_status === 'expiring_soon').length || 0
    const expiredTrackers = vehicles?.filter(v => v.tracker_status === 'expired').length || 0
    
    // Get monthly revenue
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)
    
    const { data: history, error: historyError } = await supabase
      .from('recharge_history')
      .select('amount')
      .gte('processed_at', firstDayOfMonth.toISOString())
      .eq('status', 'success')
    
    if (historyError) throw historyError
    
    const monthlyRevenue = history?.reduce((sum, h) => sum + (h.amount || 0), 0) || 0
    
    return {
      total_vehicles: totalVehicles,
      active_trackers: activeTrackers,
      expiring_soon: expiringSoon,
      expired_trackers: expiredTrackers,
      monthly_revenue: monthlyRevenue
    }
  },

  // Get tracker plans
  async getPlans() {
    const { data, error } = await supabase
      .from('tracker_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Get recharge history
  async getRechargeHistory(limit = 50) {
    const { data, error } = await supabase
      .from('recharge_history')
      .select(`
        *,
        vehicles:vehicle_id (vehicle_id, name, model)
      `)
      .order('processed_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Subscribe to real-time updates
  subscribeToVehicles(callback) {
    return supabase
      .channel('vehicles-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          console.log('Real-time update received:', payload)
          callback(payload)
        }
      )
      .subscribe()
  }
}