import { useEffect, useState } from 'react';
import orderService from '../services/orderService';

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colores para identificar rápido el estado
  const statusColors = {
    'pendiente': '#ffeb3b', // Amarillo (Alerta)
    'en_preparacion': '#3498db', // Azul (Trabajando)
    'listo': '#2ecc71', // Verde (Terminado)
    'entregado': '#95a5a6' // Gris (Historial)
  };

  useEffect(() => {
    fetchOrders();

    // AUTO-ACTUALIZACIÓN: Preguntar por pedidos nuevos cada 5 segundos
    const interval = setInterval(() => {
      fetchOrders(false); // false para no mostrar 'cargando' cada vez
    }, 5000);

    return () => clearInterval(interval); // Limpiar al salir
  }, []);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await orderService.getAll();
      // Filtramos para no llenar la pantalla de pedidos viejos (entregados/cancelados)
      // Opcional: Si quieres ver todo, quita el .filter
      const activeOrders = data.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');
      setOrders(activeOrders);
    } catch (error) {
      console.error("Error al cargar comandera");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const advanceStatus = async (order) => {
    let nextStatus = '';
    
    // Lógica del flujo de trabajo
    if (order.estado === 'pendiente') nextStatus = 'en_preparacion';
    else if (order.estado === 'en_preparacion') nextStatus = 'listo';
    else if (order.estado === 'listo') nextStatus = 'entregado';
    
    if (!nextStatus) return;

    try {
      await orderService.updateStatus(order.id, nextStatus);
      fetchOrders(false); // Actualizar visualmente al instante
    } catch (error) {
      alert('Error al actualizar pedido');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>👨‍🍳 Comandera de Cocina (KDS)</h1>
      
      {loading && <p>Cargando pedidos...</p>}

      {!loading && orders.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <h2>No hay pedidos pendientes 🎉</h2>
          <p>La cocina está limpia.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ border: `3px solid ${statusColors[order.estado]}`, borderRadius: '10px', padding: '15px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* CABECERA DEL TICKET */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>#{order.id}</span>
              <span style={{ background: statusColors[order.estado], padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold' }}>
                {order.estado.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            {/* LISTA DE PLATILLOS */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.items?.map(item => (
                <li key={item.id} style={{ marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '5px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.cantidad}x {item.Product?.nombre}</div>
                  {item.notas_personalizadas && (
                    <div style={{ color: 'red', fontSize: '0.9em', fontStyle: 'italic' }}>
                      ⚠️ Nota: {item.notas_personalizadas}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>
              Cliente: {order.User?.nombre}
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button 
              onClick={() => advanceStatus(order)}
              style={{
                width: '100%',
                marginTop: '15px',
                padding: '12px',
                background: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1em'
              }}
            >
              {order.estado === 'pendiente' && '👨‍🍳 Empezar a Cocinar'}
              {order.estado === 'en_preparacion' && '✅ Terminar Pedido'}
              {order.estado === 'listo' && '🚀 Entregar a Cliente'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Kitchen;