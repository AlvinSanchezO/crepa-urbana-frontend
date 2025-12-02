import { useEffect, useState } from 'react';
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
import dashboardService from '../services/dashboardService';

// Registrar componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Error cargando dashboard");
      }
    };
    loadData();
  }, []);

  if (!metrics) return <div style={{padding: '20px'}}>Cargando métricas... 📊</div>;

  // Configuración de la Gráfica
  const chartData = {
    labels: metrics.top_productos.map(item => item.Product.nombre),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: metrics.top_productos.map(item => item.total_vendido),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Dashboard Ejecutivo 📈</h1>

      {/* TARJETAS DE VENTAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#2ecc71', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Ventas de Hoy</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>${metrics.ventas_hoy}</p>
        </div>
        <div style={{ background: '#3498db', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Ventas del Mes</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>${metrics.ventas_mes}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* GRÁFICA DE PRODUCTOS */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ textAlign: 'center' }}>🏆 Productos Más Vendidos</h3>
          <Bar options={{ responsive: true }} data={chartData} />
        </div>

        {/* TOP CLIENTES */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>💎 Mejores Clientes</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {metrics.top_clientes.map((cliente, index) => (
              <li key={index} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{index + 1}. {cliente.nombre}</span>
                <span style={{ fontWeight: 'bold', color: '#e67e22' }}>{cliente.puntos_actuales} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;