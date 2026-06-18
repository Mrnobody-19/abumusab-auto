// supabase/functions/location-websocket/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req: Request) => {
  // Upgrade to WebSocket
  const upgrade = req.headers.get('upgrade') || ''
  
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('WebSocket only', { status: 426 })
  }
  
  const { socket, response } = Deno.upgradeWebSocket(req)
  
  // Set up Supabase real-time subscription for this client
  const channel = supabase.channel('locations')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'vehicles' },
      (payload) => {
        socket.send(JSON.stringify({
          type: 'location_update',
          data: payload.new
        }))
      }
    )
    .subscribe()
  
  // Handle incoming messages
  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)
    
    switch (data.type) {
      case 'get_locations':
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .not('latitude', 'is', null)
        
        socket.send(JSON.stringify({
          type: 'locations',
          data: vehicles
        }))
        break
        
      case 'command':
        // Forward command to SMS gateway
        socket.send(JSON.stringify({
          type: 'command_sent',
          command: data.command,
          vehicleId: data.vehicleId
        }))
        break
    }
  }
  
  socket.onclose = () => {
    channel.unsubscribe()
  }
  
  return response
})