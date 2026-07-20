import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usersAPI } from '../../api/services'
import { Settings, Shield, User, Lock, Save, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSettingsPage = () => {
  const { user, login } = useAuth()
  
  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Mock System Preferences state
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowPublicSignups, setAllowPublicSignups] = useState(true)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profileForm.full_name.trim()) {
      return toast.error('Full name is required')
    }
    
    try {
      setProfileLoading(true)
      const res = await usersAPI.updateProfile(profileForm)
      toast.success('Admin profile updated successfully!')
      // Refresh context user data
      if (res.data) {
        // We can just reload or update state if needed, normally login sets user info
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const { current_password, new_password, confirm_password } = passwordForm
    
    if (!current_password || !new_password || !confirm_password) {
      return toast.error('All password fields are required')
    }
    if (new_password !== confirm_password) {
      return toast.error('New passwords do not match')
    }
    if (new_password.length < 6) {
      return toast.error('New password must be at least 6 characters long')
    }

    try {
      setPasswordLoading(true)
      await usersAPI.changePassword({
        old_password: current_password,
        new_password: new_password
      })
      toast.success('Admin password updated successfully!')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveSystemSettings = () => {
    toast.success('System preferences saved successfully!')
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Manage your account credentials, security preferences, and system parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Admin Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user?.full_name || 'System Administrator'}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-1">
              {user?.role?.toUpperCase() || 'ADMIN'}
            </p>
            
            <div className="w-full border-t border-gray-200 dark:border-gray-800 my-4" />
            
            <div className="w-full text-left space-y-3">
              <div>
                <span className="text-xs text-gray-400 block">Registered Email</span>
                <span className="text-sm font-semibold dark:text-white">{user?.email || 'admin@evchargehub.com'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Phone Connection</span>
                <span className="text-sm font-semibold dark:text-white">{user?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Access Scope</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Full Write/Delete Controls</span>
              </div>
            </div>
          </div>

          {/* System Control Settings */}
          <div className="card p-6">
            <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" /> System Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-semibold block dark:text-white">Maintenance Mode</span>
                  <span className="text-xs text-gray-400">Put station booking page on hold</span>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-9 h-5 bg-gray-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-transparent dark:bg-gray-800"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-semibold block dark:text-white">Allow User Signups</span>
                  <span className="text-xs text-gray-400">Enable new customer registrations</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowPublicSignups}
                  onChange={(e) => setAllowPublicSignups(e.target.checked)}
                  className="w-9 h-5 bg-gray-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-transparent dark:bg-gray-800"
                />
              </div>

              <button
                onClick={handleSaveSystemSettings}
                className="btn-primary w-full text-xs mt-2 py-2 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="card p-6">
            <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Modify Personal Details
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Phone Connection</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  {profileLoading ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card p-6">
            <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" /> Reset Credentials / Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter current password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Min 6 characters"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Repeat new password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary btn-sm flex items-center gap-1.5 bg-red-600 hover:bg-red-700"
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage
