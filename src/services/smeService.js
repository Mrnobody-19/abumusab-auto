// src/services/smeService.js

// Use the Vite proxy URL
const SME_API_BASE_URL = '/sme-api';

// ============================================
// BALANCE
// ============================================

/**
 * Check account balance
 * @returns {Promise<Object>} Balance information
 */
export const checkBalance = async () => {
  try {
    const response = await fetch(`${SME_API_BASE_URL}/user/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Balance response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Balance error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('💰 Balance check:', data);
    return data;
  } catch (error) {
    console.error('Error checking balance:', error);
    return { status: 'error', message: error.message, balance: 0 };
  }
};

// ============================================
// DATA PLANS
// ============================================

/**
 * Get all available data plans
 * @returns {Promise<Array>} List of data plans
 */
export const getDataPlans = async () => {
  try {
    const response = await fetch(`${SME_API_BASE_URL}/dataplans/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📡 Data plans fetched:', data.data?.length || 0, 'plans');
    return data;
  } catch (error) {
    console.error('Error fetching data plans:', error);
    throw error;
  }
};

/**
 * Get data plans filtered by network
 */
export const getDataPlansByNetwork = async (network) => {
  try {
    const response = await getDataPlans();
    if (response.status === 'success' && response.data) {
      const filtered = response.data.filter(plan => 
        plan.network?.toLowerCase() === network.toLowerCase()
      );
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error filtering data plans:', error);
    return [];
  }
};

/**
 * Get data plan by ID
 */
export const getDataPlanById = async (planId) => {
  try {
    const response = await getDataPlans();
    if (response.status === 'success' && response.data) {
      const plan = response.data.find(p => p.id === planId);
      return plan || null;
    }
    return null;
  } catch (error) {
    console.error('Error finding data plan:', error);
    return null;
  }
};

// ============================================
// AIRTIME
// ============================================

/**
 * Buy airtime
 * @param {Object} params - Airtime parameters
 * @param {number} params.network - 1=MTN, 2=Airtel, 3=Glo, 4=9mobile
 * @param {string} params.phone - Recipient phone number (11 digits)
 * @param {number} params.amount - Amount to recharge
 * @param {string} params.ref - Unique transaction reference
 * @param {string} params.ported_number - 'true' or 'false' (optional)
 * @returns {Promise<Object>} Transaction result
 */
export const buyAirtime = async ({ network, phone, amount, ref, ported_number = 'false' }) => {
  try {
    if (!network) throw new Error('Network is required');
    if (!phone) throw new Error('Phone number is required');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');
    if (!ref) throw new Error('Transaction reference is required');

    const payload = {
      network: Number(network),
      phone: String(phone),
      amount: Number(amount),
      ref: String(ref),
      ported_number: String(ported_number)
    };

    console.log('📤 Sending airtime request:', payload);

    const response = await fetch(`${SME_API_BASE_URL}/airtime/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Airtime response status:', response.status);

    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error('Airtime error response:', data);
      throw new Error(data?.message || data?.msg || data?.detail || `HTTP error! status: ${response.status}`);
    }

    console.log('📱 Airtime purchase response:', data);
    return data;
  } catch (error) {
    console.error('Error buying airtime:', error);
    throw error;
  }
};

/**
 * Buy airtime for a vehicle's SIM
 */
export const rechargeVehicleAirtime = async (vehicle, amount) => {
  try {
    const network = 1;
    const phone = vehicle.sim_card_number || vehicle.driver_phone;
    
    if (!phone) {
      throw new Error('No phone number found for this vehicle');
    }

    const ref = `AIR_${vehicle.vehicle_id || 'VEH'}_${Date.now()}`;

    return await buyAirtime({
      network,
      phone,
      amount,
      ref
    });
  } catch (error) {
    console.error('Error recharging vehicle airtime:', error);
    throw error;
  }
};

// ============================================
// DATA
// ============================================

/**
 * Buy data
 */
export const buyData = async ({ network, data_plan, phone, ref, ported_number = 'false' }) => {
  try {
    const payload = {
      network,
      data_plan,
      phone,
      ref,
      ported_number
    };

    const response = await fetch(`${SME_API_BASE_URL}/data/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📶 Data purchase:', data);
    return data;
  } catch (error) {
    console.error('Error buying data:', error);
    throw error;
  }
};

/**
 * Buy data for a vehicle's SIM
 */
export const rechargeVehicleData = async (vehicle, planId) => {
  try {
    const network = 1;
    const phone = vehicle.sim_card_number || vehicle.driver_phone;
    
    if (!phone) {
      throw new Error('No phone number found for this vehicle');
    }

    const ref = `DATA_${vehicle.vehicle_id || 'VEH'}_${Date.now()}`;

    return await buyData({
      network,
      data_plan: planId,
      phone,
      ref
    });
  } catch (error) {
    console.error('Error recharging vehicle data:', error);
    throw error;
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk airtime recharge for multiple vehicles
 */
export const bulkRechargeAirtime = async (vehicles, amount) => {
  const results = [];
  const errors = [];

  for (const vehicle of vehicles) {
    try {
      const result = await rechargeVehicleAirtime(vehicle, amount);
      results.push({
        vehicle: vehicle.vehicle_id,
        success: true,
        data: result
      });
    } catch (error) {
      errors.push({
        vehicle: vehicle.vehicle_id,
        success: false,
        error: error.message
      });
    }
  }

  return {
    total: vehicles.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
};

/**
 * Bulk data recharge for multiple vehicles
 */
export const bulkRechargeData = async (vehicles, planId) => {
  const results = [];
  const errors = [];

  for (const vehicle of vehicles) {
    try {
      const result = await rechargeVehicleData(vehicle, planId);
      results.push({
        vehicle: vehicle.vehicle_id,
        success: true,
        data: result
      });
    } catch (error) {
      errors.push({
        vehicle: vehicle.vehicle_id,
        success: false,
        error: error.message
      });
    }
  }

  return {
    total: vehicles.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
};

// ============================================
// TRANSACTION REFERENCE GENERATORS
// ============================================

/**
 * Generate a unique transaction reference
 */
export const generateTransactionRef = (prefix, vehicleId = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const vehiclePart = vehicleId ? `_${vehicleId}` : '';
  return `${prefix}${vehiclePart}_${timestamp}_${random}`;
};

// ============================================
// NETWORK HELPERS
// ============================================

export const NETWORKS = {
  MTN: 1,
  AIRTEL: 2,
  GLO: 3,
  NINEMOBILE: 4
};

export const getNetworkName = (networkId) => {
  const networkMap = {
    1: 'MTN',
    2: 'Airtel',
    3: 'Glo',
    4: '9mobile'
  };
  return networkMap[networkId] || 'Unknown';
};

export const getNetworkId = (networkName) => {
  const networkMap = {
    'mtn': 1,
    'airtel': 2,
    'glo': 3,
    '9mobile': 4
  };
  return networkMap[networkName.toLowerCase()] || 1;
};

// Create the service object
const smeService = {
  checkBalance,
  getDataPlans,
  getDataPlansByNetwork,
  getDataPlanById,
  buyAirtime,
  rechargeVehicleAirtime,
  buyData,
  rechargeVehicleData,
  bulkRechargeAirtime,
  bulkRechargeData,
  generateTransactionRef,
  NETWORKS,
  getNetworkName,
  getNetworkId
};

export default smeService;