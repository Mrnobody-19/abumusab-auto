import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { vehicleService } from '../services/vehicleService'

const SupabaseTest = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      
      // Test direct query
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
      
      if (error) throw error
      
      console.log('Vehicles from Supabase:', data)
      setVehicles(data || [])
      
      // Test service
      const vehicles2 = await vehicleService.getAllVehicles()
      console.log('Vehicles from service:', vehicles2)
      
    } catch (err) {
      console.error('Connection error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: 20, color: 'white' }}>Testing connection...</div>
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <h2>✅ Supabase Connected!</h2>
      <p>Found {vehicles.length} vehicles in database</p>
      <div style={{ marginTop: 20 }}>
        <h3>Vehicles:</h3>
        <ul>
          {vehicles.map(v => (
            <li key={v.id}>{v.vehicle_id} - {v.name} - {v.tracker_status}</li>
          ))}
        </ul>
      </div>
      <button onClick={testConnection}>Refresh</button>
    </div>
  )
}

export default SupabaseTest