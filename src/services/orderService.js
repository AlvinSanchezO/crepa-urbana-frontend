import api from '../api/axios';

const orderService = {
  // 1. Crear un pedido (Cliente)
  create: async (items) => {
    const response = await api.post('/orders', { items });
    return response.data; // Retorna la info del pedido y los puntos ganados
  },

  // 2. Obtener todos los pedidos (Cocina / Admin)
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // 3. Cambiar el estado de un pedido (Cocina / Admin)
  // Estados válidos: 'pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { estado: status });
    return response.data;
  }
};

export default orderService;