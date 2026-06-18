import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { peyflexService as paymentService } from '../services/peyflexService'

const BulkRechargeModal = ({ isOpen, onClose, onSuccess, vehicles, plans }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedVehicles, setSelectedVehicles] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const { user } = useAuth()

  const isLiveMode = paymentService.isLiveMode()

  if (!isOpen || !vehicles || vehicles.length === 0) return null

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(vehicles.map(v => v.id))
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

    setLoading(true)

    try {
      const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id))
      
      await paymentService.processBulkRecharge(
        selectedVehiclesData,
        selectedPlan,
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
    } catch (error) {
      console.error('Bulk recharge error:', error)
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
          <h3>📱 Bulk Airtime Recharge</h3>
          <div className={`mode-badge ${isLiveMode ? 'live' : 'test'}`}>
            {isLiveMode ? '🔴 LIVE' : '🟡 TEST'}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Summary Info */}
          <div className="summary-info">
            <p><strong>Total Vehicles:</strong> {vehicles.length}</p>
            <p><strong>Selected:</strong> {selectedVehicles.length}</p>
            <p><strong>Plan:</strong> {selectedPlan ? `${selectedPlan.name} (₦${selectedPlan.price.toLocaleString()})` : 'None selected'}</p>
            <p><strong>Total Cost:</strong> ₦{(selectedPlan?.price || 0) * selectedVehicles.length}</p>
          </div>

          {/* Airtime Info Banner */}
          <div className="airtime-banner">
            <div className="banner-icon">📡</div>
            <div className="banner-text">
              <strong>Bulk Recharge:</strong><br />
              Airtime will be sent to all selected tracker SIM cards simultaneously.
            </div>
          </div>

          {/* Recharge Plans */}
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
                  <div className="plan-sms">~{getSmsCapacity(plan.price)} SMS each</div>
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
                <strong>{selectedVehicles.length} selected</strong>
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
                <strong className="total-cost">₦{(selectedPlan.price * selectedVehicles.length).toLocaleString()}</strong>
              </div>
            </div>
          )}

          {/* Vehicle Selection */}
          <div className="vehicles-section">
            <label>Select Vehicles:</label>
            <div className="select-all">
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span>Select All</span>
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
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-recharge" 
            onClick={handleBulkRecharge}
            disabled={loading || !selectedPlan || selectedVehicles.length === 0}
          >
            {loading ? 'Processing...' : `Recharge ${selectedVehicles.length} Vehicles • ₦${(selectedPlan?.price || 0) * selectedVehicles.length}`}
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
          .summary-info {
            background: rgba(10, 111, 255, 0.08);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 20px;
          }
          .summary-info p {
            font-family: var(--font-tech);
            font-size: 13px;
            color: var(--silver);
            margin: 4px 0;
          }
          .summary-info p strong {
            color: var(--white);
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
          .total-cost {
            color: var(--blue-neon);
            font-size: 16px;
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
            max-height: 200px;
            overflow-y: auto;
          }
          .vehicle-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
            font-size: 13px;
            color: var(--white);
          }
          .sim-status {
            font-family: var(--font-tech);
            font-size: 11px;
            margin-top: 2px;
          }
          .sim-status.has-sim {
            color: #22c55e;
          }
          .sim-status.no-sim {
            color: #ef4444;
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

export default BulkRechargeModal