import { useEffect, useState } from 'react'
import { Bell, Check, Trash2, MailOpen } from 'lucide-react'
import { notificationsAPI } from '../../api/services'
import { formatDateTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationsAPI.getAll()
      setNotifications(res.data)
    } catch (err) {
      toast.error('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications(
        notifications.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
      toast.success('Notification marked as read.')
    } catch (err) {
      toast.error('Failed to update notification.')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read!')
    } catch (err) {
      toast.error('Failed to update notifications.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 skeleton" />
        <div className="h-48 skeleton" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Stay updated with your slot bookings and charging sessions
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-outline btn-sm flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card p-4 flex gap-4 text-left border ${
                n.is_read
                  ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  : 'bg-primary-50/20 dark:bg-primary-900/10 border-primary-500/20 shadow-sm'
              }`}
            >
              <div className={`p-2.5 rounded-xl h-fit ${
                n.is_read
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              }`}>
                <Bell className="w-4.5 h-4.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`text-sm font-bold truncate ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDateTime(n.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {n.message}
                </p>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-[11px] text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold mt-2.5 flex items-center gap-1"
                  >
                    <MailOpen className="w-3.5 h-3.5" /> Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg dark:text-white">No notifications</h3>
          <p className="text-sm text-gray-500 mt-1">We'll notify you about your bookings and events here.</p>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
