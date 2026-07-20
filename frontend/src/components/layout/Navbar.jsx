// ============================================================
// Navbar — top navigation for public and user pages
// ============================================================
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Menu, X, Sun, Moon, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getInitials } from '../../utils/helpers'

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Public navigation links
  const publicLinks = [
    { label: 'Home', href: '/' },
    { label: 'Stations', href: '/stations' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
      <div className="container-xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-electric-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient">EV ChargeHub</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              title="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications bell */}
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/notifications'}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user?.full_name || user?.username)}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.full_name?.split(' ')[0] || user?.username}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 card shadow-lg py-1 animate-fade-in">
                      {isAdmin ? (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Dashboard
                          </Link>
                        </>
                      )}
                      <div className="divider my-1" />
                      <button
                        onClick={() => { handleLogout(); setDropdownOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline btn-sm hidden sm:flex">
                  Login
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <Link to="/login" className="btn-outline btn-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary btn-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
