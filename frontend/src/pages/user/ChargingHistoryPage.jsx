import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Zap, DollarSign, MapPin, AlertCircle } from 'lucide-react'
import { historyAPI } from '../../api/services'
import { formatDate, formatCurrency, formatEnergy, formatDuration } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ChargingHistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const res = await historyAPI.getAll()
        setHistory(res.data)
      } catch (err) {
        toast.error('Failed to load charging history.')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charging History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Detailed log of your past electric vehicle charging sessions
        </p>
      </div>

      {history.length > 0 ? (
        <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Station</th>
                  <th>Charger Connector</th>
                  <th>Duration</th>
                  <th>Energy Delivered</th>
                  <th>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap">{formatDate(h.started_at)}</td>
                    <td className="font-semibold text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{h.station?.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3" /> {h.station?.address}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {h.charger?.connector_type}
                      </span>
                    </td>
                    <td>{formatDuration(h.duration_minutes)}</td>
                    <td className="text-primary-600 dark:text-primary-400 font-semibold">{formatEnergy(h.energy_kwh)}</td>
                    <td className="font-bold text-gray-900 dark:text-white">{formatCurrency(h.amount_paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 card max-w-md mx-auto">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg dark:text-white">No history found</h3>
          <p className="text-sm text-gray-500 mt-1">Completed charging sessions will appear here.</p>
        </div>
      )}
    </div>
  )
}

export default ChargingHistoryPage
