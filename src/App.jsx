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

// NUEVO: Componente Skeleton (Caja pulsante)
const Skeleton = ({ width = '100%', height = '20px', style }) => (
  <motion.div
    animate={{ opacity: [0.3, 0.6, 0.3] }} // Efecto pulso
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    style={{
      width,
      height,
      backgroundColor: '#333',
      borderRadius: '8px',
      marginBottom: '10px',
      ...style
    }}
  />
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

// 2. MENÚ (CON SKELETONS)
function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [selectedCategory, setSelectedCategory] = useState(0);
  const navigate = useNavigate();

  const categories = [{id:0,name:'Todas'},{id:1,name:'Dulces 🍫'},{id:2,name:'Saladas 🧀'},{id:3,name:'Postres 🍦'},{id:4,name:'Bebidas 🥤'}];

  useEffect(() => {
    // Simulamos un pequeño delay para ver el skeleton si la red es muy rápida
    productService.getAll()
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        {/* HERO */}
        <div style={{ height: '350px', backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #121212), url(https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&auto=format&fit=crop&w=1547&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', color: THEME.gold, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Bienvenido a la experiencia dulce</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={{ fontSize: '1.2rem', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Hola, {user.nombre} • Tienes 💎 {user.puntos_actuales} puntos</motion.p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: THEME.text, borderLeft: `4px solid ${THEME.gold}`, paddingLeft: '10px' }}>Nuestro Menú</h2>
            <button onClick={() => { authService.logout(); navigate('/login'); }} style={{ background: 'transparent', border: `1px solid ${THEME.border}`, color: '#888', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>Cerrar Sesión</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
            {categories.map(cat => (
              <motion.button key={cat.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '10px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: selectedCategory === cat.id ? THEME.gold : '#2c2c2c', color: selectedCategory === cat.id ? '#000' : '#888' }}>{cat.name}</motion.button>
            ))}
          </div>

          {/* GRID: SI CARGA, MUESTRA SKELETONS; SI NO, PRODUCTOS */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} style={styles.card}>
                  <Skeleton height="180px" style={{ borderRadius: '8px', marginBottom: '15px' }} />
                  <Skeleton height="25px" width="70%" />
                  <Skeleton height="15px" width="90%" />
                  <Skeleton height="15px" width="60%" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <Skeleton height="30px" width="30%" />
                    <Skeleton height="40px" width="40%" style={{ borderRadius: '25px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div variants={containerStagger} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {filtered.map(p => (
                <motion.div key={p.id} variants={cardItem} style={{ ...styles.card, padding: 0, position: 'relative' }} whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                  <div style={{ height: '200px', overflow: 'hidden' }}><img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  {!p.disponible && <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(231, 76, 60, 0.9)', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold' }}>AGOTADO</div>}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{p.nombre}</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', minHeight: '40px' }}>{p.descripcion}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: THEME.gold }}>${p.precio}</span>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleBuy(p)} disabled={!p.disponible} style={{ padding: '10px 25px', borderRadius: '25px', border: 'none', background: p.disponible ? THEME.gold : '#444', color: p.disponible ? '#000' : '#888', fontWeight: 'bold', cursor: p.disponible ? 'pointer' : 'not-allowed' }}>{p.disponible ? 'Agregar' : 'Sin Stock'}</motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// 3. MIS PEDIDOS
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => { 
    orderService.getMyOrders()
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false)); 
  }, []);

  const statusColors = { 'pendiente': '#f39c12', 'en_preparacion': '#3498db', 'listo': '#2ecc71', 'entregado': '#7f8c8d' };

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.button whileHover={{ x: -5 }} onClick={() => navigate('/menu')} style={{ background: 'transparent', color: THEME.gold, border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '20px' }}>⬅ Regresar</motion.button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: THEME.gold }}>Mis Pedidos</h1>
          
          {loading ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {[1, 2, 3].map(n => <Skeleton key={n} height="120px" style={{ borderRadius: '12px' }} />)}
            </div>
          ) : (
            <motion.div variants={containerStagger} initial="hidden" animate="show" style={{ display: 'grid', gap: '20px' }}>
              {orders.map(o => (
                <motion.div key={o.id} variants={cardItem} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
                    <div><span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Orden #{o.id}</span><div style={{ fontSize: '0.8em', color: '#888' }}>{new Date(o.fecha_creacion).toLocaleString()}</div></div>
                    <div style={{ textAlign: 'right' }}><span style={{ background: statusColors[o.estado] || '#555', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase' }}>{o.estado.replace('_', ' ')}</span></div>
                  </div>
                  {o.items?.map(i => (<div key={i.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'0.95em'}}><span>{i.cantidad}x {i.Product?.nombre}</span><span style={{ color: '#888' }}>${i.precio_unitario}</span></div>))}
                  <div style={{ marginTop: '15px', borderTop: `1px dashed ${THEME.border}`, paddingTop: '10px', textAlign: 'right', fontSize: '1.2em', color: THEME.gold, fontWeight: 'bold' }}>Total: ${o.total_pagar}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// 4. ADMIN (PRODUCTOS)
function AdminProducts() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Inventario</h2></div></PageTransition>; }
function Kitchen() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Cocina</h2></div></PageTransition>; }

// 6. DASHBOARD (CON SKELETONS)
function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { dashboardService.getMetrics().then(setMetrics).catch(() => setMetrics({})); }, []);

  if (!metrics) return (
    <div style={{ ...styles.container, padding: '20px' }}>
      <Skeleton height="40px" width="300px" style={{marginBottom: '30px'}} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <Skeleton height="150px" style={{borderRadius: '12px'}} />
        <Skeleton height="150px" style={{borderRadius: '12px'}} />
      </div>
      <Skeleton height="400px" style={{borderRadius: '12px'}} />
    </div>
  );

  const chartData = {
    labels: metrics.top_productos?.map(i => i.Product.nombre),
    datasets: [{ label: 'Ventas', data: metrics.top_productos?.map(i => i.total_vendido), backgroundColor: THEME.gold }]
  };

  return (
    <div style={{ ...styles.container, padding: '20px' }}>
      <h2 style={{ color: THEME.gold }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ ...styles.card, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9em', color: '#888' }}>Ventas Hoy</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: THEME.success }}>${metrics.ventas_hoy}</div>
        </div>
        <div style={{ ...styles.card, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9em', color: '#888' }}>Ventas Mes</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: THEME.gold }}>${metrics.ventas_mes}</div>
        </div>
      </div>
      <div style={{ ...styles.card, height: '400px' }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }} />
      </div>
    </div>
  );
}

function AdminUsers() { return <PageTransition><div style={{...styles.container, padding: '20px'}}><h2>Usuarios</h2></div></PageTransition>; }

// --- RUTAS Y APP ---
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