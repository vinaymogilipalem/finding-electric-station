import { useEffect, useState } from 'react'
import { Heart, ShieldAlert } from 'lucide-react'
import { favoritesAPI } from '../../api/services'
import StationCard from '../../components/common/StationCard'
import toast from 'react-hot-toast'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await favoritesAPI.getAll()
      setFavorites(res.data)
    } catch (err) {
      toast.error('Failed to load favorites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleRemoveFavorite = async (stationId) => {
    try {
      await favoritesAPI.remove(stationId)
      setFavorites(favorites.filter(f => f.station_id !== stationId))
      toast.success('Removed from favorites.')
    } catch (err) {
      toast.error('Failed to remove from favorites.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Favorite Stations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Quick access to your preferred charging locations
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <StationCard
              key={fav.id}
              station={fav.station}
              isFavorite={true}
              onToggleFavorite={() => handleRemoveFavorite(fav.station_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card max-w-md mx-auto">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg dark:text-white">No favorites yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add stations to your favorites for quick booking access.</p>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
