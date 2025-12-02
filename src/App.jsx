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

// --- SERVICIOS (Simulación de archivos services/*.js) ---
const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
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
  getAll: async () => (await api.get('/orders')).data,
  updateStatus: async (id, status) => (await api.patch(`/orders/${id}/status`, { estado: status })).data
};

const dashboardService = {
  getMetrics: async () => (await api.get('/dashboard')).data
};

// --- COMPONENTES (Simulación de pages/*.jsx) ---

// 1. LOGIN
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      alert('¡Bienvenido! Login exitoso');
      window.location.href = '/menu';
    } catch (error) {
      alert('Error: Credenciales incorrectas');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{textAlign: 'center'}}>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{display: 'block', marginBottom: '5px'}}>Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{display: 'block', marginBottom: '5px'}}>Contraseña:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
          Entrar
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
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Error al cargar menú');
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleBuy = async (product) => {
    if (!window.confirm(`¿Pedir ${product.nombre} por $${product.precio}?`)) return;
    try {
      const response = await orderService.create([{ producto_id: product.id, cantidad: 1 }]);
      const puntosGanados = response.data.puntos_ganados || 0;
      const updatedUser = { ...user, puntos_actuales: user.puntos_actuales + puntosGanados };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert(`¡Pedido Exitoso! Ganaste ${puntosGanados} puntos.`);
    } catch (error) {
      alert('Error al procesar pedido');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Menú Crepa Urbana 🥞</h1>
        <div>
          <span>Hola, <b>{user.nombre}</b> (💎 {user.puntos_actuales} pts) </span>
          <button onClick={handleLogout} style={{ marginLeft: '10px', background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Salir</button>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <img src={product.imagen_url || 'https://via.placeholder.com/150'} alt={product.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
              <h3 style={{ margin: '10px 0 5px' }}>{product.nombre}</h3>
              <p style={{ color: '#666', fontSize: '0.9em' }}>{product.descripcion}</p>
            </div>
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#e67e22' }}>${product.precio}</span>
                <span style={{ color: product.disponible ? 'green' : 'red', fontSize: '0.8em' }}>{product.disponible ? 'Disponible' : 'Agotado'}</span>
              </div>
              <button 
                onClick={() => handleBuy(product)}
                disabled={!product.disponible}
                style={{ width: '100%', padding: '8px', background: product.disponible ? '#2ecc71' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: product.disponible ? 'pointer' : 'not-allowed' }}
              >
                {product.disponible ? 'Comprar' : 'Sin Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. ADMIN PRODUCTOS
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) await productService.update(editingProduct.id, formData);
      else await productService.create(formData);
      setEditingProduct(null);
      setFormData({ nombre: '', descripcion: '', precio: '', categoria_id: 1, imagen_url: '' });
      loadProducts();
      alert('Guardado con éxito');
    } catch (error) { alert('Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar?')) {
      await productService.delete(id);
      loadProducts();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gestión de Productos</h2>
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '15px', marginBottom: '20px' }}>
        <input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required style={{marginRight: '5px'}} />
        <input placeholder="Precio" type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required style={{marginRight: '5px'}} />
        <button type="submit">{editingProduct ? 'Actualizar' : 'Crear'}</button>
      </form>
      <div style={{ display: 'grid', gap: '10px' }}>
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #eee', padding: '10px' }}>
            <span>{p.nombre} - ${p.precio}</span>
            <div>
              <button onClick={() => { setEditingProduct(p); setFormData(p); }}>Editar</button>
              <button onClick={() => handleDelete(p.id)} style={{ marginLeft: '5px', color: 'red' }}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. COCINA (KDS)
function Kitchen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado'));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 5000);
    return () => clearInterval(interval);
  }, []);

  const advanceStatus = async (order) => {
    const nextStatus = order.estado === 'pendiente' ? 'en_preparacion' : order.estado === 'en_preparacion' ? 'listo' : 'entregado';
    await orderService.updateStatus(order.id, nextStatus);
    fetchOrders();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Comandera de Cocina</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ border: '2px solid #333', padding: '10px', borderRadius: '5px' }}>
            <h4>Orden #{order.id} <span style={{fontSize:'0.8em', background:'#eee', padding:'2px'}}>({order.estado})</span></h4>
            <ul>
              {order.items?.map(item => (
                <li key={item.id}>{item.cantidad}x {item.Product?.nombre}</li>
              ))}
            </ul>
            <button onClick={() => advanceStatus(order)} style={{ width: '100%', padding: '5px', marginTop: '10px', background: '#3498db', color: 'white', border: 'none' }}>
              Avanzar Estado
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. DASHBOARD
function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  if (!metrics) return <div style={{padding:'20px'}}>Cargando métricas...</div>;

  const chartData = {
    labels: metrics.top_productos?.map(item => item.Product.nombre) || [],
    datasets: [{
      label: 'Ventas',
      data: metrics.top_productos?.map(item => item.total_vendido) || [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Ejecutivo</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#2ecc71', color: 'white', padding: '20px', borderRadius: '5px', flex: 1 }}>
          <h3>Hoy</h3>
          <p style={{fontSize:'1.5em', fontWeight:'bold'}}>${metrics.ventas_hoy}</p>
        </div>
        <div style={{ background: '#3498db', color: 'white', padding: '20px', borderRadius: '5px', flex: 1 }}>
          <h3>Mes</h3>
          <p style={{fontSize:'1.5em', fontWeight:'bold'}}>${metrics.ventas_mes}</p>
        </div>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

// 6. GESTIÓN USUARIOS
function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const handleAdjust = async (user) => {
    const points = prompt('Puntos a ajustar (+/-):');
    if (points) {
      await api.post('/loyalty/adjust', { userId: user.id, points: parseInt(points) });
      alert('Ajustado');
      const res = await api.get('/users');
      setUsers(res.data);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Usuarios</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', background: '#eee' }}><th>Nombre</th><th>Email</th><th>Puntos</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.puntos_actuales}</td>
              <td><button onClick={() => handleAdjust(u)}>Ajustar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL APP ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif' }}>
        <nav style={{ background: '#333', padding: '10px', color: 'white', marginBottom: '20px', display: 'flex', gap: '15px', overflowX: 'auto' }}>
          <a href="/menu" style={{ color: 'white', textDecoration: 'none' }}>Menú</a>
          <a href="/admin-menu" style={{ color: 'white', textDecoration: 'none' }}>Admin Prod.</a>
          <a href="/kitchen" style={{ color: 'white', textDecoration: 'none' }}>Cocina</a>
          <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a>
          <a href="/admin-users" style={{ color: 'white', textDecoration: 'none' }}>Usuarios</a>
        </nav>
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
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