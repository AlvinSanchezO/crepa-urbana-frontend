import api from '../api/axios';

const paymentService = {
  // Crear Payment Intent en el backend
  async createPaymentIntent(monto, email, descripcion) {
    const response = await api.post('/payments/create-intent', {
      monto,
      email,
      descripcion,
      metodo_pago: 'tarjeta'
    });
    return response.data;
  },

  // Confirmar pago después de procesarlo en Stripe - ENVIANDO PRODUCTOS
  async confirmPayment(paymentIntentId, pedidoId = null, productos = []) {
    const response = await api.post('/payments/confirm', {
      payment_intent_id: paymentIntentId,
      pedido_id: pedidoId,
      metodo_pago: 'tarjeta',
      productos: productos.map(p => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio,
        notas_personalizadas: 'Compra desde el menú'
      }))
    });
    return response.data;
  },

  // Obtener estado de un pago
  async checkPaymentStatus(paymentIntentId) {
    const response = await api.get(`/payments/status/${paymentIntentId}`);
    return response.data;
  },

  // Historial de transacciones
  async getMyTransactions(page = 1, limit = 10) {
    const response = await api.get('/payments/my-transactions', {
      params: { page, limit }
    });
    return response.data;
  }
};

export default paymentService;
