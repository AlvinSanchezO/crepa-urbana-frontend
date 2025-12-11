import { useEffect, useState } from 'react';
import productService from '../services/productService';
import authService from '../services/authService';
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';

function Menu() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      alert('Error al cargar el menú');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleBuy = async (product) => {
    const confirm = window.confirm(`¿Deseas pedir una ${product.nombre} por $${product.precio}?`);
    if (!confirm) return;

    try {
      const orderPayload = [{ producto_id: product.id, cantidad: 1, notas: "Pedido Web" }];
      const response = await orderService.create(orderPayload);
      
      const puntosGanados = response.data.puntos_ganados || 0;
      const nuevosPuntos = user.puntos_actuales + puntosGanados;
      const updatedUser = { ...user, puntos_actuales: nuevosPuntos };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      if(window.confirm(`¡Pedido Exitoso! Ganaste ${puntosGanados} puntos.\n¿Quieres ver el estado de tu pedido?`)) {
        navigate('/my-orders');
      }

    } catch (error) {
      console.error(error);
      alert('Hubo un error al procesar tu pedido.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Menú Crepa Urbana 🥞</h1>
          <button onClick={handleLogout} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Salir</button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
          <span>Hola, <b>{user.nombre}</b> (💎 {user.puntos_actuales} pts)</span>
          
          {/* BOTÓN NUEVO: IR A MIS PEDIDOS */}
          <button 
            onClick={() => navigate('/my-orders')}
            style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📜 Ver Mis Pedidos
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <img src={product.imagen_url || 'https://via.placeholder.com/150'} alt={product.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
              <h3 style={{ margin: '10px 0 5px 0' }}>{product.nombre}</h3>
              <p style={{ color: '#666', fontSize: '0.9em' }}>{product.descripcion}</p>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#e67e22' }}>${product.precio}</span>
                {product.disponible ? <span style={{ color: 'green', fontSize: '0.8em' }}>✅ Disponible</span> : <span style={{ color: 'red', fontSize: '0.8em' }}>❌ Agotado</span>}
              </div>
              {user.rol !== 'admin' && (
                <button 
                  onClick={() => handleBuy(product)}
                  disabled={!product.disponible}
                  style={{ width: '100%', padding: '10px', background: product.disponible ? '#2ecc71' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', cursor: product.disponible ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                >
                  {product.disponible ? '🛒 Comprar' : 'Sin Stock'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;