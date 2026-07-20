import { Link } from 'react-router-dom'
import { Zap, MapPin, Calendar, Clock, Star, Shield, ArrowRight, Activity, Users } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-primary-900/10 via-electric-900/5 to-transparent">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold w-fit">
              <Zap className="w-4 h-4 text-primary-500 animate-bounce" />
              Powering Your Green Journey
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Discover & Book <br />
              <span className="text-gradient">EV Charging Slots</span> <br />
              Instantly
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
              Find nearby electric vehicle charging stations, check real-time connector availability, and book your slot in seconds. No more waiting queues.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/stations" className="btn-primary btn-lg">
                Find Stations <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-outline btn-lg">
                Join Platform
              </Link>
            </div>
          </div>
          {/* Hero Visual Mockup */}
          <div className="relative flex justify-center items-center">
            <div className="w-full max-w-lg aspect-square bg-gradient-to-tr from-primary-500 to-electric-600 rounded-3xl opacity-10 blur-3xl absolute animate-pulse-slow" />
            <div className="card p-6 shadow-2xl relative border-primary-500/20 max-w-md w-full bg-white dark:bg-gray-900 animate-slide-up">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="badge badge-success mb-2">Available Now</span>
                  <h3 className="font-bold text-lg dark:text-white">GreenCharge Koramangala</h3>
                  <p className="text-xs text-gray-500">80 Feet Road, Bangalore</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-current" /> 4.9
                </div>
              </div>
              <div className="divider" />
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Fast Charger (CCS)</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">50 kW</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Connector Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> Available
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Price per kWh</span>
                  <span className="font-semibold">₹18.00 / kWh</span>
                </div>
              </div>
              <Link to="/stations" className="btn-primary w-full text-center py-2.5 rounded-xl font-medium">
                Book Charger Slot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl font-bold md:text-4xl dark:text-white">Why Choose EV ChargeHub?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              The smartest and most comprehensive platform designed specifically for electric vehicle owners and station operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 hover:shadow-lg transition-shadow flex flex-col gap-4 text-left">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold dark:text-white">Smart Location Search</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Filter charging stations by city, connector type, charging speed, pricing, and availability. Find the best match for your car.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 hover:shadow-lg transition-shadow flex flex-col gap-4 text-left">
              <div className="w-12 h-12 bg-electric-100 dark:bg-electric-900/30 text-electric-600 dark:text-electric-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold dark:text-white">Guaranteed Slot Booking</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Reserve charging slots in advance. Our smart double-booking prevention ensures that your selected charger is reserved just for you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 hover:shadow-lg transition-shadow flex flex-col gap-4 text-left">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold dark:text-white">Detailed Charging History</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Track your energy consumption (kWh), duration of charging, and total money spent. Get detailed analytics on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-electric-600 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-1">50+</h3>
            <p className="text-xs text-primary-100 uppercase tracking-wider font-semibold">Active Stations</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-1">200+</h3>
            <p className="text-xs text-primary-100 uppercase tracking-wider font-semibold">Fast Chargers</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-1">10,000+</h3>
            <p className="text-xs text-primary-100 uppercase tracking-wider font-semibold">Slots Booked</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-1">4.8★</h3>
            <p className="text-xs text-primary-100 uppercase tracking-wider font-semibold">Average Rating</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
