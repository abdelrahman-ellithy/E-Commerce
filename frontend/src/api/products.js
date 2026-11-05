import api from './client.js';

export const productApi = {
  list: (params) => api.get('/products', { params }),
  categories: () => api.get('/products/categories'),
  get: (id) => api.get(`/products/${id}`),
  addReview: (id, payload) => api.post(`/products/${id}/reviews`, payload),
  adminList: (params) => api.get('/products/admin/all', { params }),
  adminGet: (id) => api.get(`/products/admin/${id}`),
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
};
