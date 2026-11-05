import api from './client.js';

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, payload) => api.patch(`/admin/orders/${id}/status`, payload),
  markOrderPaid: (id) => api.patch(`/admin/orders/${id}/pay`),
};
