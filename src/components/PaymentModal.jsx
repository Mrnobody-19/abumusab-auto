import React, { useState, useEffect } from 'react'
import { paymentService } from '../services/paymentService'

const PaymentModal = ({ isOpen, onClose, onSuccess, vehicle, plan }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [balance, setBalance] = useState(null)
  const [checkingBalance, setCheckingBalance] = useState(false)

  useEffect(() => {
    if (isOpen) {
      checkBalance()
    }
  }, [isOpen])

  const checkBalance = async () => {
    setCheckingBalance(true)
    try {
      const result = await paymentService.getBalance()
      if (result.success) {
        setBalance(result.data || result)
      }
    } catch (err) {
      console.error('Error checking balance:', err)
    } finally {
      setCheckingBalance(false)
    }
  }

  if (!isOpen || !vehicle || !plan) return null

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      await paymentService.processRecharge(vehicle, plan, (result) => {
        setLoading(false)
        if (result.success) {
          onSuccess(result)
          onClose()
        } else {
          setError(result.message)
        }
      })
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📱 Airtime Recharge</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="payment-summary">
            <h4>Recharge Summary</h4>
            <div className="summary-details">
              <div className="summary-row">
                <span>Vehicle:</span>
                <strong>{vehicle.vehicle_id} - {vehicle.name}</strong>
              </div>
              <div className="summary-row">
                <span>SIM:</span>
                <strong>{vehicle.sim_card_number}</strong>
              </div>
              <div className="summary-row">
                <span>Plan:</span>
                <strong>{plan.name}</strong>
              </div>
              <div className="summary-row">
                <span>Duration:</span>
                <strong>{plan.days} days</strong>
              </div>
              <div className="summary-row total">
                <span>Amount:</span>
                <strong className="amount">₦{plan.price.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Balance Display */}
          <div className={`balance-display ${balance?.success === false ? 'low-balance' : ''}`}>
            <div className="balance-icon">💰</div>
            <div>
              <div className="balance-label">VTU Wallet Balance</div>
              <div className="balance-amount">
                {checkingBalance ? 'Checking...' : `₦${balance?.balance?.toLocaleString() || '0.00'}`}
              </div>
            </div>
            <button className="btn-refresh-balance" onClick={checkBalance}>
              🔄
            </button>
          </div>

          {balance?.success === false && (
            <div className="warning-message">
              ⚠️ {balance.message || 'Unable to fetch balance. Please check your API key.'}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="vtu-info">
            <div className="info-header">📱 Peyflex Telecom</div>
            <p>✅ Airtime sent instantly to <strong>{vehicle.sim_card_number}</strong></p>
            <p>✅ Amount: <strong>₦{plan.price.toLocaleString()}</strong></p>
            <p>✅ Tracker active for <strong>{plan.days} days</strong></p>
            <p className="info-note">💰 Airtime will be deducted from your VTU wallet</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-pay" 
            onClick={handlePayment}
            disabled={loading || balance?.success === false}
          >
            {loading ? 'Processing...' : `Recharge ₦${plan.price.toLocaleString()}`}
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
          .payment-modal {
            background: rgba(6, 14, 30, 0.98);
            border: 1px solid var(--border);
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
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
          .payment-summary {
            background: rgba(10, 111, 255, 0.08);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .payment-summary h4 {
            font-family: var(--font-head);
            font-size: 14px;
            color: var(--white);
            margin-bottom: 12px;
          }
          .summary-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
          }
          .summary-row.total {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--border);
          }
          .amount {
            color: var(--blue-neon);
            font-size: 18px;
          }
          .balance-display {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(34, 197, 94, 0.08);
            border: 1px solid rgba(34, 197, 94, 0.2);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 16px;
          }
          .balance-display.low-balance {
            border-color: rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.08);
          }
          .balance-icon {
            font-size: 24px;
          }
          .balance-label {
            font-family: var(--font-tech);
            font-size: 11px;
            color: var(--text-muted);
          }
          .balance-amount {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--white);
          }
          .btn-refresh-balance {
            background: rgba(10, 111, 255, 0.15);
            border: none;
            color: var(--blue-neon);
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-left: auto;
          }
          .warning-message {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 10px;
            color: #ef4444;
            font-size: 12px;
            margin-bottom: 16px;
          }
          .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 10px;
            color: #ef4444;
            font-size: 13px;
            margin-top: 16px;
          }
          .vtu-info {
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
          .vtu-info p {
            font-family: var(--font-tech);
            font-size: 12px;
            color: var(--silver);
            margin: 4px 0;
          }
          .info-note {
            color: #f59e0b;
            margin-top: 8px;
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
          .btn-pay {
            background: linear-gradient(135deg, #0a6fff, #0055cc);
            border: none;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          .btn-pay:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  )
}

export default PaymentModal