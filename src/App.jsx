import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion'; // <--- IMPORTANTE

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- ESTILOS Y TEMA ---
const THEME = {
  bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', gold: '#d4af37', border: '#333333', success: '#27ae60', danger: '#e74c3c'
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: "'Segoe UI', sans-serif" },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: `1px solid ${THEME.border}`, backgroundColor: '#2c2c2c', color: 'white' },
  // Convertimos los estilos de botón en objetos base para usarlos con motion.button
  buttonBase: { width: '100%', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  card: { backgroundColor: THEME.cardBg, borderRadius: '12px', padding: '15px', border: `1px solid ${THEME.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  navLink: { color: THEME.text, textDecoration: 'none', padding: '5px 10px', fontSize: '0.95rem' }
};

// --- ANIMACIONES (VARIANTS) ---
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 }
};

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Retraso entre cada tarjeta
    }
  }
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// --- API ---
const api = axios.create({ baseURL: 'http://localhost:3000/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (e) => Promise.reject(e));

// --- SERVICIOS ---
const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) { localStorage.setItem('token', res.data.token); localStorage.setItem('user', JSON.stringify(res.data.user)); }
    return res.data;
  },
  register: async (data) => (await api.post('/auth/register', data)).data,
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); }
};
const productService = {
  getAll: async () => (await api.get('/products')).data,
  create: async (data) => (await api.post('/products', data)).data,
  update: async (id, data) => (await api.put(`/products/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/products/${id}`)).data
};
const orderService = {
  create: async (items) => (await api.post('/orders', { items })).data,
  getMyOrders: async () => (await api.get('/orders/my-orders')).data,
  getAll: async () => (await api.get('/orders')).data,
  updateStatus: async (id, status) => (await api.patch(`/orders/${id}/status`, { estado: status })).data
};
const dashboardService = { getMetrics: async () => (await api.get('/dashboard')).data };

// --- COMPONENTES VISUALES ---

const PageTransition = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

// 1. LOGIN
function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', telefono: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await authService.register(formData);
        alert('¡Registro exitoso!'); setIsRegistering(false);
      } else {
        await authService.login(formData.email, formData.password);
        window.location.href = '/menu';
      }
    } catch (e) { alert('Error: ' + (e.response?.data?.message || 'Error')); }
  };

  return (
    <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.5 }}
        style={{ ...styles.card, width: '100%', maxWidth: '400px', padding: '40px' }}
      >
        <h1 style={{ textAlign: 'center', color: THEME.gold, fontFamily: "'Playfair Display', serif" }}>Crepa Urbana</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          {isRegistering && <input style={styles.input} placeholder="Nombre" name="nombre" onChange={handleChange} required />}
          <input style={styles.input} placeholder="Email" name="email" onChange={handleChange} required />
          <input style={styles.input} placeholder="Password" type="password" name="password" onChange={handleChange} required />
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            type="submit" 
            style={{ ...styles.buttonBase, background: THEME.gold, color: '#000' }}
          >
            {isRegistering ? 'Registrarse' : 'Entrar'}
          </motion.button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ textAlign: 'center', color: THEME.gold, cursor: 'pointer', marginTop: '15px' }}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿Crear cuenta?'}
          </p>
        </form>
      </motion.div>
    </div>
  );
}

// 2. MENÚ (CON ANIMACIONES)
function Menu() {
  const [products, setProducts] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [selectedCategory, setSelectedCategory] = useState(0);
  const navigate = useNavigate();

  const categories = [{id:0,name:'Todas'},{id:1,name:'Dulces 🍫'},{id:2,name:'Saladas 🧀'},{id:3,name:'Postres 🍦'},{id:4,name:'Bebidas 🥤'}];

  useEffect(() => { productService.getAll().then(setProducts); }, []);

  const handleBuy = async (p) => {
    if (!window.confirm(`¿Pedir ${p.nombre}?`)) return;
    try {
      const res = await orderService.create([{ producto_id: p.id, cantidad: 1 }]);
      if(window.confirm(`¡Ganaste ${res.data.puntos_ganados} pts! ¿Ver pedido?`)) navigate('/my-orders');
    } catch { alert('Error'); }
  };

  const filtered = selectedCategory === 0 ? products : products.filter(p => p.categoria_id === selectedCategory);

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: THEME.gold, fontFamily: "'Playfair Display', serif" }}>Menú</h1>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => { authService.logout(); navigate('/login'); }} style={{ background: 'transparent', border: '1px solid #555', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>Salir</motion.button>
          </header>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' }}>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  ...styles.buttonBase, width: 'auto', padding: '8px 16px', borderRadius: '20px',
                  background: selectedCategory === cat.id ? THEME.gold : 'transparent',
                  color: selectedCategory === cat.id ? '#000' : THEME.gold,
                  border: `1px solid ${THEME.gold}`
                }}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>

          {/* GRID ANIMADO */}
          <motion.div 
            variants={containerStagger}
            initial="hidden"
            animate="show"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}
          >
            {filtered.map(p => (
              <motion.div key={p.id} variants={cardItem} style={styles.card} whileHover={{ y: -5 }}>
                <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }} />
                <h3 style={{ margin: '10px 0', fontSize: '1.2rem' }}>{p.nombre}</h3>
                <p style={{ color: '#888', fontSize: '0.9em' }}>{p.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '1.4rem', color: THEME.gold, fontWeight: 'bold' }}>${p.precio}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuy(p)}
                    disabled={!p.disponible}
                    style={{ ...styles.buttonBase, width: 'auto', padding: '8px 20px', background: p.disponible ? THEME.gold : '#555', color: '#000' }}
                  >
                    {p.disponible ? 'Pedir' : 'Agotado'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

// 3. MIS PEDIDOS
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { orderService.getMyOrders().then(setOrders); }, []);

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.button whileHover={{ x: -5 }} onClick={() => navigate('/menu')} style={{ background: 'transparent', color: THEME.gold, border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '20px' }}>⬅ Volver</motion.button>
          <h1 style={{ color: THEME.gold }}>Mis Pedidos</h1>
          <motion.div variants={containerStagger} initial="hidden" animate="show" style={{ display: 'grid', gap: '15px' }}>
            {orders.map(o => (
              <motion.div key={o.id} variants={cardItem} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>Orden #{o.id}</b>
                  <span style={{ color: THEME.gold }}>{o.estado.toUpperCase()}</span>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '10px' }}>${o.total_pagar}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

// COMPONENTES ADMIN SIMPLIFICADOS (Solo envoltorio visual para el ejemplo)
function AdminProducts() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Inventario</h2></div></PageTransition>; }
function Kitchen() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Cocina</h2></div></PageTransition>; }
function Dashboard() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Dashboard</h2></div></PageTransition>; }
function AdminUsers() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Usuarios</h2></div></PageTransition>; }

// --- RUTAS ANIMADAS ---
const PrivateRoute = ({ children }) => localStorage.getItem('token') ? children : <Navigate to="/login" />;

function AnimatedRoutes() {
  const location = useLocation(); // Necesario para que Framer sepa cuándo cambia la ruta
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
        <Route path="/admin-menu" element={<PrivateRoute><AdminProducts /></PrivateRoute>} />
        <Route path="/kitchen" element={<PrivateRoute><Kitchen /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin-users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuth = !!localStorage.getItem('token');
  const isAdmin = user.rol === 'admin';

  return (
    <BrowserRouter>
      <div style={{ backgroundColor: THEME.bg, minHeight: '100vh' }}>
        {isAuth && (
          <nav style={{ backgroundColor: '#000', borderBottom: `2px solid ${THEME.gold}`, padding: '15px', overflowX: 'auto', display: 'flex', gap: '20px' }}>
            <a href="/menu" style={{ ...styles.navLink, color: THEME.gold }}>MENÚ</a>
            {!isAdmin && <a href="/my-orders" style={styles.navLink}>MIS PEDIDOS</a>}
            {isAdmin && <a href="/dashboard" style={styles.navLink}>ADMIN</a>}
          </nav>
        )}
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;