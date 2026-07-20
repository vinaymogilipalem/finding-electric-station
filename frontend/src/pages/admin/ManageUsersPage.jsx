import { useEffect, useState } from 'react'
import { Users, Shield, AlertTriangle, CheckCircle, Trash2, Ban } from 'lucide-react'
import { usersAPI } from '../../api/services'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ManageUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getAll()
      setUsers(res.data.items || res.data) // fallback if not paginated schema
    } catch (err) {
      toast.error('Failed to load users list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleBlock = async (id, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block'
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      await usersAPI.toggleBlock(id)
      toast.success(`User successfully ${action}ed!`)
      fetchUsers()
    } catch (err) {
      toast.error('Failed to update user block status.')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return

    try {
      await usersAPI.deleteUser(id)
      toast.success('User deleted successfully.')
      fetchUsers()
    } catch (err) {
      toast.error('Failed to delete user.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse text-left">
        <div className="h-10 w-48 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          View register accounts, check roles, and block or unblock users
        </p>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Username</th>
                <th>Role</th>
                <th>Register Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-gray-900 dark:text-white">{u.full_name || 'N/A'}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{u.email}</span>
                    </div>
                  </td>
                  <td>{u.username || 'N/A'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-gray'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <span className={`badge ${u.is_blocked ? 'badge-danger' : 'badge-success'}`}>
                      {u.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleToggleBlock(u.id, u.is_blocked)}
                        className={`btn-sm ${u.is_blocked ? 'btn-primary' : 'btn-outline border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'}`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {u.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn-outline border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-500 btn-sm"
                          title="Delete user account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManageUsersPage
