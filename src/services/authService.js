import api from '../api/axios';

const authService = {
  login: async (email, password) => {
    // Esto hace POST a http://localhost:3000/api/auth/login
    const response = await api.post('/auth/login', { email, password });
    
    // Si hay token, lo guardamos en el navegador
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;