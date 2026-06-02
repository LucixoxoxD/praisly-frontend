import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
})

// Attach token + active business ID to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('praisly_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const bizId = localStorage.getItem('praisly_active_business_id')
  if (bizId) config.headers['X-Business-Id'] = bizId
  return config
})

// Token refresh queue — prevents multiple simultaneous refresh calls
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

// On 401: attempt token refresh first; only redirect to login if refresh fails
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Skip refresh for customer review pages and for the refresh endpoint itself
    const isReviewPage = window.location.pathname.startsWith('/review')
    const isRefreshCall = original?.url?.includes('/api/auth/refresh')

    if (err.response?.status === 401 && !original._retry && !isReviewPage && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('praisly_refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/refresh`,
          { refresh_token: refreshToken },
        )

        const newToken = res.data.access_token
        const newRefresh = res.data.refresh_token

        localStorage.setItem('praisly_token', newToken)
        if (newRefresh) localStorage.setItem('praisly_refresh_token', newRefresh)

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        processQueue(null, newToken)

        original.headers['Authorization'] = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('praisly_token')
        localStorage.removeItem('praisly_refresh_token')
        localStorage.removeItem('praisly_business')
        localStorage.removeItem('praisly_active_business_id')
        localStorage.removeItem('praisly_locations')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  },
)

export const authService = {
  login: async ({ email, phone, password }) => {
    const body = { password }
    if (phone) body.phone = phone
    else body.email = email
    const res = await api.post('/api/auth/login', body)
    localStorage.setItem('praisly_token', res.data.access_token)
    if (res.data.refresh_token) {
      localStorage.setItem('praisly_refresh_token', res.data.refresh_token)
    }
    if (res.data.business) {
      localStorage.setItem('praisly_business', JSON.stringify(res.data.business))
      localStorage.setItem('praisly_active_business_id', res.data.business.id)
    }
    return res.data
  },

  signup: async (data) => {
    const res = await api.post('/api/auth/signup', data)
    localStorage.setItem('praisly_token', res.data.access_token)
    if (res.data.refresh_token) {
      localStorage.setItem('praisly_refresh_token', res.data.refresh_token)
    }
    if (res.data.business) {
      localStorage.setItem('praisly_business', JSON.stringify(res.data.business))
      localStorage.setItem('praisly_active_business_id', res.data.business.id)
    }
    return res.data
  },

  logout: () => {
    const token = localStorage.getItem('praisly_token')
    if (token) api.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('praisly_token')
    localStorage.removeItem('praisly_refresh_token')
    localStorage.removeItem('praisly_business')
    localStorage.removeItem('praisly_active_business_id')
    localStorage.removeItem('praisly_locations')
    window.location.href = '/login'
  },

  isAuthenticated: () => !!localStorage.getItem('praisly_token'),

  getBusiness: () => {
    const b = localStorage.getItem('praisly_business')
    try { return b ? JSON.parse(b) : null } catch { return null }
  },

  setBusiness: (biz) => {
    localStorage.setItem('praisly_business', JSON.stringify(biz))
    if (biz?.id) localStorage.setItem('praisly_active_business_id', biz.id)
  },

  // Multi-location helpers
  getLocations: () => {
    const l = localStorage.getItem('praisly_locations')
    try { return l ? JSON.parse(l) : [] } catch { return [] }
  },

  setLocations: (locations) => {
    localStorage.setItem('praisly_locations', JSON.stringify(locations || []))
  },

  switchLocation: (biz) => {
    localStorage.setItem('praisly_business', JSON.stringify(biz))
    localStorage.setItem('praisly_active_business_id', biz.id)
  },

  getActiveBusinessId: () => localStorage.getItem('praisly_active_business_id'),
}

// Standalone refresh — used by Protected route guard before any API call is made.
// Uses raw axios (not `api`) to avoid triggering the interceptor.
export async function refreshAuth() {
  const refreshToken = localStorage.getItem('praisly_refresh_token')
  if (!refreshToken) return false
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/refresh`,
      { refresh_token: refreshToken },
    )
    const newToken = res.data.access_token
    const newRefresh = res.data.refresh_token
    localStorage.setItem('praisly_token', newToken)
    if (newRefresh) localStorage.setItem('praisly_refresh_token', newRefresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    return true
  } catch (e) {
    localStorage.removeItem('praisly_token')
    localStorage.removeItem('praisly_refresh_token')
    localStorage.removeItem('praisly_business')
    localStorage.removeItem('praisly_active_business_id')
    localStorage.removeItem('praisly_locations')
    return false
  }
}

export default api
