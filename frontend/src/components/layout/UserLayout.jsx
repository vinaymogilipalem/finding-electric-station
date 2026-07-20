// ============================================================
// UserLayout — layout for authenticated user pages (with sidebar)
// Responsive: sidebar hidden on mobile, toggleable
// ============================================================
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import UserSidebar from './UserSidebar'

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <UserSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative">
            <UserSidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold text-gray-900 dark:text-white">EV ChargeHub</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserLayout
