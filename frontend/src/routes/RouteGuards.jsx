// ============================================================
// Route Guards — protect routes based on authentication & role
// ============================================================
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Show a loading spinner while auth state is being determined
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
)

// ── ProtectedRoute ────────────────────────────────────────────
// Redirects to /login if user is not authenticated
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

// ── AdminRoute ────────────────────────────────────────────────
// Redirects to /dashboard if user is not an admin
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

// ── PublicOnlyRoute ───────────────────────────────────────────
// Redirects authenticated users away from login/register pages
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
  }

  return <Outlet />
}
