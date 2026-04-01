import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token')
  const isAuthRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register-admin')

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

export default api