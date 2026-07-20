import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, MapPin, CheckCircle, ExternalLink, Zap } from 'lucide-react'
import { stationsAPI } from '../../api/services'
import toast from 'react-hot-toast'

const ManageStationsPage = () => {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: 'Bangalore', area: '',
    latitude: '', longitude: '', operating_hours: '6:00 AM - 10:00 PM',
    amenities: 'WiFi,Parking,Restroom', image_url: '', is_active: true
  })

  const fetchStations = async () => {
    try {
      setLoading(true)
      const res = await stationsAPI.getAll()
      setStations(res.data.items || res.data)
    } catch (err) {
      toast.error('Failed to load stations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  const openAddModal = () => {
    setEditId(null)
    setFormData({
      name: '', description: '', address: '', city: 'Bangalore', area: '',
      latitude: '', longitude: '', operating_hours: '6:00 AM - 10:00 PM',
      amenities: 'WiFi,Parking,Restroom', image_url: '', is_active: true
    })
    setModalOpen(true)
  }

  const openEditModal = (station) => {
    setEditId(station.id)
    setFormData({
      name: station.name || '',
      description: station.description || '',
      address: station.address || '',
      city: station.city || 'Bangalore',
      area: station.area || '',
      latitude: station.latitude || '',
      longitude: station.longitude || '',
      operating_hours: station.operating_hours || '6:00 AM - 10:00 PM',
      amenities: station.amenities || '',
      image_url: station.image_url || '',
      is_active: station.is_active ?? true
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      }

      if (editId) {
        await stationsAPI.update(editId, payload)
        toast.success('Station updated successfully!')
      } else {
        await stationsAPI.create(payload)
        toast.success('Station added successfully!')
      }

      setModalOpen(false)
      fetchStations()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save station.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this station? All related chargers and bookings will be deleted.')) return
    try {
      await stationsAPI.delete(id)
      toast.success('Station deleted successfully.')
      fetchStations()
    } catch (err) {
      toast.error('Failed to delete station.')
    }
  }

  if (loading && stations.length === 0) {
    return (
      <div className="space-y-4 animate-pulse text-left">
        <div className="h-10 w-48 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Stations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Add new charging stations, update descriptions, and manage operational state
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary btn-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Station
        </button>
      </div>

      {/* Station Grid list */}
      <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Station Details</th>
                <th>Location Details</th>
                <th>Operating Hours</th>
                <th>Chargers Count</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-gray-900 dark:text-white">{s.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{s.address}</span>
                    </div>
                  </td>
                  <td>{s.area}, {s.city}</td>
                  <td>{s.operating_hours || '24 Hours'}</td>
                  <td>
                    <span className="badge badge-info">
                      {s.charger_count ?? s.chargers?.length ?? 0} Chargers
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {s.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(s)}
                        className="btn-outline btn-sm p-1.5"
                        title="Edit Station details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="btn-outline border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 btn-sm p-1.5"
                        title="Delete Station"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-xl p-6 bg-white dark:bg-gray-900 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <h3 className="font-bold text-lg mb-4 dark:text-white">
              {editId ? 'Edit Charging Station' : 'Add Charging Station'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Station Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., Koramangala Hub"
                  />
                </div>
                <div>
                  <label className="label">Area</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="E.g., Sector 3"
                  />
                </div>
              </div>

              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Operating Hours</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    placeholder="E.g., 24 Hours or 6:00 AM - 10:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="input"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="E.g., 12.9352"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="input"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="E.g., 77.6245"
                  />
                </div>
              </div>

              <div>
                <label className="label">Amenities (Comma separated)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi, Cafe, Restroom, Security..."
                />
              </div>

              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  className="input"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Https://..."
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  className="input scrollbar-thin"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief station details..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Station is Active</label>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline btn-sm px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm px-6"
                >
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageStationsPage
