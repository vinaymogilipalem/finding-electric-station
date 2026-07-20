import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, ArrowLeft, Send } from 'lucide-react'
import { authAPI } from '../../api/services'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authAPI.forgotPassword(email)
      setSubmitted(true)
      toast.success('Reset request submitted.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-md w-full p-8 shadow-lg text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-electric-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Forgot password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We will help you reset it securely</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm leading-relaxed">
              If an account is associated with <strong>{email}</strong>, we have sent a password reset verification link there.
            </div>
            <Link to="/login" className="btn-primary w-full py-2.5 rounded-xl font-medium mt-2 flex justify-center items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-xl font-medium mt-6 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Reset Link
                </>
              )}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-medium py-2">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
