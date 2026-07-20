import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, Battery, RefreshCw, Zap } from 'lucide-react'
import { chargersAPI, stationsAPI } from '../../api/services'
import { formatCurrency, getChargerTypeColor, getStatusBadgeClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ManageChargersPage = () => {
  const [stations, setStations] = useState([])
  const [selectedStationId, setSelectedStationId] = useState('')
  const [chargers, setChargers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  const [formData, setFormData] = useState({
    charger_type: 'AC_FAST',
    connector_type: 'Type2',
    power_kw: 22.0,
    price_per_kwh: 12.0,
    status: 'available'
  })

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const res = await stationsAPI.getAll()
      const list = res.data.items || res.data
      setStations(list)
      if (list.length > 0) {
        setSelectedStationId(String(list[0].id))
      }
    } catch (err) {
      toast.error('Failed to load stations.')
    } finally {
      setLoading(false)
    }
  }

  const fetchChargers = async () => {
    if (!selectedStationId) return
    try {
      setLoading(true)
      const res = await chargersAPI.getByStation(selectedStationId)
      setChargers(res.data)
    } catch (err) {
      toast.error('Failed to load chargers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchChargers()
  }, [selectedStationId])

  const openAddModal = () => {
    setEditId(null)
    setFormData({
      charger_type: 'AC_FAST',
      connector_type: 'Type2',
      power_kw: 22.0,
      price_per_kwh: 12.0,
      status: 'available'
    })
    setModalOpen(true)
  }

  const openEditModal = (charger) => {
    setEditId(charger.id)
    setFormData({
      charger_type: charger.charger_type,
      connector_type: charger.connector_type,
      power_kw: charger.power_kw,
      price_per_kwh: charger.price_per_kwh,
      status: charger.status
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        station_id: Number(selectedStationId),
        power_kw: Number(formData.power_kw),
        price_per_kwh: Number(formData.price_per_kwh)
      }

      if (editId) {
        await chargersAPI.update(editId, payload)
        toast.success('Charger details updated!')
      } else {
        await chargersAPI.create(payload)
        toast.success('Charger added successfully!')
      }

      setModalOpen(false)
      fetchChargers()
    } catch (err) {
      toast.error('Failed to save charger.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this charger? All related bookings will be deleted.')) return
    try {
      await chargersAPI.delete(id)
      toast.success('Charger removed successfully.')
      fetchChargers()
    } catch (err) {
      toast.error('Failed to remove charger.')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'occupied' : currentStatus === 'occupied' ? 'maintenance' : 'available'
    try {
      await chargersAPI.updateStatus(id, nextStatus)
      toast.success(`Charger status changed to ${nextStatus}.`)
      fetchChargers()
    } catch (err) {
      toast.error('Failed to change status.')
    }
  }

  return (
    <div className="space-y-6 text-left relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Chargers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Manage connectors, power levels, pricing, and availability states
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Station dropdown */}
          <select
            className="select max-w-xs"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
          >
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          
          <button onClick={openAddModal} disabled={!selectedStationId} className="btn-primary btn-sm flex items-center gap-1 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Charger
          </button>
        </div>
      </div>

      {/* Chargers list */}
      <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        {chargers.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Charger Type</th>
                  <th>Connector</th>
                  <th>Power Rating</th>
                  <th>Price Rate</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getChargerTypeColor(c.charger_type)}`}>
                        {c.charger_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-semibold">{c.connector_type}</td>
                    <td>{c.power_kw} kW</td>
                    <td className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(c.price_per_kwh)} / kWh</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className="btn-outline btn-sm flex items-center gap-1"
                          title="Toggle charger operational status"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Toggle Status
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="btn-outline btn-sm p-1.5"
                          title="Edit charger parameters"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn-outline border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 btn-sm p-1.5"
                          title="Delete charger"
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
        ) : (
          <div className="text-center py-16">
            <Battery className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-base dark:text-white">No chargers added</h3>
            <p className="text-xs text-gray-500 mt-1">Configure your first charging unit at this station.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-xl text-left">
            <h3 className="font-bold text-lg mb-4 dark:text-white">
              {editId ? 'Edit Charger Parameters' : 'Add New Charger'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Charger Type</label>
                <select
                  className="select"
                  value={formData.charger_type}
                  onChange={(e) => setFormData({ ...formData, charger_type: e.target.value })}
                >
                  <option value="AC_SLOW">AC SLOW (Level 1)</option>
                  <option value="AC_FAST">AC FAST (Level 2)</option>
                  <option value="DC_FAST">DC FAST (Supercharger)</option>
                </select>
              </div>

              <div>
                <label className="label">Connector Type</label>
                <select
                  className="select"
                  value={formData.connector_type}
                  onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
                >
                  <option value="Type1">Type 1</option>
                  <option value="Type2">Type 2 (Mennekes)</option>
                  <option value="CCS">CCS (Combined Charging System)</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Tesla">Tesla Supercharger Type</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Power Output (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="input"
                    value={formData.power_kw}
                    onChange={(e) => setFormData({ ...formData, power_kw: e.target.value })}
                    placeholder="E.g., 22.0"
                  />
                </div>
                <div>
                  <label className="label">Price per kWh (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input"
                    value={formData.price_per_kwh}
                    onChange={(e) => setFormData({ ...formData, price_per_kwh: e.target.value })}
                    placeholder="E.g., 12.00"
                  />
                </div>
              </div>

              <div>
                <label className="label">Current Status</label>
                <select
                  className="select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">Available (Operational)</option>
                  <option value="occupied">Occupied (Charging)</option>
                  <option value="maintenance">Maintenance (Offline)</option>
                </select>
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
                  Save Charger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageChargersPage
