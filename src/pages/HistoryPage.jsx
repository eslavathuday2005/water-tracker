import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BarChart2,
  Trash2,
  Clock,
  Droplets,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { intakeApi } from '../api/intakeApi';
import { useToast } from '../context/ToastContext';

const HistoryPage = () => {
  const { showToast } = useToast();
  const [historyData, setHistoryData] = useState({ dailyTotals: [], logs: [] });
  const [daysFilter, setDaysFilter] = useState(14);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await intakeApi.getHistory(daysFilter);
      if (res.success && res.data) {
        setHistoryData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load intake history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [daysFilter]);

  const handleDeleteLog = async (id, amount) => {
    if (!window.confirm(`Are you sure you want to delete this log of ${amount}ml?`)) {
      return;
    }

    try {
      const res = await intakeApi.deleteEntry(id);
      if (res.success) {
        showToast('Log entry removed', 'info');
        fetchHistory();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete log', 'error');
    }
  };

  const toggleExpand = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-cyan)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              <BarChart2 size={16} />
              Hydration Analytics
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
              Intake History & Trends
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Review your historical water consumption, track daily totals, and inspect past logs.
            </p>
          </div>

          {/* Days Filter */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDaysFilter(d)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: daysFilter === d ? 'var(--accent-cyan)' : 'transparent',
                  color: daysFilter === d ? '#030c18' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart Container */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
            Daily Water Consumption Breakdown ({daysFilter} Days)
          </h3>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading consumption chart...
            </div>
          ) : historyData.dailyTotals?.length > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              height: '240px',
              paddingTop: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              overflowX: 'auto'
            }}>
              {historyData.dailyTotals
                .slice()
                .reverse()
                .map((day) => {
                  const maxDisplay = Math.max(3000, day.dailyGoal * 1.2);
                  const barHeightPercent = Math.min(100, Math.round((day.totalAmount / maxDisplay) * 100));
                  const isAchieved = day.totalAmount >= day.dailyGoal;
                  const dayLabel = new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <div
                      key={day.date}
                      style={{
                        flex: 1,
                        minWidth: '46px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isAchieved ? '#10b981' : 'var(--accent-cyan)'
                      }}>
                        {day.totalAmount}
                      </div>

                      {/* Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(8, barHeightPercent)}%`,
                          background: isAchieved
                            ? 'linear-gradient(180deg, #10b981, #059669)'
                            : 'linear-gradient(180deg, var(--accent-cyan), var(--accent-deep-blue))',
                          borderRadius: '6px 6px 0 0',
                          boxShadow: isAchieved
                            ? '0 0 12px rgba(16, 185, 129, 0.4)'
                            : '0 0 12px rgba(0, 229, 255, 0.3)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        title={`${day.date}: ${day.totalAmount}ml / ${day.dailyGoal}ml (${day.percentage}%)`}
                        onClick={() => toggleExpand(day.date)}
                      />

                      <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        marginTop: '4px'
                      }}>
                        {dayLabel}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              No history recorded for this period yet.
            </div>
          )}
        </div>

        {/* Daily Breakdown List */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
            Past Dates Logged ({historyData.dailyTotals?.length || 0} Days)
          </h3>

          {historyData.dailyTotals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {historyData.dailyTotals.map((day) => {
                const isExpanded = expandedDate === day.date;
                const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={day.date}
                    className="glass-card"
                    style={{ overflow: 'hidden', border: isExpanded ? '1px solid var(--border-accent)' : undefined }}
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => toggleExpand(day.date)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: day.isGoalReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 229, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: day.isGoalReached ? '#10b981' : 'var(--accent-cyan)'
                        }}>
                          {day.isGoalReached ? <CheckCircle2 size={20} /> : <Droplets size={20} />}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                            {formattedDate}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {day.entriesCount} logged drink{day.entriesCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            color: day.isGoalReached ? '#10b981' : 'var(--accent-cyan)'
                          }}>
                            {day.totalAmount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {day.dailyGoal} ml</span>
                          </div>
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: day.isGoalReached ? '#10b981' : '#f59e0b'
                          }}>
                            {day.percentage}% {day.isGoalReached ? 'Goal Reached' : 'of daily goal'}
                          </div>
                        </div>

                        <div style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible log entries */}
                    {isExpanded && (
                      <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid var(--border-subtle)',
                        background: 'rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                          INDIVIDUAL DRINK ENTRIES:
                        </div>
                        {day.logs?.map((entry) => {
                          const timeStr = new Date(entry.loggedAt || entry.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div
                              key={entry._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                  +{entry.amount} ml
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> {timeStr}
                                </span>
                                {entry.note && (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    • {entry.note}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteLog(entry._id, entry.amount)}
                                className="btn btn-danger btn-icon btn-sm"
                                title="Delete Entry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No history found. Start logging today on the dashboard!
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
