// ============================================================
// Utility helper functions used throughout the app
// ============================================================

// Format a date string into a human-readable format
// e.g., "2024-01-15" → "Jan 15, 2024"
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format a datetime string into date + time
// e.g., "2024-01-15T10:30:00" → "Jan 15, 2024 at 10:30 AM"
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format currency in Indian Rupees
// e.g., 250.5 → "₹250.50"
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00'
  return `₹${Number(amount).toFixed(2)}`
}

// Format energy consumption
// e.g., 12.5 → "12.50 kWh"
export const formatEnergy = (kwh) => {
  if (kwh === null || kwh === undefined) return '0 kWh'
  return `${Number(kwh).toFixed(2)} kWh`
}

// Format duration in minutes to human readable
// e.g., 90 → "1h 30m"
export const formatDuration = (minutes) => {
  if (!minutes) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Get status badge class based on booking status
export const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    cancelled: 'badge-danger',
    completed: 'badge-info',
    available: 'badge-success',
    occupied: 'badge-danger',
    maintenance: 'badge-warning',
  }
  return classes[status] || 'badge-gray'
}

// Get a color for charger type
export const getChargerTypeColor = (type) => {
  const colors = {
    AC_SLOW: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    AC_FAST: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    DC_FAST: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  }
  return colors[type] || 'text-gray-600 bg-gray-50'
}

// Truncate long text with ellipsis
// e.g., "This is a very long text" → "This is a very..."
export const truncate = (text, maxLength = 60) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Calculate time slots for booking (every 30 minutes)
export const generateTimeSlots = () => {
  const slots = []
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const hour = String(h).padStart(2, '0')
      const min = String(m).padStart(2, '0')
      slots.push(`${hour}:${min}`)
    }
  }
  return slots
}

// Get today's date in YYYY-MM-DD format (for date inputs)
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Get initials from a name
// e.g., "John Doe" → "JD"
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get error message from an Axios error response
export const getErrorMessage = (error) => {
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail[0]?.msg || 'Validation error'
  }
  return error?.message || 'An error occurred. Please try again.'
}
