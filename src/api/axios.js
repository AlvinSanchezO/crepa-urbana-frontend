import axios from 'axios';

// Determinar la URL del API basándose en el hostname
const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // Si estamos en Railway production
  if (hostname.includes('railway.app')) {
    return 'https://crepa-urbana-backend-production.up.railway.app';
  }
  
  // Si estamos en localhost (desarrollo)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // Fallback a la variable de entorno o Railway
  return import.meta.env.VITE_API_URL || 'https://crepa-urbana-backend-production.up.railway.app';
};

const apiUrl = getApiUrl();
console.log('API URL:', apiUrl);

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