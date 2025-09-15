import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) 
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else 
    delete API.defaults.headers.common["Authorization"];
}

export default API;

// Auth API calls
export const login = (email, password) => 
  API.post("/auth/login", { email, password });

export const getMe = () => 
  API.get("/auth/me");

// Dashboard API calls
export const getDashboardStats = () => 
  API.get("/dashboard/stats");

export const getRecentAppointments = (counselorId) =>
  API.get(`/appointments/counselor/${counselorId}?limit=5&sort=desc`);

export const getRecentAnnouncements = () =>
  API.get("/announcements?limit=3&sort=desc");

export const getUpcomingActivities = () =>
  API.get("/activities?limit=3&sort=asc&upcoming=true");

// Appointments
export const getAppointments = (counselorId) =>
  API.get(`/appointments/counselor/${counselorId}`);
export const createAppointment = (data) =>
  API.post("/appointments", data);
export const updateAppointment = (id, status) =>
  API.patch(`/appointments/${id}/status`, { status });
export const cancelAppointment = (id) =>
  API.delete(`/appointments/${id}`);

// Announcements
export const postAnnouncement = (data) =>
  API.post("/announcements", data);
export const getAnnouncements = () =>
  API.get("/announcements");

// Activities
export const postActivity = (data) =>
  API.post("/activities", data);
export const getActivities = () =>
  API.get("/activities");

// Books
export const getBooks = () =>
  API.get("/books");
export const postBook = (data) =>
  API.post("/books", data);