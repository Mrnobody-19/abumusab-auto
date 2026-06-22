// src/components/RechargeModal.jsx

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import smeService from '../services/smeService'

const RechargeModal = ({ isOpen, onClose, onSuccess, vehicle, plans }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [balance, setBalance] = useState(null)
  const [transactionPin, setTransactionPin] = useState('')
  const [showPinInput, setShowPinInput] = useState(false)
  const [result, setResult] = useState(null)
  const [currentStep, setCurrentStep] = useState('select')
  const { user } = useAuth()

  // ✅ CORRECT PLANS STARTING FROM ₦100
  const defaultPlans = [
    { id: 1, name: 'Starter', price: 100, days: 7, sms: 20 },
    { id: 2, name: 'Basic', price: 200, days: 15, sms: 40 },
    { id: 3, name: 'Standard', price: 500, days: 30, sms: 100 },
    { id: 4, name: 'Premium', price: 1000, days: 60, sms: 200 },
    { id: 5, name: 'Enterprise', price: 2000, days: 90, sms: 400 },
    { id: 6, name: 'Ultimate', price: 5000, days: 180, sms: 1000 }
  ]

  const rechargePlans = plans || defaultPlans

  useEffect(() => {
    if (isOpen) {
      fetchBalance()
      setResult(null)
      setSelectedPlan(null)
      setShowPinInput(false)
      setTransactionPin('')
      setCurrentStep('select')
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

  if (!isOpen || !vehicle) return null

  const handleRecharge = async () => {
    if (!selectedPlan) {
      alert('Please select a recharge plan')
      return
    }

    if (!vehicle.sim_card_number) {
      alert('This tracker does not have a SIM card assigned. Please add SIM card number first.')
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
    setResult(null)

    try {
      let rechargeResult

      if (paymentMethod === 'wallet') {
        const ref = smeService.generateTransactionRef('AIR', vehicle.vehicle_id)
        rechargeResult = await smeService.buyAirtime({
          network: 1,
          phone: vehicle.sim_card_number,
          amount: selectedPlan.price,
          ref: ref
        })
      } else {
        rechargeResult = {
          status: 'success',
          message: 'Cash payment recorded. Airtime will be sent manually.',
          cash_payment: true
        }
      }

      setResult(rechargeResult)

      if (rechargeResult.status === 'success' || rechargeResult.status === 'successful') {
        await logRechargeHistory(vehicle, selectedPlan, rechargeResult)
        setCurrentStep('complete')
        
        setTimeout(() => {
          onSuccess(rechargeResult)
          onClose()
        }, 1500)
      } else {
        setResult({
          status: 'error',
          message: rechargeResult.message || 'Recharge failed. Please try again.'
        })
        setCurrentStep('select')
      }
    } catch (error) {
      console.error('Recharge error:', error)
      setResult({
        status: 'error',
        message: error.message || 'An error occurred. Please try again.'
      })
      setCurrentStep('select')
    } finally {
      setLoading(false)
      setShowPinInput(false)
      setTransactionPin('')
    }
  }

  const logRechargeHistory = async (vehicle, plan, result) => {
    try {
      const { supabase } = await import('../lib/supabase')
      await supabase
        .from('recharge_history')
        .insert({
          vehicle_id: vehicle.id,
          plan_name: plan.name,
          amount: plan.price,
          duration_days: plan.days,
          payment_method: paymentMethod,
          transaction_ref: result.transaction_ref || `MANUAL_${Date.now()}`,
          status: 'success',
          processed_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging recharge:', error)
    }
  }

  const getBalanceDisplay = () => {
    if (!balance) return 'Loading...'
    return `₦${(balance.balance || balance.wallet_balance || 0).toLocaleString()}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recharge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔋 Recharge Tracker</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Balance Display */}
          <div className="balance-display">
            <span>💰 Wallet Balance:</span>
            <span className="balance-amount">{getBalanceDisplay()}</span>
          </div>

          {/* Vehicle Info */}
          <div className="vehicle-info">
            <div className="info-row">
              <span className="info-label">🚗 Vehicle:</span>
              <span className="info-value">{vehicle.vehicle_id} - {vehicle.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📱 SIM:</span>
              <span className="info-value sim-number">{vehicle.sim_card_number || 'Not assigned'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📅 Expiry:</span>
              <span className="info-value">{vehicle.tracker_expiry || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📋 Plan:</span>
              <span className="info-value">{vehicle.tracker_plan || 'None'}</span>
            </div>
          </div>

          {/* Airtime Banner */}
          <div className="airtime-banner">
            <div className="banner-icon">📡</div>
            <div className="banner-text">
              <strong>How it works:</strong><br />
              Airtime is sent to the tracker's SIM card. The tracker uses this airtime to send SMS location updates. <strong>Plans start from ₦100</strong>.
            </div>
          </div>

          {/* Payment Methods */}
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
                <div className="method-desc">Instant airtime delivery</div>
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
                <div className="method-desc">Pay at office (manual)</div>
              </div>
            </div>
          </div>

          {/* ✅ Recharge Plans - Starting from ₦100 */}
          <div className="plans-section">
            <label>Select Recharge Plan:</label>
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
                  <div className="plan-sms">{plan.sms || Math.floor(plan.price * 0.2)} SMS</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Plan Summary */}
          {selectedPlan && (
            <div className="plan-summary">
              <div className="summary-title">📋 Summary</div>
              <div className="summary-row">
                <span>Airtime Amount:</span>
                <strong>₦{selectedPlan.price.toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Tracker Active:</span>
                <strong>{selectedPlan.days} days</strong>
              </div>
              <div className="summary-row">
                <span>Estimated SMS:</span>
                <strong>{selectedPlan.sms || Math.floor(selectedPlan.price * 0.2)} messages</strong>
              </div>
              <div className="summary-row">
                <span>SIM Number:</span>
                <strong className="sim-highlight">{vehicle.sim_card_number || 'Not assigned'}</strong>
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

          {/* Result Display */}
          {result && (
            <div className={`result-display ${result.status === 'success' || result.status === 'successful' ? 'success' : 'error'}`}>
              {result.status === 'success' || result.status === 'successful' ? '✅' : '❌'} 
              {result.message || result.status}
              {result.cash_payment && ' - Cash payment recorded'}
            </div>
          )}

          {/* Processing State */}
          {currentStep === 'processing' && (
            <div className="processing-section">
              <div className="processing-icon">⏳</div>
              <h4>Processing Recharge...</h4>
              <p>Sending airtime to {vehicle.vehicle_id}</p>
              <div className="loading-spinner"></div>
            </div>
          )}

          {/* Complete State */}
          {currentStep === 'complete' && (
            <div className="complete-section">
              <div className="complete-icon">✅</div>
              <h4>Recharge Complete!</h4>
              <p>₦{selectedPlan?.price} airtime sent to {vehicle.vehicle_id}</p>
              <p className="complete-sub">The tracker will be active for {selectedPlan?.days} days</p>
            </div>
          )}

          {/* Payment Info */}
          {currentStep === 'select' && paymentMethod === 'wallet' && (
            <div className="wallet-info">
              <div className="info-header">💰 Wallet Payment</div>
              <p>✅ Instant airtime delivery via SME API</p>
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
              <p className="cash-note">After payment, airtime will be sent manually by our team.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {currentStep === 'select' && (
            <>
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button 
                className="btn-recharge" 
                onClick={handleRecharge}
                disabled={loading || !selectedPlan || !vehicle.sim_card_number || (paymentMethod === 'wallet' && showPinInput && transactionPin.length < 4)}
              >
                {loading ? '⏳ Processing...' : `🔋 Recharge • ₦${selectedPlan?.price?.toLocaleString() || 0}`}
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

          .recharge-modal {
            background: rgba(6, 14, 30, 0.98);
            border: 1px solid var(--border);
            border-radius: 20px;
            width: 90%;
            max-width: 580px;
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

          .vehicle-info {
            background: rgba(8, 20, 50, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 16px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
          }

          .info-value {
            color: var(--white);
            font-weight: 500;
          }

          .sim-number {
            color: var(--blue-neon);
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

          .payment-methods {
            margin-bottom: 20px;
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
            padding: 12px 10px;
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
            font-size: 13px;
            font-weight: 700;
            color: var(--white);
          }

          .plan-price {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--blue-neon);
            margin: 2px 0;
          }

          .plan-days {
            font-family: var(--font-tech);
            font-size: 10px;
            color: var(--text-muted);
          }

          .plan-sms {
            font-family: var(--font-tech);
            font-size: 9px;
            color: #22c55e;
            margin-top: 2px;
          }

          .plan-summary {
            background: rgba(0, 195, 255, 0.08);
            border-radius: 12px;
            padding: 12px;
            margin-top: 16px;
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

          .sim-highlight {
            color: var(--blue-neon);
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

          .result-display {
            margin-top: 16px;
            padding: 12px;
            border-radius: 8px;
            font-family: var(--font-tech);
            font-size: 13px;
          }

          .result-display.success {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
          }

          .result-display.error {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
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
            padding: 20px 0;
          }

          .processing-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .processing-section h4 {
            font-family: var(--font-head);
            color: var(--white);
            margin-bottom: 8px;
          }

          .processing-section p {
            font-family: var(--font-tech);
            color: var(--silver);
            margin-bottom: 16px;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto;
            border: 3px solid rgba(10, 111, 255, 0.1);
            border-top-color: #0a6fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .complete-section {
            text-align: center;
            padding: 20px 0;
          }

          .complete-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }

          .complete-section h4 {
            font-family: var(--font-head);
            color: #22c55e;
            margin-bottom: 8px;
          }

          .complete-section p {
            font-family: var(--font-tech);
            color: var(--silver);
          }

          .complete-sub {
            color: #4a5a7a !important;
            font-size: 12px;
            margin-top: 4px;
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
            background: linear-gradient(135deg, #0a6fff, #0055cc);
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
            box-shadow: 0 4px 16px rgba(10, 111, 255, 0.3);
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
            .recharge-modal {
              padding: 16px;
            }
            .plans-grid {
              grid-template-columns: 1fr 1fr 1fr;
            }
            .methods-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default RechargeModal