import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import orderService from '../services/orderService';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, TrendingUp, ShoppingBag, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { toast } from 'react-toastify';

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

const STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    icon: '⏳',
    color: THEME.warning,
    step: 0,
    description: 'Tu pedido fue recibido',
  },
  en_preparacion: {
    label: 'En Preparación',
    icon: '👨‍🍳',
    color: THEME.primary,
    step: 1,
    description: 'Estamos preparando tu pedido',
  },
  listo: {
    label: 'Listo',
    icon: '✅',
    color: THEME.success,
    step: 2,
    description: 'Tu pedido está listo',
  },
  entregado: {
    label: 'Entregado',
    icon: '🎉',
    color: THEME.success,
    step: 3,
    description: 'Tu pedido fue entregado',
  },
  cancelado: {
    label: 'Cancelado',
    icon: '❌',
    color: THEME.danger,
    step: -1,
    description: 'Tu pedido fue cancelado',
  },
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error cargando historial', error);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Timeline visual
  const Timeline = ({ order }) => {
    const currentStatus = STATUS_CONFIG[order.estado] || STATUS_CONFIG.pendiente;
    const currentStep = currentStatus.step;

    const steps = [
      { step: 0, label: 'Recibido', icon: '📦' },
      { step: 1, label: 'Preparación', icon: '👨‍🍳' },
      { step: 2, label: 'Listo', icon: '✅' },
      { step: 3, label: 'Entregado', icon: '🎉' },
    ];

    if (order.estado === 'cancelado') {
      return (
        <div
          style={{
            background: `${THEME.danger}10`,
            border: `1.5px solid ${THEME.danger}`,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <AlertCircle size={24} color={THEME.danger} />
          <div>
            <p style={{ margin: '0 0 4px 0', color: THEME.danger, fontWeight: '700', fontSize: '14px' }}>
              Pedido Cancelado
            </p>
            <p style={{ margin: 0, color: THEME.textMuted, fontSize: '12px' }}>
              Este pedido fue cancelado
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '24px' }}>
        {/* Timeline Background Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '0',
            right: '0',
            height: '2px',
            background: THEME.border,
            zIndex: 0,
          }}
        />

        {/* Filled Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '0',
            height: '2px',
            background: `linear-gradient(90deg, ${THEME.gold}, ${THEME.success})`,
            width: `${((currentStep + 1) / 4) * 100}%`,
            zIndex: 1,
            transition: 'width 0.6s ease',
          }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = step.step < currentStep;
          const isCurrent = step.step === currentStep;

          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 2,
              }}
            >
              <motion.div
                animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                transition={{ repeat: isCurrent ? Infinity : 0, duration: 0.6 }}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: isCompleted || isCurrent ? `${THEME.gold}` : THEME.card,
                  border: `2px solid ${isCompleted || isCurrent ? THEME.gold : THEME.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '12px',
                  color: isCompleted || isCurrent ? THEME.dark : THEME.textMuted,
                  fontWeight: 'bold',
                  boxShadow:
                    isCurrent
                      ? `0 0 20px ${THEME.gold}60`
                      : isCompleted
                      ? `0 0 10px ${THEME.gold}30`
                      : 'none',
                }}
              >
                {step.icon}
              </motion.div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isCompleted || isCurrent ? THEME.gold : THEME.textMuted,
                  textAlign: 'center',
                }}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: THEME.text,
        }}
      >
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          <ShoppingBag size={48} color={THEME.gold} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
          minHeight: '100vh',
          color: THEME.text,
          paddingTop: '60px',
          paddingBottom: '32px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/menu')}
            style={{
              background: 'none',
              border: `1.5px solid ${THEME.gold}`,
              color: THEME.gold,
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            <ChevronLeft size={16} /> Volver
          </motion.button>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Mis Pedidos</h1>
            <p style={{ color: THEME.textMuted, margin: 0, fontSize: '13px' }}>
              Sigue el estado de tus órdenes
            </p>
          </div>
        </motion.div>

        {/* ORDERS LIST */}
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
                border: `1px solid ${THEME.border}`,
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥞</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Aún no tienes pedidos
              </h3>
              <p style={{ color: THEME.textMuted, margin: '0 0 24px 0', fontSize: '14px' }}>
                ¡Haz tu primer pedido en el menú!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/menu')}
                style={{
                  background: `linear-gradient(135deg, ${THEME.gold}, #c9a227)`,
                  color: THEME.dark,
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Ir al Menú →
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order, idx) => {
                const isExpanded = expandedOrderId === order.id;
                const statusConfig = STATUS_CONFIG[order.estado] || STATUS_CONFIG.pendiente;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                      background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = THEME.gold;
                      e.currentTarget.style.boxShadow = `0 20px 40px rgba(212, 175, 55, 0.15)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = THEME.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* HEADER PEDIDO */}
                    <motion.div
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                      style={{
                        padding: '20px',
                        background: THEME.darker,
                        borderBottom: isExpanded ? `1px solid ${THEME.border}` : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: `${statusConfig.color}20`,
                            border: `1.5px solid ${statusConfig.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                          }}
                        >
                          {statusConfig.icon}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>
                            Orden #{order.id}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              color: THEME.textMuted,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Clock size={12} />
                            {new Date(order.fecha_creacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                        }}
                      >
                        <div style={{ textAlign: 'right' }}>
                          <p
                            style={{
                              margin: 0,
                              color: THEME.gold,
                              fontSize: '18px',
                              fontWeight: 'bold',
                            }}
                          >
                            ${order.total_pagar?.toFixed(2) || '0.00'}
                          </p>
                          <span
                            style={{
                              background: statusConfig.color,
                              color: THEME.dark,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              display: 'inline-block',
                              marginTop: '4px',
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          style={{ color: THEME.gold }}
                        >
                          <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* CONTENIDO EXPANDIBLE */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            padding: '24px',
                            borderTop: `1px solid ${THEME.border}`,
                          }}
                        >
                          {/* TIMELINE */}
                          <Timeline order={order} />

                          {/* STATUS DESCRIPTION */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                              background: `${statusConfig.color}10`,
                              border: `1px solid ${statusConfig.color}`,
                              borderRadius: '12px',
                              padding: '16px',
                              marginBottom: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                            }}
                          >
                            <span style={{ fontSize: '20px' }}>{statusConfig.icon}</span>
                            <div>
                              <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600', color: statusConfig.color }}>
                                {statusConfig.label}
                              </p>
                              <p style={{ margin: 0, fontSize: '12px', color: THEME.textMuted }}>
                                {statusConfig.description}
                              </p>
                            </div>
                          </motion.div>

                          {/* PRODUCTOS */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4
                              style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: THEME.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '12px',
                                margin: '0 0 12px 0',
                              }}
                            >
                              Productos
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {order.items?.map((item, itemIdx) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + itemIdx * 0.05 }}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: THEME.darker,
                                    borderRadius: '8px',
                                    border: `1px solid ${THEME.border}`,
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        background: THEME.gold,
                                        color: THEME.dark,
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                      }}
                                    >
                                      {item.cantidad}
                                    </span>
                                    <div>
                                      <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600' }}>
                                        {item.Product?.nombre || 'Producto'}
                                      </p>
                                      <p style={{ margin: 0, fontSize: '11px', color: THEME.textMuted }}>
                                        ${item.precio_unitario?.toFixed(2) || '0.00'} c/u
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      color: THEME.gold,
                                    }}
                                  >
                                    ${(item.cantidad * item.precio_unitario)?.toFixed(2) || '0.00'}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* TOTAL */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{
                              background: `${THEME.gold}10`,
                              border: `1.5px solid ${THEME.gold}`,
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ fontSize: '14px', fontWeight: '600', color: THEME.text }}>
                              Total a Pagar
                            </span>
                            <span
                              style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: THEME.gold,
                              }}
                            >
                              ${order.total_pagar?.toFixed(2) || '0.00'}
                            </span>
                          </motion.div>

                          {/* RATING SECTION - Si está entregado */}
                          {order.estado === 'entregado' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              style={{
                                marginTop: '24px',
                                padding: '16px',
                                background: THEME.darker,
                                borderRadius: '12px',
                                border: `1px solid ${THEME.border}`,
                                textAlign: 'center',
                              }}
                            >
                              <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>
                                ¿Cómo fue tu experiencia?
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  gap: '8px',
                                }}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      fontSize: '28px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    ⭐
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* SUMMARY */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: orders.length * 0.1 + 0.2 }}
            style={{
              marginTop: '32px',
              padding: '20px',
              background: `${THEME.gold}05`,
              border: `1px solid ${THEME.gold}20`,
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: THEME.textMuted, fontSize: '13px', margin: 0 }}>
              Total de pedidos: <span style={{ color: THEME.gold, fontWeight: 'bold' }}>{orders.length}</span>
            </p>
          </motion.div>
        )}
      </div>
      </div>
    </>
  );
}

export default MyOrders;