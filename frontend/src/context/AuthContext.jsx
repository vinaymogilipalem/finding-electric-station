// ============================================================
// Auth Context — provides user authentication state globally
// Wrap your entire app with <AuthProvider> in App.jsx
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/services'

// Create the context
const AuthContext = createContext(null)

// Custom hook to use auth context anywhere in the app
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// AuthProvider component — wraps the app and provides auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)       // Current logged-in user object
  const [loading, setLoading] = useState(true) // True while checking auth on startup

  // On app load, check if there's a valid token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Fetch current user profile using the stored token
      authAPI.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token is invalid or expired — clear storage
          localStorage.clear()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { access_token, refresh_token, user: userData } = res.data

    // Store tokens in localStorage
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)

    setUser(userData)
    return userData
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  // ── Register ──────────────────────────────────────────────
  const register = async (data) => {
    const res = await authAPI.register(data)
    const { access_token, refresh_token, user: userData } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(userData)
    return userData
  }

  // ── Update user in context (after profile edit) ───────────
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }))
  }

  // Helper flags
  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  // Provide all auth values and functions to children
  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, isAuthenticated, login, logout, register, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
