import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- ESTILOS Y TEMA ---
const THEME = {
  bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', gold: '#d4af37', border: '#333333', success: '#27ae60', danger: '#e74c3c'
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: "'Segoe UI', sans-serif" },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${THEME.border}`, backgroundColor: '#2c2c2c', color: 'white' },
  buttonBase: { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  // Tarjetas con bordes más pronunciados
  card: { backgroundColor: THEME.cardBg, borderRadius: '20px', padding: '15px', border: `1px solid ${THEME.border}`, overflow: 'hidden' },
  navLink: { color: THEME.text, textDecoration: 'none', padding: '5px 10px', fontSize: '0.95rem' }
};

// --- ANIMACIONES ---
const pageVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3 } };
const containerStagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardItem = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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
    <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1519340333755-56e9c1d04579?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ ...styles.card, width: '100%', maxWidth: '400px', padding: '40px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(30,30,30,0.8)' }}
      >
        <h1 style={{ textAlign: 'center', color: THEME.gold, fontFamily: "'Playfair Display', serif", fontSize: '2.5rem' }}>Crepa Urbana</h1>
        <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '20px' }}>La experiencia dulce</p>
        <form onSubmit={handleSubmit}>
          {isRegistering && <input style={styles.input} placeholder="Nombre" name="nombre" onChange={handleChange} required />}
          <input style={styles.input} placeholder="Email" name="email" onChange={handleChange} required />
          <input style={styles.input} placeholder="Password" type="password" name="password" onChange={handleChange} required />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" style={{ ...styles.buttonBase, background: THEME.gold, color: '#000' }}>
            {isRegistering ? 'Registrarse' : 'Entrar'}
          </motion.button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ textAlign: 'center', color: THEME.gold, cursor: 'pointer', marginTop: '15px', textDecoration: 'underline' }}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿Crear cuenta?'}
          </p>
        </form>
      </motion.div>
    </div>
  );
}

// 2. MENÚ (CON HERO SECTION Y MEJORES TARJETAS)
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
      <div style={{ ...styles.container }}>
        {/* HERO SECTION */}
        <div style={{ 
          height: '350px', 
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #121212), url(https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&auto=format&fit=crop&w=1547&q=80)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px'
        }}>
          <motion.h1 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', color: THEME.gold, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
          >
            Bienvenido a la experiencia dulce
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontSize: '1.2rem', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
            Hola, {user.nombre} • Tienes 💎 {user.puntos_actuales} puntos
          </motion.p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {/* HEADER UTILITARIO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: THEME.text, borderLeft: `4px solid ${THEME.gold}`, paddingLeft: '10px' }}>Nuestro Menú</h2>
            <button onClick={() => { authService.logout(); navigate('/login'); }} style={{ background: 'transparent', border: `1px solid ${THEME.border}`, color: '#888', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>Cerrar Sesión</button>
          </div>

          {/* FILTROS */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                  background: selectedCategory === cat.id ? THEME.gold : '#2c2c2c',
                  color: selectedCategory === cat.id ? '#000' : '#888',
                  boxShadow: selectedCategory === cat.id ? '0 0 10px rgba(212, 175, 55, 0.4)' : 'none'
                }}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>

          {/* GRID DE PRODUCTOS MEJORADO */}
          <motion.div variants={containerStagger} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {filtered.map(p => (
              <motion.div 
                key={p.id} 
                variants={cardItem} 
                style={{ ...styles.card, padding: 0, position: 'relative' }}
                whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }} // <--- SOMBRA QUE CRECE
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                </div>
                {!p.disponible && <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(231, 76, 60, 0.9)', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.8rem' }}>AGOTADO</div>}
                
                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{p.nombre}</h3>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', minHeight: '40px' }}>{p.descripcion}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: THEME.gold }}>${p.precio}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBuy(p)}
                      disabled={!p.disponible}
                      style={{ 
                        padding: '10px 25px', 
                        borderRadius: '25px', 
                        border: 'none', 
                        background: p.disponible ? THEME.gold : '#444', 
                        color: p.disponible ? '#000' : '#888',
                        fontWeight: 'bold', 
                        cursor: p.disponible ? 'pointer' : 'not-allowed',
                        boxShadow: p.disponible ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                      }}
                    >
                      {p.disponible ? 'Agregar' : 'Sin Stock'}
                    </motion.button>
                  </div>
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
          <motion.button whileHover={{ x: -5 }} onClick={() => navigate('/menu')} style={{ background: 'transparent', color: THEME.gold, border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '20px' }}>⬅ Regresar</motion.button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: THEME.gold }}>Mis Pedidos</h1>
          <motion.div variants={containerStagger} initial="hidden" animate="show" style={{ display: 'grid', gap: '20px' }}>
            {orders.map(o => (
              <motion.div key={o.id} variants={cardItem} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Orden #{o.id}</span>
                  <span style={{ color: THEME.gold, fontWeight: 'bold' }}>{o.estado.toUpperCase().replace('_', ' ')}</span>
                </div>
                {o.items?.map(i => (<div key={i.id} style={{display:'flex', justifyContent:'space-between', color:'#ccc'}}><span>{i.cantidad}x {i.Product?.nombre}</span><span>${i.precio_unitario}</span></div>))}
                <div style={{ marginTop: '15px', textAlign: 'right', fontSize: '1.2em', fontWeight: 'bold', color: THEME.gold }}>Total: ${o.total_pagar}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

// COMPONENTES ADMIN SIMPLIFICADOS
function AdminProducts() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Inventario</h2></div></PageTransition>; }
function Kitchen() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Cocina</h2></div></PageTransition>; }
function Dashboard() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Dashboard</h2></div></PageTransition>; }
function AdminUsers() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Usuarios</h2></div></PageTransition>; }

// --- RUTAS ANIMADAS ---
const PrivateRoute = ({ children }) => localStorage.getItem('token') ? children : <Navigate to="/login" />;

function AnimatedRoutes() {
  const location = useLocation();
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
          <nav style={{ backgroundColor: '#000', borderBottom: `1px solid ${THEME.border}`, padding: '15px', overflowX: 'auto', display: 'flex', gap: '20px', position: 'sticky', top: 0, zIndex: 100 }}>
            <a href="/menu" style={{ ...styles.navLink, color: THEME.gold }}>MENÚ</a>
            {!isAdmin && <a href="/my-orders" style={styles.navLink}>PEDIDOS</a>}
            {isAdmin && <a href="/dashboard" style={styles.navLink}>ADMIN</a>}
          </nav>
        )}
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;