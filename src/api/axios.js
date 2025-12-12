import axios from 'axios';

// Obtener la URL del API desde la variable de entorno de Vite
const apiUrl = import.meta.env.VITE_API_URL;
console.log('API URL from env:', apiUrl);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

if (!apiUrl) {
  console.error('WARNING: VITE_API_URL is not defined!');
}

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