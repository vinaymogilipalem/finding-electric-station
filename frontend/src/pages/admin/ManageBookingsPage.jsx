import { useEffect, useState } from 'react'
import { Calendar, Trash2, XCircle, Search, Clock, MapPin } from 'lucide-react'
import { bookingsAPI } from '../../api/services'
import { formatDate, formatCurrency, getStatusBadgeClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // Pass all=true to fetch all bookings from backend as admin
      const res = await bookingsAPI.getAll({ all: 'true' })
      setBookings(res.data)
    } catch (err) {
      toast.error('Failed to load bookings list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await bookingsAPI.cancel(id)
      toast.success('Booking cancelled successfully.')
      fetchBookings()
    } catch (err) {
      toast.error('Failed to cancel booking.')
    }
  }

  // Filter & Search logic
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus ? b.status === filterStatus : true
    const userEmail = b.user?.email || ''
    const userName = b.user?.full_name || ''
    const stationName = b.station?.name || ''
    const query = searchQuery.toLowerCase()
    const matchesSearch = query
      ? userEmail.toLowerCase().includes(query) ||
        userName.toLowerCase().includes(query) ||
        stationName.toLowerCase().includes(query)
      : true
    return matchesStatus && matchesSearch
  })

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-4 animate-pulse text-left">
        <div className="h-10 w-48 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Bookings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Monitor all reservation slots, transaction status, and cancel bookings
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search user email, name, or station..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings table */}
      <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        {filteredBookings.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>User Details</th>
                  <th>Station / Charger</th>
                  <th>Schedule</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const isCancelable = b.status === 'confirmed' || b.status === 'pending'
                  return (
                    <tr key={b.id}>
                      <td className="font-mono font-semibold">{b.booking_ref}</td>
                      <td>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-gray-900 dark:text-white">{b.user?.full_name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{b.user?.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-gray-900 dark:text-white">{b.station?.name}</span>
                          <span className="text-xs text-gray-400 font-normal">{b.charger?.connector_type} ({b.charger?.charger_type.replace('_', ' ')})</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col text-left text-xs">
                          <span>{formatDate(b.booking_date)}</span>
                          <span className="text-gray-400 font-normal">{b.start_time} - {b.end_time}</span>
                        </div>
                      </td>
                      <td className="font-bold text-gray-900 dark:text-white">{formatCurrency(b.total_amount)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right">
                        {isCancelable && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="btn-outline border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 btn-sm flex items-center gap-1 ml-auto"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-base dark:text-white">No bookings match</h3>
            <p className="text-xs text-gray-500 mt-1">Try changing filter parameters or search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageBookingsPage
