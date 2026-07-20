import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.full_name || user.username}!`)
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        // Redirect to requested page or user dashboard
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-md w-full p-8 shadow-lg text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-electric-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your EV ChargeHub account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 mb-4 leading-normal">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                id="password"
                required
                className="input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
