import api from '../api/axios';

const orderService = {
  // Cliente: Crear pedido
  create: async (items) => {
    const response = await api.post('/orders', { items });
    return response.data;
  },

  // Cliente: Ver MIS pedidos (NUEVO)
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  // Admin/Cocina: Ver TODOS los pedidos
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Admin/Cocina: Cambiar estado
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { estado: status });
    return response.data;
  }
};

export default orderService;