import api from '../api/axios';

const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  adjustPoints: async (userId, points) => {
    const response = await api.post('/api/loyalty/adjust', { userId, points });
    return response.data;
  }
};

export default userService;