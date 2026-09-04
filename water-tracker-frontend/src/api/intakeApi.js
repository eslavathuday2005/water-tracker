import axiosClient from './axiosClient';

export const intakeApi = {
  logIntake: (data) => axiosClient.post('/intake', data),
  getToday: () => axiosClient.get('/intake/today'),
  getHistory: (days = 14) => axiosClient.get(`/intake/history?days=${days}`),
  deleteEntry: (id) => axiosClient.delete(`/intake/${id}`),
  getUserHistoryAdmin: (userId) => axiosClient.get(`/intake/user/${userId}`)
};
