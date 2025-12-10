import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, ClipboardList, Package, ChefHat, BarChart3, Users, LogOut, 
  ShoppingCart, Gem, ChevronLeft, Trash2, Edit, CheckCircle, XCircle, Menu as MenuIcon 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Menu from './pages/Menu';
import { CartProvider } from './context/CartContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- ESTILOS Y TEMA ---
const THEME = {
  bg: '#121212', cardBg: '#1e1e1e', text: '#e0e0e0', gold: '#d4af37', border: '#333333', success: '#27ae60', danger: '#e74c3c'
};

const responsiveStyles = `
  .desktop-nav { display: none !important; }
  .mobile-nav { display: flex !important; }
  .app-content { padding-bottom: 80px; }
  .hero-title { font-size: 2.5rem !important; }

  @media (min-width: 768px) {
    .desktop-nav { display: flex !important; }
    .mobile-nav { display: none !important; }
    .app-content { padding-bottom: 0; }
    .hero-title { font-size: 3.5rem !important; }
  }
`;

const styles = {
  container: { minHeight: '100vh', backgroundColor: THEME.bg, color: THEME.text, fontFamily: "'Segoe UI', sans-serif" },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${THEME.border}`, backgroundColor: '#2c2c2c', color: 'white' },
  buttonBase: { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  card: { backgroundColor: THEME.cardBg, borderRadius: '20px', padding: '15px', border: `1px solid ${THEME.border}`, overflow: 'hidden' },
  bottomBarLink: { 
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    textDecoration: 'none', color: '#888', fontSize: '0.7rem', padding: '8px 0', cursor: 'pointer', minWidth: '0' 
  },
  navLink: { color: THEME.text, textDecoration: 'none', padding: '8px 12px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', transition: 'background 0.2s' }
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
const userService = {
  getAll: async () => (await api.get('/users')).data,
  adjustPoints: async (userId, points) => (await api.post('/loyalty/adjust', { userId, points })).data
};

// --- COMPONENTES VISUALES ---
const PageTransition = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="app-content">
    {children}
  </motion.div>
);

const Skeleton = ({ width = '100%', height = '20px', style }) => (
  <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ width, height, backgroundColor: '#333', borderRadius: '8px', marginBottom: '10px', ...style }} />
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
        toast.success('¡Registro exitoso! Por favor inicia sesión.'); 
        setIsRegistering(false);
      } else {
        await authService.login(formData.email, formData.password);
        toast.success('¡Bienvenido a Crepa Urbana!', { icon: "👋" });
        setTimeout(() => window.location.href = '/menu', 500);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Error en la operación'); }
  };

  return (
    <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1519340333755-56e9c1d04579?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} style={{ ...styles.card, width: '100%', maxWidth: '400px', padding: '40px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(30,30,30,0.8)' }}>
        <h1 style={{ textAlign: 'center', color: THEME.gold, fontFamily: "'Playfair Display', serif", fontSize: '2.5rem' }}>Crepa Urbana</h1>
        <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '20px' }}>La experiencia dulce</p>
        <form onSubmit={handleSubmit}>
          {isRegistering && <input style={styles.input} placeholder="Nombre" name="nombre" onChange={handleChange} required />}
          <input style={styles.input} placeholder="Email" name="email" onChange={handleChange} required />
          <input style={styles.input} placeholder="Password" type="password" name="password" onChange={handleChange} required />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" style={{ ...styles.buttonBase, background: THEME.gold, color: '#000' }}>{isRegistering ? 'Registrarse' : 'Entrar'}</motion.button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ textAlign: 'center', color: THEME.gold, cursor: 'pointer', marginTop: '15px', textDecoration: 'underline' }}>{isRegistering ? '¿Ya tienes cuenta?' : '¿Crear cuenta?'}</p>
        </form>
      </motion.div>
    </div>
  );
}

// 2. MENÚ (ANTIGUA - DESHABILITADA - Reemplazada por src/pages/Menu.jsx)
function OldMenu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [selectedCategory, setSelectedCategory] = useState(0);
  const navigate = useNavigate();
  const categories = [{id:0,name:'Todas'},{id:1,name:'Dulces'},{id:2,name:'Saladas'},{id:3,name:'Postres'},{id:4,name:'Bebidas'}];

  useEffect(() => { productService.getAll().then(data => { setProducts(data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const handleBuy = async (p) => {
    // ELIMINADO EL WINDOW.CONFIRM --> Ahora es compra directa en 1 clic
    try {
      const res = await orderService.create([{ producto_id: p.id, cantidad: 1 }]);
      
      // Toast elegante con acción
      toast.success(
        <div onClick={() => navigate('/my-orders')} style={{ cursor: 'pointer' }}>
          <strong>¡{p.nombre} pedida!</strong><br/>
          +{res.data.puntos_ganados} pts 💎 (Clic para ver)
        </div>,
        { autoClose: 3000 }
      );
    } catch { toast.error('Error al procesar el pedido'); }
  };

  const filtered = selectedCategory === 0 ? products : products.filter(p => p.categoria_id === selectedCategory);

  return (
    <PageTransition>
      <div style={{ ...styles.container }}>
        <div style={{ height: '300px', backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #121212), url(https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-4.0.3&auto=format&fit=crop&w=1547&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="hero-title" style={{ fontFamily: "'Playfair Display', serif", color: THEME.gold, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Crepa Urbana</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={{ fontSize: '1.2rem', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Hola, {user.nombre} • <Gem size={18} color={THEME.gold} /> {user.puntos_actuales}
          </motion.p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: THEME.text, borderLeft: `4px solid ${THEME.gold}`, paddingLeft: '10px' }}>Nuestro Menú</h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
            {categories.map(cat => (
              <motion.button key={cat.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '8px 16px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: selectedCategory === cat.id ? THEME.gold : '#2c2c2c', color: selectedCategory === cat.id ? '#000' : '#888' }}>{cat.name}</motion.button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>{[1,2,3,4].map(n => <div key={n} style={styles.card}><Skeleton height="180px" style={{borderRadius:'8px', marginBottom:'15px'}} /><Skeleton height="20px" width="70%" /><Skeleton height="40px" width="40%" style={{marginTop:'20px'}} /></div>)}</div>
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
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleBuy(p)} disabled={!p.disponible} style={{ padding: '10px 20px', borderRadius: '25px', border: 'none', background: p.disponible ? THEME.gold : '#444', color: p.disponible ? '#000' : '#888', fontWeight: 'bold', cursor: p.disponible ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:'5px' }}>
                        {p.disponible ? <><ShoppingCart size={18}/> Agregar</> : 'Sin Stock'}
                      </motion.button>
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
  useEffect(() => { orderService.getMyOrders().then(data => { setOrders(data); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const statusColors = { 'pendiente': '#f39c12', 'en_preparacion': '#3498db', 'listo': '#2ecc71', 'entregado': '#7f8c8d' };

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.button whileHover={{ x: -5 }} onClick={() => navigate('/menu')} style={{ background: 'transparent', color: THEME.gold, border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '20px', display:'flex', alignItems:'center', gap:'5px' }}>
            <ChevronLeft /> Regresar
          </motion.button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: THEME.gold }}>Mis Pedidos</h1>
          {loading ? <div style={{ display: 'grid', gap: '20px' }}>{[1,2].map(n => <Skeleton key={n} height="120px" style={{borderRadius:'12px'}} />)}</div> : (
            <motion.div variants={containerStagger} initial="hidden" animate="show" style={{ display: 'grid', gap: '20px' }}>
              {orders.map(o => (
                <motion.div key={o.id} variants={cardItem} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}><ClipboardList size={20} color={THEME.gold}/><span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Orden #{o.id}</span></div>
                    <div style={{ textAlign: 'right' }}><span style={{ background: statusColors[o.estado] || '#555', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase' }}>{o.estado.replace('_', ' ')}</span></div>
                  </div>
                  {o.items?.map(i => (<div key={i.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'0.95em'}}><span>{i.cantidad}x {i.Product?.nombre}</span><span style={{ color: '#888' }}>${i.precio_unitario}</span></div>))}
                  <div style={{ marginTop: '15px', borderTop: `1px dashed ${THEME.border}`, paddingTop: '10px', textAlign: 'right', fontSize: '1.2em', fontWeight: 'bold', color: THEME.gold }}>Total: ${o.total_pagar}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// 4. ADMIN: INVENTARIO (Sin confirm, solo Toast)
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' });
  useEffect(() => { productService.getAll().then(setProducts); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await productService.create(formData);
    productService.getAll().then(setProducts);
    toast.success('Producto creado exitosamente'); 
  };

  const toggleStock = async (p) => {
    await productService.update(p.id, { disponible: !p.disponible });
    productService.getAll().then(setProducts);
    toast.info(`Stock actualizado: ${p.nombre}`);
  };

  // Eliminado window.confirm para borrar (directo)
  const deleteProduct = async (id) => {
    await productService.delete(id);
    productService.getAll().then(setProducts);
    toast.error('Producto eliminado');
  };

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <h2 style={{ color: THEME.gold, marginBottom: '20px' }}><Package style={{marginRight:'10px'}}/>Gestión de Inventario</h2>
        <div style={{ ...styles.card, marginBottom: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
            <input style={styles.input} placeholder="Nombre Producto" onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            <input style={styles.input} placeholder="Descripción" onChange={e => setFormData({...formData, descripcion: e.target.value})} />
            <input style={styles.input} placeholder="Precio" type="number" onChange={e => setFormData({...formData, precio: e.target.value})} required />
            <input style={styles.input} placeholder="URL Imagen" onChange={e => setFormData({...formData, imagen_url: e.target.value})} />
            <button type="submit" style={styles.buttonBase}><CheckCircle /> Agregar Producto</button>
          </form>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {products.map(p => (
            <div key={p.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <img src={p.imagen_url} alt="" style={{width:'50px', height:'50px', borderRadius:'5px', objectFit:'cover'}} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{p.nombre}</div>
                  <div style={{ color: THEME.gold }}>${p.precio}</div>
                </div>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => toggleStock(p)} style={{ ...styles.buttonBase, width:'auto', padding:'5px 10px', fontSize:'0.8em', borderColor: p.disponible ? THEME.success : THEME.danger, color: p.disponible ? THEME.success : THEME.danger, background: 'transparent', border: '1px solid' }}>
                  {p.disponible ? 'ACTIVO' : 'AGOTADO'}
                </button>
                <button onClick={() => deleteProduct(p.id)} style={{background:'transparent', border:'none', color: THEME.danger, cursor:'pointer'}}><Trash2 /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

// 5. ADMIN: COCINA
function Kitchen() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetch = () => orderService.getAll().then(data => setOrders(data.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado')));
    fetch();
    const i = setInterval(fetch, 5000);
    return () => clearInterval(i);
  }, []);

  const advance = async (o) => {
    const next = o.estado === 'pendiente' ? 'en_preparacion' : o.estado === 'en_preparacion' ? 'listo' : 'entregado';
    await orderService.updateStatus(o.id, next);
    toast.success(`Orden #${o.id} actualizada`); 
  };

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <h2 style={{ color: THEME.gold, marginBottom:'20px' }}><ChefHat style={{marginRight:'10px'}}/>Comandera KDS</h2>
        {orders.length === 0 && <p style={{color:'#666'}}>No hay pedidos pendientes...</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {orders.map(o => (
            <div key={o.id} style={{ ...styles.card, border: o.estado === 'pendiente' ? `2px solid ${THEME.gold}` : `1px solid ${THEME.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>#{o.id}</span>
                <span style={{ textTransform: 'uppercase', fontSize: '0.8em', background: '#333', padding: '2px 6px', borderRadius: '4px' }}>{o.estado.replace('_', ' ')}</span>
              </div>
              <ul style={{ paddingLeft: '20px', color: '#ccc' }}>
                {o.items?.map(i => <li key={i.id}>{i.cantidad}x {i.Product?.nombre}</li>)}
              </ul>
              <button onClick={() => advance(o)} style={{ ...styles.buttonBase, marginTop: '15px', background: '#333', color:'white' }}>
                {o.estado === 'listo' ? 'Entregar' : 'Avanzar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

// 6. ADMIN: DASHBOARD
function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { dashboardService.getMetrics().then(setMetrics).catch(() => setMetrics({})); }, []);

  if (!metrics) return (
    <div style={{ ...styles.container, padding: '20px' }}>
      <Skeleton height="40px" width="300px" style={{marginBottom: '30px'}} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <Skeleton height="150px" style={{borderRadius:'12px'}} />
        <Skeleton height="150px" style={{borderRadius:'12px'}} />
      </div>
      <Skeleton height="400px" style={{borderRadius:'12px'}} />
    </div>
  );

  const chartData = {
    labels: metrics.top_productos?.map(i => i.Product.nombre),
    datasets: [{ label: 'Ventas', data: metrics.top_productos?.map(i => i.total_vendido), backgroundColor: THEME.gold }]
  };

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <h2 style={{ color: THEME.gold, marginBottom:'20px' }}><BarChart3 style={{marginRight:'10px'}}/>Dashboard</h2>
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
    </PageTransition>
  );
}

// 7. ADMIN: USUARIOS (Sin prompt, con prompt personalizado sería mejor pero usamos window.prompt por simplicidad ya que no bloquea tanto)
function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { userService.getAll().then(setUsers); }, []);

  const adjust = async (u) => {
    // Aquí el prompt es inevitable sin crear un modal personalizado, 
    // pero al menos no es una "alerta" de información.
    const p = prompt('Puntos (+/-):'); 
    if(p) {
      await userService.adjustPoints(u.id, parseInt(p));
      userService.getAll().then(setUsers);
      toast.success('Puntos actualizados'); // TOAST
    }
  };

  return (
    <PageTransition>
      <div style={{ ...styles.container, padding: '20px' }}>
        <h2 style={{ color: THEME.gold, marginBottom:'20px' }}><Users style={{marginRight:'10px'}}/>Usuarios</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {users.map(u => (
            <div key={u.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{fontWeight:'bold'}}>{u.nombre}</div>
                <div style={{color:'#888', fontSize:'0.8em'}}>{u.email}</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <span style={{color:THEME.gold, fontWeight:'bold'}}>💎 {u.puntos_actuales}</span>
                <button onClick={() => adjust(u)} style={{...styles.buttonBase, width:'auto', padding:'5px 10px', fontSize:'0.8em', background:'#333', color:'white'}}>Ajustar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

// --- NAV BAR COMPONENTES ---
const NavItem = ({ to, icon, label, active, onClick }) => {
  const navigate = useNavigate();
  const handleClick = (e) => { e.preventDefault(); if (onClick) onClick(); else navigate(to); };
  return (
    <a href={to} onClick={handleClick} style={{ ...styles.bottomBarLink, color: active ? THEME.gold : '#888' }}>
      {icon}
      <span style={{marginTop:'4px'}}>{label}</span>
    </a>
  );
};

function Navigation({ isAdmin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const handleLogout = () => { authService.logout(); navigate('/login'); };

  return (
    <>
      <nav className="desktop-nav" style={{ backgroundColor: '#000', borderBottom: `1px solid ${THEME.border}`, padding: '15px 40px', position: 'sticky', top: 0, zIndex: 100, gap: '20px', alignItems: 'center' }}>
        <span style={{color: THEME.gold, fontWeight:'bold', fontSize:'1.5rem', marginRight:'auto', fontFamily: "'Playfair Display', serif", display:'flex', alignItems:'center', gap:'10px'}}><ChefHat /> CREPA URBANA</span>
        <a href="/menu" style={{ ...styles.navLink, color: path === '/menu' ? THEME.gold : 'white' }}><UtensilsCrossed size={18}/> MENÚ</a>
        {!isAdmin && <a href="/my-orders" style={{ ...styles.navLink, color: path === '/my-orders' ? THEME.gold : 'white' }}><ClipboardList size={18}/> PEDIDOS</a>}
        {isAdmin && (
          <>
            <a href="/admin-menu" style={{ ...styles.navLink, color: path === '/admin-menu' ? THEME.gold : 'white' }}><Package size={18}/> STOCK</a>
            <a href="/kitchen" style={{ ...styles.navLink, color: path === '/kitchen' ? THEME.gold : 'white' }}><ChefHat size={18}/> COCINA</a>
            <a href="/dashboard" style={{ ...styles.navLink, color: path === '/dashboard' ? THEME.gold : 'white' }}><BarChart3 size={18}/> DASH</a>
            <a href="/admin-users" style={{ ...styles.navLink, color: path === '/admin-users' ? THEME.gold : 'white' }}><Users size={18}/> USERS</a>
          </>
        )}
        <button onClick={handleLogout} style={{ marginLeft: '10px', background: 'transparent', border: `1px solid ${THEME.danger}`, color: THEME.danger, padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px' }}><LogOut size={16}/> Salir</button>
      </nav>

      <nav className="mobile-nav" style={{ backgroundColor: '#000', borderTop: `1px solid ${THEME.gold}`, position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 100, paddingBottom: '5px', boxShadow: '0 -5px 20px rgba(0,0,0,0.5)' }}>
        {isAdmin ? (
          <>
            <NavItem to="/menu" icon={<UtensilsCrossed size={24} />} label="Menú" active={path === '/menu'} />
            <NavItem to="/admin-menu" icon={<Package size={24} />} label="Stock" active={path === '/admin-menu'} />
            <NavItem to="/kitchen" icon={<ChefHat size={24} />} label="Cocina" active={path === '/kitchen'} />
            <NavItem to="/dashboard" icon={<BarChart3 size={24} />} label="Dash" active={path === '/dashboard'} />
            <NavItem to="/admin-users" icon={<Users size={24} />} label="Users" active={path === '/admin-users'} />
            <NavItem to="#" icon={<LogOut size={24} />} label="Salir" onClick={handleLogout} />
          </>
        ) : (
          <>
            <NavItem to="/menu" icon={<UtensilsCrossed size={24} />} label="Menú" active={path === '/menu'} />
            <NavItem to="/my-orders" icon={<ClipboardList size={24} />} label="Pedidos" active={path === '/my-orders'} />
            <NavItem to="#" icon={<LogOut size={24} />} label="Salir" onClick={handleLogout} />
          </>
        )}
      </nav>
    </>
  );
}

// --- APP PRINCIPAL ---
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <CartProvider>
        <style>{responsiveStyles}</style>
        <div style={{ backgroundColor: THEME.bg, minHeight: '100vh' }}>
          {isAuth && !isAdmin && <Navbar user={user} onLogout={handleLogout} />}
          {isAuth && isAdmin && <Navigation isAdmin={isAdmin} />}
          <AnimatedRoutes />
          {/* TOAST CONTAINER AQUÍ AL FINAL */}
          <ToastContainer theme="dark" position="bottom-right" />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;