import { useState } from 'react'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { usersAPI } from '../../api/services'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const [formData, setFormData] = useState({ current_password: '', new_password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.new_password.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }
    if (formData.new_password !== formData.confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await usersAPI.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      })
      toast.success('Password changed successfully!')
      setFormData({ current_password: '', new_password: '', confirmPassword: '' })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Update your security configurations and account preferences
        </p>
      </div>

      {/* Change Password Card */}
      <div className="card p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-500" /> Change Password
        </h3>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 mb-4 leading-normal">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="current_password">Current Password</label>
            <input
              type="password"
              id="current_password"
              required
              className="input"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="label" htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              required
              className="input"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              required
              className="input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 rounded-xl font-medium mt-6 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SettingsPage
