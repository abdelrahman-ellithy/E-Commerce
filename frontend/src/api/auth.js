import api from './client.js';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  getMe: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/me', payload),
  changePassword: (payload) => api.put('/auth/password', payload),
};
