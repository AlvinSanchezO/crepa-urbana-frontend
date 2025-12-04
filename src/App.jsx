import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- CONFIGURACIÓN API (Simulación de axios.js) ---
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- SERVICIOS ---
const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
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

const dashboardService = {
  getMetrics: async () => (await api.get('/dashboard')).data
};

// --- COMPONENTES ---

// 1. LOGIN
function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await authService.register(formData);
        alert('¡Registro exitoso! Inicia sesión.');
        setIsRegistering(false);
        setFormData({ ...formData, password: '' });
      } else {
        await authService.login(formData.email, formData.password);
        alert('¡Bienvenido!');
        window.location.href = '/menu';
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Error en la operación'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{textAlign: 'center'}}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Nombre:</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Teléfono:</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>
          </>
        )}
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Contraseña:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
          {isRegistering ? 'Registrarse' : 'Entrar'}
        </button>
        <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </form>
    </div>
  );
}

// 2. MENÚ CLIENTE
function Menu() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  useEffect(() => {
    productService.getAll().then(setProducts).catch(console.error);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleBuy = async (product) => {
    if (!window.confirm(`¿Pedir ${product.nombre}?`)) return;
    try {
      const res = await orderService.create([{ producto_id: product.id, cantidad: 1, notas: "Web" }]);
      const ganados = res.data.puntos_ganados || 0;
      const newUser = { ...user, puntos_actuales: user.puntos_actuales + ganados };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      if(window.confirm(`¡Ganaste ${ganados} pts! ¿Ver pedido?`)) navigate('/my-orders');
    } catch { alert('Error al pedir'); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Menú 🥞</h1>
        <div>
          <span>Hola, <b>{user.nombre}</b> (💎 {user.puntos_actuales}) </span>
          <button onClick={handleLogout} style={{ marginLeft: '10px', background: '#f44', color: 'white', border: 'none', padding: '5px' }}>Salir</button>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <img src={p.imagen_url || 'https://via.placeholder.com/150'} alt={p.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <h3>{p.nombre}</h3>
            <p>${p.precio}</p>
            <button onClick={() => handleBuy(p)} disabled={!p.disponible} style={{ width: '100%', padding: '8px', background: p.disponible ? '#2ecc71' : '#ccc', color: 'white', border: 'none' }}>
              {p.disponible ? 'Comprar' : 'Agotado'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. MIS PEDIDOS
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/menu')}>⬅ Volver</button>
      <h1>Mis Pedidos</h1>
      {orders.map(o => (
        <div key={o.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>Orden #{o.id}</b>
            <span>{o.estado}</span>
          </div>
          <ul>
            {o.items?.map(i => <li key={i.id}>{i.cantidad}x {i.Product?.nombre}</li>)}
          </ul>
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>Total: ${o.total_pagar}</div>
        </div>
      ))}
    </div>
  );
}

// 4. ADMIN PRODUCTOS
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', precio: '', categoria_id: 1 });
  
  useEffect(() => { productService.getAll().then(setProducts); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await productService.create(formData);
    productService.getAll().then(setProducts);
    alert('Creado');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Productos</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input placeholder="Nombre" onChange={e => setFormData({...formData, nombre: e.target.value})} required />
        <input placeholder="Precio" type="number" onChange={e => setFormData({...formData, precio: e.target.value})} required />
        <button type="submit">Crear</button>
      </form>
      <ul>
        {products.map(p => <li key={p.id}>{p.nombre} - ${p.precio}</li>)}
      </ul>
    </div>
  );
}

// 5. COCINA
function Kitchen() {
  const [orders, setOrders] = useState([]);

  const fetch = () => orderService.getAll().then(data => setOrders(data.filter(o => o.estado !== 'entregado')));

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const advance = async (order) => {
    const next = order.estado === 'pendiente' ? 'en_preparacion' : 'entregado';
    await orderService.updateStatus(order.id, next);
    fetch();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Cocina</h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {orders.map(o => (
          <div key={o.id} style={{ border: '2px solid #333', padding: '10px' }}>
            <h4>#{o.id} ({o.estado})</h4>
            <button onClick={() => advance(o)}>Avanzar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. DASHBOARD
function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    dashboardService.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div>Cargando...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ padding: '20px', background: '#2ecc71', color: 'white' }}>Hoy: ${metrics.ventas_hoy}</div>
        <div style={{ padding: '20px', background: '#3498db', color: 'white' }}>Mes: ${metrics.ventas_mes}</div>
      </div>
    </div>
  );
}

// 7. USUARIOS
function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  const adjust = async (u) => {
    const p = prompt('Puntos:');
    if (p) {
      await api.post('/loyalty/adjust', { userId: u.id, points: parseInt(p) });
      api.get('/users').then(res => setUsers(res.data));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Usuarios</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.nombre} - {u.puntos_actuales} pts <button onClick={() => adjust(u)}>Ajustar</button></li>)}
      </ul>
    </div>
  );
}

// --- APP PRINCIPAL ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'admin';
  const isAuth = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif' }}>
        {isAuth && (
          <nav style={{ background: '#333', padding: '10px', display: 'flex', gap: '15px' }}>
            <a href="/menu" style={{ color: 'white' }}>Menú</a>
            {!isAdmin && <a href="/my-orders" style={{ color: 'white' }}>Mis Pedidos</a>}
            {isAdmin && (
              <>
                <a href="/admin-menu" style={{ color: '#fc0' }}>Admin</a>
                <a href="/kitchen" style={{ color: '#fc0' }}>Cocina</a>
                <a href="/dashboard" style={{ color: '#fc0' }}>Dashboard</a>
                <a href="/admin-users" style={{ color: '#fc0' }}>Usuarios</a>
              </>
            )}
          </nav>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/admin-menu" element={<PrivateRoute><AdminProducts /></PrivateRoute>} />
          <Route path="/kitchen" element={<PrivateRoute><Kitchen /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin-users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;