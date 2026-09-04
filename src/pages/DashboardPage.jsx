import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  Target,
  Sparkles,
  Flame,
  Award,
  RefreshCw,
  Droplet
} from 'lucide-react';
import Navbar from '../components/Navbar';
import WaterWaveGauge from '../components/WaterWaveGauge';
import QuickAddModal from '../components/QuickAddModal';
import SetGoalModal from '../components/SetGoalModal';
import { intakeApi } from '../api/intakeApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Helper to format local date as YYYY-MM-DD
const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [todayData, setTodayData] = useState({
    date: '',
    totalAmount: 0,
    dailyGoal: user?.dailyGoal || 2000,
    percentage: 0,
    remainingAmount: 2000,
    isGoalReached: false,
    logs: []
  });

  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSetGoalOpen, setIsSetGoalOpen] = useState(false);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const res = await intakeApi.getToday();
      if (res.success && res.data) {
        setTodayData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Error loading today hydration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const handleDeleteLog = async (id, amount) => {
    if (!window.confirm(`Are you sure you want to remove this entry of ${amount}ml?`)) {
      return;
    }

    try {
      const res = await intakeApi.deleteEntry(id);
      if (res.success) {
        showToast(`Removed -${amount}ml entry`, 'info');
        fetchTodayData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete entry', 'error');
    }
  };

  // Format today's date nicely: "Friday, Sep 4, 2026"
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {/* Top Greeting & Action Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-cyan)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <Calendar size={16} />
                {formattedToday}
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
                Hydration Dashboard
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Keep your body energized and mind sharp with consistent daily water intake.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsSetGoalOpen(true)}
                className="btn btn-secondary"
              >
                <Target size={18} />
                Adjust Goal ({todayData.dailyGoal}ml)
              </button>
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="btn btn-primary"
              >
                <Plus size={18} />
                Log Water
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }} className="dashboard-grid">
          {/* Left Column: Interactive Water Wave Gauge & Quick Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WaterWaveGauge
              totalAmount={todayData.totalAmount}
              dailyGoal={todayData.dailyGoal}
            />

            {/* Quick Action Bar */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                letterSpacing: '0.05em'
              }}>
                Instant Hydration Shortcuts
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                {[150, 250, 500, 750].map((amt) => (
                  <button
                    key={amt}
                    onClick={async () => {
                      try {
                        await intakeApi.logIntake({
                          amount: amt,
                          unit: 'ml',
                          date: getLocalTodayDate(),
                          note: 'Quick shortcut'
                        });
                        showToast(`+${amt}ml added! 💧`, 'success');
                        fetchTodayData();
                      } catch (err) {
                        showToast(err.message, 'error');
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '10px 4px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <Droplet size={16} color="var(--accent-cyan)" />
                    <span>+{amt}ml</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hydration Metrics Cards & Today's Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stat Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}>
              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONSUMED</span>
                  <Droplet size={18} color="var(--accent-cyan)" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-cyan)' }}>
                  {todayData.totalAmount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ml</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {((todayData.totalAmount / 250)).toFixed(1)} standard glasses
                </div>
              </div>

              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>REMAINING</span>
                  <Target size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: todayData.isGoalReached ? '#10b981' : '#f59e0b' }}>
                  {todayData.remainingAmount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ml</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {todayData.isGoalReached ? 'Goal reached!' : `to hit daily target`}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAILY GOAL</span>
                  <Award size={18} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: '#c4b5fd' }}>
                  {todayData.dailyGoal} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ml</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {((todayData.dailyGoal / 250)).toFixed(0)} glasses target
                </div>
              </div>
            </div>

            {/* Today's Intake Entries Timeline */}
            <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Today's Logged Entries</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {todayData.logs?.length || 0} water logs recorded today
                  </p>
                </div>
                <button
                  onClick={fetchTodayData}
                  className="btn btn-secondary btn-icon"
                  title="Refresh Today's Data"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading logs...
                </div>
              ) : todayData.logs && todayData.logs.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {todayData.logs.map((log) => {
                    const logTime = new Date(log.loggedAt || log.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={log._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(0, 229, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-cyan)'
                          }}>
                            <Droplet size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                              +{log.amount} ml
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)'
                            }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={12} /> {logTime}
                              </span>
                              {log.note && <span>• {log.note}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteLog(log._id, log.amount)}
                          className="btn btn-danger btn-icon btn-sm"
                          title="Delete Log Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px dashed var(--border-subtle)'
                }}>
                  <Droplet size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    No water logged yet today
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                    Click below to log your first drink of water!
                  </p>
                  <button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} /> Log Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onIntakeLogged={() => fetchTodayData()}
      />

      <SetGoalModal
        isOpen={isSetGoalOpen}
        onClose={() => setIsSetGoalOpen(false)}
        onGoalUpdated={() => fetchTodayData()}
      />

      <style>{`
        @media (min-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 380px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
