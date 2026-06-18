// supabase/functions/sms-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Twilio helper (we'll add this)
// For sending SMS to trackers

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!

// Function to send SMS via Twilio
async function sendSMS(to: string, message: string) {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
  
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: message
    })
  })
  
  const data = await response.json()
  return data
}

// Format Nigerian phone number for Twilio
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1)
  }
  if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned
  }
  return `+${cleaned}`
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    // Send command to tracker
    if (action === 'send-command' && req.method === 'POST') {
      const { phoneNumber, command } = await req.json()
      const formattedPhone = formatPhoneNumber(phoneNumber)
      
      const result = await sendSMS(formattedPhone, command)
      
      // Log the command
      await supabase
        .from('command_logs')
        .insert({
          phone_number: phoneNumber,
          command: command,
          status: result.sid ? 'sent' : 'failed',
          twilio_sid: result.sid,
          created_at: new Date().toISOString()
        })
      
      return new Response(
        JSON.stringify({ success: true, sid: result.sid }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Receive incoming SMS from tracker
    if (req.method === 'POST') {
      let from = ''
      let message = ''
      
      const contentType = req.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        const body = await req.json()
        from = body.from || body.phone || body.sender
        message = body.message || body.text || body.content
      } else {
        const formData = await req.formData()
        from = formData.get('From')?.toString() || ''
        message = formData.get('Body')?.toString() || ''
      }
      
      console.log('Received SMS:', { from, message })
      
      // Parse location from SMS
      let latitude = null
      let longitude = null
      let speed = 0
      
      const latMatch = message.match(/LAT:([\d.-]+)/i)
      const lonMatch = message.match(/LON:([\d.-]+)/i)
      const speedMatch = message.match(/SPD:(\d+)/i)
      
      if (latMatch && lonMatch) {
        latitude = parseFloat(latMatch[1])
        longitude = parseFloat(lonMatch[1])
        speed = speedMatch ? parseInt(speedMatch[1]) : 0
      } else {
        const coords = message.split(',')
        if (coords.length >= 2) {
          latitude = parseFloat(coords[0])
          longitude = parseFloat(coords[1])
          speed = coords.length >= 3 ? parseInt(coords[2]) : 0
        }
      }
      
      if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
        // Find vehicle by SIM card number
        const cleanFrom = from.replace('+', '').replace(/^234/, '0')
        
        const { data: vehicle, error: findError } = await supabase
          .from('vehicles')
          .select('id, vehicle_id, name, sim_card_number')
          .eq('sim_card_number', cleanFrom)
          .single()
        
        if (!findError && vehicle) {
          await supabase
            .from('vehicles')
            .update({
              latitude,
              longitude,
              speed,
              status: speed > 5 ? 'moving' : speed > 0 ? 'idle' : 'parked',
              last_update: new Date().toISOString()
            })
            .eq('id', vehicle.id)
          
          await supabase
            .from('location_history')
            .insert({
              vehicle_id: vehicle.id,
              latitude,
              longitude,
              speed,
              recorded_at: new Date().toISOString()
            })
        }
      }
      
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }
    
    return new Response('Not found', { status: 404 })
    
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})