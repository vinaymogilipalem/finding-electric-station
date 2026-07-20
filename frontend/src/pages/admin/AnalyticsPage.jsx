import { useEffect, useState } from 'react'
import { BarChart2, TrendingUp, Zap, Calendar, Users, Activity } from 'lucide-react'
import { analyticsAPI } from '../../api/services'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import toast from 'react-hot-toast'

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState([])
  const [bookingsTrend, setBookingsTrend] = useState([])
  const [chargerTypes, setChargerTypes] = useState([])
  const [userGrowth, setUserGrowth] = useState([])
  const [period, setPeriod] = useState('daily')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const [revRes, trendRes, typeRes, growthRes] = await Promise.all([
          analyticsAPI.getRevenue(period),
          analyticsAPI.getBookingsTrend(),
          analyticsAPI.getChargerTypes(),
          analyticsAPI.getUserGrowth(),
        ])

        setRevenueData(revRes.data)
        setBookingsTrend(trendRes.data)
        setChargerTypes(typeRes.data)
        setUserGrowth(growthRes.data)
      } catch (err) {
        toast.error('Failed to load detailed analytics.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Analyze historical revenue, user growth trends, and device usage
          </p>
        </div>

        <select
          className="select max-w-[150px]"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Revenue Growth Chart
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: revenueData.map(p => p.date),
                datasets: [{ label: 'Revenue (₹)', data: revenueData.map(p => p.amount), backgroundColor: '#10b981', borderRadius: 6 }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* User Growth */}
        <div className="card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> User Registrations Trend
          </h3>
          <div className="h-64">
            <Line
              data={{
                labels: userGrowth.map(p => p.date),
                datasets: [{ label: 'New Registrations', data: userGrowth.map(p => p.count), borderColor: '#3b82f6', tension: 0.3, fill: true, backgroundColor: 'rgba(59, 130, 246, 0.05)' }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Bookings */}
        <div className="card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" /> Bookings counts
          </h3>
          <div className="h-64">
            <Line
              data={{
                labels: bookingsTrend.map(p => p.date),
                datasets: [{ label: 'Bookings Count', data: bookingsTrend.map(p => p.count), borderColor: '#f59e0b', tension: 0.3, fill: true, backgroundColor: 'rgba(245, 158, 11, 0.05)' }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Charger distribution */}
        <div className="card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" /> Connector Type Share
          </h3>
          <div className="h-64 relative flex justify-center items-center">
            {chargerTypes.length > 0 ? (
              <Doughnut
                data={{
                  labels: chargerTypes.map(c => c.charger_type.replace('_', ' ')),
                  datasets: [{ data: chargerTypes.map(c => c.count), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            ) : (
              <p className="text-sm text-gray-500">No charger usage logged yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
