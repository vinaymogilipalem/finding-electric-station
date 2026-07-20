import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({
        email: formData.email,
        username: formData.username || null,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        password: formData.password,
      })
      toast.success('Registration successful! Welcome to EV ChargeHub.')
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-md w-full p-8 shadow-lg text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-electric-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Create an account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start booking charging slots today</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 mb-4 leading-normal">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="full_name">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="full_name"
                className="input pl-10"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  id="username"
                  className="input pl-10"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="john_doe"
                />
              </div>
            </div>

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
          </div>

          <div>
            <label className="label" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                id="email"
                required
                className="input pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  id="password"
                  required
                  className="input pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  className="input pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
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
                <CheckCircle className="w-4 h-4" /> Register Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
