# 💻 EJEMPLOS DE CÓDIGO - CASOS ADICIONALES

## 1️⃣ AGREGAR HISTORIAL DE PAGOS

### Crear: `src/pages/PaymentHistory.jsx`

```jsx
import { useEffect, useState } from 'react';
import paymentService from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await paymentService.getMyTransactions(1, 20);
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar el historial de pagos');
      setLoading(false);
    }
  };

  const statusColor = {
    succeeded: '#27ae60',
    processing: '#3498db',
    failed: '#e74c3c',
    canceled: '#95a5a6'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/menu')} style={{ cursor: 'pointer' }}>
          ⬅ Volver
        </button>
        <h1 style={{ marginTop: '10px' }}>💳 Historial de Pagos</h1>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : transactions.length === 0 ? (
        <p>No tienes pagos registrados.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Fecha</th>
              <th style={{ padding: '10px' }}>Monto</th>
              <th style={{ padding: '10px' }}>Estado</th>
              <th style={{ padding: '10px' }}>ID Pago</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  {new Date(t.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '10px' }}>
                  <strong style={{ color: '#e67e22' }}>${t.amount.toFixed(2)}</strong>
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    background: statusColor[t.status],
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8em'
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '10px', fontSize: '0.8em', color: '#666' }}>
                  {t.payment_intent_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PaymentHistory;
```

---

## 2️⃣ AGREGAR CARRITO DE COMPRAS

### Modificar: `src/pages/Menu.jsx` (agregar carrito)

```jsx
// En el estado:
const [cart, setCart] = useState([]);
const [showCart, setShowCart] = useState(false);

// Nueva función para agregar al carrito:
const handleAddToCart = (product) => {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    setCart(cart.map(item =>
      item.id === product.id 
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  } else {
    setCart([...cart, { ...product, cantidad: 1 }]);
  }
  toast.success(`${product.nombre} agregado al carrito`);
};

// Modificar handleBuy para abrir carrito:
const handleBuy = (product) => {
  handleAddToCart(product);
  setShowCart(true);
};

// Calcular total del carrito:
const cartTotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

// En handlePaymentSuccess, pasar múltiples items:
const handlePaymentSuccess = async (paymentIntentId) => {
  try {
    const orderPayload = cart.map(item => ({
      producto_id: item.id,
      cantidad: item.cantidad,
      notas: "Pedido Web - Pagado con Stripe"
    }));
    
    const response = await orderService.create(orderPayload);
    
    // ... resto del código
    
    setCart([]); // Limpiar carrito
    setShowCart(false);
  } catch (error) {
    // ... manejo de error
  }
};

// Mostrar carrito:
{showCart && (
  <div style={{ /* estilos del carrito */ }}>
    <h2>🛒 Carrito de Compras</h2>
    {cart.map(item => (
      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{item.cantidad}x {item.nombre}</span>
        <span>${(item.precio * item.cantidad).toFixed(2)}</span>
        <button onClick={() => setCart(cart.filter(i => i.id !== item.id))}>
          ❌ Eliminar
        </button>
      </div>
    ))}
    <h3>Total: ${cartTotal.toFixed(2)}</h3>
    <button onClick={() => setShowPaymentModal(true)}>
      Proceder al pago
    </button>
  </div>
)}
```

---

## 3️⃣ MANEJAR ERRORES DE WEBHOOK

### Backend: `routes/payments.js` (ejemplo)

```javascript
// Webhook para confirmar pagos
app.post('/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Pago exitoso:', paymentIntent.id);
        
        // Actualizar orden en BD
        await Order.update(
          { estado: 'pagado' },
          { where: { payment_intent_id: paymentIntent.id } }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Pago fallido:', failedPayment.id);
        
        // Actualizar orden como fallida
        await Order.update(
          { estado: 'pago_fallido' },
          { where: { payment_intent_id: failedPayment.id } }
        );
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook error');
  }
});
```

---

## 4️⃣ REEMBOLSOS

### Crear: `src/services/paymentService.js` (agregar método)

```javascript
// Agregar a paymentService:
async refundPayment(paymentIntentId, amount = null) {
  const response = await api.post('/payments/refund', {
    payment_intent_id: paymentIntentId,
    amount: amount // null = reembolso completo
  });
  return response.data;
}
```

### Backend: `routes/payments.js`

```javascript
app.post('/api/payments/refund', authenticate, async (req, res) => {
  const { payment_intent_id, amount } = req.body;

  try {
    // Crear reembolso
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined
    });

    // Actualizar orden
    const order = await Order.findOne({
      where: { payment_intent_id }
    });

    if (order) {
      order.estado = 'reembolsado';
      order.refund_id = refund.id;
      await order.save();
    }

    res.json({
      success: true,
      refund_id: refund.id,
      amount: refund.amount / 100
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Uso en Frontend:

```jsx
const handleRefund = async (orderId, paymentIntentId) => {
  if (!window.confirm('¿Deseas reembolsar este pago?')) return;

  try {
    const result = await paymentService.refundPayment(paymentIntentId);
    toast.success(`Reembolso exitoso: $${(result.amount).toFixed(2)}`);
    
    // Actualizar estado de la orden
    loadOrders();
  } catch (error) {
    toast.error(`Error en reembolso: ${error.message}`);
  }
};
```

---

## 5️⃣ ENVIAR RECIBOS POR EMAIL

### Backend: `routes/payments.js`

```javascript
const nodemailer = require('nodemailer');

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Después de pago exitoso:
app.post('/api/payments/confirm', authenticate, async (req, res) => {
  // ... código existente ...

  // Enviar email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Recibo de Pago - Orden #${order.id}`,
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu pago ha sido procesado exitosamente.</p>
      <h3>Detalles de la Orden:</h3>
      <ul>
        ${order.items.map(item => 
          `<li>${item.cantidad}x ${item.Product.nombre} - $${item.precio_unitario}</li>`
        ).join('')}
      </ul>
      <h3>Total: $${order.total_pagar}</h3>
      <p>ID de Pago: ${req.body.payment_intent_id}</p>
      <p>Fecha: ${new Date().toLocaleDateString()}</p>
      <a href="${process.env.FRONTEND_URL}/my-orders">Ver tu pedido</a>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('Error enviando email:', error);
    else console.log('Email enviado:', info.response);
  });
});
```

---

## 6️⃣ VALIDACIÓN AVANZADA DE TARJETA

### Crear: `src/utils/cardValidation.js`

```javascript
// Algoritmo de Luhn para validar número de tarjeta
export const validateCardNumber = (cardNumber) => {
  const sanitized = cardNumber.replace(/\D/g, '');
  
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Detectar tipo de tarjeta
export const detectCardType = (cardNumber) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) return type;
  }
  return 'unknown';
};

// Validar fecha de expiración
export const validateExpiryDate = (month, year) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (month < 1 || month > 12) return false;

  return true;
};
```

### Usar en PaymentModal.jsx:

```jsx
import { validateCardNumber, detectCardType } from '../utils/cardValidation';

const handleCardChange = (event) => {
  const cardNumber = event.elementValue.card?.replace(/\s/g, '');
  
  if (cardNumber) {
    const isValid = validateCardNumber(cardNumber);
    const cardType = detectCardType(cardNumber);
    
    console.log('Card type:', cardType);
    console.log('Valid:', isValid);
    
    setCardError(event.error ? event.error.message : null);
  }
};
```

---

## 7️⃣ ANÁLISIS Y REPORTES DE PAGOS

### Crear: `src/pages/PaymentAnalytics.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import paymentService from '../services/paymentService';

function PaymentAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const transactions = await paymentService.getMyTransactions(1, 100);
      
      // Agrupar por estado
      const byStatus = transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {});

      // Sumar por mes
      const byMonth = transactions.reduce((acc, t) => {
        const month = new Date(t.created_at).toLocaleDateString('es-ES', 
          { month: 'long', year: 'numeric' }
        );
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
      }, {});

      setData({
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        byStatus,
        byMonth
      });
    } catch (error) {
      console.error('Error cargando análisis:', error);
    }
  };

  if (!data) return <p>Cargando...</p>;

  const pieData = {
    labels: Object.keys(data.byStatus),
    datasets: [{
      data: Object.values(data.byStatus),
      backgroundColor: ['#27ae60', '#3498db', '#e74c3c', '#95a5a6']
    }]
  };

  const barData = {
    labels: Object.keys(data.byMonth),
    datasets: [{
      label: 'Monto por Mes',
      data: Object.values(data.byMonth),
      backgroundColor: '#3498db'
    }]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Análisis de Pagos</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h3>Total de Transacciones</h3>
          <p style={{ fontSize: '2em', color: '#e67e22' }}>{data.totalTransactions}</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h3>Monto Total</h3>
          <p style={{ fontSize: '2em', color: '#27ae60' }}>${data.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div>
          <h3>Por Estado</h3>
          <Pie data={pieData} />
        </div>
        <div>
          <h3>Por Mes</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
}

export default PaymentAnalytics;
```

---

## 8️⃣ TESTING CON VITEST

### Crear: `src/services/__tests__/paymentService.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentService from '../paymentService';
import api from '../../api/axios';

vi.mock('../../api/axios');

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear un payment intent', async () => {
    const mockResponse = {
      data: {
        client_secret: 'pi_test_xxx#secret_yyy',
        payment_intent_id: 'pi_test_xxx'
      }
    };

    api.post.mockResolvedValueOnce(mockResponse);

    const result = await paymentService.createPaymentIntent(
      12.99,
      'test@example.com',
      'Crepa Dulce'
    );

    expect(api.post).toHaveBeenCalledWith(
      '/payments/create-intent',
      expect.objectContaining({
        monto: 12.99,
        email: 'test@example.com'
      })
    );

    expect(result).toEqual(mockResponse.data);
  });

  it('debe confirmar un pago', async () => {
    const mockResponse = {
      data: {
        success: true,
        orden_id: 42
      }
    };

    api.post.mockResolvedValueOnce(mockResponse);

    const result = await paymentService.confirmPayment('pi_test_xxx');

    expect(api.post).toHaveBeenCalledWith(
      '/payments/confirm',
      expect.objectContaining({
        payment_intent_id: 'pi_test_xxx'
      })
    );

    expect(result.success).toBe(true);
  });
});
```

---

Estos son ejemplos de funcionalidades avanzadas que puedes agregar. Cada una está lista para copiar y usar. 🚀
