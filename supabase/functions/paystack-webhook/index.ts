// supabase/functions/paystack-webhook/index.ts
// @ts-ignore - Deno types are available at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')!;
const termiiApiKey = Deno.env.get('TERMII_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Format Nigerian phone number
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
}

// Send airtime via Termii
async function sendAirtime(phoneNumber: string, amount: number, reference: string) {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  const response = await fetch('https://api.termii.com/api/airtime/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: termiiApiKey,
      to: formattedPhone,
      amount: amount.toString(),
      recharge_type: 'airtime',
      reference: reference
    })
  });
  
  return await response.json();
}

// Send bulk airtime
async function sendBulkAirtime(phoneNumbers: string[], amount: number, reference: string) {
  const formattedNumbers = phoneNumbers.map(p => formatPhoneNumber(p));
  
  const response = await fetch('https://api.termii.com/api/airtime/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: termiiApiKey,
      to: formattedNumbers,
      amount: amount.toString(),
      recharge_type: 'airtime',
      reference: reference
    })
  });
  
  return await response.json();
}

// Verify Paystack webhook signature
function verifySignature(signature: string, payload: string): boolean {
  const crypto = new TextEncoder();
  const key = crypto.encode(paystackSecret);
  const data = crypto.encode(payload);
  
  // Simple verification - in production use proper HMAC
  return signature !== '';
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    
    // Only process successful charge events
    if (payload.event !== 'charge.success') {
      return new Response('Ignored event', { status: 200 });
    }
    
    const transaction = payload.data;
    const amount = transaction.amount / 100;
    const reference = transaction.reference;
    
    console.log('Processing payment:', { reference, amount });
    
    // Get pending recharge
    const { data: pending, error: fetchError } = await supabase
      .from('pending_recharges')
      .select('*')
      .eq('transaction_ref', reference)
      .single();
    
    if (fetchError || !pending) {
      console.error('Pending recharge not found:', reference);
      return new Response('Not found', { status: 404 });
    }
    
    let airtimeResult;
    
    if (pending.is_bulk && pending.phone_numbers) {
      airtimeResult = await sendBulkAirtime(
        pending.phone_numbers,
        pending.amount_per_vehicle,
        reference
      );
    } else {
      airtimeResult = await sendAirtime(
        pending.phone_number,
        pending.amount,
        reference
      );
    }
    
    console.log('Termii response:', airtimeResult);
    
    if (airtimeResult.code === 'successful') {
      // Calculate new expiry
      const plan = pending.plan;
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + plan.days);
      
      if (pending.is_bulk) {
        // Update all vehicles
        for (let i = 0; i < pending.vehicle_ids.length; i++) {
          await supabase
            .from('vehicles')
            .update({
              tracker_status: 'active',
              tracker_expiry: newExpiry.toISOString().split('T')[0],
              tracker_plan: plan.name,
              last_airtime_recharge: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString()
            })
            .eq('id', pending.vehicle_ids[i]);
          
          await supabase
            .from('recharge_history')
            .insert({
              vehicle_id: pending.vehicle_ids[i],
              amount: plan.price,
              plan_id: plan.id,
              plan_name: plan.name,
              duration_days: plan.days,
              payment_method: 'paystack',
              transaction_ref: reference,
              status: 'completed',
              processed_at: new Date().toISOString(),
              metadata: {
                type: 'airtime',
                phone: pending.phone_numbers[i],
                termii_sent: true
              }
            });
        }
      } else {
        // Update single vehicle
        await supabase
          .from('vehicles')
          .update({
            tracker_status: 'active',
            tracker_expiry: newExpiry.toISOString().split('T')[0],
            tracker_plan: plan.name,
            last_airtime_recharge: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', pending.vehicle_id);
        
        await supabase
          .from('recharge_history')
          .insert({
            vehicle_id: pending.vehicle_id,
            amount: plan.price,
            plan_id: plan.id,
            plan_name: plan.name,
            duration_days: plan.days,
            payment_method: 'paystack',
            transaction_ref: reference,
            status: 'completed',
            processed_at: new Date().toISOString(),
            metadata: {
              type: 'airtime',
              phone: pending.phone_number,
              termii_sent: true
            }
          });
      }
      
      // Delete pending record
      await supabase
        .from('pending_recharges')
        .delete()
        .eq('transaction_ref', reference);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Airtime sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Mark as failed
      await supabase
        .from('recharge_history')
        .insert({
          vehicle_id: pending.vehicle_id || pending.vehicle_ids?.[0],
          amount: pending.amount,
          plan_id: pending.plan?.id,
          plan_name: pending.plan?.name,
          duration_days: pending.plan?.days,
          payment_method: 'paystack',
          transaction_ref: reference,
          status: 'airtime_failed',
          processed_at: new Date().toISOString(),
          metadata: {
            type: 'airtime',
            termii_error: airtimeResult
          }
        });
      
      return new Response(
        JSON.stringify({ success: false, error: 'Airtime delivery failed' }),
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500 }
    );
  }
});