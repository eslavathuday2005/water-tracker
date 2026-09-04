import axiosClient from './axiosClient';

export const userApi = {
  getAllUsers: () => axiosClient.get('/users'),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  updateUserGoal: (id, dailyGoal) => axiosClient.patch(`/users/${id}/goal`, { dailyGoal }),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
  getOverviewStats: () => axiosClient.get('/stats/overview'),
  getSystemGoal: () => axiosClient.get('/stats/system-goal'),
  updateSystemGoal: (defaultDailyGoal) => axiosClient.put('/stats/system-goal', { defaultDailyGoal })
};
