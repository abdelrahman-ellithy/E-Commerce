import api from './client.js';

export const orderApi = {
  create: (payload) => api.post('/orders', payload),
  mine: (params) => api.get('/orders/mine', { params }),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};
