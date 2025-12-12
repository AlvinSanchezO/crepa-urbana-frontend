import axios from 'axios';

// Obtener la URL del API desde la variable global definida en vite.config.js
const apiUrl = __API_URL__ || 'http://localhost:3000';
console.log('API URL configured as:', apiUrl);

// Crear una instancia base
const api = axios.create({
  baseURL: `${apiUrl}/api`,
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