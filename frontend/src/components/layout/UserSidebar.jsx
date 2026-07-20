// ============================================================
// UserSidebar — sidebar for user dashboard pages
// ============================================================
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, Calendar, Clock, Heart,
  Bell, User, Settings, LogOut, Zap
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Stations', href: '/stations', icon: MapPin },
  { label: 'My Bookings', href: '/bookings', icon: Calendar },
  { label: 'Charging History', href: '/history', icon: Clock },
  { label: 'Favorites', href: '/favorites', icon: Heart },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const UserSidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (href) => location.pathname === href

  return (
    <aside className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 h-16 px-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-electric-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-gradient">EV ChargeHub</span>
      </div>

      {/* User info card */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {getInitials(user?.full_name || user?.username)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={active ? 'nav-item-active' : 'nav-item'}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default UserSidebar
