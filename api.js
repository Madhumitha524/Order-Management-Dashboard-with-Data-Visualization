import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: (params) => api.get('/orders/stats/aggregate', { params }),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  save: (data) => api.put('/dashboard', data),
};

export default api;
