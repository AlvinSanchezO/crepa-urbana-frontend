import api from '../api/axios';

const orderService = {
  create: async (items) => {
    // Enviamos el pedido al backend
    const response = await api.post('/orders', { items });
    return response.data; // Retorna la info del pedido y los puntos ganados
  }
};

export default orderService;