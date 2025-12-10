#!/usr/bin/env node
/**
 * 🎯 VERIFICACIÓN DE INTEGRACIÓN STRIPE
 * 
 * Este script verifica que todos los archivos están en su lugar
 * y que la integración de Stripe está completa.
 * 
 * Uso: node verify-integration.js
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${COLORS.GREEN}✅ ${msg}${COLORS.RESET}`),
  error: (msg) => console.log(`${COLORS.RED}❌ ${msg}${COLORS.RESET}`),
  warning: (msg) => console.log(`${COLORS.YELLOW}⚠️  ${msg}${COLORS.RESET}`),
  info: (msg) => console.log(`${COLORS.BLUE}ℹ️  ${msg}${COLORS.RESET}`),
};

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, searchString) {
  if (!checkFileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

console.log('\n' + '═'.repeat(60));
console.log('🔍 VERIFICACIÓN DE INTEGRACIÓN STRIPE - CREPA URBANA');
console.log('═'.repeat(60) + '\n');

let allChecks = true;

// 1. Verificar archivos creados
console.log('📁 ARCHIVOS CREADOS:');
const filesToCheck = [
  'src/services/paymentService.js',
  'src/components/PaymentModal.jsx',
  'src/components/PaymentModal.css',
  '.env.local'
];

filesToCheck.forEach(file => {
  if (checkFileExists(file)) {
    log.success(`Existe: ${file}`);
  } else {
    log.error(`Falta: ${file}`);
    allChecks = false;
  }
});

// 2. Verificar archivos modificados
console.log('\n✏️  ARCHIVOS MODIFICADOS:');
if (checkFileContent('src/pages/Menu.jsx', 'PaymentModal')) {
  log.success('Menu.jsx contiene importación de PaymentModal');
} else {
  log.error('Menu.jsx no tiene PaymentModal importado');
  allChecks = false;
}

if (checkFileContent('src/pages/Menu.jsx', 'showPaymentModal')) {
  log.success('Menu.jsx tiene estado showPaymentModal');
} else {
  log.error('Menu.jsx no tiene estado showPaymentModal');
  allChecks = false;
}

if (checkFileContent('src/pages/Menu.jsx', 'handlePaymentSuccess')) {
  log.success('Menu.jsx tiene función handlePaymentSuccess');
} else {
  log.error('Menu.jsx no tiene handlePaymentSuccess');
  allChecks = false;
}

// 3. Verificar documentación
console.log('\n📖 DOCUMENTACIÓN:');
const docFiles = [
  'STRIPE_INTEGRATION.md',
  'ARCHITECTURE.md',
  'TESTING_GUIDE.md',
  'CODE_EXAMPLES.md',
  'IMPLEMENTATION_SUMMARY.md',
  'INDEX.md',
  'STATUS.txt'
];

docFiles.forEach(file => {
  if (checkFileExists(file)) {
    const size = fs.statSync(file).size;
    log.success(`Existe: ${file} (${Math.round(size/1024)}KB)`);
  } else {
    log.error(`Falta: ${file}`);
    allChecks = false;
  }
});

// 4. Verificar contenido de paymentService
console.log('\n🔧 CONTENIDO DE paymentService.js:');
const paymentServiceChecks = [
  { name: 'createPaymentIntent', search: 'createPaymentIntent' },
  { name: 'confirmPayment', search: 'confirmPayment' },
  { name: 'checkPaymentStatus', search: 'checkPaymentStatus' },
  { name: 'getMyTransactions', search: 'getMyTransactions' }
];

paymentServiceChecks.forEach(check => {
  if (checkFileContent('src/services/paymentService.js', check.search)) {
    log.success(`Método presente: ${check.name}()`);
  } else {
    log.error(`Método falta: ${check.name}()`);
    allChecks = false;
  }
});

// 5. Verificar contenido de PaymentModal
console.log('\n🎨 CONTENIDO DE PaymentModal.jsx:');
const modalChecks = [
  { name: 'CardElement import', search: 'CardElement' },
  { name: 'useStripe hook', search: 'useStripe' },
  { name: 'useElements hook', search: 'useElements' },
  { name: 'confirmCardPayment', search: 'confirmCardPayment' },
  { name: 'paymentService', search: 'paymentService' }
];

modalChecks.forEach(check => {
  if (checkFileContent('src/components/PaymentModal.jsx', check.search)) {
    log.success(`Presente: ${check.name}`);
  } else {
    log.error(`Falta: ${check.name}`);
    allChecks = false;
  }
});

// 6. Verificar .env.local
console.log('\n🔑 VARIABLES DE ENTORNO:');
if (checkFileContent('.env.local', 'VITE_STRIPE_PUBLIC_KEY')) {
  log.success('VITE_STRIPE_PUBLIC_KEY está configurada');
} else {
  log.warning('VITE_STRIPE_PUBLIC_KEY no encontrada');
}

if (checkFileContent('.env.local', 'VITE_API_URL')) {
  log.success('VITE_API_URL está configurada');
} else {
  log.warning('VITE_API_URL no encontrada');
}

// 7. Verificar package.json
console.log('\n📦 DEPENDENCIAS:');
const dependencies = [
  { name: '@stripe/react-stripe-js', package: '@stripe/react-stripe-js' },
  { name: '@stripe/stripe-js', package: '@stripe/stripe-js' },
  { name: 'react-toastify', package: 'react-toastify' }
];

if (checkFileExists('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  dependencies.forEach(dep => {
    if (allDeps[dep.package]) {
      log.success(`${dep.name} (v${allDeps[dep.package]})`);
    } else {
      log.error(`Falta: ${dep.name}`);
      allChecks = false;
    }
  });
} else {
  log.error('package.json no encontrado');
}

// Resultado final
console.log('\n' + '═'.repeat(60));
if (allChecks) {
  log.success('INTEGRACIÓN COMPLETADA CORRECTAMENTE ✅');
  console.log('\n🚀 Próximos pasos:');
  console.log('   1. Lee INDEX.md para entender la documentación');
  console.log('   2. Verifica que el backend tiene los endpoints /api/payments/*');
  console.log('   3. Inicia el frontend: npm run dev');
  console.log('   4. Sigue TESTING_GUIDE.md para hacer testing');
  console.log('\n');
} else {
  log.error('INTEGRACIÓN INCOMPLETA ❌');
  console.log('\n🔧 Por favor, revisa los errores arriba y resuelve los problemas.');
  console.log('\n');
  process.exit(1);
}

console.log('═'.repeat(60) + '\n');
