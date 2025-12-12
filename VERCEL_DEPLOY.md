# Deploy en Vercel - Checklist

## ✅ Configuración completada

1. **axios.js** - Actualizado para usar `VITE_API_URL` desde variables de entorno
2. **.env** - Configurado para desarrollo local (http://localhost:3000)
3. **.env.production** - Creado para producción en Railway

## 📋 Pasos para Deploy en Vercel

### 1. Conectar repositorio
- Ve a https://vercel.com
- Conecta tu repositorio de GitHub
- Selecciona el proyecto `crepa-urbana-frontend`

### 2. Agregar variables de entorno en Vercel
En la sección "Settings" > "Environment Variables", agrega:

```
VITE_API_URL=https://crepa-urbana-backend-production.up.railway.app
VITE_STRIPE_PUBLIC_KEY=pk_test_51ScamzPz6W8JeHACaUI2G38dBk13qO5mbGJm4fLNP0ftS9EgoMN5iMx3wOvAmIaJeTkkxo2689Qu6fsc4RJD1AyZ00tSL06kMe
```

### 3. Configuración de Vercel (automática)
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Vercel detectará automáticamente que es un proyecto Vite.

### 4. Deploy
- Haz push a la rama main
- Vercel hará deploy automáticamente

## 🔗 Variables de entorno explicadas

| Variable | Valor | Uso |
|----------|-------|-----|
| VITE_API_URL | https://crepa-urbana-backend-production.up.railway.app | URL del backend en producción |
| VITE_STRIPE_PUBLIC_KEY | pk_test_... | Clave pública de Stripe (test por ahora) |

## ⚠️ Importante

- `.env` y `.env.production` están en `.gitignore` (correcto)
- Las variables en Vercel sobreescriben las locales
- Cuando cambies a keys de Stripe en vivo, actualiza también en Vercel

## 🚀 Después del primer deploy

Vercel te dará una URL como:
`https://crepa-urbana-frontend-xxxxx.vercel.app`

Confirma que:
- ✅ La aplicación carga correctamente
- ✅ Las peticiones al API funcionan
- ✅ Stripe se integra correctamente
