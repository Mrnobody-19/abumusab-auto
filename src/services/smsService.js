// src/services/smsService.js

import { supabase } from '../lib/supabase';

// Base URL for LibreSMS
const LIBRESMS_BASE_URL = import.meta.env.VITE_LIBRESMS_URL || 'http://100.73.126.207:8686';
const LIBRESMS_STATUS_URL = 'http://100.73.126.207:8687/status';

let pollingInterval = null;
let messageListeners = [];
let processedMessageIds = new Set();

/**
 * Convert coordinates to address using OpenStreetMap Nominatim
 * @param {number} latitude - The latitude
 * @param {number} longitude - The longitude
 * @returns {Promise<Object>} Address components
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
      {
        headers: {
          'User-Agent': 'FleetTracker/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      
      const result = {
        full_address: data.display_name || '',
        road: address.road || address.street || '',
        neighbourhood: address.neighbourhood || address.suburb || address.district || '',
        town: address.town || address.city || address.village || address.municipality || '',
        state: address.state || address.region || address.province || '',
        country: address.country || '',
        postcode: address.postcode || '',
        latitude: latitude,
        longitude: longitude
      };
      
      if (!result.road && address.hamlet) {
        result.road = address.hamlet;
      }
      
      return result;
    }
    
    return {
      full_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      road: '',
      town: '',
      state: '',
      country: '',
      postcode: '',
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return {
      full_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      road: '',
      town: '',
      state: '',
      country: '',
      postcode: '',
      latitude,
      longitude,
      error: error.message
    };
  }
};

/**
 * Format address into a readable string
 * @param {Object} address - The address object from reverseGeocode
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return 'Unknown location';
  
  const parts = [];
  
  if (address.road) parts.push(address.road);
  if (address.neighbourhood && !address.road.includes(address.neighbourhood)) {
    parts.push(address.neighbourhood);
  }
  if (address.town) parts.push(address.town);
  if (address.state) parts.push(address.state);
  if (address.country) parts.push(address.country);
  
  if (address.full_address && parts.length === 0) {
    return address.full_address;
  }
  
  return parts.join(', ') || `${address.latitude?.toFixed(6)}, ${address.longitude?.toFixed(6)}`;
};

/**
 * Get tracker password from Supabase by vehicle ID
 */
export const getTrackerPassword = async (vehicleId) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('tracker_password')
      .eq('id', vehicleId)
      .single();
    
    if (error) {
      console.error('Error fetching tracker password:', error);
      return '123456';
    }
    
    return data?.tracker_password || '123456';
  } catch (error) {
    console.error('Error getting tracker password:', error);
    return '123456';
  }
};

/**
 * Get vehicle details including SIM and password by vehicle ID
 */
export const getVehicleSMSDetails = async (vehicleId) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, vehicle_id, sim_card_number, tracker_password')
      .eq('id', vehicleId)
      .single();
    
    if (error) {
      console.error('Error fetching vehicle SMS details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting vehicle SMS details:', error);
    return null;
  }
};

/**
 * Send an SMS message
 */
export const sendSMS = async (to, message) => {
  try {
    const url = new URL(`${LIBRESMS_BASE_URL}/sendsms`);
    url.searchParams.append('to', to);
    url.searchParams.append('message', message);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

/**
 * Send an MMS message with image
 */
export const sendMMS = async (to, message, imageBase64 = null, imageUrl = null) => {
  try {
    const url = new URL(`${LIBRESMS_BASE_URL}/sendmms`);
    url.searchParams.append('to', to);
    url.searchParams.append('message', message);
    
    if (imageBase64) {
      url.searchParams.append('image', imageBase64);
    }
    
    if (imageUrl) {
      url.searchParams.append('image_url', imageUrl);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending MMS:', error);
    throw error;
  }
};

/**
 * Get all received messages from LibreSMS
 */
export const getMessages = async () => {
  try {
    const response = await fetch(`${LIBRESMS_BASE_URL}/getmessages`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📥 Raw response from LibreSMS:', result);
    
    if (result.Success && result.Data) {
      let messages = [];
      
      if (Array.isArray(result.Data)) {
        messages = result.Data;
      } else if (result.Data && typeof result.Data === 'object') {
        if (result.Data.messages && Array.isArray(result.Data.messages)) {
          messages = result.Data.messages;
        } else if (result.Data.sms && Array.isArray(result.Data.sms)) {
          messages = result.Data.sms;
        } else if (result.Data.items && Array.isArray(result.Data.items)) {
          messages = result.Data.items;
        } else {
          for (const key of Object.keys(result.Data)) {
            if (Array.isArray(result.Data[key])) {
              messages = result.Data[key];
              break;
            }
          }
        }
      }
      
      console.log(`📬 Found ${messages.length} messages`);
      return messages;
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    console.warn('⚠️ Unexpected response format:', result);
    return [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

/**
 * Parse coordinates from SMS message
 */
export const parseCoordinates = (message) => {
  try {
    let body = '';
    
    if (typeof message === 'string') {
      body = message;
    } else if (message && typeof message === 'object') {
      body = message.body || message.message || message.text || message.content || '';
    }
    
    if (!body) return null;
    
    const latMatch = body.match(/lat:([0-9.]+)/i);
    const lonMatch = body.match(/lon:([0-9.]+)/i);
    const speedMatch = body.match(/speed:([0-9.]+)/i);
    
    if (latMatch && lonMatch) {
      const latitude = parseFloat(latMatch[1]);
      const longitude = parseFloat(lonMatch[1]);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return {
          latitude: latitude,
          longitude: longitude,
          speed: speedMatch ? parseFloat(speedMatch[1]) : 0,
          raw: body
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return null;
  }
};

/**
 * Extract phone number from message
 */
export const extractPhoneNumber = (message) => {
  try {
    if (typeof message === 'object') {
      return message.from || message.sender || message.address || message.phone || '';
    }
    return '';
  } catch (error) {
    return '';
  }
};

/**
 * Check for new messages and parse coordinates with reverse geocoding
 */
export const checkForNewMessages = async () => {
  try {
    const messages = await getMessages();
    
    if (!messages || messages.length === 0) {
      return [];
    }
    
    console.log(`📬 Processing ${messages.length} messages for coordinates`);
    
    const locationUpdates = [];
    for (const msg of messages) {
      const msgId = msg.id || msg._id || `${msg.from}-${msg.body}-${msg.timestamp}`;
      
      if (processedMessageIds.has(msgId)) {
        continue;
      }
      
      const coords = parseCoordinates(msg);
      if (coords) {
        const fromNumber = extractPhoneNumber(msg);
        console.log(`📍 Found coordinates in message from ${fromNumber}:`, coords);
        
        processedMessageIds.add(msgId);
        
        // Reverse geocode the coordinates
        try {
          const address = await reverseGeocode(coords.latitude, coords.longitude);
          console.log('📮 Address found:', address);
          
          locationUpdates.push({
            ...coords,
            from: fromNumber,
            message: msg,
            timestamp: msg.timestamp || msg.date || new Date().toISOString(),
            address: address,
            formatted_address: formatAddress(address)
          });
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          locationUpdates.push({
            ...coords,
            from: fromNumber,
            message: msg,
            timestamp: msg.timestamp || msg.date || new Date().toISOString(),
            address: null,
            formatted_address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
          });
        }
      }
    }
    
    if (processedMessageIds.size > 1000) {
      const iterator = processedMessageIds.values();
      for (let i = 0; i < 500; i++) {
        processedMessageIds.delete(iterator.next().value);
      }
    }
    
    if (locationUpdates.length > 0) {
      console.log(`📡 Found ${locationUpdates.length} new location updates with addresses`);
    }
    
    return locationUpdates;
  } catch (error) {
    console.error('Error checking for new messages:', error);
    return [];
  }
};

/**
 * Start polling for new messages
 */
export const startPollingMessages = (callback, interval = 5000) => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  console.log('🔄 Starting message polling (every ' + interval + 'ms)...');
  
  if (callback) {
    messageListeners.push(callback);
  }
  
  setTimeout(async () => {
    const updates = await checkForNewMessages();
    if (updates.length > 0) {
      console.log(`📡 Initial check: ${updates.length} location updates`);
      messageListeners.forEach(listener => listener(updates));
    }
  }, 1000);
  
  pollingInterval = setInterval(async () => {
    try {
      const updates = await checkForNewMessages();
      if (updates.length > 0) {
        console.log(`📡 Polling found ${updates.length} new location updates`);
        messageListeners.forEach(listener => listener(updates));
      }
    } catch (error) {
      console.error('Error in polling:', error);
    }
  }, interval);
  
  return () => {
    stopPollingMessages();
  };
};

/**
 * Stop polling for messages
 */
export const stopPollingMessages = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  messageListeners = [];
  console.log('⏹️ Stopped message polling');
};

/**
 * Add a message listener
 */
export const addMessageListener = (callback) => {
  messageListeners.push(callback);
  return () => {
    messageListeners = messageListeners.filter(cb => cb !== callback);
  };
};

/**
 * Send command with password via SMS
 */
export const sendCommand = async (phoneNumber, command, password = '123456') => {
  try {
    const fullCommand = `${command}${password}`;
    console.log(`📤 Sending command "${command}" to ${phoneNumber} with password`);
    
    const url = new URL(`${LIBRESMS_BASE_URL}/sendsms`);
    url.searchParams.append('to', phoneNumber);
    url.searchParams.append('message', fullCommand);
    
    console.log(`📤 GET ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Command sent successfully:', result);
    
    return {
      success: true,
      data: result,
      command: fullCommand,
      phoneNumber
    };
  } catch (error) {
    console.error('❌ Error sending command:', error);
    return {
      success: false,
      error: error.message || 'Failed to send command'
    };
  }
};

/**
 * Send command to a vehicle using its ID
 */
export const sendCommandToVehicle = async (vehicleId, command) => {
  try {
    const vehicleDetails = await getVehicleSMSDetails(vehicleId);
    
    if (!vehicleDetails) {
      return {
        success: false,
        error: 'Vehicle not found'
      };
    }
    
    if (!vehicleDetails.sim_card_number) {
      return {
        success: false,
        error: 'No SIM card assigned to this vehicle'
      };
    }
    
    const password = vehicleDetails.tracker_password || '123456';
    const phoneNumber = vehicleDetails.sim_card_number;
    const vehicleName = vehicleDetails.vehicle_id;
    
    console.log(`📤 Sending "${command}" to ${vehicleName} (${phoneNumber}) with password: ${password}`);
    
    return await sendCommand(phoneNumber, command, password);
  } catch (error) {
    console.error('❌ Error sending command to vehicle:', error);
    return {
      success: false,
      error: error.message || 'Failed to send command to vehicle'
    };
  }
};

/**
 * Get location for a vehicle using its ID
 */
export const getLocationForVehicle = async (vehicleId) => {
  return sendCommandToVehicle(vehicleId, 'position');
};

/**
 * Stop engine for a vehicle using its ID
 */
export const stopVehicleEngine = async (vehicleId) => {
  return sendCommandToVehicle(vehicleId, 'cutoil');
};

/**
 * Start engine for a vehicle using its ID
 */
export const startVehicleEngine = async (vehicleId) => {
  return sendCommandToVehicle(vehicleId, 'resume');
};

/**
 * Get status for a vehicle using its ID
 */
export const getVehicleStatus = async (vehicleId) => {
  return sendCommandToVehicle(vehicleId, 'status');
};

/**
 * Check server health
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${LIBRESMS_BASE_URL}/health`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Check server status
 */
export const checkStatus = async () => {
  try {
    const response = await fetch(LIBRESMS_STATUS_URL, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
};

// Create the service object with all functions
const smsService = {
  sendSMS,
  sendMMS,
  getMessages,
  checkHealth,
  checkStatus,
  sendCommand,
  sendCommandToVehicle,
  getLocationForVehicle,
  stopVehicleEngine,
  startVehicleEngine,
  getVehicleStatus,
  getTrackerPassword,
  getVehicleSMSDetails,
  parseCoordinates,
  checkForNewMessages,
  startPollingMessages,
  stopPollingMessages,
  addMessageListener,
  extractPhoneNumber,
  reverseGeocode,
  formatAddress,
  BASE_URL: LIBRESMS_BASE_URL
};

export default smsService;