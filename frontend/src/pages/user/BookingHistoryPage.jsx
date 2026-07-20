import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, XCircle, AlertCircle } from 'lucide-react'
import { bookingsAPI } from '../../api/services'
import { formatDate, formatCurrency, getStatusBadgeClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await bookingsAPI.getAll()
      // Sort bookings: active/upcoming first, then past
      const sorted = res.data.sort((a, b) => {
        const dateA = new Date(`${a.booking_date}T${a.start_time}`)
        const dateB = new Date(`${b.booking_date}T${b.start_time}`)
        return dateB - dateA // Latest first
      })
      setBookings(sorted)
    } catch (err) {
      toast.error('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await bookingsAPI.cancel(id)
      toast.success('Booking cancelled successfully.')
      fetchBookings()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to cancel booking.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Manage your upcoming and past charger reservations
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isCancelable = booking.status === 'confirmed' || booking.status === 'pending'
            return (
              <div key={booking.id} className="card p-5 space-y-4 hover:shadow-md transition-shadow relative">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                      {booking.station?.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{booking.station?.address}</span>
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="divider" />

                {/* Details */}
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking Ref</span>
                    <span className="font-mono font-semibold">{booking.booking_ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Connector Type</span>
                    <span className="font-semibold">{booking.charger?.connector_type} ({booking.charger?.charger_type.replace('_', ' ')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date & Time</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(booking.booking_date)} at {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-semibold">{formatCurrency(booking.total_amount)}</span>
                  </div>
                </div>

                {/* Actions */}
                {isCancelable && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-danger btn-sm flex-1 justify-center rounded-lg py-2 flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Booking
                    </button>
                    <Link
                      to={`/stations/${booking.station_id}`}
                      className="btn-outline btn-sm justify-center rounded-lg py-2"
                    >
                      Station Info
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 card max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg dark:text-white">No bookings yet</h3>
          <p className="text-sm text-gray-500 mt-1">Book your first charging slot and start charging.</p>
          <Link to="/stations" className="btn-primary btn-sm mt-4 inline-block">Find Stations</Link>
        </div>
      )}
    </div>
  )
}

export default BookingHistoryPage
