import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('praisly_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear session and redirect to login (skip on customer review pages)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !window.location.pathname.startsWith('/review')
    ) {
      localStorage.removeItem('praisly_token')
      localStorage.removeItem('praisly_business')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('praisly_token', res.data.access_token)
    if (res.data.business) {
      localStorage.setItem('praisly_business', JSON.stringify(res.data.business))
    }
    return res.data
  },

  signup: async (data) => {
    const res = await api.post('/api/auth/signup', data)
    localStorage.setItem('praisly_token', res.data.access_token)
    if (res.data.business) {
      localStorage.setItem('praisly_business', JSON.stringify(res.data.business))
    }
    return res.data
  },

  logout: () => {
    const token = localStorage.getItem('praisly_token')
    if (token) api.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('praisly_token')
    localStorage.removeItem('praisly_business')
    window.location.href = '/login'
  },

  isAuthenticated: () => !!localStorage.getItem('praisly_token'),

  getBusiness: () => {
    const b = localStorage.getItem('praisly_business')
    try { return b ? JSON.parse(b) : null } catch { return null }
  },

  setBusiness: (biz) => {
    localStorage.setItem('praisly_business', JSON.stringify(biz))
  },
}

export default api
