import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refreshWallet: () => api.post('/auth/refresh-wallet'),
};

// Leagues
export const leagueAPI = {
  list: (params) => api.get('/leagues', { params }),
  get: (id) => api.get(`/leagues/${id}`),
  create: (data) => api.post('/leagues', data),
  update: (id, data) => api.patch(`/leagues/${id}`, data),
  declareWinners: (id, data) => api.post(`/leagues/${id}/declare-winners`, data),
  remove: (id) => api.delete(`/leagues/${id}`),
};

// Teams
export const teamAPI = {
  list: (params) => api.get('/teams', { params }),
  get: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  join: (inviteCode) => api.post('/teams/join', { inviteCode }),
  remove: (id) => api.delete(`/teams/${id}`),
};

// Payments
export const paymentAPI = {
  list: (params) => api.get('/payments', { params }),
  get: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  payDues: (teamId) => api.post('/payments/dues', { teamId }),
  verify: (hash) => api.get(`/payments/verify/${hash}`),
};

// Payouts
export const payoutAPI = {
  list: (params) => api.get('/payouts', { params }),
  get: (id) => api.get(`/payouts/${id}`),
  execute: (id) => api.post(`/payouts/${id}/execute`),
  refresh: (id) => api.post(`/payouts/${id}/refresh`),
};

// Ledger
export const ledgerAPI = {
  list: (params) => api.get('/ledger', { params }),
  summary: (params) => api.get('/ledger/summary', { params }),
};

// Public
export const publicAPI = {
  overview: () => api.get('/public/overview'),
  recentTransactions: () => api.get('/public/recent-transactions'),
  leagues: () => api.get('/public/leagues'),
};

export default api;
