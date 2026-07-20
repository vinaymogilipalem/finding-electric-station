import { useState } from 'react'
import { User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usersAPI } from '../../api/services'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await usersAPI.updateProfile(formData)
      updateUser(res.data)
      toast.success('Profile updated successfully!')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Manage your personal information and contact settings
        </p>
      </div>

      <div className="card p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 mb-4 leading-normal">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email (Read only) */}
          <div>
            <label className="label">Email Address (Cannot change)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                disabled
                className="input pl-10 bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-200"
                value={user?.email || ''}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="label" htmlFor="full_name">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="full_name"
                required
                className="input pl-10"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="label" htmlFor="username">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="username"
                required
                className="input pl-10"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="john_doe"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="label" htmlFor="phone">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                id="phone"
                className="input pl-10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
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
                <CheckCircle className="w-4 h-4" /> Save Profile Details
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
