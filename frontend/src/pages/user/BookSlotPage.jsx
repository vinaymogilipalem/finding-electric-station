import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Clock, Zap, DollarSign, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import { stationsAPI, bookingsAPI } from '../../api/services'
import { formatCurrency, generateTimeSlots, getTodayDate, getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const BookSlotPage = () => {
  const { id: stationId } = useParams()
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChargerId, setSelectedChargerId] = useState('')
  const [date, setDate] = useState(getTodayDate())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  const timeSlots = generateTimeSlots()

  useEffect(() => {
    const fetchStation = async () => {
      try {
        setLoading(true)
        const res = await stationsAPI.getById(stationId)
        setStation(res.data)
        
        // Auto-select first available charger if any
        const avail = res.data.chargers?.find(c => c.status === 'available')
        if (avail) {
          setSelectedChargerId(String(avail.id))
        } else if (res.data.chargers?.length > 0) {
          setSelectedChargerId(String(res.data.chargers[0].id))
        }
      } catch (err) {
        toast.error('Failed to load station details.')
      } finally {
        setLoading(false)
      }
    }
    fetchStation()
  }, [stationId])

  const selectedCharger = station?.chargers?.find(c => String(c.id) === selectedChargerId)

  // Calculate estimated total price
  const calculateTotal = () => {
    if (!selectedCharger) return 0
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMins = startH * 60 + startM
    const endMins = endH * 60 + endM
    
    if (endMins <= startMins) return 0
    const hours = (endMins - startMins) / 60
    return hours * selectedCharger.price_per_kwh
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    setError('')

    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    if ((endH * 60 + endM) <= (startH * 60 + startM)) {
      setError('End time must be after start time.')
      return
    }

    setBookingLoading(true)
    try {
      await bookingsAPI.create({
        station_id: Number(stationId),
        charger_id: Number(selectedChargerId),
        booking_date: date,
        start_time: startTime,
        end_time: endTime
      })
      toast.success('Charging slot booked successfully!')
      navigate('/bookings')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container-xl py-8 px-4 animate-pulse space-y-6">
        <div className="h-10 w-48 skeleton" />
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    )
  }

  if (!station) {
    return (
      <div className="container-xl py-8 px-4 text-center">
        <h2 className="text-xl font-bold dark:text-white">Station not found</h2>
        <Link to="/stations" className="text-primary-600 mt-2 inline-block">Back to search</Link>
      </div>
    )
  }

  const totalAmount = calculateTotal()

  return (
    <div className="container-xl py-8 px-4 text-left">
      <Link to={`/stations/${stationId}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Station Details
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Charging Slot</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-8">
        Reserve a charger at <strong className="text-gray-700 dark:text-gray-300">{station.name}</strong>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 card p-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 mb-4 leading-normal">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-6">
            {/* Charger selection */}
            <div>
              <label className="label">Select Charger / Connector</label>
              <select
                className="select"
                value={selectedChargerId}
                onChange={(e) => setSelectedChargerId(e.target.value)}
                required
              >
                {station.chargers?.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.connector_type} ({c.charger_type.replace('_', ' ')} - {c.power_kw}kW) - {formatCurrency(c.price_per_kwh)}/kWh - Status: {c.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Date selection */}
            <div>
              <label className="label">Charging Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  required
                  min={getTodayDate()}
                  className="input pl-10"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Time windows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Clock className="w-4 h-4" />
                  </span>
                  <select
                    className="select pl-10"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">End Time</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Clock className="w-4 h-4" />
                  </span>
                  <select
                    className="select pl-10"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading || !selectedChargerId}
              className="btn-primary w-full py-2.5 rounded-xl font-medium mt-4 flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Confirm & Book Slot
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Pricing Summary */}
        <div className="card p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-base mb-4 dark:text-white">Reservation Summary</h3>
          {selectedCharger ? (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Connector Type</span>
                <span className="font-semibold dark:text-white">{selectedCharger.connector_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Power Rating</span>
                <span className="font-semibold dark:text-white">{selectedCharger.power_kw} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Rate</span>
                <span className="font-semibold dark:text-white">{formatCurrency(selectedCharger.price_per_kwh)} / kWh</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimated Total Price</span>
                <span className="font-extrabold text-primary-600 dark:text-primary-400">
                  {totalAmount > 0 ? formatCurrency(totalAmount) : 'N/A'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal mt-4">
                * Note: The final price is calculated based on actual energy consumed (kWh) during the charging session.
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Please select a charger to view summary.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookSlotPage
