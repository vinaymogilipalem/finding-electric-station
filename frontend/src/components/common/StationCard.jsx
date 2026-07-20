// ============================================================
// StationCard — displays a charging station in a card format
// Used in the stations list and favorites pages
// ============================================================
import { Link } from 'react-router-dom'
import { MapPin, Zap, Star, ExternalLink, Heart } from 'lucide-react'
import { getChargerTypeColor, truncate } from '../../utils/helpers'

const StationCard = ({ station, isFavorite, onToggleFavorite }) => {
  // Determine overall availability label
  const availableCount = station.chargers?.filter(c => c.status === 'available').length || 0
  const totalCount = station.chargers?.length || 0

  return (
    <div className="card-hover group overflow-hidden">
      {/* Station Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary-500/20 to-electric-500/20 overflow-hidden">
        {station.image_url ? (
          <img
            src={station.image_url}
            alt={station.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap className="w-12 h-12 text-primary-400 opacity-50" />
          </div>
        )}

        {/* Availability badge */}
        <div className={`absolute top-3 left-3 badge ${availableCount > 0 ? 'badge-success' : 'badge-danger'}`}>
          {availableCount > 0 ? `${availableCount} Available` : 'All Occupied'}
        </div>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite(station.id) }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        )}
      </div>

      {/* Station Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
          {station.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>{truncate(`${station.area}, ${station.city}`, 40)}</span>
        </div>

        {/* Charger types */}
        {station.chargers && station.chargers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[...new Set(station.chargers.map(c => c.charger_type))].map(type => (
              <span
                key={type}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getChargerTypeColor(type)}`}
              >
                {type.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {totalCount} charger{totalCount !== 1 ? 's' : ''}
          </span>
          {station.avg_rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {Number(station.avg_rating).toFixed(1)}
            </span>
          )}
          {station.chargers?.[0]?.price_per_kwh && (
            <span>₹{station.chargers[0].price_per_kwh}/kWh</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            to={`/stations/${station.id}`}
            className="btn-primary btn-sm flex-1 text-center"
          >
            View Details
          </Link>
          <a
            href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline btn-sm px-2"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default StationCard
