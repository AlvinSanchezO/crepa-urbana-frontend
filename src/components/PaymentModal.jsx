import React, { useState, useRef } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';
import './PaymentModal.css';
import { X } from 'lucide-react';

function PaymentModal({ products = [], total = 0, user, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [email, setEmail] = useState(user.email || '');
  const [zipCode, setZipCode] = useState('00000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardError, setCardError] = useState(null);
  const cardElementRef = useRef(null);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    
    // Cambiar estilo del CardElement según su estado
    if (cardElementRef.current) {
      if (event.error) {
        cardElementRef.current.style.borderColor = '#e74c3c';
      } else if (event.complete) {
        cardElementRef.current.style.borderColor = '#2ecc71';
      } else {
        cardElementRef.current.style.borderColor = '#ddd';
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe no está cargado correctamente');
      return;
    }

    if (cardError) {
      setError('Por favor, corrija los errores de la tarjeta');
      return;
    }

    if (!email) {
      setError('Por favor, ingrese un email válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Crear Payment Intent en el backend con el total del carrito
      const paymentIntentData = await paymentService.createPaymentIntent(
        total,
        email,
        `${products.length} producto(s) - Crepa Urbana`
      );

      console.log('📦 Respuesta del servidor:', paymentIntentData);

      // El backend responde con data.data.clientSecret
      const clientSecret = paymentIntentData.data?.clientSecret || paymentIntentData.clientSecret;
      if (!clientSecret) {
        console.error('❌ No se recibió clientSecret. Respuesta completa:', paymentIntentData);
        throw new Error(`No se recibió el clientSecret del servidor. Respuesta: ${JSON.stringify(paymentIntentData)}`);
      }

      // 2️⃣ Procesar el pago con Stripe
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              email: email,
              address: {
                postal_code: zipCode || '00000',
              },
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        toast.error(`Error en el pago: ${stripeError.message}`);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 3️⃣ Confirmar el pago en el backend ENVIANDO PRODUCTOS (IMPORTANTE)
        try {
          console.log('📦 Enviando productos al backend:', products);
          const confirmResponse = await paymentService.confirmPayment(
            paymentIntent.id,
            null, // No hay pedido_id aún, se crea en el backend
            products // ENVIANDO PRODUCTOS PARA QUE BACKEND CREE LA ORDEN
          );
          console.log('✅ Pago confirmado en backend:', confirmResponse);
        } catch (confirmError) {
          console.warn('⚠️ Pago procesado pero error al confirmar en backend:', confirmError);
          // No fallar si la confirmación falla, el pago ya se procesó en Stripe
        }

        // 4️⃣ Llamar al callback de éxito
        toast.success(`¡Pago exitoso! Tu orden ha sido creada.`);
        onSuccess(paymentIntent.id);
      } else {
        setError(`Estado del pago: ${paymentIntent.status}`);
        toast.error(`Error: El pago no se completó correctamente`);
      }
    } catch (err) {
      console.error('Error en el pago:', err);
      setError(err.message || 'Error al procesar el pago');
      toast.error(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#e74c3c',
      },
    },
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>💳 Procesar Pago</h2>
          <button className="payment-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Resumen del carrito */}
        <div className="payment-info">
          <div className="payment-info-row">
            <span>Cantidad de productos:</span>
            <span>{products.length}</span>
          </div>
          {products.map((product, index) => (
            <div key={index} className="payment-info-row">
              <span>{product.cantidad}x {product.nombre}</span>
              <span>${(product.precio * product.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div className="payment-info-row" style={{ borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px', fontWeight: 'bold' }}>
            <span>Total a pagar:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="payment-message error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {cardError && (
          <div className="payment-message error">
            <span>⚠️</span>
            <span>{cardError}</span>
          </div>
        )}

        {loading && (
          <div className="payment-message loading">
            <div className="payment-spinner"></div>
            <span>Procesando pago...</span>
          </div>
        )}

        {/* Formulario de pago */}
        <form onSubmit={handlePayment} className="payment-form">
          {/* Email */}
          <div className="payment-form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          {/* Código Postal */}
          <div className="payment-form-group">
            <label htmlFor="zipCode">Código Postal</label>
            <input
              id="zipCode"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              maxLength="10"
              disabled={loading}
            />
          </div>

          {/* Card Element */}
          <div className="payment-form-group">
            <label>Datos de la Tarjeta</label>
            <div className="stripe-card-element">
              <CardElement
                ref={cardElementRef}
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
          </div>

          {/* Información de tarjetas de prueba */}
          <div style={{
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#666',
            marginBottom: '10px'
          }}>
            <strong>Tarjetas de prueba:</strong>
            <div>✅ Éxito: 4242 4242 4242 4242</div>
            <div>❌ Falla: 4000 0000 0000 0002</div>
            <div>Fecha: 12/25 | CVC: 123</div>
          </div>

          {/* Botones */}
          <div className="payment-button-group">
            <button
              type="button"
              className="payment-button cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="payment-button submit"
              disabled={loading || !stripe || !elements}
            >
              {loading ? (
                <>
                  <div className="payment-spinner"></div>
                  Procesando...
                </>
              ) : (
                <>💳 Pagar ${total.toFixed(2)}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
