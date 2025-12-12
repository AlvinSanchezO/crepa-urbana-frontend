import axios from 'axios';
import { getApiUrl } from '../config/api';

// Obtener la URL del API en tiempo de ejecución
const apiUrl = getApiUrl();
console.log('API URL at runtime:', apiUrl);

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