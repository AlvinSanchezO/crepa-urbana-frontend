import axios from 'axios';

// Crear una instancia base
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de cada petición, inyectar el Token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;