import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SetGoalModal = ({ isOpen, onClose, targetUser, onGoalUpdated }) => {
  const { user: currentUser, updateUser } = useAuth();
  const { showToast } = useToast();
  const [goal, setGoal] = useState('2000');
  const [loading, setLoading] = useState(false);

  const activeUser = targetUser || currentUser;

  useEffect(() => {
    if (activeUser?.dailyGoal) {
      setGoal(String(activeUser.dailyGoal));
    }
  }, [activeUser, isOpen]);

  if (!isOpen) return null;

  const presets = [2000, 2500, 3000, 3500];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(goal);

    if (isNaN(num) || num <= 0) {
      showToast('Daily goal must be a positive number greater than 0', 'error');
      return;
    }

    try {
      setLoading(true);

      // If targetUser is passed and is different from logged in user (Admin editing user)
      if (targetUser && targetUser.id !== currentUser.id) {
        const res = await userApi.updateUserGoal(targetUser.id, num);
        if (res.success) {
          showToast(`Updated daily goal to ${num}ml for ${targetUser.name}`, 'success');
          if (onGoalUpdated) onGoalUpdated(res.data);
          onClose();
        }
      } else {
        // User editing own goal
        const res = await authApi.updateProfile({ dailyGoal: num });
        if (res.success) {
          showToast(`Your daily goal is now ${num}ml (≈ ${(num / 250).toFixed(0)} glasses)!`, 'success');
          updateUser({ dailyGoal: num });
          if (onGoalUpdated) onGoalUpdated(res.data);
          onClose();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update goal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <Target size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>
              {targetUser ? `Set Goal for ${targetUser.name}` : 'Customize Daily Hydration Goal'}
            </h3>
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

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            marginBottom: '16px'
          }}>
            Select a recommended target or enter your personalized daily intake volume:
          </p>

          {/* Quick Preset Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGoal(String(preset))}
                style={{
                  padding: '10px 4px',
                  borderRadius: '8px',
                  border: goal === String(preset)
                    ? '2px solid var(--accent-cyan)'
                    : '1px solid var(--border-subtle)',
                  background: goal === String(preset)
                    ? 'rgba(0, 229, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div>{preset}ml</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {preset / 250} glasses
                </div>
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Custom Goal (Milliliters)</label>
            <input
              type="number"
              min="250"
              max="10000"
              step="50"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="form-input"
              placeholder="e.g. 2200"
              required
            />
          </div>

          <div style={{
            background: 'rgba(0, 229, 255, 0.06)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '0.82rem',
            color: '#7dd3fc',
            marginBottom: '20px'
          }}>
            💡 Health authorities generally recommend 2,000ml to 3,000ml per day depending on body weight, climate, and activity levels.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
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
              style={{ flex: 1.5 }}
              disabled={loading || !goal}
            >
              <Check size={18} />
              {loading ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetGoalModal;
