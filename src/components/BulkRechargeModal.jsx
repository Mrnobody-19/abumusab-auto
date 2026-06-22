// src/components/BulkRechargeModal.jsx

import React, { useState, useEffect } from 'react'
import smeService from '../services/smeService'

const BulkRechargeModal = ({ isOpen, onClose, onSuccess, vehicles, plans }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedVehicles, setSelectedVehicles] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [balance, setBalance] = useState(null)
  const [transactionPin, setTransactionPin] = useState('')
  const [showPinInput, setShowPinInput] = useState(false)
  const [results, setResults] = useState([])
  const [currentStep, setCurrentStep] = useState('select') // 'select' | 'processing' | 'complete'
  const [progress, setProgress] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  useEffect(() => {
    if (isOpen) {
      fetchBalance()
      setResults([])
      setSelectedPlan(null)
      setShowPinInput(false)
      setTransactionPin('')
      setCurrentStep('select')
      setProgress(0)
      setSelectedVehicles([])
      setSelectAll(false)
    }
  }, [isOpen])

  const fetchBalance = async () => {
    try {
      const data = await smeService.checkBalance()
      setBalance(data)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  if (!isOpen || !vehicles || vehicles.length === 0) return null

  // Default plans if none provided - starting from ₦100
  const defaultPlans = [
    { id: 1, name: 'Starter', price: 100, days: 7 },
    { id: 2, name: 'Basic', price: 200, days: 15 },
    { id: 3, name: 'Standard', price: 500, days: 30 },
    { id: 4, name: 'Premium', price: 1000, days: 60 },
    { id: 5, name: 'Enterprise', price: 2000, days: 90 },
    { id: 6, name: 'Ultimate', price: 5000, days: 180 }
  ]

  const rechargePlans = plans || defaultPlans

  const handleSelectAll = () => {
    const eligibleVehicles = vehicles.filter(v => v.sim_card_number)
    if (selectAll) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(eligibleVehicles.map(v => v.id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId)
      } else {
        return [...prev, vehicleId]
      }
    })
  }

  const handleBulkRecharge = async () => {
    if (!selectedPlan) {
      alert('Please select a recharge plan')
      return
    }

    if (selectedVehicles.length === 0) {
      alert('Please select at least one vehicle')
      return
    }

    // Check if all selected vehicles have SIM cards
    const vehiclesWithoutSim = vehicles
      .filter(v => selectedVehicles.includes(v.id) && !v.sim_card_number)
      .map(v => v.vehicle_id)

    if (vehiclesWithoutSim.length > 0) {
      alert(`The following vehicles do not have SIM cards assigned:\n${vehiclesWithoutSim.join('\n')}`)
      return
    }

    if (paymentMethod === 'wallet' && !transactionPin) {
      setShowPinInput(true)
      return
    }

    if (paymentMethod === 'wallet' && transactionPin.length < 4) {
      alert('Please enter a valid 4-digit transaction pin')
      return
    }

    setLoading(true)
    setCurrentStep('processing')
    setResults([])

    try {
      const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id))
      let successful = 0
      let failed = 0
      const resultsArray = []

      for (let i = 0; i < selectedVehiclesData.length; i++) {
        const vehicle = selectedVehiclesData[i]
        setProgress(((i + 1) / selectedVehiclesData.length) * 100)

        try {
          let rechargeResult
          const ref = smeService.generateTransactionRef('BULK', vehicle.vehicle_id)

          if (paymentMethod === 'wallet') {
            rechargeResult = await smeService.buyAirtime({
              network: 1, // Default to MTN
              phone: vehicle.sim_card_number,
              amount: selectedPlan.price,
              ref: ref
            })
          } else {
            // Cash payment - manual processing
            rechargeResult = {
              status: 'success',
              message: 'Cash payment recorded',
              cash_payment: true
            }
          }

          if (rechargeResult.status === 'success' || rechargeResult.status === 'successful') {
            successful++
            resultsArray.push({
              vehicle: vehicle.vehicle_id,
              success: true,
              data: rechargeResult
            })
          } else {
            failed++
            resultsArray.push({
              vehicle: vehicle.vehicle_id,
              success: false,
              error: rechargeResult.message || 'Recharge failed'
            })
          }
        } catch (error) {
          failed++
          resultsArray.push({
            vehicle: vehicle.vehicle_id,
            success: false,
            error: error.message || 'An error occurred'
          })
        }
      }

      setResults(resultsArray)
      setCurrentStep('complete')

      if (successful > 0) {
        onSuccess({
          total: selectedVehiclesData.length,
          successful,
          failed,
          results: resultsArray
        })
      }
    } catch (error) {
      console.error('Bulk recharge error:', error)
      alert('An error occurred during bulk recharge')
    } finally {
      setLoading(false)
      setShowPinInput(false)
      setTransactionPin('')
    }
  }

  const getSmsCapacity = (amount) => {
    const smsPerNaira = 0.2
    return Math.floor(amount * smsPerNaira)
  }

  const getBalanceDisplay = () => {
    if (!balance) return 'Loading...'
    return `₦${(balance.balance || balance.wallet_balance || 0).toLocaleString()}`
  }

  const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id))
  const totalAmount = selectedPlan ? selectedPlan.price * selectedVehiclesData.length : 0
  const totalSMS = selectedPlan ? Math.floor(selectedPlan.price * 0.2 * selectedVehiclesData.length) : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bulk-recharge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 Bulk Airtime Recharge</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Balance Display */}
          <div className="balance-display">
            <span>💰 Wallet Balance:</span>
            <span className="balance-amount">{getBalanceDisplay()}</span>
          </div>

          {/* Summary Info */}
          <div className="summary-info">
            <div className="summary-item">
              <span className="summary-label">Total Vehicles:</span>
              <span className="summary-value">{vehicles.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Selected:</span>
              <span className="summary-value highlight">{selectedVehicles.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Plan:</span>
              <span className="summary-value">{selectedPlan ? selectedPlan.name : 'None'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Cost:</span>
              <span className="summary-value total-cost">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-methods">
            <label>Payment Method:</label>
            <div className="methods-grid">
              <div 
                className={`method-option ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                onClick={() => {
                  setPaymentMethod('wallet')
                  setShowPinInput(false)
                  setTransactionPin('')
                }}
              >
                <div className="method-icon">💰</div>
                <div className="method-name">Wallet</div>
                <div className="method-desc">Instant bulk recharge</div>
              </div>
              <div 
                className={`method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => {
                  setPaymentMethod('cash')
                  setShowPinInput(false)
                  setTransactionPin('')
                }}
              >
                <div className="method-icon">💵</div>
                <div className="method-name">Cash</div>
                <div className="method-desc">Manual processing</div>
              </div>
            </div>
          </div>

          {/* Airtime Info Banner */}
          <div className="airtime-banner">
            <div className="banner-icon">📡</div>
            <div className="banner-text">
              <strong>Bulk Recharge:</strong><br />
              Airtime will be sent to all selected tracker SIM cards simultaneously. Plans start from ₦100.
            </div>
          </div>

          {/* Recharge Plans - Starting from 100 */}
          <div className="plans-section">
            <label>Select Airtime Plan:</label>
            <div className="plans-grid">
              {rechargePlans.map(plan => (
                <div 
                  key={plan.id}
                  className={`plan-option ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-price">₦{plan.price.toLocaleString()}</div>
                  <div className="plan-days">{plan.days} days</div>
                  <div className="plan-sms">~{getSmsCapacity(plan.price)} SMS</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Plan Summary */}
          {selectedPlan && selectedVehicles.length > 0 && (
            <div className="plan-summary">
              <div className="summary-title">📋 Bulk Summary</div>
              <div className="summary-row">
                <span>Vehicles:</span>
                <strong>{selectedVehiclesData.length} selected</strong>
              </div>
              <div className="summary-row">
                <span>Plan:</span>
                <strong>{selectedPlan.name}</strong>
              </div>
              <div className="summary-row">
                <span>Per Vehicle:</span>
                <strong>₦{selectedPlan.price.toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Total Cost:</span>
                <strong className="total-cost">₦{totalAmount.toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Total SMS:</span>
                <strong>~{totalSMS} messages</strong>
              </div>
            </div>
          )}

          {/* Transaction Pin Input */}
          {showPinInput && paymentMethod === 'wallet' && (
            <div className="pin-input-section">
              <label>Enter Transaction Pin</label>
              <input
                type="password"
                maxLength="4"
                pattern="[0-9]{4}"
                placeholder="Enter 4-digit pin"
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="pin-input"
              />
              <div className="pin-hint">Enter your 4-digit transaction pin to confirm</div>
            </div>
          )}

          {/* Processing State */}
          {currentStep === 'processing' && (
            <div className="processing-section">
              <div className="processing-icon">⏳</div>
              <h4>Processing Bulk Recharge...</h4>
              <p>Recharging {selectedVehiclesData.length} vehicles</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-text">{Math.round(progress)}% complete</div>
            </div>
          )}

          {/* Complete State */}
          {currentStep === 'complete' && (
            <div className="complete-section">
              <div className="complete-icon">✅</div>
              <h4>Bulk Recharge Complete!</h4>
              <div className="result-stats">
                <div className="result-stat">
                  <span className="stat-number">{vehicles.length}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="result-stat success">
                  <span className="stat-number">{results.filter(r => r.success).length}</span>
                  <span className="stat-label">✅ Successful</span>
                </div>
                <div className="result-stat failed">
                  <span className="stat-number">{results.filter(r => !r.success).length}</span>
                  <span className="stat-label">❌ Failed</span>
                </div>
              </div>
              <div className="result-details">
                {results.map((result, index) => (
                  <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                    <span className="result-vehicle">{result.vehicle}</span>
                    <span className="result-status">
                      {result.success ? '✅ Success' : `❌ ${result.error}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Selection */}
          {currentStep === 'select' && (
            <div className="vehicles-section">
              <label>Select Vehicles:</label>
              <div className="select-all">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span>Select All (with SIM)</span>
              </div>
              <div className="vehicles-list">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="vehicle-item">
                    <input 
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleSelectVehicle(vehicle.id)}
                      disabled={!vehicle.sim_card_number}
                    />
                    <div className="vehicle-info-mini">
                      <span className="vehicle-name">{vehicle.vehicle_id} - {vehicle.name}</span>
                      <span className={`sim-status ${vehicle.sim_card_number ? 'has-sim' : 'no-sim'}`}>
                        {vehicle.sim_card_number ? `📱 ${vehicle.sim_card_number}` : '❌ No SIM'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {currentStep === 'select' && paymentMethod === 'wallet' && (
            <div className="wallet-info">
              <div className="info-header">💰 Wallet Payment</div>
              <p>✅ Instant bulk airtime delivery via SME API</p>
              <p>✅ Funds will be deducted from your wallet balance</p>
              <p className="wallet-note">💳 Available balance: {getBalanceDisplay()}</p>
            </div>
          )}

          {currentStep === 'select' && paymentMethod === 'cash' && (
            <div className="cash-info">
              <div className="info-header">📍 Office Payment</div>
              <p><strong>Abu Mus'ab Automotive Solutions</strong></p>
              <p>Suite 205, Technology Hub, Abuja</p>
              <p>Monday - Friday: 9am - 6pm</p>
              <p className="cash-note">After payment, bulk airtime will be sent manually.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {currentStep === 'select' && (
            <>
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button 
                className="btn-recharge" 
                onClick={handleBulkRecharge}
                disabled={loading || !selectedPlan || selectedVehicles.length === 0 || (paymentMethod === 'wallet' && showPinInput && transactionPin.length < 4)}
              >
                {loading ? '⏳ Processing...' : `📦 Recharge ${selectedVehicles.length} • ₦${totalAmount.toLocaleString()}`}
              </button>
            </>
          )}
          {currentStep === 'complete' && (
            <button className="btn-done" onClick={onClose}>Done</button>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .bulk-recharge-modal {
            background: rgba(6, 14, 30, 0.98);
            border: 1px solid var(--border);
            border-radius: 20px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .modal-header h3 {
            font-family: var(--font-head);
            font-size: 20px;
            color: var(--white);
            margin: 0;
          }

          .modal-close {
            background: none;
            border: none;
            color: var(--silver);
            font-size: 28px;
            cursor: pointer;
          }

          .modal-body {
            padding: 24px;
          }

          .balance-display {
            background: rgba(10, 111, 255, 0.08);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            font-family: var(--font-tech);
            font-size: 14px;
            color: var(--silver);
          }

          .balance-amount {
            color: #22c55e;
            font-weight: 700;
            font-size: 16px;
          }

          .summary-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
            background: rgba(8, 20, 50, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 16px;
          }

          .summary-item {
            display: flex;
            justify-content: space-between;
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
          }

          .summary-value {
            color: var(--white);
            font-weight: 500;
          }

          .summary-value.highlight {
            color: #7c3aed;
            font-weight: 700;
          }

          .summary-value.total-cost {
            color: #7c3aed;
            font-weight: 700;
          }

          .payment-methods {
            margin-bottom: 16px;
          }

          .payment-methods label {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
            display: block;
            margin-bottom: 12px;
          }

          .methods-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .method-option {
            background: rgba(8, 20, 50, 0.6);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .method-option.selected {
            border-color: var(--blue-neon);
            background: rgba(10, 111, 255, 0.1);
          }

          .method-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }

          .method-name {
            font-family: var(--font-head);
            font-size: 14px;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 4px;
          }

          .method-desc {
            font-family: var(--font-tech);
            font-size: 10px;
            color: var(--text-muted);
          }

          .airtime-banner {
            background: linear-gradient(135deg, rgba(10, 111, 255, 0.15), rgba(0, 195, 255, 0.05));
            border: 1px solid rgba(10, 111, 255, 0.3);
            border-radius: 12px;
            padding: 12px;
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }

          .banner-icon {
            font-size: 32px;
          }

          .banner-text {
            font-family: var(--font-tech);
            font-size: 12px;
            color: var(--silver);
            line-height: 1.5;
          }

          .banner-text strong {
            color: var(--white);
          }

          .plans-section {
            margin-bottom: 16px;
          }

          .plans-section label {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
            display: block;
            margin-bottom: 12px;
          }

          .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
            gap: 10px;
          }

          .plan-option {
            background: rgba(8, 20, 50, 0.6);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 10px 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .plan-option.selected {
            border-color: var(--blue-neon);
            background: rgba(10, 111, 255, 0.1);
          }

          .plan-name {
            font-family: var(--font-head);
            font-size: 12px;
            font-weight: 700;
            color: var(--white);
          }

          .plan-price {
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 700;
            color: var(--blue-neon);
            margin: 2px 0;
          }

          .plan-days {
            font-family: var(--font-tech);
            font-size: 9px;
            color: var(--text-muted);
          }

          .plan-sms {
            font-family: var(--font-tech);
            font-size: 8px;
            color: #22c55e;
            margin-top: 2px;
          }

          .plan-summary {
            background: rgba(124, 58, 237, 0.08);
            border-radius: 12px;
            padding: 12px;
            margin-top: 16px;
            margin-bottom: 16px;
          }

          .summary-title {
            font-family: var(--font-head);
            font-size: 13px;
            color: var(--white);
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid var(--border);
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-family: var(--font-tech);
            font-size: 12px;
            color: var(--silver);
          }

          .summary-row strong {
            color: var(--white);
          }

          .summary-row .total-cost {
            color: #7c3aed;
            font-size: 15px;
          }

          .pin-input-section {
            margin-top: 16px;
            padding: 12px;
            background: rgba(10, 111, 255, 0.08);
            border-radius: 12px;
          }

          .pin-input-section label {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
            display: block;
            margin-bottom: 8px;
          }

          .pin-input {
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(10, 111, 255, 0.2);
            border-radius: 8px;
            background: rgba(8, 20, 50, 0.6);
            color: white;
            font-size: 18px;
            font-family: monospace;
            text-align: center;
            letter-spacing: 8px;
            outline: none;
          }

          .pin-input:focus {
            border-color: var(--blue-neon);
          }

          .pin-hint {
            font-family: var(--font-tech);
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 6px;
          }

          .vehicles-section {
            margin-top: 16px;
          }

          .vehicles-section label {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
            display: block;
            margin-bottom: 8px;
          }

          .select-all {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            border-bottom: 1px solid var(--border);
            margin-bottom: 8px;
          }

          .select-all input {
            width: 16px;
            height: 16px;
            cursor: pointer;
          }

          .select-all span {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--white);
          }

          .vehicles-list {
            max-height: 150px;
            overflow-y: auto;
          }

          .vehicles-list::-webkit-scrollbar {
            width: 4px;
          }

          .vehicles-list::-webkit-scrollbar-thumb {
            background: rgba(10, 111, 255, 0.3);
            border-radius: 4px;
          }

          .vehicle-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 6px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          }

          .vehicle-item input {
            width: 16px;
            height: 16px;
            cursor: pointer;
          }

          .vehicle-item input:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .vehicle-info-mini {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .vehicle-name {
            font-family: var(--font-tech);
            font-size: 12px;
            color: var(--white);
          }

          .sim-status {
            font-family: var(--font-tech);
            font-size: 10px;
            margin-top: 1px;
          }

          .sim-status.has-sim {
            color: #22c55e;
          }

          .sim-status.no-sim {
            color: #ef4444;
          }

          .wallet-info, .cash-info {
            background: rgba(10, 111, 255, 0.08);
            border-radius: 12px;
            padding: 12px;
            margin-top: 16px;
          }

          .info-header {
            font-family: var(--font-head);
            font-size: 13px;
            color: var(--white);
            margin-bottom: 8px;
          }

          .wallet-info p, .cash-info p {
            font-family: var(--font-tech);
            font-size: 11px;
            color: var(--silver);
            margin: 4px 0;
          }

          .wallet-note {
            color: #22c55e !important;
            margin-top: 8px !important;
            font-weight: 600;
          }

          .cash-note {
            color: var(--blue-neon);
            margin-top: 8px !important;
          }

          .processing-section {
            text-align: center;
            padding: 30px 0;
          }

          .processing-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .processing-section h4 {
            font-family: var(--font-head);
            color: var(--white);
            margin-bottom: 8px;
          }

          .processing-section p {
            font-family: var(--font-tech);
            color: var(--silver);
            margin-bottom: 20px;
          }

          .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(10, 111, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #0a6fff, #7c3aed);
            border-radius: 4px;
            transition: width 0.5s ease;
          }

          .progress-text {
            font-family: var(--font-tech);
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 8px;
          }

          .complete-section {
            text-align: center;
            padding: 10px 0;
          }

          .complete-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .complete-section h4 {
            font-family: var(--font-head);
            color: var(--white);
            margin-bottom: 16px;
          }

          .result-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }

          .result-stat {
            text-align: center;
            padding: 12px;
            background: rgba(8, 20, 50, 0.3);
            border-radius: 8px;
          }

          .result-stat .stat-number {
            display: block;
            font-size: 24px;
            font-weight: 700;
            font-family: var(--font-display);
            color: white;
          }

          .result-stat .stat-label {
            font-size: 11px;
            color: var(--text-muted);
            font-family: var(--font-tech);
          }

          .result-stat.success .stat-number {
            color: #22c55e;
          }

          .result-stat.failed .stat-number {
            color: #ef4444;
          }

          .result-details {
            max-height: 120px;
            overflow-y: auto;
            text-align: left;
          }

          .result-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 10px;
            border-radius: 6px;
            font-family: var(--font-tech);
            font-size: 11px;
            margin-bottom: 2px;
          }

          .result-item.success {
            background: rgba(34, 197, 94, 0.05);
            color: #22c55e;
          }

          .result-item.error {
            background: rgba(239, 68, 68, 0.05);
            color: #ef4444;
          }

          .result-vehicle {
            font-weight: 600;
          }

          .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .btn-cancel {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
          }

          .btn-recharge {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            border: none;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
          }

          .btn-recharge:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
          }

          .btn-recharge:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-done {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border: none;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }

          @media (max-width: 480px) {
            .bulk-recharge-modal {
              padding: 16px;
            }
            .plans-grid {
              grid-template-columns: 1fr 1fr 1fr;
            }
            .methods-grid {
              grid-template-columns: 1fr;
            }
            .result-stats {
              grid-template-columns: 1fr 1fr 1fr;
            }
            .summary-info {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default BulkRechargeModal