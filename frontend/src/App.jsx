import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './routes/RouteGuards'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import UserLayout from './components/layout/UserLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public Pages
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import StationsPage from './pages/public/StationsPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'

// User Pages
import UserDashboard from './pages/user/UserDashboard'
import StationDetailPage from './pages/user/StationDetailPage'
import BookSlotPage from './pages/user/BookSlotPage'
import BookingHistoryPage from './pages/user/BookingHistoryPage'
import ChargingHistoryPage from './pages/user/ChargingHistoryPage'
import FavoritesPage from './pages/user/FavoritesPage'
import NotificationsPage from './pages/user/NotificationsPage'
import ProfilePage from './pages/user/ProfilePage'
import SettingsPage from './pages/user/SettingsPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import ManageStationsPage from './pages/admin/ManageStationsPage'
import ManageChargersPage from './pages/admin/ManageChargersPage'
import ManageBookingsPage from './pages/admin/ManageBookingsPage'
import PricingPage from './pages/admin/PricingPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import ReportsPage from './pages/admin/ReportsPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

// ChartJS registration for pages that use it
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/stations" element={<StationsPage />} />
            
            {/* Guest-only routes (Auth redirect if already logged in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/stations/:id" element={<StationDetailPage />} />
              <Route path="/book/:id" element={<BookSlotPage />} />
              <Route path="/bookings" element={<BookingHistoryPage />} />
              <Route path="/history" element={<ChargingHistoryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/stations" element={<ManageStationsPage />} />
              <Route path="/admin/chargers" element={<ManageChargersPage />} />
              <Route path="/admin/bookings" element={<ManageBookingsPage />} />
              <Route path="/admin/pricing" element={<PricingPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/audit" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
