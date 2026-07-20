// ============================================================
// AdminLayout — layout for admin pages (with sidebar)
// ============================================================
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 bg-gray-900 text-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold">Admin Dashboard</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
