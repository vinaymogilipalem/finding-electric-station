// ============================================================
// AdminSidebar — collapsible sidebar for admin pages
// ============================================================
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Zap, LayoutDashboard, Users, MapPin, Battery, Calendar,
  DollarSign, BarChart2, FileText, ClipboardList, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Navigation items for admin sidebar
const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Stations', href: '/admin/stations', icon: MapPin },
  { label: 'Chargers', href: '/admin/chargers', icon: Battery },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

const AdminSidebar = () => {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (href) => location.pathname === href

  return (
    <aside
      className={`
        flex flex-col bg-gray-900 dark:bg-gray-950 text-gray-300 min-h-screen
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!collapsed && (
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-electric-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            ChargeHub
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-electric-500 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user info + logout */}
      <div className="border-t border-gray-800 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400
            hover:bg-red-900/30 hover:text-red-300 transition-colors w-full
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
