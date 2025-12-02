import api from '../api/axios';

const productService = {
  // Ver todos
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Crear nuevo
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Actualizar (Sirve para editar info o cambiar el switch de stock)
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;