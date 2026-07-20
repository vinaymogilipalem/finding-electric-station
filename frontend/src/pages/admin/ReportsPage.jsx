import { useEffect, useState } from 'react'
import { FileText, Download, Calendar } from 'lucide-react'
import { historyAPI, bookingsAPI } from '../../api/services'
import { formatDate, formatCurrency, formatEnergy, formatDuration } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ReportsPage = () => {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [reportType, setReportType] = useState('history') // history or bookings

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true)
        if (reportType === 'history') {
          const res = await historyAPI.getAll()
          setSessions(res.data)
        } else {
          const res = await bookingsAPI.getAll({ all: 'true' })
          setSessions(res.data)
        }
      } catch (err) {
        toast.error('Failed to load report data.')
      } finally {
        setLoading(false)
      }
    }
    fetchReportData()
  }, [reportType])

  const handleExport = () => {
    // Generate CSV string
    let headers = []
    let rows = []

    if (reportType === 'history') {
      headers = ['Session ID', 'Date', 'User Email', 'Station Name', 'Connector', 'Duration (min)', 'Energy (kWh)', 'Amount Paid']
      rows = sessions.map(s => [
        s.id,
        s.started_at ? new Date(s.started_at).toLocaleDateString() : 'N/A',
        s.user?.email || 'N/A',
        s.station?.name || 'N/A',
        s.charger?.connector_type || 'N/A',
        s.duration_minutes,
        s.energy_kwh,
        s.amount_paid
      ])
    } else {
      headers = ['Booking ID', 'Ref Code', 'Date', 'User Email', 'Station Name', 'Slot Time', 'Total Amount', 'Status']
      rows = sessions.map(b => [
        b.id,
        b.booking_ref,
        b.booking_date,
        b.user?.email || 'N/A',
        b.station?.name || 'N/A',
        `${b.start_time}-${b.end_time}`,
        b.total_amount,
        b.status
      ])
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report CSV downloaded successfully!')
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Export structured database tables as CSV files for spreadsheet parsing
          </p>
        </div>

        <div className="flex gap-3">
          <select
            className="select max-w-[200px]"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="history">Completed Sessions</option>
            <option value="bookings">All Booking Logs</option>
          </select>

          <button onClick={handleExport} className="btn-primary btn-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        {loading ? (
          <div className="p-8 animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 skeleton" />)}
          </div>
        ) : sessions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                {reportType === 'history' ? (
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Station</th>
                    <th>Duration</th>
                    <th>Energy (kWh)</th>
                    <th>Amount Paid</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Ref Code</th>
                    <th>User</th>
                    <th>Station</th>
                    <th>Schedule</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {reportType === 'history' ? (
                  sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{formatDate(s.started_at)}</td>
                      <td>{s.user?.email || 'User'}</td>
                      <td>{s.station?.name}</td>
                      <td>{formatDuration(s.duration_minutes)}</td>
                      <td>{formatEnergy(s.energy_kwh)}</td>
                      <td className="font-bold">{formatCurrency(s.amount_paid)}</td>
                    </tr>
                  ))
                ) : (
                  sessions.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono font-semibold">{b.booking_ref}</td>
                      <td>{b.user?.email || 'User'}</td>
                      <td>{b.station?.name}</td>
                      <td>{b.booking_date} ({b.start_time}-{b.end_time})</td>
                      <td className="font-bold">{formatCurrency(b.total_amount)}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'completed' ? 'badge-info' : b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No report records found for this period.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
