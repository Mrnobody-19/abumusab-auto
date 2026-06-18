// supabase/functions/twilio-sms/index.ts - Termii Version (FIXED ERROR HANDLING)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Termii API Key
const TERMII_API_KEY = 'TLVYodjDQCrLPHKlRcnCgiNuwVVYstaKPCSCOmABJdqEfgqFPFfUzoOooijxJf'
const isTermiiConfigured = TERMII_API_KEY && TERMII_API_KEY.startsWith('TL')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info, Accept, Accept-Language, Accept-Encoding',
  'Access-Control-Max-Age': '86400',
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1)
  } else if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned
  }
  return cleaned
}

// Send SMS via Termii - WITHOUT Sender ID
async function sendSMS(to: string, message: string) {
  const formattedTo = formatPhoneNumber(to)
  console.log(`[Termii] To: ${formattedTo}, Message: ${message}`)

  if (!isTermiiConfigured) {
    console.log('⚠️ Termii not configured - simulating SMS')
    return { 
      success: true, 
      simulated: true,
      message: 'SMS simulated (Termii not configured)',
      status: 'simulated',
      data: null
    }
  }

  try {
    const payload = {
      api_key: TERMII_API_KEY,
      to: formattedTo,
      sms: message,
      type: 'plain',
      channel: 'generic'
    }

    console.log('[Termii] Payload:', JSON.stringify(payload))

    const response = await fetch('https://api.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('[Termii] Full Response:', JSON.stringify(data, null, 2))

    // Check if the response is successful
    if (response.ok && (data.code === 'success' || data.status === 'success' || data.message_id)) {
      return {
        success: true,
        status: 'sent',
        message_id: data.message_id || null,
        data: data,
        simulated: false,
        message: 'SMS sent successfully'
      }
    }

    // If we got here, something went wrong
    const errorMessage = data.message || data.error || data.status || JSON.stringify(data)
    console.error('[Termii] Error response:', errorMessage)
    
    return {
      success: false,
      status: 'error',
      message: errorMessage,
      data: data,
      simulated: false
    }

  } catch (error) {
    console.error('[Termii] Exception:', error.message)
    return {
      success: false,
      status: 'error',
      message: error.message || 'Failed to send SMS',
      data: null,
      simulated: false
    }
  }
}

// Get vehicle info from database
async function getVehicleInfo(vehicleId: number) {
  console.log(`🔍 Looking for vehicle with ID: ${vehicleId}`)
  
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, vehicle_id, tracker_password, sim_card_number, name')
    .eq('id', vehicleId)
    .maybeSingle()
  
  if (error) {
    console.error('❌ Database error:', error)
    return null
  }
  
  console.log('✅ Vehicle found:', data)
  return data
}

Deno.serve(async (req: Request) => {
  // OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // GET request - test endpoint
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Termii SMS function is running',
          termii_configured: isTermiiConfigured,
          api_key_present: !!TERMII_API_KEY
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // POST request
    if (req.method === 'POST') {
      const body = await req.json()
      const { action, phoneNumber, command, vehicleId } = body
      
      console.log('📨 Request received:', { action, phoneNumber, command, vehicleId })

      if (action === 'test') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Test successful - Termii Edge Function is working',
            termii_configured: isTermiiConfigured
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (action === 'send') {
        let finalPhoneNumber = phoneNumber
        let finalCommand = command

        // If vehicleId is provided, get info from database
        if (vehicleId) {
          const vehicle = await getVehicleInfo(vehicleId)
          if (vehicle) {
            finalPhoneNumber = vehicle.sim_card_number
            finalCommand = `${vehicle.tracker_password || '123456'} ${command}`
            console.log(`📱 Using vehicle ${vehicle.vehicle_id}: ${finalPhoneNumber}`)
          } else {
            return new Response(
              JSON.stringify({ error: `Vehicle with ID ${vehicleId} not found` }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        }

        if (!finalPhoneNumber || !finalCommand) {
          return new Response(
            JSON.stringify({ error: 'Missing phoneNumber or command' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Send the SMS via Termii
        const result = await sendSMS(finalPhoneNumber, finalCommand)

        // Log the command
        try {
          await supabase
            .from('command_logs')
            .insert({
              phone_number: finalPhoneNumber,
              command: finalCommand,
              status: result.status || (result.success ? 'sent' : 'failed'),
              provider: 'termii',
              message_id: result.message_id || null,
              created_at: new Date().toISOString()
            })
        } catch (logError) {
          console.error('Log error:', logError)
        }

        // Return response
        return new Response(
          JSON.stringify({ 
            success: result.success,
            message: result.message || (result.success ? 'Command sent successfully via Termii' : 'Failed to send SMS'),
            simulated: result.simulated || false,
            formatted_number: formatPhoneNumber(finalPhoneNumber),
            vehicle_id: vehicleId || null,
            termii_response: result.data || null,
            status: result.status
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})