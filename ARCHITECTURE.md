# 🏗️ ARQUITECTURA DE STRIPE INTEGRATION

## 📐 DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUARIO EN MENU                           │
│                         (Menu.jsx - React)                          │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Click en "Comprar"
                       ▼
           ┌───────────────────────┐
           │   handleBuy()         │
           │  Abre PaymentModal    │
           └───────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    ┌─────────────────────────┐  ┌──────────────┐
    │  Componente renderiza   │  │ CardElement  │
    │      modal de pago      │  │  (Stripe)    │
    └────────────┬────────────┘  └──────────────┘
                 │
                 │ Usuario ingresa:
                 │ - Email
                 │ - Datos de tarjeta
                 │
                 │ Click "Pagar"
                 ▼
    ┌─────────────────────────────────────────┐
    │  PaymentModal.jsx                       │
    │  - Validar datos                        │
    │  - Llamar paymentService                │
    └────────────┬────────────────────────────┘
                 │
                 │ POST /api/payments/create-intent
                 │ Body: { monto, email, descripcion }
                 ▼
    ┌─────────────────────────────────────────┐
    │         BACKEND (Node.js/Express)       │
    │  POST /api/payments/create-intent       │
    │  - Validar usuario autenticado          │
    │  - Crear Payment Intent con Stripe      │
    │  - Retornar clientSecret                │
    └────────────┬────────────────────────────┘
                 │
                 │ Response: { client_secret, payment_intent_id }
                 ▼
    ┌─────────────────────────────────────────┐
    │  Frontend recibe clientSecret           │
    │  stripe.confirmCardPayment(             │
    │    clientSecret,                        │
    │    { payment_method: {...} }            │
    │  )                                      │
    └────────────┬────────────────────────────┘
                 │
                 │ Enviar al servicio de Stripe
                 ▼
    ┌─────────────────────────────────────────┐
    │    STRIPE (Servicio de Pagos)           │
    │  - Procesar tarjeta                     │
    │  - Validar datos                        │
    │  - Autorizar o rechazar                 │
    └────────────┬────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼ ÉXITO                   ▼ FALLA
┌──────────────┐          ┌──────────────┐
│ status:      │          │ error:       │
│ succeeded    │          │ reason       │
└──────┬───────┘          └──────┬───────┘
       │                         │
       │ confirmPayment()        │ Mostrar error
       │                         │ en modal
       ▼                         ▼
┌──────────────────────────┐  ┌──────────────┐
│ POST /api/payments/      │  │ Toast error  │
│       confirm            │  │ (react-      │
│ Body: {                  │  │  toastify)   │
│   payment_intent_id,     │  └──────────────┘
│   pedido_id              │
│ }                        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         BACKEND CONFIRMA                 │
│  POST /api/payments/confirm              │
│  - Crear orden en DB                     │
│  - Asignar puntos                        │
│  - Actualizar estado de pago             │
└──────┬───────────────────────────────────┘
       │
       │ Response: { success: true, orden_id }
       ▼
┌──────────────────────────────────────────┐
│  Frontend - handlePaymentSuccess()       │
│  - Mostrar toast de éxito                │
│  - Actualizar puntos en localStorage     │
│  - Cerrar modal                          │
│  - Preguntar si ver pedidos              │
└──────────────────────────────────────────┘
       │
       │ Si usuario hace click "Sí"
       ▼
    ┌──────────────────────┐
    │  navigate('/my-orders')│
    │  MyOrders.jsx        │
    │  - Ver orden creada  │
    └──────────────────────┘
```

---

## 📦 ESTRUCTURA DE CARPETAS

```
crepa-urbana-frontend/
├── src/
│   ├── api/
│   │   └── axios.js                 ← Configuración HTTP
│   ├── components/
│   │   ├── PaymentModal.jsx         ← 🆕 Modal de Stripe
│   │   └── PaymentModal.css         ← 🆕 Estilos del modal
│   ├── pages/
│   │   ├── Menu.jsx                 ← ✏️ MODIFICADO (integración)
│   │   ├── MyOrders.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   ├── services/
│   │   ├── paymentService.js        ← 🆕 API de pagos
│   │   ├── orderService.js
│   │   ├── authService.js
│   │   └── ...
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── App.css
├── .env.local                       ← 🆕 Variables Stripe
├── .env                             ← Copiar a .env.local
├── package.json
├── vite.config.js
├── STRIPE_INTEGRATION.md            ← 📖 Documentación
├── TESTING_GUIDE.md                 ← 🧪 Guía de pruebas
└── ...

```

---

## 🔄 COMPONENTES Y SUS RESPONSABILIDADES

### 1. **Menu.jsx** (Página principal)
```
┌─────────────────────────────────┐
│       Menu.jsx                  │
├─────────────────────────────────┤
│ Estado:                         │
│ - products[]                    │
│ - user                          │
│ - showPaymentModal (🆕)         │
│ - selectedProduct (🆕)          │
│                                 │
│ Métodos:                        │
│ - fetchProducts()               │
│ - handleLogout()                │
│ - handleBuy() (🆕 modificado)   │
│ - handlePaymentSuccess() (🆕)   │
│                                 │
│ Renderiza:                      │
│ - Grid de productos             │
│ - <Elements> (Stripe provider)  │
│ - <PaymentModal> (condicional)  │
└─────────────────────────────────┘
```

### 2. **PaymentModal.jsx** (Modal de pago)
```
┌──────────────────────────────────┐
│     PaymentModal.jsx             │
├──────────────────────────────────┤
│ Props:                           │
│ - product                        │
│ - user                           │
│ - onSuccess (callback)           │
│ - onClose (callback)             │
│                                  │
│ Estado interno:                  │
│ - email                          │
│ - loading                        │
│ - error                          │
│ - cardError                      │
│                                  │
│ Métodos:                         │
│ - handleCardChange()             │
│ - handlePayment() (envía a API)  │
│                                  │
│ Renderiza:                       │
│ - Overlay semi-transparente      │
│ - Información del producto       │
│ - Input de email                 │
│ - CardElement (Stripe)           │
│ - Mensajes de error              │
│ - Botones (Pagar/Cancelar)       │
└──────────────────────────────────┘
```

### 3. **paymentService.js** (Servicio HTTP)
```
┌──────────────────────────────────┐
│   paymentService.js              │
├──────────────────────────────────┤
│ Métodos (exportados):            │
│                                  │
│ createPaymentIntent()            │
│ ├─ POST /payments/create-intent  │
│ └─ return { client_secret }      │
│                                  │
│ confirmPayment()                 │
│ ├─ POST /payments/confirm        │
│ └─ return { success, orden_id }  │
│                                  │
│ checkPaymentStatus()             │
│ ├─ GET /payments/status/:id      │
│ └─ return { status, amount }     │
│                                  │
│ getMyTransactions()              │
│ ├─ GET /payments/my-transactions │
│ └─ return [transactions]         │
└──────────────────────────────────┘
```

---

## 🔐 SEGURIDAD DE DATOS

```
┌─────────────────────────────────────────────────────┐
│              DATOS SENSIBLES                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  NUNCA en frontend:                                │
│  ❌ STRIPE_SECRET_KEY (sk_test_xxx)               │
│  ❌ Contraseñas de BD                             │
│  ❌ API keys privadas                             │
│                                                     │
│  SIEMPRE en frontend (env):                        │
│  ✅ VITE_STRIPE_PUBLIC_KEY (pk_test_xxx)          │
│  ✅ VITE_API_URL (http://localhost:3000)          │
│                                                     │
│  Flujo de datos:                                   │
│  Frontend (public key)                             │
│      ↓                                              │
│  Stripe (procesa pago)                             │
│      ↓                                              │
│  Backend (secret key)                              │
│      ↓                                              │
│  BD (orden creada)                                │
│                                                     │
│  NUNCA: Frontend → DB directamente                 │
│  SIEMPRE: Frontend → Backend → DB                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📡 COMUNICACIÓN HTTP

### Request 1: Crear Payment Intent
```
POST http://localhost:3000/api/payments/create-intent

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "monto": 12.99,
  "email": "usuario@example.com",
  "descripcion": "Crepa: Crepa Dulce",
  "metodo_pago": "tarjeta"
}

Response (200 OK):
{
  "client_secret": "pi_test_xxx#secret_yyy",
  "payment_intent_id": "pi_test_xxx"
}
```

### Request 2: Procesar con Stripe (desde Frontend)
```
Stripe API (no es HTTP tradicional)

stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: <CardElement>,
    billing_details: {
      email: "usuario@example.com"
    }
  }
})

Response (desde Stripe):
{
  paymentIntent: {
    id: "pi_test_xxx",
    status: "succeeded" | "requires_action" | "processing"
  },
  error: null | { message: "..." }
}
```

### Request 3: Confirmar Pago
```
POST http://localhost:3000/api/payments/confirm

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "payment_intent_id": "pi_test_xxx",
  "pedido_id": null,
  "metodo_pago": "tarjeta"
}

Response (200 OK):
{
  "success": true,
  "message": "Pago confirmado y orden creada",
  "orden_id": 42,
  "puntos_ganados": 10
}
```

---

## 🎨 ESTADO DEL MODAL DURANTE EL FLUJO

```
┌─────────────────────────────────────┐
│ ESTADO 1: INICIAL                   │
├─────────────────────────────────────┤
│ - Email input: vacío                │
│ - CardElement: vacío                │
│ - Botón Pagar: habilitado           │
│ - Spinner: no visible               │
│ - Mensajes: ninguno                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ ESTADO 2: USUARIO COMPLETA DATOS    │
├─────────────────────────────────────┤
│ - Email: "user@example.com"         │
│ - CardElement: "4242..."            │
│ - Botón Pagar: habilitado           │
│ - Indicadores: ✅ todos ok          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ ESTADO 3: CLICK EN "PAGAR"          │
├─────────────────────────────────────┤
│ - Botón: deshabilitado              │
│ - Spinner: visible                  │
│ - Texto: "Procesando..."            │
│ - Inputs: deshabilitados            │
│ - Mensaje: loading azul             │
└─────────────────────────────────────┘
              ↓
    ┌─────────────┬─────────────┐
    │             │             │
    ▼ ÉXITO       ▼ FALLA
┌──────────────┐ ┌──────────────┐
│ ESTADO 4A:   │ │ ESTADO 4B:   │
│ ✅ ÉXITO     │ │ ❌ ERROR     │
├──────────────┤ ├──────────────┤
│ - Mensaje:   │ │ - Mensaje:   │
│   success    │ │   error rojo │
│ - Toast:     │ │ - Botón:     │
│   visible    │ │   habilitado │
│ - Modal:     │ │ - Spinner:   │
│   cierra     │ │   invisible  │
│   (2s)       │ │ - Inputs:    │
│              │ │   habilitados│
└──────────────┘ └──────────────┘
    │                   │
    │                   │ Usuario puede
    │                   │ reintentar
    │
    ▼
┌──────────────────────┐
│ Modal cerrado        │
│ Volver a Menu        │
└──────────────────────┘
```

---

## 🧪 INTEGRACIÓN CON TESTING

```
┌───────────────────────────────────┐
│  Testing Stack                    │
├───────────────────────────────────┤
│                                   │
│ Unit Tests (Vitest):             │
│ ├─ paymentService.test.js        │
│ ├─ PaymentModal.test.jsx         │
│ └─ Menu.test.jsx                 │
│                                   │
│ Integration Tests (Cypress):      │
│ ├─ menu-payment-flow.cy.js       │
│ ├─ payment-modal.cy.js           │
│ └─ stripe-payment.cy.js          │
│                                   │
│ Manual Testing:                   │
│ ├─ Tarjeta éxito                 │
│ ├─ Tarjeta falla                 │
│ ├─ 3D Secure                     │
│ ├─ Validaciones                  │
│ └─ Edge cases                    │
│                                   │
└───────────────────────────────────┘
```

---

## 📊 TABLA COMPARATIVA: ANTES vs DESPUÉS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Flujo de compra** | Sin pago online | Con pago Stripe |
| **Crear orden** | Inmediato | Después del pago |
| **Modal de pago** | No existe | ✅ PaymentModal.jsx |
| **CardElement** | No existe | ✅ Stripe CardElement |
| **Servicio de pagos** | No existe | ✅ paymentService.js |
| **Validación tarjeta** | N/A | ✅ Stripe valida |
| **Seguridad** | Baja (sin cifrado) | ✅ Alta (PCI DSS) |
| **Puntos en pago** | Se asignan inmediato | ✅ Después de pagar |
| **Historial de pagos** | No existe | ✅ Disponible |

---

Este es el corazón de tu integración Stripe. Cada componente tiene una responsabilidad clara y se comunica a través de servicios bien definidos. 🎯
