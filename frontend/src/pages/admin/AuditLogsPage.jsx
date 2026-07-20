import { useEffect, useState } from 'react'
import { Activity, ShieldAlert, Search, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { auditAPI } from '../../api/services'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AuditLogsPage = () => {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  
  // Selected log detail modal state
  const [selectedLog, setSelectedLog] = useState(null)

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const res = await auditAPI.getAll({
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        skip,
        limit,
      })
      setLogs(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      toast.error('Failed to retrieve system audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [skip, limit, actionFilter, entityFilter])

  const handlePageChange = (newSkip) => {
    if (newSkip >= 0 && newSkip < total) {
      setSkip(newSkip)
    }
  }

  const currentPage = Math.floor(skip / limit) + 1
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Audit Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Review security updates, database edits, user lockouts, and API operations
          </p>
        </div>

        <button onClick={fetchAuditLogs} className="btn-secondary btn-sm flex items-center gap-1.5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters bar */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Filter by Action
          </label>
          <select
            className="select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setSkip(0)
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE (Create objects)</option>
            <option value="UPDATE">UPDATE (Modify objects)</option>
            <option value="DELETE">DELETE (Delete objects)</option>
            <option value="BLOCK">BLOCK (Block users)</option>
            <option value="UNBLOCK">UNBLOCK (Unblock users)</option>
            <option value="LOGIN">LOGIN (Admin / User Login)</option>
            <option value="SEED">SEED (DB Initialization)</option>
          </select>
        </div>

        <div>
          <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Filter by Entity/Table
          </label>
          <select
            className="select"
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value)
              setSkip(0)
            }}
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Station">Station</option>
            <option value="Charger">Charger</option>
            <option value="Booking">Booking</option>
            <option value="Pricing">Pricing</option>
            <option value="Database">Database</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        {loading ? (
          <div className="p-8 animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 skeleton" />
            ))}
          </div>
        ) : logs.length > 0 ? (
          <div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Target ID</th>
                    <th>IP Address</th>
                    <th>Details Summary</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {formatDate(log.created_at)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            log.action === 'DELETE' || log.action === 'BLOCK'
                              ? 'badge-danger'
                              : log.action === 'CREATE'
                              ? 'badge-success'
                              : log.action === 'UPDATE' || log.action === 'UNBLOCK'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="font-semibold text-gray-900 dark:text-white">{log.entity}</td>
                      <td className="font-mono text-xs">{log.entity_id || 'N/A'}</td>
                      <td className="font-mono text-xs text-gray-500">{log.ip_address || 'unknown'}</td>
                      <td className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                        {log.details}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn-secondary btn-xs p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-500">
                Showing <span className="font-semibold">{logs.length > 0 ? skip + 1 : 0}</span> to{' '}
                <span className="font-semibold">{Math.min(skip + limit, total)}</span> of{' '}
                <span className="font-semibold">{total}</span> audit logs
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(skip - limit)}
                  disabled={skip === 0}
                  className="btn-secondary btn-sm flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>
                <div className="flex items-center px-4 text-sm font-semibold dark:text-white">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(skip + limit)}
                  disabled={skip + limit >= total}
                  className="btn-secondary btn-sm flex items-center"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-lg mb-1">No Audit Logs Found</p>
            <p className="text-sm">Try resetting filters or checking back after making station edits.</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Audit Log Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 block uppercase">Timestamp</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedLog.created_at)}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 block uppercase">User ID</span>
                  <span className="text-sm text-gray-900 dark:text-white">{selectedLog.user_id || 'System (anonymous)'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 block uppercase">Action Executed</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 block uppercase">Target Entity</span>
                  <span className="text-sm text-gray-900 dark:text-white">{selectedLog.entity} (ID: {selectedLog.entity_id || 'N/A'})</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 block uppercase mb-1">Full Log Description</span>
                <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded border border-gray-200 dark:border-gray-800 text-sm font-mono whitespace-pre-wrap dark:text-gray-300">
                  {selectedLog.details}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 block uppercase">Client IP Address</span>
                <span className="text-sm text-gray-900 dark:text-white font-mono">{selectedLog.ip_address || 'unknown'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="btn-secondary btn-sm">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogsPage
