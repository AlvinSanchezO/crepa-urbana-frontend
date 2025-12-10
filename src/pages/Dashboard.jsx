import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { TrendingUp, Users, Package, Clock, ChevronRight } from 'lucide-react';
import dashboardService from '../services/dashboardService';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Tema profesional
const THEME = {
  dark: '#0f0f0f',
  darker: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
  gold: '#d4af37',
  text: '#ffffff',
  textMuted: '#a0a0a0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  primary: '#3b82f6',
};

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.text,
      }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          <Clock size={48} />
        </motion.div>
      </div>
    );
  }

  // Datos para gráfica de ventas
  const salesChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas ($)',
        data: [1200, 1900, 1500, 2200, 2500, 2100, 1800],
        borderColor: THEME.gold,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: THEME.gold,
        pointBorderColor: THEME.card,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
      },
    ],
  };

  // Datos para gráfica de productos
  const productsChartData = {
    labels: metrics?.top_productos?.slice(0, 5).map(item => item.Product.nombre.substring(0, 15)) || [],
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: metrics?.top_productos?.slice(0, 5).map(item => item.total_vendido) || [],
        backgroundColor: [
          THEME.gold,
          THEME.primary,
          THEME.success,
          THEME.warning,
          THEME.danger,
        ],
        borderColor: THEME.card,
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: THEME.textMuted,
          font: { size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: THEME.gold,
        borderWidth: 1,
        titleColor: THEME.gold,
        bodyColor: THEME.text,
        padding: 12,
        titleFont: { weight: 'bold', size: 14 },
      },
    },
    scales: {
      y: {
        ticks: { color: THEME.textMuted, font: { size: 11 } },
        grid: { color: THEME.border, drawBorder: false },
        beginAtZero: true,
      },
      x: {
        ticks: { color: THEME.textMuted, font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // Componente reutilizable para KPI Card
  const KPICard = ({ title, value, subtitle, icon: Icon, trend, color }) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: `0 20px 40px rgba(212, 175, 55, 0.2)` }}
      style={{
        background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
        border: `1px solid ${THEME.border}`,
        padding: '24px',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: THEME.textMuted, fontSize: '13px', fontWeight: '600', margin: 0, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: THEME.text, margin: 0, marginBottom: '8px' }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{ color: THEME.textMuted, fontSize: '12px', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          background: color + '20',
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={28} color={color} />
        </div>
      </div>
      {trend && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${THEME.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <TrendingUp size={16} color={trend > 0 ? THEME.success : THEME.danger} />
          <span style={{
            color: trend > 0 ? THEME.success : THEME.danger,
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            {trend > 0 ? '+' : ''}{trend}% vs. semana anterior
          </span>
        </div>
      )}
    </motion.div>
  );

  // Componente para Timeline
  const ActivityTimeline = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
        border: `1px solid ${THEME.border}`,
        padding: '24px',
        borderRadius: '16px',
      }}
    >
      <h3 style={{ color: THEME.text, marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={20} color={THEME.gold} />
        Actividad Reciente
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { time: 'Hace 2 minutos', action: 'Nueva orden recibida', value: 'ID: #2541', color: THEME.success },
          { time: 'Hace 15 minutos', action: 'Pago confirmado', value: '$45.99', color: THEME.gold },
          { time: 'Hace 1 hora', action: 'Producto agotado', value: 'Crepas Dulces', color: THEME.warning },
          { time: 'Hace 3 horas', action: 'Nuevo cliente registrado', value: 'María García', color: THEME.primary },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: idx < 3 ? `1px solid ${THEME.border}` : 'none',
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: item.color,
              boxShadow: `0 0 12px ${item.color}80`,
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: THEME.text, fontSize: '14px', fontWeight: '500' }}>
                {item.action}
              </p>
              <p style={{ margin: 0, color: THEME.textMuted, fontSize: '12px' }}>
                {item.time}
              </p>
            </div>
            <span style={{ color: item.color, fontSize: '13px', fontWeight: 'bold' }}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div style={{
      background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
      minHeight: '100vh',
      padding: '32px 20px',
      color: THEME.text,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
            Dashboard Ejecutivo
          </h1>
          <p style={{ color: THEME.textMuted, margin: 0, fontSize: '14px' }}>
            Resumen de operaciones y métricas clave
          </p>
        </motion.div>

        {/* KPI CARDS - GRID 2x2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <KPICard
              title="Ventas de Hoy"
              value={`$${metrics?.ventas_hoy?.toFixed(2) || '0.00'}`}
              subtitle="En tiempo real"
              icon={TrendingUp}
              trend={12}
              color={THEME.gold}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard
              title="Ventas del Mes"
              value={`$${metrics?.ventas_mes?.toFixed(2) || '0.00'}`}
              subtitle="Acumulado"
              icon={TrendingUp}
              trend={8}
              color={THEME.primary}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <KPICard
              title="Órdenes Hoy"
              value={metrics?.top_productos?.length || '0'}
              subtitle="Completadas"
              icon={Package}
              trend={15}
              color={THEME.success}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <KPICard
              title="Clientes Activos"
              value={metrics?.top_clientes?.length || '0'}
              subtitle="Registrados"
              icon={Users}
              trend={5}
              color={THEME.warning}
            />
          </motion.div>
        </div>

        {/* GRÁFICAS - 2 COLUMNAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {/* Gráfica de Ventas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
              border: `1px solid ${THEME.border}`,
              padding: '24px',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ color: THEME.text, marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color={THEME.gold} />
              Ventas Semanales
            </h3>
            <Line data={salesChartData} options={chartOptions} height={300} />
          </motion.div>

          {/* Gráfica de Productos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
              border: `1px solid ${THEME.border}`,
              padding: '24px',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ color: THEME.text, marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color={THEME.gold} />
              Top Productos
            </h3>
            <Bar data={productsChartData} options={chartOptions} height={300} />
          </motion.div>
        </div>

        {/* ACTIVITY TIMELINE + TOP CLIENTES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}>
          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <ActivityTimeline />
          </motion.div>

          {/* Top Clientes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
              border: `1px solid ${THEME.border}`,
              padding: '24px',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ color: THEME.text, marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color={THEME.gold} />
              Mejores Clientes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics?.top_clientes?.slice(0, 5).map((cliente, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: THEME.darker,
                    borderRadius: '8px',
                    border: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.primary})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: THEME.dark,
                      fontSize: '14px',
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{ margin: 0, color: THEME.text, fontSize: '14px', fontWeight: '500' }}>
                        {cliente.nombre}
                      </p>
                      <p style={{ margin: 0, color: THEME.textMuted, fontSize: '12px' }}>
                        {cliente.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: THEME.gold + '20',
                      color: THEME.gold,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                      {cliente.puntos_actuales} pts
                    </span>
                    <ChevronRight size={16} color={THEME.textMuted} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;