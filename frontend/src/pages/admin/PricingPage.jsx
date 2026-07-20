import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, DollarSign } from 'lucide-react'
import { pricingAPI } from '../../api/services'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

const PricingPage = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    charger_type: 'AC_SLOW',
    price_per_kwh: 8.0,
    description: '',
    is_active: true
  })

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await pricingAPI.getAll()
      setPlans(res.data)
    } catch (err) {
      toast.error('Failed to load pricing plans.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const openAddModal = () => {
    setEditId(null)
    setFormData({
      name: '',
      charger_type: 'AC_SLOW',
      price_per_kwh: 8.0,
      description: '',
      is_active: true
    })
    setModalOpen(true)
  }

  const openEditModal = (plan) => {
    setEditId(plan.id)
    setFormData({
      name: plan.name || '',
      charger_type: plan.charger_type || 'AC_SLOW',
      price_per_kwh: plan.price_per_kwh || 8.0,
      description: plan.description || '',
      is_active: plan.is_active ?? true
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        price_per_kwh: Number(formData.price_per_kwh)
      }

      if (editId) {
        await pricingAPI.update(editId, payload)
        toast.success('Pricing plan updated successfully!')
      } else {
        await pricingAPI.create(payload)
        toast.success('Pricing plan created successfully!')
      }

      setModalOpen(false)
      fetchPlans()
    } catch (err) {
      toast.error('Failed to save pricing plan.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing plan?')) return
    try {
      await pricingAPI.delete(id)
      toast.success('Pricing plan deleted successfully.')
      fetchPlans()
    } catch (err) {
      toast.error('Failed to delete pricing plan.')
    }
  }

  if (loading && plans.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Module</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Configure price rates per kWh based on charging speeds and unit types
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary btn-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {/* Pricing list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="card p-5 space-y-4 border hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{plan.name}</h3>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                  {plan.charger_type.replace('_', ' ')}
                </span>
              </div>
              <span className={`badge ${plan.is_active ? 'badge-success' : 'badge-gray'}`}>
                {plan.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[3rem] leading-relaxed">
              {plan.description || 'No description provided.'}
            </p>

            <div className="divider" />

            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Rate Rate</span>
                <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{formatCurrency(plan.price_per_kwh)} <span className="text-xs font-normal text-gray-500">/ kWh</span></span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="btn-outline btn-sm p-1.5"
                  title="Edit pricing plan"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="btn-outline border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 btn-sm p-1.5"
                  title="Delete pricing plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-xl text-left">
            <h3 className="font-bold text-lg mb-4 dark:text-white">
              {editId ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Plan Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Supercharger Peak Rate"
                />
              </div>

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
                <label className="label">Price Rate per kWh (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={formData.price_per_kwh}
                  onChange={(e) => setFormData({ ...formData, price_per_kwh: e.target.value })}
                  placeholder="E.g., 18.50"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  className="input scrollbar-thin"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about peak hours, dynamic rules..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="plan_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500"
                />
                <label htmlFor="plan_is_active" className="text-sm text-gray-700 dark:text-gray-300">Plan is Active</label>
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
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingPage
