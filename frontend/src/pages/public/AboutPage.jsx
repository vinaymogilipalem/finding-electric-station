import { Zap, HelpCircle, MapPin, Calendar, Clock } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="container-xl py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16 flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          About <span className="text-gradient">EV ChargeHub</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
          EV ChargeHub is India's leading EV charging station booking and management platform. We bridge the gap between EV owners and charging infrastructure, making electric mobility seamless, reliable, and stress-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="flex flex-col gap-4 text-left">
          <h2 className="text-2xl font-bold dark:text-white">Our Mission</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            We aim to accelerate the transition to sustainable energy by building the software backbone for the electric vehicle ecosystem. By optimizing charger utilization and offering a reliable slot-reservation model, we ensure EV drivers always have peace of mind when they travel.
          </p>
          <div className="divider" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Our Pillars</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-500" /> Reliable and up-to-date station status
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-500" /> Easy slot reservations without queues
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-500" /> Open API and future IoT charger integration
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-electric-500 rounded-2xl flex items-center justify-center text-white p-6 shadow-lg">
            <div className="text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <p className="font-bold text-xl">Connecting EV Drivers</p>
              <p className="text-xs text-primary-100 mt-2">Smart solutions for a clean green future.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-4xl mx-auto text-left">
        <h2 className="text-2xl font-bold mb-8 text-center dark:text-white">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-base">
              1
            </div>
            <h3 className="font-semibold dark:text-white">Discover Station</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Search by your location, area, connector speed, and filter by available chargers.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-base">
              2
            </div>
            <h3 className="font-semibold dark:text-white">Reserve Slot</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Select date, start and end time. Pay securely or choose to pay at the station.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-base">
              3
            </div>
            <h3 className="font-semibold dark:text-white">Plug & Charge</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Arrive at the slot time, plug in your vehicle, monitor charging logs on your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
