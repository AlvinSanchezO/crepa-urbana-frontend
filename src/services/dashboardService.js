import api from '../api/axios';

const dashboardService = {
  getMetrics: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export default dashboardService;