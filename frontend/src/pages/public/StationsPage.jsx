import { useEffect, useState } from 'react'
import { MapPin, Search, Filter, ShieldAlert, Heart } from 'lucide-react'
import { stationsAPI, favoritesAPI } from '../../api/services'
import StationCard from '../../components/common/StationCard'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const StationsPage = () => {
  const { isAuthenticated } = useAuth()
  const [stations, setStations] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [chargerType, setChargerType] = useState('')
  const [connectorType, setConnectorType] = useState('')

  // Unique list of cities and connectors in Bangalore and Hyderabad areas for filters
  const cities = ['Bangalore', 'Hyderabad']
  const chargerTypes = ['AC_SLOW', 'AC_FAST', 'DC_FAST']
  const connectorTypes = ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla']

  const fetchStations = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.q = search
      if (city) params.city = city
      if (chargerType) params.charger_type = chargerType

      const res = await stationsAPI.getAll(params)
      let items = Array.isArray(res.data) ? res.data : (res.data.items || [])

      // Client-side connector filtering if specified
      if (connectorType) {
        items = items.filter(station =>
          station.chargers?.some(c => c.connector_type === connectorType)
        )
      }

      setStations(items)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load stations.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!isAuthenticated) return
    try {
      const res = await favoritesAPI.getAll()
      setFavorites(res.data.map(f => f.station_id))
    } catch (err) {
      console.error('Error fetching favorites:', err)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [search, city, chargerType, connectorType])

  useEffect(() => {
    fetchFavorites()
  }, [isAuthenticated])

  const handleToggleFavorite = async (stationId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add to favorites.')
      return
    }

    const isFav = favorites.includes(stationId)
    try {
      if (isFav) {
        await favoritesAPI.remove(stationId)
        setFavorites(favorites.filter(id => id !== stationId))
        toast.success('Removed from favorites.')
      } else {
        await favoritesAPI.add(stationId)
        setFavorites([...favorites, stationId])
        toast.success('Added to favorites!')
      }
    } catch (err) {
      toast.error('Failed to update favorite status.')
    }
  }

  return (
    <div className="container-xl py-8 px-4 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charging Stations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Discover nearby EV charging stations and book a session
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-5 mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search query */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search station, area..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* City Filter */}
          <select
            className="select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Charger Type Filter */}
          <select
            className="select"
            value={chargerType}
            onChange={(e) => setChargerType(e.target.value)}
          >
            <option value="">All Charger Types</option>
            {chargerTypes.map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Connector Type Filter */}
          <select
            className="select"
            value={connectorType}
            onChange={(e) => setConnectorType(e.target.value)}
          >
            <option value="">All Connector Types</option>
            {connectorTypes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 skeleton rounded-xl" />
          ))}
        </div>
      ) : stations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isFavorite={favorites.includes(station.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card max-w-md mx-auto">
          <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg dark:text-white">No stations found</h3>
          <p className="text-sm text-gray-500 mt-1">Try refining your search keywords or filters.</p>
        </div>
      )}
    </div>
  )
}

export default StationsPage
