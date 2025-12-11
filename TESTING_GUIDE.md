# 🧪 GUÍA DE TESTING - STRIPE INTEGRATION

## CHECKLIST DE TESTING

### ✅ Setup Inicial
- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Variables de entorno en `.env.local` configuradas
- [ ] Librerías Stripe instaladas (`npm list @stripe/react-stripe-js`)

### ✅ Testing del Flujo Completo

#### 1. Login
- [ ] Ingresa email y contraseña válidas
- [ ] Verifica que se redirige a Menu.jsx
- [ ] Verifica que tu nombre y puntos aparecen

#### 2. Abrir Modal de Pago
- [ ] Haz click en "Comprar" en cualquier crepa
- [ ] El modal se abre correctamente
- [ ] Se muestra el nombre y precio del producto
- [ ] El campo de email está pre-llenado (si el usuario tiene email)
- [ ] El CardElement es visible y enfocable

#### 3. Validación de Datos
- [ ] Intenta dejar el email vacío y haz click en "Pagar" → debe mostrar error
- [ ] Intenta ingresar un email inválido → debe mostrar error
- [ ] Intenta ingresar una tarjeta inválida → debe mostrar error rojo en CardElement
- [ ] Los estilos del CardElement cambian al recibir foco (borde naranja)

#### 4. Pago Exitoso
- [ ] Ingresa tarjeta válida: `4242 4242 4242 4242`
- [ ] Fecha: `12/25` (o cualquier futura)
- [ ] CVC: `123` (o cualquier 3 dígitos)
- [ ] Haz click en "Pagar"
- [ ] El botón cambia a estado "Procesando..." con spinner
- [ ] Espera 2-3 segundos
- [ ] El pago se completa exitosamente
- [ ] Toast verde aparece: "¡Pago exitoso! Tu orden ha sido creada."
- [ ] El modal se cierra automáticamente
- [ ] Tus puntos se actualizan en la pantalla
- [ ] Se pregunta si quieres ver el estado de tu pedido

#### 5. Ver Orden Creada
- [ ] Haz click en "Sí" cuando te pregunta si quieres ver el pedido
- [ ] Se redirige a MyOrders.jsx
- [ ] La orden aparece en la lista con estado "pendiente" (o el que asigne el backend)
- [ ] El total del pedido coincide con el precio pagado
- [ ] La orden tiene un ID único

#### 6. Pago Fallido
- [ ] Vuelve al Menú
- [ ] Intenta comprar otra crepa
- [ ] Ingresa tarjeta rechazada: `4000 0000 0000 0002`
- [ ] Haz click en "Pagar"
- [ ] El pago falla
- [ ] Toast rojo aparece con el error
- [ ] El modal sigue abierto (NO se cierra)
- [ ] Puedes corregir e intentar de nuevo

#### 7. Cancelar Modal
- [ ] Abre el modal de pago
- [ ] Haz click en botón "Cancelar"
- [ ] El modal se cierra sin crear orden
- [ ] Vuelves al menú normalmente

#### 8. Responsividad
- [ ] Abre el modal en desktop
- [ ] Abre el modal en mobile (F12, cambiar a móvil)
- [ ] El modal se ve bien en ambos
- [ ] Los botones son clickeables en mobile

---

## 🔍 DEBUGGING

### Ver errores en consola del navegador:
```javascript
// Abre: F12 → Console
// Verifica que no haya errores rojos
```

### Ver requests al backend:
```javascript
// Abre: F12 → Network
// Haz click en "Comprar"
// Busca requests POST a `/api/payments/create-intent`
// Verifica que el response contiene `client_secret`
```

### Ver respuesta del Stripe:
```javascript
// En PaymentModal.jsx, agrega logs:
console.log('Stripe response:', paymentIntent);
console.log('Stripe error:', stripeError);
```

### Verificar variables de entorno:
```javascript
// En la consola del navegador:
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log(import.meta.env.VITE_API_URL);
// Deben mostrar las claves correctas
```

---

## 🎯 CASOS DE PRUEBA ESPECÍFICOS

### Caso 1: Pago Exitoso sin 3D Secure
```
Tarjeta: 4242 4242 4242 4242
Fecha: 12/25
CVC: 123
Email: test@example.com
Resultado esperado: ✅ Pago exitoso, orden creada
```

### Caso 2: Pago Rechazado
```
Tarjeta: 4000 0000 0000 0002
Fecha: 12/25
CVC: 123
Email: test@example.com
Resultado esperado: ❌ Pago rechazado, mostrar error
```

### Caso 3: 3D Secure (requiere confirmación adicional)
```
Tarjeta: 4000 0025 0000 3155
Fecha: 12/25
CVC: 123
Email: test@example.com
Resultado esperado: 🔐 Redirige a autenticación, luego éxito
```

### Caso 4: Información incompleta
```
Email: (vacío)
Tarjeta: 4242 4242 4242 4242
Resultado esperado: ⚠️ Error "Por favor, ingrese un email válido"
```

### Caso 5: Cerrar modal y reabrir
```
1. Abre modal
2. Haz click en X (cerrar)
3. Haz click en "Comprar" nuevamente
Resultado esperado: Modal se abre nuevamente, sin datos previos
```

---

## 📊 VERIFICACIONES FINALES

### Después de completar todos los tests:

- [ ] Los estilos del modal se ven profesionales
- [ ] No hay errores en la consola (F12)
- [ ] Los toasts aparecen correctamente
- [ ] Las órdenes se crean en la base de datos
- [ ] Los puntos se actualizan correctamente
- [ ] El flujo es suave (sin tiempos de espera innecesarios)
- [ ] Los errores se muestran claramente al usuario
- [ ] El modal es responsive en todos los dispositivos

### Rendimiento:
- [ ] El modal abre en < 500ms
- [ ] El pago se procesa en < 5 segundos
- [ ] No hay memory leaks (F12 → Performance)

### Seguridad:
- [ ] La clave secreta de Stripe NO aparece en el frontend
- [ ] El email se valida antes de enviar
- [ ] Los datos de tarjeta se procesan solo con Stripe
- [ ] No hay logs de datos sensibles en la consola

---

## 🚨 ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| "Stripe no está cargado" | Variable de entorno falta | Verifica `.env.local` |
| "Cannot read property 'confirmCardPayment'" | Stripe no está inicializado | Verifica `loadStripe()` |
| "No se recibió clientSecret" | Backend no responde | Verifica que backend está corriendo |
| "Card declined" | Tarjeta de prueba incorrecta | Usa `4242 4242 4242 4242` |
| "Invalid email" | Email sin @ | Ingresa formato válido |
| CORS error | Backend no permite requests | Configura CORS en backend |

---

## 📝 NOTAS IMPORTANTES

1. **Las tarjetas de prueba son ESPECÍFICAS de Stripe Test Mode**
   - En producción no funcionan
   - Cada tarjeta tiene un comportamiento diferente
   - Consulta: https://stripe.com/docs/testing

2. **Los pagos se procesan REALMENTE en test mode**
   - No se cobra dinero, pero sí se registran
   - Aparecen en tu dashboard de Stripe
   - Se pueden ver en `https://dashboard.stripe.com/test/payments`

3. **Los Payment Intents expiran después de 24 horas**
   - Si no completas el pago en ese tiempo, expira
   - Necesitas crear uno nuevo

4. **Guarda tus Payment Intent IDs para auditoria**
   - Son el identificador único del pago
   - Te ayudan a rastrear problemas

---

## 🎉 CUANDO TODO FUNCIONA

Si completaste todos los tests exitosamente:

✅ La integración de Stripe está **100% funcional**
✅ El flujo de pago es **end-to-end**
✅ El usuario puede **comprar crepas con tarjeta**
✅ Las órdenes se crean **automáticamente después del pago**
✅ Los puntos se actualizan **correctamente**

¡Felicidades, tu sistema de pagos está listo para usar! 🚀
