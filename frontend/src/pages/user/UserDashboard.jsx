import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Calendar, Clock, DollarSign, Activity, Bell, Heart,
  AlertCircle, ChevronRight, MapPin, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { stationsAPI, bookingsAPI, historyAPI, notificationsAPI, favoritesAPI } from '../../api/services'
import { formatCurrency, formatEnergy, formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const UserDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ moneySpent: 0, energyConsumed: 0 })
  const [upcomingBooking, setUpcomingBooking] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [nearbyStations, setNearbyStations] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // 1. Fetch bookings to find upcoming
        const bookingsRes = await bookingsAPI.getAll()
        const activeBookings = bookingsRes.data.filter(
          b => b.status === 'confirmed' || b.status === 'pending'
        )
        if (activeBookings.length > 0) {
          // Sort by date/time ascending and get first
          activeBookings.sort((a, b) => {
            const dateA = new Date(`${a.booking_date}T${a.start_time}`)
            const dateB = new Date(`${b.booking_date}T${b.start_time}`)
            return dateA - dateB
          })
          setUpcomingBooking(activeBookings[0])
        }

        // 2. Fetch charging history for stats and recent sessions
        const historyRes = await historyAPI.getAll()
        const historyData = historyRes.data
        setRecentSessions(historyData.slice(0, 3))

        // Calculate totals
        const totalMoney = historyData.reduce((sum, item) => sum + (item.amount_paid || 0), 0)
        const totalEnergy = historyData.reduce((sum, item) => sum + (item.energy_kwh || 0), 0)
        setStats({ moneySpent: totalMoney, energyConsumed: totalEnergy })

        // 3. Fetch favorites
        const favsRes = await favoritesAPI.getAll()
        setFavorites(favsRes.data.slice(0, 3))

        // 4. Fetch notifications
        const notifRes = await notificationsAPI.getAll()
        setNotifications(notifRes.data.slice(0, 4))

        // 5. Fetch stations to show as nearby
        const stationsRes = await stationsAPI.getAll({ limit: 3 })
        setNearbyStations(Array.isArray(stationsRes.data) ? stationsRes.data : (stationsRes.data.items || []))

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        toast.error('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 skeleton lg:col-span-2" />
          <div className="h-64 skeleton" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.full_name || user?.username}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here is a summary of your electric vehicle charging activity.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Money spent */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Money Spent</p>
            <h3 className="text-2xl font-bold dark:text-white">{formatCurrency(stats.moneySpent)}</h3>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Energy consumed */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Energy Consumed</p>
            <h3 className="text-2xl font-bold dark:text-white">{formatEnergy(stats.energyConsumed)}</h3>
          </div>
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Active bookings */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Upcoming Bookings</p>
            <h3 className="text-2xl font-bold dark:text-white">{upcomingBooking ? 1 : 0}</h3>
          </div>
          <div className="p-3 bg-electric-100 dark:bg-electric-900/30 text-electric-600 dark:text-electric-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Booking & Recent sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming booking card */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" /> Upcoming Reservation
            </h2>

            {upcomingBooking ? (
              <div className="p-4 rounded-xl border border-primary-500/20 bg-primary-50/30 dark:bg-primary-900/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm dark:text-white">
                    {upcomingBooking.station?.name || 'Charging Station'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{upcomingBooking.station?.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(upcomingBooking.booking_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {upcomingBooking.start_time} - {upcomingBooking.end_time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusBadgeClass(upcomingBooking.status)}`}>
                    {upcomingBooking.status.toUpperCase()}
                  </span>
                  <Link
                    to={`/stations/${upcomingBooking.station_id}`}
                    className="btn-primary btn-sm rounded-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No upcoming bookings. Need a charge?</p>
                <Link to="/stations" className="text-primary-600 hover:text-primary-700 font-medium text-xs mt-1 inline-block">
                  Search stations now
                </Link>
              </div>
            )}
          </div>

          {/* Recent Charging Sessions */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-electric-500" /> Recent Charging Sessions
              </h2>
              <Link to="/history" className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentSessions.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Station</th>
                      <th>Duration</th>
                      <th>Energy</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((session) => (
                      <tr key={session.id}>
                        <td>{formatDate(session.started_at)}</td>
                        <td className="font-semibold">{session.station?.name || 'Station'}</td>
                        <td>{session.duration_minutes} mins</td>
                        <td className="text-primary-600 dark:text-primary-400 font-medium">{formatEnergy(session.energy_kwh)}</td>
                        <td className="font-bold">{formatCurrency(session.amount_paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No charging history found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets (Favorites, Notifications) */}
        <div className="space-y-6">
          {/* Favorite Stations */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-current" /> Favorites
              </h2>
              <Link to="/favorites" className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div key={fav.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate dark:text-white">{fav.station?.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{fav.station?.area}, {fav.station?.city}</p>
                    </div>
                    <Link
                      to={`/stations/${fav.station_id}`}
                      className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-xs">No favorite stations added yet.</p>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" /> Notifications
              </h2>
              <Link to="/notifications" className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3.5">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 text-left">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 dark:text-white leading-tight">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-xs">No new notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
