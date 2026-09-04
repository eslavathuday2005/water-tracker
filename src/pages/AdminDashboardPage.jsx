import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Droplets,
  Activity,
  Award,
  Search,
  Trash2,
  Edit,
  Eye,
  Settings,
  AlertTriangle,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SetGoalModal from '../components/SetGoalModal';
import { userApi } from '../api/userApi';
import { intakeApi } from '../api/intakeApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminDashboardPage = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedUserForGoal, setSelectedUserForGoal] = useState(null);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
  const [userHistoryModalData, setUserHistoryModalData] = useState(null);
  const [loadingUserHistory, setLoadingUserHistory] = useState(false);

  // System Default Goal modal/state
  const [systemGoalInput, setSystemGoalInput] = useState('2000');
  const [isSystemGoalModalOpen, setIsSystemGoalModalOpen] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        userApi.getAllUsers(),
        userApi.getOverviewStats()
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (statsRes.success) {
        setStats(statsRes.data);
        setSystemGoalInput(String(statsRes.data.defaultDailyGoal || 2000));
      }
    } catch (err) {
      showToast(err.message || 'Error fetching admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // View user intake history modal
  const handleViewUserHistory = async (targetUser) => {
    setSelectedUserForHistory(targetUser);
    try {
      setLoadingUserHistory(true);
      const res = await intakeApi.getUserHistoryAdmin(targetUser.id);
      if (res.success) {
        setUserHistoryModalData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch user intake history', 'error');
    } finally {
      setLoadingUserHistory(false);
    }
  };

  // Delete user account
  const handleDeleteUser = async (targetUser) => {
    // Edge Case: Admin tries to delete their own account
    if (targetUser.id === currentAdmin.id) {
      showToast('Forbidden: Admin cannot delete their own account!', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${targetUser.name} (${targetUser.email}) and all their hydration logs? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await userApi.deleteUser(targetUser.id);
      if (res.success) {
        showToast(`User ${targetUser.email} was removed successfully.`, 'info');
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Update System Default Goal
  const handleUpdateSystemGoal = async (e) => {
    e.preventDefault();
    const num = Number(systemGoalInput);
    if (isNaN(num) || num <= 0) {
      showToast('Goal must be greater than 0', 'error');
      return;
    }

    try {
      const res = await userApi.updateSystemGoal(num);
      if (res.success) {
        showToast(`Platform default daily goal updated to ${num}ml!`, 'success');
        setIsSystemGoalModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update system goal', 'error');
    }
  };

  // Filter users by name or email
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              color: '#a78bfa',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              <Shield size={16} />
              Administrative Control Center
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
              System Administration
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Monitor system-wide metrics, manage user hydration goals, inspect intake records, and administer accounts.
            </p>
          </div>

          <button
            onClick={() => setIsSystemGoalModalOpen(true)}
            className="btn btn-secondary"
          >
            <Settings size={18} />
            System Default Goal ({stats?.defaultDailyGoal || 2000}ml)
          </button>
        </div>

        {/* Platform Overview Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL USERS</span>
              <Users size={20} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#38bdf8' }}>
              {stats?.totalUsers || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              + {stats?.totalAdmins || 0} system admin(s)
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>WATER LOGGED TODAY</span>
              <Droplets size={20} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-cyan)' }}>
              {((stats?.totalWaterLoggedToday || 0) / 1000).toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Litres</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {stats?.totalWaterLoggedToday || 0} ml consumed today
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ALL-TIME CONSUMPTION</span>
              <Award size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
              {((stats?.totalWaterLoggedAllTime || 0) / 1000).toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Litres</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Across {stats?.totalLogs || 0} total logged drinks
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE TODAY</span>
              <Activity size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#f59e0b' }}>
              {stats?.activeUsersTodayCount || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Users</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Avg intake: {stats?.avgIntakePerUser || 0} ml/user
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Registered Users Directory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                View history, manage hydration goals, and delete accounts
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Search user name or email..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '12px', fontSize: '0.88rem' }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* User Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Daily Goal</th>
                  <th>Total Logged</th>
                  <th>Total Entries</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentAdmin.id;
                    const joinDate = new Date(u.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <tr key={u.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.name} {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </td>
                        <td>
                          <span className={u.role === 'admin' ? 'badge badge-admin' : 'badge badge-user'}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            {u.dailyGoal} ml
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            {u.totalIntakeLogged.toLocaleString()} ml
                          </span>
                        </td>
                        <td>{u.totalLogsCount} entries</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{joinDate}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleViewUserHistory(u)}
                              className="btn btn-secondary btn-icon btn-sm"
                              title="View User Intake History"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setSelectedUserForGoal(u)}
                              className="btn btn-secondary btn-icon btn-sm"
                              title="Update User Daily Goal"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              className="btn btn-danger btn-icon btn-sm"
                              title={isSelf ? 'Admin cannot delete own account' : 'Delete User Account'}
                              style={{ opacity: isSelf ? 0.3 : 1 }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit User Goal Modal */}
      {selectedUserForGoal && (
        <SetGoalModal
          isOpen={!!selectedUserForGoal}
          targetUser={selectedUserForGoal}
          onClose={() => setSelectedUserForGoal(null)}
          onGoalUpdated={() => {
            setSelectedUserForGoal(null);
            loadAdminData();
          }}
        />
      )}

      {/* System Default Goal Modal */}
      {isSystemGoalModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSystemGoalModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System Default Hydration Goal</h3>
              <button
                onClick={() => setIsSystemGoalModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateSystemGoal} style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Set the recommended baseline daily hydration goal assigned to new users upon registration:
              </p>
              <div className="form-group">
                <label className="form-label">Default Goal (ml)</label>
                <input
                  type="number"
                  min="250"
                  max="10000"
                  value={systemGoalInput}
                  onChange={(e) => setSystemGoalInput(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsSystemGoalModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Update Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Intake History Inspection Modal */}
      {selectedUserForHistory && (
        <div className="modal-overlay" onClick={() => setSelectedUserForHistory(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Intake History: {selectedUserForHistory.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedUserForHistory.email} • Daily Target: {selectedUserForHistory.dailyGoal}ml
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForHistory(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
              {loadingUserHistory ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading user intake logs...
                </div>
              ) : userHistoryModalData?.dailyTotals?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ALL-TIME WATER LOGGED</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {userHistoryModalData.totalLogged} ml
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL ENTRIES</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c4b5fd' }}>
                        {userHistoryModalData.totalEntries} drinks
                      </div>
                    </div>
                  </div>

                  {userHistoryModalData.dailyTotals.map((day) => (
                    <div
                      key={day.date}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700 }}>{day.date}</span>
                        <span style={{
                          fontWeight: 700,
                          color: day.isGoalReached ? '#10b981' : 'var(--accent-cyan)'
                        }}>
                          {day.totalAmount} / {day.dailyGoal} ml ({day.percentage}%)
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {day.logs?.map((log) => (
                          <div
                            key={log._id}
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              background: 'rgba(0, 0, 0, 0.2)',
                              padding: '6px 10px',
                              borderRadius: '6px'
                            }}
                          >
                            <span>+{log.amount} ml {log.note && `(${log.note})`}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {new Date(log.loggedAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  This user has not logged any water intake yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
