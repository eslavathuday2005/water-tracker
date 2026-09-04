import React from 'react';
import { Sparkles, Trophy, Droplets } from 'lucide-react';

const WaterWaveGauge = ({ totalAmount = 0, dailyGoal = 2000 }) => {
  // Calculate percentage and bounded wave height (min 8%, max 98% for aesthetics)
  const rawPercentage = dailyGoal > 0 ? Math.round((totalAmount / dailyGoal) * 100) : 0;
  const clampedWaveHeight = Math.min(100, Math.max(0, rawPercentage));
  const remaining = Math.max(0, dailyGoal - totalAmount);
  const isGoalAchieved = totalAmount >= dailyGoal;

  // Milestone status text & badge
  let statusText = 'Hydration Journey Started';
  let badgeColor = 'rgba(0, 229, 255, 0.2)';
  let textColor = 'var(--accent-cyan)';

  if (isGoalAchieved) {
    statusText = 'Daily Goal Achieved! 🎉';
    badgeColor = 'rgba(16, 185, 129, 0.25)';
    textColor = '#10b981';
  } else if (rawPercentage >= 75) {
    statusText = 'Almost at the Finish Line! ⚡';
    badgeColor = 'rgba(14, 165, 233, 0.25)';
    textColor = '#38bdf8';
  } else if (rawPercentage >= 50) {
    statusText = 'Halfway to Optimal Hydration! 🌊';
    badgeColor = 'rgba(0, 180, 216, 0.25)';
    textColor = '#00b4d8';
  } else if (rawPercentage > 0) {
    statusText = 'Keep Drinking Throughout the Day!';
    badgeColor = 'rgba(0, 229, 255, 0.15)';
    textColor = 'var(--accent-cyan)';
  }

  // Glasses equivalent (assuming standard 250ml glass)
  const currentGlasses = (totalAmount / 250).toFixed(1);
  const goalGlasses = (dailyGoal / 250).toFixed(0);

  return (
    <div className="glass-card" style={{
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: isGoalAchieved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 229, 255, 0.12)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        background: badgeColor,
        border: `1px solid ${textColor}55`,
        borderRadius: '9999px',
        color: textColor,
        fontSize: '0.85rem',
        fontWeight: 700,
        marginBottom: '24px',
        zIndex: 1
      }}>
        {isGoalAchieved ? <Trophy size={16} /> : <Droplets size={16} />}
        {statusText}
      </div>

      {/* Circular Animated Water Vessel */}
      <div style={{
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        position: 'relative',
        background: 'radial-gradient(circle, #081426 60%, #030811 100%)',
        border: '4px solid rgba(0, 229, 255, 0.35)',
        boxShadow: isGoalAchieved
          ? '0 0 35px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.2)'
          : '0 0 35px rgba(0, 229, 255, 0.3), inset 0 0 20px rgba(0, 229, 255, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        {/* Animated Fluid Water Container */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${Math.min(100, Math.max(6, clampedWaveHeight))}%`,
          transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          background: isGoalAchieved
            ? 'linear-gradient(180deg, #10b981 0%, #047857 100%)'
            : 'linear-gradient(180deg, #00e5ff 0%, #0077b6 100%)',
          opacity: 0.85
        }}>
          {/* Animated SVG Wave Top */}
          <div style={{
            position: 'absolute',
            top: '-24px',
            left: 0,
            width: '200%',
            height: '28px',
            animation: 'waveMove 4s linear infinite',
            pointerEvents: 'none'
          }}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path
                d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1200,40 L1200,120 L0,120 Z"
                fill={isGoalAchieved ? '#10b981' : '#00e5ff'}
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Center Hydration Readout */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          userSelect: 'none'
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1,
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)'
          }}>
            {rawPercentage}%
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#e2e8f0',
            marginTop: '4px',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}>
            {totalAmount.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ {dailyGoal.toLocaleString()} ml</span>
          </div>
          <div style={{
            fontSize: '0.78rem',
            color: '#cbd5e1',
            marginTop: '2px',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
          }}>
            ≈ {currentGlasses} of {goalGlasses} glasses
          </div>
        </div>
      </div>

      {/* Progress Footer Summary */}
      <div style={{
        marginTop: '24px',
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Drank Today
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {totalAmount} ml
          </div>
        </div>

        <div style={{ width: '1px', background: 'var(--border-subtle)' }} />

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Remaining
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: isGoalAchieved ? '#10b981' : '#f59e0b'
          }}>
            {isGoalAchieved ? '0 ml' : `${remaining} ml`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterWaveGauge;
