import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, Zap, Star, Shield, ExternalLink,
  MessageSquare, Trash2, Heart
} from 'lucide-react'
import { stationsAPI, favoritesAPI, reviewsAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { getChargerTypeColor, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

const StationDetailPage = () => {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchStationDetails = async () => {
    try {
      setLoading(true)
      const res = await stationsAPI.getById(id)
      setStation(res.data)

      // Check favorite
      if (isAuthenticated) {
        const favsRes = await favoritesAPI.getAll()
        setIsFavorite(favsRes.data.some(f => f.station_id === Number(id)))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load station details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStationDetails()
  }, [id, isAuthenticated])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to favorites.')
      return
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(id)
        setIsFavorite(false)
        toast.success('Removed from favorites.')
      } else {
        await favoritesAPI.add(id)
        setIsFavorite(true)
        toast.success('Added to favorites!')
      }
    } catch (err) {
      toast.error('Failed to update favorite.')
    }
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to write a review.')
      return
    }

    setSubmittingReview(true)
    try {
      await reviewsAPI.create(id, { rating: reviewRating, comment: reviewComment })
      toast.success('Thank you for your review!')
      setReviewComment('')
      setReviewRating(5)
      fetchStationDetails()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await reviewsAPI.delete(reviewId)
      toast.success('Review deleted.')
      fetchStationDetails()
    } catch (err) {
      toast.error('Failed to delete review.')
    }
  }

  if (loading) {
    return (
      <div className="container-xl py-8 px-4 animate-pulse space-y-6">
        <div className="h-64 skeleton rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-80 skeleton lg:col-span-2" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="container-xl py-12 px-4 text-center">
        <h2 className="text-xl font-bold dark:text-white">Station not found</h2>
        <Link to="/stations" className="text-primary-600 font-medium text-sm mt-2 inline-block">Back to search</Link>
      </div>
    )
  }

  // Calculate average rating
  const avgRating = station.reviews?.length
    ? (station.reviews.reduce((sum, r) => sum + r.rating, 0) / station.reviews.length).toFixed(1)
    : 'N/A'

  return (
    <div className="container-xl py-8 px-4 text-left">
      {/* Cover / Image Header */}
      <div className="relative h-64 md:h-80 rounded-2xl bg-gradient-to-br from-primary-500/20 to-electric-500/20 overflow-hidden mb-8 shadow-sm">
        {station.image_url ? (
          <img src={station.image_url} alt={station.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-400 opacity-60">
            <Zap className="w-20 h-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{station.name}</h1>
            <p className="text-sm text-gray-200 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {station.address}, {station.area}, {station.city}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggleFavorite}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-colors"
              title="Add to Favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <a
              href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Navigate
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Overview, Chargers list, reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Station description & details */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {station.description || 'No description available for this charging station.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <div>
                  <span className="font-semibold block">Operating Hours</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{station.operating_hours || '24 Hours'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <div>
                  <span className="font-semibold block">Ratings</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{avgRating} ({station.reviews?.length || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {station.amenities && (
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-2.5">Available Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {station.amenities.split(',').map(am => (
                    <span key={am} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-lg text-gray-700 dark:text-gray-300">
                      {am.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chargers List */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Chargers</h2>
              {isAuthenticated && (
                <Link to={`/book/${station.id}`} className="btn-primary btn-sm">
                  Book Slot Now
                </Link>
              )}
            </div>

            {station.chargers && station.chargers.length > 0 ? (
              <div className="space-y-4">
                {station.chargers.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-sm transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getChargerTypeColor(c.charger_type)}`}>
                          {c.charger_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold dark:text-white">{c.connector_type}</span>
                        <span className="text-xs text-gray-400">({c.power_kw} kW)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Price per kWh: {formatCurrency(c.price_per_kwh)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`badge ${c.status === 'available' ? 'badge-success' : c.status === 'occupied' ? 'badge-danger' : 'badge-warning'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No chargers set up at this station yet.</p>
            )}
          </div>

          {/* Reviews list */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reviews & Feedbacks</h2>

            {/* List */}
            {station.reviews && station.reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                {station.reviews.map((r, index) => (
                  <div key={r.id} className={`pt-4 text-left ${index === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white text-xs font-bold">
                          {r.user?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs dark:text-white">{r.user?.full_name || 'Anonymous User'}</h4>
                          <span className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-yellow-500 text-xs">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        {(user?.id === r.user_id || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2.5 leading-relaxed">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>

        {/* Right column: Write a review or Book details summary */}
        <div className="space-y-6">
          {/* Booking call-out */}
          <div className="card p-6 bg-gradient-to-br from-primary-900 to-electric-950 text-white border-none shadow-md">
            <Zap className="w-8 h-8 text-primary-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Need a charge?</h3>
            <p className="text-xs text-primary-200 mb-6 leading-relaxed">
              Ensure you get immediate access. Book a slot at this station. Conflict detection prevents double reservations.
            </p>
            {isAuthenticated ? (
              <Link to={`/book/${station.id}`} className="btn bg-white hover:bg-gray-100 text-primary-900 w-full py-2.5 rounded-xl font-semibold text-center transition-colors">
                Book Slot Now
              </Link>
            ) : (
              <Link to="/login" className="btn bg-white hover:bg-gray-100 text-primary-900 w-full py-2.5 rounded-xl font-semibold text-center transition-colors">
                Login to Book Slot
              </Link>
            )}
          </div>

          {/* Review form */}
          {isAuthenticated && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-4 dark:text-white">Write a Review</h3>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="label">Rating</label>
                  <select
                    className="select"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Terrible)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Comment</label>
                  <textarea
                    rows={4}
                    required
                    className="input"
                    placeholder="Describe your charging experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary w-full py-2 flex items-center justify-center gap-1.5"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StationDetailPage
