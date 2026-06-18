import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { peyflexService as paymentService } from '../services/peyflexService'

const RechargeModal = ({ isOpen, onClose, onSuccess, vehicle, plans }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('paystack')
  const { user } = useAuth()

  const isLiveMode = paymentService.isLiveMode()

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

    setLoading(true)

    try {
      if (paymentMethod === 'paystack') {
        await paymentService.processAirtimeRecharge(
          vehicle,
          selectedPlan,
          user.email,
          (result) => {
            setLoading(false)
            if (result.success) {
              onSuccess(result)
              onClose()
            } else {
              alert(result.message)
            }
          }
        )
      } else {
        const result = await paymentService.processCashRecharge(vehicle, selectedPlan)
        setLoading(false)
        if (result.success) {
          onSuccess(result)
          onClose()
        } else {
          alert(result.message)
        }
      }
    } catch (error) {
      console.error('Recharge error:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const getSmsCapacity = (amount) => {
    const smsPerNaira = 0.2
    return Math.floor(amount * smsPerNaira)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recharge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📱 Airtime Recharge - GPS Tracker</h3>
          <div className={`mode-badge ${isLiveMode ? 'live' : 'test'}`}>
            {isLiveMode ? '🔴 LIVE' : '🟡 TEST'}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info">
            <p><strong>Vehicle:</strong> {vehicle.vehicle_id} - {vehicle.name}</p>
            <p><strong>SIM Card Number:</strong> 
              <span className="sim-number">{vehicle.sim_card_number || 'Not assigned'}</span>
            </p>
            <p><strong>Current Expiry:</strong> {vehicle.tracker_expiry || 'Not set'}</p>
            <p><strong>Current Plan:</strong> {vehicle.tracker_plan || 'None'}</p>
            {vehicle.airtime_balance > 0 && (
              <p><strong>Airtime Balance:</strong> ₦{vehicle.airtime_balance}</p>
            )}
          </div>

          <div className="airtime-banner">
            <div className="banner-icon">📡</div>
            <div className="banner-text">
              <strong>How it works:</strong><br />
              Airtime is sent to the tracker's SIM card. The tracker uses this airtime to send SMS location updates and respond to commands.
            </div>
          </div>

          <div className="payment-methods">
            <label>Payment Method:</label>
            <div className="methods-grid">
              <div 
                className={`method-option ${paymentMethod === 'paystack' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('paystack')}
              >
                <div className="method-icon">💳</div>
                <div className="method-name">Card / Bank</div>
                <div className="method-desc">Instant airtime delivery</div>
              </div>
              <div 
                className={`method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="method-icon">💵</div>
                <div className="method-name">Cash</div>
                <div className="method-desc">Pay at office (manual airtime)</div>
              </div>
            </div>
          </div>

          <div className="plans-section">
            <label>Select Airtime Plan:</label>
            <div className="plans-grid">
              {plans && plans.map(plan => (
                <div 
                  key={plan.id}
                  className={`plan-option ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-price">₦{plan.price.toLocaleString()}</div>
                  <div className="plan-days">{plan.days} days active</div>
                  <div className="plan-sms">~{getSmsCapacity(plan.price)} SMS</div>
                </div>
              ))}
            </div>
          </div>

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
                <strong>{getSmsCapacity(selectedPlan.price)} messages</strong>
              </div>
              <div className="summary-row">
                <span>SIM Number:</span>
                <strong className="sim-highlight">{vehicle.sim_card_number || 'Not assigned'}</strong>
              </div>
            </div>
          )}

          {paymentMethod === 'paystack' && (
            <div className="paystack-info">
              <div className="info-header">💳 Payment Details</div>
              {isLiveMode ? (
                <>
                  <p>⚠️ <strong>LIVE MODE</strong> - Real money will be charged</p>
                  <p>✅ Secure payment via Paystack</p>
                  <p>✅ Supports: Cards, Bank Transfers, USSD, QR Code</p>
                  <p>✅ Airtime sent immediately after payment</p>
                  <p className="live-note">💰 ₦{selectedPlan?.price || '0'} will be deducted from your account</p>
                </>
              ) : (
                <>
                  <p>🔧 <strong>TEST MODE</strong> - No real money will be charged</p>
                  <p>✅ Use test card: <strong>4084084084084081</strong></p>
                  <p>✅ Any future expiry, any CVV</p>
                  <p>✅ Airtime is simulated</p>
                  <p className="test-mode-note">This is a test transaction. No real airtime will be sent.</p>
                </>
              )}
            </div>
          )}

          {paymentMethod === 'cash' && (
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
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-recharge" 
            onClick={handleRecharge}
            disabled={loading || !selectedPlan || !vehicle.sim_card_number}
          >
            {loading ? 'Processing...' : `Send Airtime • ₦${selectedPlan?.price?.toLocaleString() || 0}`}
          </button>
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
          .mode-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-family: var(--font-tech);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .mode-badge.live {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          .mode-badge.test {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
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
          .vehicle-info {
            background: rgba(10, 111, 255, 0.08);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
          }
          .vehicle-info p {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
            margin: 4px 0;
          }
          .sim-number {
            color: var(--blue-neon);
            font-weight: 700;
            margin-left: 8px;
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
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 12px;
          }
          .plan-option {
            background: rgba(8, 20, 50, 0.6);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px;
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
            font-size: 14px;
            font-weight: 700;
            color: var(--white);
          }
          .plan-price {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--blue-neon);
            margin: 4px 0;
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
            margin-top: 4px;
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
          .paystack-info, .cash-info {
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
          .paystack-info p, .cash-info p {
            font-family: var(--font-tech);
            font-size: 11px;
            color: var(--silver);
            margin: 4px 0;
          }
          .test-mode-note {
            color: #f59e0b !important;
            margin-top: 8px !important;
          }
          .live-note {
            color: #ef4444 !important;
            margin-top: 8px !important;
            font-weight: 600;
          }
          .cash-note {
            color: var(--blue-neon);
            margin-top: 8px !important;
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
          }
          .btn-recharge:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  )
}

export default RechargeModal