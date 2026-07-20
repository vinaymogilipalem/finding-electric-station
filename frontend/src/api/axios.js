// ============================================================
// Axios API Client Configuration
// All API calls go through this configured Axios instance
// ============================================================
import axios from 'axios'

// Base URL pointing to our FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api'

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor ──────────────────────────────────────
// Automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ─────────────────────────────────────
// Handle 401 (token expired) globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh the token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { access_token } = res.data
          localStorage.setItem('access_token', access_token)
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch {
          // Refresh failed — clear storage and redirect to login
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        // No refresh token — redirect to login
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
