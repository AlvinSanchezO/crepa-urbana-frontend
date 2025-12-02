import api from '../api/axios';

const productService = {
  getAll: async () => {
    // Hace GET a http://localhost:3000/api/products
    const response = await api.get('/products');
    return response.data;
  }
};

export default productService;