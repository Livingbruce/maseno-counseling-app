import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const login = (email, password) =>
  api.post('/api/login', { email, password })

export const getMe = () =>
  api.get('/api/me')

// Dashboard API calls
export const getDashboardStats = () =>
  api.get('/api/dashboard/stats')

export const getAppointments = () =>
  api.get('/api/appointments')

export const getStudents = () =>
  api.get('/api/students')

export const getCounselors = () =>
  api.get('/api/counselors')

export const getAnnouncements = () =>
  api.get('/api/announcements')

export const createAnnouncement = (data) =>
  api.post('/api/announcements', data)

export const updateAnnouncement = (id, data) =>
  api.put(`/api/announcements/${id}`, data)

export const deleteAnnouncement = (id) =>
  api.delete(`/api/announcements/${id}`)

export const getActivities = () =>
  api.get('/api/activities')

export const createActivity = (data) =>
  api.post('/api/activities', data)

export const updateActivity = (id, data) =>
  api.put(`/api/activities/${id}`, data)

export const deleteActivity = (id) =>
  api.delete(`/api/activities/${id}`)

export const getBooks = () =>
  api.get('/api/books')

export const createBook = (data) =>
  api.post('/api/books', data)

export const updateBook = (id, data) =>
  api.put(`/api/books/${id}`, data)

export const deleteBook = (id) =>
  api.delete(`/api/books/${id}`)

export default api
