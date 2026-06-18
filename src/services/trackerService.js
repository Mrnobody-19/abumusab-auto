import { supabase } from '../lib/supabase'
import { paymentService } from './paymentService'

export const trackerService = {
  // Get all plans
  async getPlans() {
    const { data, error } = await supabase
      .from('tracker_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Process recharge with payment
  async processRechargeWithPayment(vehicle, plan, userEmail, onPaymentComplete) {
    const metadata = {
      plan_name: plan.name,
      vehicle_id: vehicle.vehicle_id,
      duration_days: plan.days,
      vehicle_name: vehicle.name
    }
    
    // Initialize Paystack payment
    paymentService.initializePayment(
      userEmail,
      plan.price,
      metadata,
      async (response) => {
        if (response.success) {
          // Verify payment
          const verification = await paymentService.verifyPayment(response.reference)
          
          if (verification.data.status === 'success') {
            // Update vehicle tracker
            const currentExpiry = vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry) : new Date()
            const newExpiry = new Date(currentExpiry)
            newExpiry.setDate(newExpiry.getDate() + plan.days)
            
            const { error: updateError } = await supabase
              .from('vehicles')
              .update({
                tracker_status: 'active',
                tracker_expiry: newExpiry.toISOString().split('T')[0],
                tracker_plan: plan.name,
                updated_at: new Date().toISOString()
              })
              .eq('id', vehicle.id)
            
            if (updateError) throw updateError
            
            // Record payment
            await paymentService.recordPayment(
              vehicle.id,
              plan.price,
              plan.id,
              plan.name,
              plan.days,
              response.reference,
              'paystack'
            )
            
            onPaymentComplete({
              success: true,
              message: `Successfully recharged ${vehicle.vehicle_id} with ${plan.name} plan!`,
              newExpiry: newExpiry.toISOString().split('T')[0],
              transactionRef: response.reference
            })
          } else {
            onPaymentComplete({
              success: false,
              message: 'Payment verification failed'
            })
          }
        } else {
          onPaymentComplete({
            success: false,
            message: response.message || 'Payment failed'
          })
        }
      }
    )
  },

  // Process cash payment (offline)
  async processCashRecharge(vehicleId, planId, amount, planName, durationDays) {
    const transactionRef = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`
    
    // Get current vehicle
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('tracker_expiry')
      .eq('id', vehicleId)
      .single()
    
    // Calculate new expiry
    const currentExpiry = vehicle.tracker_expiry ? new Date(vehicle.tracker_expiry) : new Date()
    const newExpiry = new Date(currentExpiry)
    newExpiry.setDate(newExpiry.getDate() + durationDays)
    
    // Update vehicle
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        tracker_status: 'active',
        tracker_expiry: newExpiry.toISOString().split('T')[0],
        tracker_plan: planName,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
    
    if (updateError) throw updateError
    
    // Record payment
    await paymentService.recordPayment(
      vehicleId,
      amount,
      planId,
      planName,
      durationDays,
      transactionRef,
      'cash'
    )
    
    return {
      success: true,
      message: `Successfully recharged with ${planName} plan (Cash)`,
      newExpiry: newExpiry.toISOString().split('T')[0],
      transactionRef
    }
  },

  // Get recharge history
  async getRechargeHistory(limit = 50) {
    return await paymentService.getPaymentHistory(null, limit)
  },

  // Get payment summary
  async getPaymentSummary() {
    return await paymentService.getPaymentSummary()
  }
}