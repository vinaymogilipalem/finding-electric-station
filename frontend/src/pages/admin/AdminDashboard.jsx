import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, MapPin, Zap, Calendar, DollarSign, Activity, TrendingUp,
  Clock, ShieldAlert, Award
} from 'lucide-react'
import { analyticsAPI } from '../../api/services'
import { formatCurrency } from '../../utils/helpers'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js'
import toast from 'react-hot-toast'

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
)

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [bookingsTrend, setBookingsTrend] = useState([])
  const [popularStations, setPopularStations] = useState([])
  const [chargerTypes, setChargerTypes] = useState([])
  const [userGrowth, setUserGrowth] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [sumRes, revRes, trendRes, popRes, typeRes, growthRes] = await Promise.all([
          analyticsAPI.getSummary(),
          analyticsAPI.getRevenue('daily'),
          analyticsAPI.getBookingsTrend(),
          analyticsAPI.getPopularStations(),
          analyticsAPI.getChargerTypes(),
          analyticsAPI.getUserGrowth(),
        ])

        setSummary(sumRes.data)
        setRevenueData(revRes.data)
        setBookingsTrend(trendRes.data)
        setPopularStations(popRes.data)
        setChargerTypes(typeRes.data)
        setUserGrowth(growthRes.data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load admin analytics.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    )
  }

  // ── Charts config ──

  // Bookings daily trend line chart
  const bookingsChartData = {
    labels: bookingsTrend.map(p => p.date),
    datasets: [
      {
        label: 'Bookings Count',
        data: bookingsTrend.map(p => p.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ]
  }

  // Daily revenue bar chart
  const revenueChartData = {
    labels: revenueData.map(p => p.date),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueData.map(p => p.amount),
        backgroundColor: '#22c55e',
        borderRadius: 6,
      }
    ]
  }

  // Charger types doughnut chart
  const chargersChartData = {
    labels: chargerTypes.map(c => c.charger_type.replace('_', ' ')),
    datasets: [
      {
        data: chargerTypes.map(c => c.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 1,
      }
    ]
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Comprehensive system analytics, charger states, and revenue tracking
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold dark:text-white">{summary?.total_users}</h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stations */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Total Stations</p>
            <h3 className="text-2xl font-bold dark:text-white">{summary?.total_stations}</h3>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Available / Occupied Chargers */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Chargers State</p>
            <h3 className="text-lg font-bold dark:text-white">
              {summary?.available_chargers} <span className="text-green-500 text-xs">Avail</span> / {summary?.occupied_chargers} <span className="text-red-500 text-xs">Occ</span>
            </h3>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold dark:text-white">{formatCurrency(summary?.total_revenue)}</h3>
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Trend */}
        <div className="card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Daily Bookings Trend
          </h3>
          <div className="h-64">
            <Line
              data={bookingsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
              }}
            />
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Daily Revenue (₹)
          </h3>
          <div className="h-64">
            <Bar
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
      </div>

      {/* popular stations and charger types distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular stations */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Popular Stations (by reservation counts)
          </h3>
          <div className="space-y-4">
            {popularStations.length > 0 ? (
              popularStations.map((station, index) => (
                <div key={station.station_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-gray-400">#{index + 1}</span>
                    <h4 className="font-semibold text-sm dark:text-white">{station.station_name}</h4>
                  </div>
                  <span className="badge badge-info">{station.booking_count} bookings</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No bookings logged yet.</p>
            )}
          </div>
        </div>

        {/* Charger types distribution */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-4 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> Charger Types Distribution
            </h3>
            <div className="h-48 relative flex justify-center items-center">
              {chargerTypes.length > 0 ? (
                <Doughnut
                  data={chargersChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <p className="text-xs text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
