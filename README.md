# 🥞 Crepa Urbana - Frontend

Sistema de gestión de pedidos y puntos de lealtad para la crepería **Crepa Urbana**, con panel de administración completo, dashboard analítico y autenticación segura.

## 🎯 Características Principales

### 👤 Para Clientes
- 🛒 **Carrito de compras** con persistencia en localStorage
- 💳 **Pago con Stripe** - Integración segura de tarjetas de crédito
- 💎 **Sistema de puntos** - Acumula puntos con cada compra
- 📱 **Diseño responsive** - Funciona en móvil, tablet y desktop
- 📋 **Historial de pedidos** - Consulta tus pedidos anteriores
- 🔐 **Autenticación** - Login/Registro seguro con JWT

### 👨‍💼 Para Administradores
- 📊 **Dashboard analítico** con KPIs en tiempo real
  - Ventas del día
  - Ventas del mes
  - Total de órdenes
  - Ingresos totales
- 📈 **Gráficos mejorados** - Visualización de productos más vendidos
- 📦 **Gestión de inventario** - Crear, editar y eliminar productos
- 👥 **Gestión de usuarios** - Ajustar puntos y eliminar usuarios
- 🍳 **Panel de cocina** - KDS para ver pedidos en tiempo real
- 📋 **Últimas órdenes** - Tabla con información completa de transacciones

## 🚀 Tecnologías Utilizadas

- **Frontend Framework:** React 19 + Vite
- **Animaciones:** Framer Motion
- **Estilos:** CSS-in-JS (Inline styles)
- **Gráficos:** Chart.js con react-chartjs-2
- **Pagos:** Stripe.js + @stripe/react-stripe-js
- **Notificaciones:** React Toastify
- **Iconos:** Lucide React
- **Routing:** React Router v6
- **HTTP Client:** Axios

## 📦 Instalación

### Requisitos previos
- Node.js 16+ 
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/AlvinSanchezO/crepa-urbana-frontend.git
cd crepa-urbana-frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env con las variables necesarias
cp .env.example .env

# 4. Configurar variables de entorno en .env
VITE_STRIPE_PUBLIC_KEY=tu_clave_publica_stripe
VITE_API_URL=http://localhost:3000

# 5. Iniciar servidor de desarrollo
npm run dev
```

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Stripe - Obtener de https://dashboard.stripe.com/apikeys
VITE_STRIPE_PUBLIC_KEY=pk_test_51...

# Backend API
VITE_API_URL=http://localhost:3000
```

## 🏗️ Estructura del Proyecto

```
src/
├── App.jsx                 # Componente principal con routing
├── main.jsx                # Punto de entrada
├── pages/
│   ├── Login.jsx          # Autenticación
│   ├── Menu.jsx           # Catálogo de productos
│   ├── MyOrders.jsx       # Historial de pedidos
│   ├── AdminProducts.jsx  # Gestión de inventario
│   ├── AdminUsers.jsx     # Gestión de usuarios
│   ├── Kitchen.jsx        # Panel de cocina (KDS)
│   └── Dashboard.jsx      # Dashboard analítico
├── components/
│   ├── Navbar.jsx         # Navegación principal
│   ├── PaymentModal.jsx   # Modal de pago con Stripe
│   └── HeroSection.jsx    # Sección hero
├── services/
│   ├── authService.js     # Autenticación
│   ├── productService.js  # Gestión de productos
│   ├── orderService.js    # Gestión de pedidos
│   ├── userService.js     # Gestión de usuarios
│   ├── paymentService.js  # Pagos con Stripe
│   └── dashboardService.js # Métricas del dashboard
├── api/
│   └── axios.js           # Cliente HTTP configurado
├── assets/
└── styles/
    └── index.css          # Estilos globales
```

## 🎨 Temas y Personalización

El proyecto utiliza un tema oscuro con acentos dorados:

```javascript
const THEME = {
  bg: '#0f0f0f',           // Fondo oscuro
  cardBg: '#1a1a1a',       // Fondo de tarjetas
  text: '#ffffff',         // Texto blanco
  border: '#333333',       // Bordes oscuros
  gold: '#d4af37',         // Dorado principal
  danger: '#e74c3c',       // Rojo para peligrosos
  success: '#27ae60',      // Verde para éxito
};
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación segura:

1. El usuario inicia sesión/se registra
2. El backend retorna un token JWT
3. El token se guarda en localStorage
4. Se envía en el header `Authorization: Bearer <token>` con cada petición
5. Los datos del usuario se almacenan en localStorage

## 💳 Integración con Stripe

- Utiliza Stripe Elements para entrada segura de tarjetas
- Los pagos se procesan a través de Payment Intent
- Soporta validación 3D Secure
- Confirmación de pago en el backend para crear órdenes
- Manejo robusto de errores y reintentos

## 📱 Responsive Design

El proyecto es completamente responsive usando:
- CSS Grid y Flexbox
- Media queries donde necesario
- `clamp()` para tipografía escalable
- Breakpoints adaptables

### Breakpoints
- 📱 Mobile: < 768px
- 📱 Tablet: 768px - 1024px
- 🖥️ Desktop: > 1024px

## 🧪 Pruebas de Pago Stripe

Tarjetas de prueba disponibles:

| Tarjeta | Resultado |
|---------|-----------|
| 4242 4242 4242 4242 | ✅ Pago exitoso |
| 4000 0000 0000 0002 | ❌ Pago rechazado |
| 4000 0025 0000 3155 | 🔐 Requiere 3D Secure |

Usa cualquier fecha futura y cualquier CVC para la prueba.

## 🚀 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizador de compilación
npm run preview

# Lint con ESLint
npm run lint
```

## 📊 Dashboard Analytics

El dashboard muestra:
- **4 KPIs principales** con animaciones
- **Gráfico de barras** con productos más vendidos
- **Tabla de últimas órdenes** con información completa
- **Diseño responsive** para todos los dispositivos
- **Carga automática de datos** del backend

## 🛡️ Seguridad

- ✅ Tokens JWT para autenticación
- ✅ Validación en cliente y servidor
- ✅ HTTPS en producción
- ✅ Manejo seguro de datos sensibles
- ✅ CORS configurado correctamente
- ✅ `.env` excluido del repositorio

## 🐛 Troubleshooting

### Error: "VITE_STRIPE_PUBLIC_KEY is not defined"
- Verifica que el archivo `.env` existe en la raíz
- Asegúrate que tienes `VITE_STRIPE_PUBLIC_KEY` configurado
- Reinicia el servidor de desarrollo

### Error: "Cannot connect to API"
- Verifica que el backend está corriendo en `VITE_API_URL`
- Comprueba que `VITE_API_URL` está correctamente configurado en `.env`
- Revisa la consola del navegador (F12) para más detalles

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feat/nombre-feature`
2. Haz commits descriptivos: `git commit -m "feat: descripción"`
3. Push a la rama: `git push origin feat/nombre-feature`
4. Abre un Pull Request en GitHub

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Alvin Sánchez** - [GitHub](https://github.com/AlvinSanchezO)

---

**Última actualización:** Diciembre 2025  
**Versión:** 2.0 - Dashboard mejorado y Sistema de usuarios completo
