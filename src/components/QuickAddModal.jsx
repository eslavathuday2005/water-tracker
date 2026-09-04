import React, { useState } from 'react';
import { X, Plus, Droplets, Coffee, Milk, Sparkles, Calendar } from 'lucide-react';
import { intakeApi } from '../api/intakeApi';
import { useToast } from '../context/ToastContext';

// Helper to format local date as YYYY-MM-DD
const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const QuickAddModal = ({ isOpen, onClose, onIntakeLogged }) => {
  const { showToast } = useToast();
  const [customAmount, setCustomAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalTodayDate);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { label: 'Small Cup', amount: 150, icon: <Coffee size={18} /> },
    { label: 'Standard Glass', amount: 250, icon: <Droplets size={18} /> },
    { label: 'Water Bottle', amount: 500, icon: <Milk size={18} /> },
    { label: 'Hydration Flask', amount: 750, icon: <Sparkles size={18} /> }
  ];

  const handleLogAmount = async (amountToLog, logNote = '') => {
    const num = Number(amountToLog);

    // Edge Case: validate amount > 0 and <= 10000ml
    if (isNaN(num) || num <= 0) {
      showToast('Intake amount must be a positive number greater than 0', 'error');
      return;
    }

    if (num > 10000) {
      showToast('Intake amount cannot exceed 10,000ml (10 Litres)', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await intakeApi.logIntake({
        amount: num,
        unit: 'ml',
        date: selectedDate || getLocalTodayDate(),
        note: logNote
      });

      if (res.success) {
        showToast(`Logged +${num}ml of water! Keep hydrating! 💧`, 'success');
        setCustomAmount('');
        setNote('');
        setSelectedDate(getLocalTodayDate());
        onIntakeLogged(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to log water intake', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    handleLogAmount(customAmount, note);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <Droplets size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Log Water Intake</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Preset Buttons Grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              Quick Preset Portions:
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {presets.map((preset) => (
                <button
                  key={preset.amount}
                  type="button"
                  disabled={loading}
                  onClick={() => handleLogAmount(preset.amount, preset.label)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '14px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ color: 'var(--accent-cyan)' }}>{preset.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>+{preset.amount} ml</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>OR ENTER CUSTOM AMOUNT</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Custom Form */}
          <form onSubmit={handleSubmitCustom}>
            <div className="form-group">
              <label className="form-label">Water Amount (ml)</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 350"
                className="form-input"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getLocalTodayDate()}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Post-workout hydrate"
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                maxLength={50}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={loading || !customAmount}
              >
                <Plus size={18} />
                {loading ? 'Logging...' : 'Log Intake'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
