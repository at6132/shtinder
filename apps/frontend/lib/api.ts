import axios from 'axios'

// Ensure API URL has protocol
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          // Update auth store if available
          if (typeof window !== 'undefined') {
            const { useAuthStore } = await import('@/store/auth-store')
            const store = useAuthStore.getState()
            if (store.user) {
              store.setAuth(store.user, accessToken, newRefreshToken || refreshToken)
            }
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        // Update auth store
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/auth-store')
          useAuthStore.getState().logout()
        }
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

