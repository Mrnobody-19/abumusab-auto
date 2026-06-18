import React, { useState } from 'react'
import { vehicleService } from '../services/vehicleService'

const AddTrackerModal = ({ isOpen, onClose, onSuccess, plans }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    name: '',
    model: '',
    driver_name: '',
    driver_phone: '',
    sim_card_number: '',
    imei_number: '',
    tracker_password: '123456',
    tracker_plan: plans?.[0]?.name || 'Basic'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.vehicle_id || !formData.name || !formData.sim_card_number || !formData.imei_number) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const result = await vehicleService.addVehicle(formData)
      if (result.success) {
        onSuccess(result)
        onClose()
        setFormData({
          vehicle_id: '',
          name: '',
          model: '',
          driver_name: '',
          driver_phone: '',
          sim_card_number: '',
          imei_number: '',
          tracker_password: '123456',
          tracker_plan: plans?.[0]?.name || 'Basic'
        })
      } else {
        setError(result.message || 'Failed to add tracker')
      }
    } catch (err) {
      setError(err.message || 'Error adding tracker')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-tracker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Add New Tracker</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Vehicle ID *</label>
                <input
                  type="text"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  placeholder="e.g., ABJ-001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehicle Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Toyota HiAce"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., 2023 Model"
                />
              </div>
              <div className="form-group">
                <label>Driver Name</label>
                <input
                  type="text"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  placeholder="Driver's full name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Driver Phone</label>
                <input
                  type="tel"
                  name="driver_phone"
                  value={formData.driver_phone}
                  onChange={handleChange}
                  placeholder="Driver's phone number"
                />
              </div>
              <div className="form-group">
                <label>SIM Card Number *</label>
                <input
                  type="text"
                  name="sim_card_number"
                  value={formData.sim_card_number}
                  onChange={handleChange}
                  placeholder="SIM card number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>IMEI Number *</label>
                <input
                  type="text"
                  name="imei_number"
                  value={formData.imei_number}
                  onChange={handleChange}
                  placeholder="Tracker IMEI number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tracker Password *</label>
                <input
                  type="text"
                  name="tracker_password"
                  value={formData.tracker_password}
                  onChange={handleChange}
                  placeholder="e.g., 123456, 000000, admin123"
                  required
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                  Common passwords: 123456, 000000, admin123, 6666
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tracker Plan</label>
                <select
                  name="tracker_plan"
                  value={formData.tracker_plan}
                  onChange={handleChange}
                >
                  {plans?.map(plan => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name} - ₦{plan.price.toLocaleString()}/{plan.days} days
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-info">
              <p>📱 The tracker will be activated immediately upon adding.</p>
              <p>🔑 The tracker password is used for sending commands via SMS.</p>
              <p>💳 Recharge will be required before expiry date.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Tracker'}
            </button>
          </div>
        </form>

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
          .add-tracker-modal {
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
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .form-group label {
            font-family: var(--font-tech);
            font-size: 12px;
            font-weight: 600;
            color: var(--silver);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .form-group input,
          .form-group select {
            background: rgba(8, 20, 50, 0.8);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 12px;
            color: var(--white);
            font-family: var(--font-body);
            font-size: 14px;
          }
          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: var(--blue-neon);
          }
          .form-group small {
            color: var(--text-muted);
            font-size: 11px;
          }
          .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 10px;
            color: #ef4444;
            font-size: 13px;
            margin-bottom: 16px;
          }
          .form-info {
            background: rgba(10, 111, 255, 0.05);
            border-radius: 8px;
            padding: 12px;
            margin-top: 16px;
          }
          .form-info p {
            font-family: var(--font-tech);
            font-size: 12px;
            color: var(--silver);
            margin: 4px 0;
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
          .btn-submit {
            background: linear-gradient(135deg, #0a6fff, #0055cc);
            border: none;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  )
}

export default AddTrackerModal  // ✅ MAKE SURE THIS IS HERE