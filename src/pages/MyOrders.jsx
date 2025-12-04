import { useEffect, useState } from 'react';
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Colores según el estado para que sea visualmente intuitivo
  const statusColors = {
    'pendiente': '#ff9800',      // Naranja
    'en_preparacion': '#2196f3', // Azul
    'listo': '#4caf50',          // Verde
    'entregado': '#9e9e9e',      // Gris
    'cancelado': '#f44336'       // Rojo
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error cargando historial");
      }
    };
    loadOrders();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/menu')} 
          style={{ marginRight: '15px', padding: '5px 10px', cursor: 'pointer' }}
        >
          ⬅ Volver al Menú
        </button>
        <h1>📜 Mis Pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <p>Aún no has realizado pedidos.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              
              {/* Encabezado del Pedido */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Orden #{order.id}</span>
                  <span style={{ color: '#666', fontSize: '0.8em', marginLeft: '10px' }}>
                    {new Date(order.fecha_creacion).toLocaleString()}
                  </span>
                </div>
                <span style={{ 
                  background: statusColors[order.estado], 
                  color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', textTransform: 'uppercase' 
                }}>
                  {order.estado.replace('_', ' ')}
                </span>
              </div>

              {/* Lista de productos */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {order.items?.map(item => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{item.cantidad}x {item.Product?.nombre}</span>
                    <span style={{ color: '#666' }}>${item.precio_unitario}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '10px', textAlign: 'right', fontWeight: 'bold', color: '#e67e22' }}>
                Total: ${order.total_pagar}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;