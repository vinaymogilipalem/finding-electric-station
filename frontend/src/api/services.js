// ============================================================
// All API service functions — grouped by feature
// Each function makes one API call and returns the response data
// ============================================================
import api from './axios'

// ── AUTH ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refresh_token) => api.post('/auth/refresh', { refresh_token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
}

// ── USERS ────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users/', { params }),         // Admin
  getById: (id) => api.get(`/users/${id}`),                  // Admin
  toggleBlock: (id) => api.put(`/users/${id}/block`),        // Admin
  deleteUser: (id) => api.delete(`/users/${id}`),            // Admin
  updateProfile: (data) => api.put('/users/me/profile', data),
  changePassword: (data) => api.put('/users/me/password', data),
}

// ── STATIONS ─────────────────────────────────────────────────
export const stationsAPI = {
  getAll: (params) => api.get('/stations/', { params }),
  getById: (id) => api.get(`/stations/${id}`),
  create: (data) => api.post('/stations/', data),            // Admin
  update: (id, data) => api.put(`/stations/${id}`, data),   // Admin
  delete: (id) => api.delete(`/stations/${id}`),            // Admin
}

// ── CHARGERS ─────────────────────────────────────────────────
export const chargersAPI = {
  getByStation: (stationId) => api.get(`/chargers/station/${stationId}`),
  create: (data) => api.post('/chargers/', data),            // Admin
  update: (id, data) => api.put(`/chargers/${id}`, data),   // Admin
  delete: (id) => api.delete(`/chargers/${id}`),            // Admin
  updateStatus: (id, status) => api.put(`/chargers/${id}/status`, { status }), // Admin
}

// ── BOOKINGS ─────────────────────────────────────────────────
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings/', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings/', data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
}

// ── CHARGING HISTORY ─────────────────────────────────────────
export const historyAPI = {
  getAll: (params) => api.get('/history/', { params }),
}

// ── FAVORITES ─────────────────────────────────────────────────
export const favoritesAPI = {
  getAll: () => api.get('/favorites/'),
  add: (stationId) => api.post(`/favorites/${stationId}`),
  remove: (stationId) => api.delete(`/favorites/${stationId}`),
}

// ── REVIEWS ──────────────────────────────────────────────────
export const reviewsAPI = {
  getByStation: (stationId) => api.get(`/reviews/station/${stationId}`),
  create: (stationId, data) => api.post(`/reviews/station/${stationId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
}

// ── NOTIFICATIONS ────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// ── ANALYTICS (Admin) ────────────────────────────────────────
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getRevenue: (period) => api.get('/analytics/revenue', { params: { period } }),
  getBookingsTrend: () => api.get('/analytics/bookings-trend'),
  getPopularStations: () => api.get('/analytics/popular-stations'),
  getChargerTypes: () => api.get('/analytics/charger-types'),
  getUserGrowth: () => api.get('/analytics/user-growth'),
}

// ── PRICING (Admin) ──────────────────────────────────────────
export const pricingAPI = {
  getAll: () => api.get('/pricing/'),
  create: (data) => api.post('/pricing/', data),
  update: (id, data) => api.put(`/pricing/${id}`, data),
  delete: (id) => api.delete(`/pricing/${id}`),
}

// ── AUDIT LOGS (Admin) ───────────────────────────────────────
export const auditAPI = {
  getAll: (params) => api.get('/audit/', { params }),
}
