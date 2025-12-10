import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import orderService from '../services/orderService';
import { Clock, AlertCircle, CheckCircle2, Volume2, Zap, User, MapPin } from 'lucide-react';
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
    bgColor: `${THEME.warning}20`,
    nextStatus: 'en_preparacion',
    action: '👨‍🍳 Empezar',
  },
  en_preparacion: {
    label: 'Preparando',
    icon: '👨‍🍳',
    color: THEME.primary,
    bgColor: `${THEME.primary}20`,
    nextStatus: 'listo',
    action: '✅ Listo',
  },
  listo: {
    label: 'Listo',
    icon: '✅',
    color: THEME.success,
    bgColor: `${THEME.success}20`,
    nextStatus: 'entregado',
    action: '🚀 Entregar',
  },
};

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [ordersItems, setOrdersItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Timer actualización
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(orderId => {
          if (updated[orderId] > 0) {
            updated[orderId] += 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await orderService.getAll();
      const activeOrders = data.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');
      
      setOrders(activeOrders);
      setOrdersItems(activeOrders);

      // Inicializar timers para nuevas órdenes
      activeOrders.forEach(order => {
        if (!timers[order.id]) {
          setTimers(prev => ({
            ...prev,
            [order.id]: 0,
          }));
        }
      });

      // Sonido para nuevas órdenes
      if (soundEnabled && activeOrders.length > orders.length) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error al cargar órdenes', error);
      toast.error('Error cargando pedidos');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio no disponible');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const advanceStatus = async (order) => {
    const nextStatus = STATUS_CONFIG[order.estado]?.nextStatus;
    if (!nextStatus) return;

    try {
      await orderService.updateStatus(order.id, nextStatus);
      toast.success(`Orden #${order.id} → ${STATUS_CONFIG[nextStatus]?.label}`);
      fetchOrders(false);
    } catch (error) {
      toast.error('Error al actualizar pedido');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <Zap size={48} color={THEME.gold} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
        minHeight: '100vh',
        color: THEME.text,
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '20px',
            background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
            border: `1px solid ${THEME.border}`,
            borderRadius: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              👨‍🍳 Kitchen Display System
            </h1>
            <p style={{ color: THEME.textMuted, margin: 0, fontSize: '13px' }}>
              Gestión en tiempo real de órdenes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: soundEnabled ? THEME.gold : THEME.card,
                border: `1.5px solid ${soundEnabled ? THEME.gold : THEME.border}`,
                color: soundEnabled ? THEME.dark : THEME.text,
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <Volume2 size={16} />
              {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
            </motion.button>

            <div
              style={{
                background: THEME.card,
                border: `1.5px solid ${THEME.border}`,
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Órdenes: <span style={{ color: THEME.gold, fontWeight: 'bold' }}>{ordersItems.length}</span>
            </div>
          </div>
        </motion.div>

        {/* KANBAN BOARD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* PENDIENTES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
              border: `2px solid ${THEME.warning}`,
              borderRadius: '16px',
              padding: '20px',
              minHeight: '400px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: THEME.warning,
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ⏳ Pendientes ({ordersItems.filter(o => o.estado === 'pendiente').length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Reorder.Group
                axis="y"
                values={ordersItems.filter(o => o.estado === 'pendiente')}
                onReorder={e => setOrdersItems([...ordersItems.filter(o => o.estado !== 'pendiente'), ...e])}
              >
                {ordersItems.filter(o => o.estado === 'pendiente').map((order, idx) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    timer={timers[order.id] || 0}
                    onAdvance={advanceStatus}
                    onSelect={setSelectedOrder}
                    isNew={idx === 0}
                    formatTime={formatTime}
                    formatDate={formatDate}
                  />
                ))}
              </Reorder.Group>

              {ordersItems.filter(o => o.estado === 'pendiente').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>Sin órdenes pendientes</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* EN PREPARACIÓN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
              border: `2px solid ${THEME.primary}`,
              borderRadius: '16px',
              padding: '20px',
              minHeight: '400px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: THEME.primary,
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              👨‍🍳 Preparando ({ordersItems.filter(o => o.estado === 'en_preparacion').length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Reorder.Group
                axis="y"
                values={ordersItems.filter(o => o.estado === 'en_preparacion')}
                onReorder={e => setOrdersItems([...ordersItems.filter(o => o.estado !== 'en_preparacion'), ...e])}
              >
                {ordersItems.filter(o => o.estado === 'en_preparacion').map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    timer={timers[order.id] || 0}
                    onAdvance={advanceStatus}
                    onSelect={setSelectedOrder}
                    formatTime={formatTime}
                    formatDate={formatDate}
                  />
                ))}
              </Reorder.Group>

              {ordersItems.filter(o => o.estado === 'en_preparacion').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>Sin órdenes en preparación</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* LISTO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
              border: `2px solid ${THEME.success}`,
              borderRadius: '16px',
              padding: '20px',
              minHeight: '400px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: THEME.success,
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ✅ Listo ({ordersItems.filter(o => o.estado === 'listo').length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Reorder.Group
                axis="y"
                values={ordersItems.filter(o => o.estado === 'listo')}
                onReorder={e => setOrdersItems([...ordersItems.filter(o => o.estado !== 'listo'), ...e])}
              >
                {ordersItems.filter(o => o.estado === 'listo').map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    timer={timers[order.id] || 0}
                    onAdvance={advanceStatus}
                    onSelect={setSelectedOrder}
                    formatTime={formatTime}
                    formatDate={formatDate}
                  />
                ))}
              </Reorder.Group>

              {ordersItems.filter(o => o.estado === 'listo').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>Sin órdenes listas</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* MODAL DE DETALLES */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 100,
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '20px',
                  padding: '32px',
                  maxWidth: '500px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  zIndex: 101,
                }}
              >
                <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: 'bold' }}>
                  Orden #{selectedOrder.id}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: THEME.darker,
                      borderRadius: '8px',
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    <User size={16} color={THEME.gold} />
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: THEME.textMuted }}>Cliente</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                        {selectedOrder.User?.nombre}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: THEME.darker,
                      borderRadius: '8px',
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    <Clock size={16} color={THEME.gold} />
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', color: THEME.textMuted }}>Tiempo</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                        {formatTime(timers[selectedOrder.id] || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: '700', color: THEME.textMuted, margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                  Productos
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {selectedOrder.items?.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px',
                        background: THEME.darker,
                        borderRadius: '8px',
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>
                        {item.cantidad}x {item.Product?.nombre}
                      </p>
                      {item.notas_personalizadas && (
                        <p style={{ margin: 0, fontSize: '12px', color: THEME.warning, fontStyle: 'italic' }}>
                          ⚠️ {item.notas_personalizadas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    advanceStatus(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${THEME.gold}, #c9a227)`,
                    color: THEME.dark,
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                >
                  {STATUS_CONFIG[selectedOrder.estado]?.action}
                </motion.button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: THEME.darker,
                    color: THEME.text,
                    border: `1.5px solid ${THEME.border}`,
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componente OrderCard
function OrderCard({ order, timer, onAdvance, onSelect, isNew, formatTime, formatDate }) {
  const config = STATUS_CONFIG[order.estado];

  return (
    <Reorder.Item
      value={order}
      style={{ cursor: 'grab', userSelect: 'none' }}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, boxShadow: `0 10px 30px ${config.color}40` }}
    >
      <motion.div
        initial={isNew ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: config.bgColor,
          border: `1.5px solid ${config.color}`,
          borderRadius: '12px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onClick={() => onSelect(order)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = THEME.gold;
          e.currentTarget.style.boxShadow = `0 10px 30px ${config.color}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = config.color;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '700' }}>
              #{order.id}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: THEME.textMuted }}>
              {formatDate(order.fecha_creacion)}
            </p>
          </div>
          <motion.div
            animate={{ scale: timer > 300 ? 1.1 : 1 }}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: timer > 600 ? THEME.danger : timer > 300 ? THEME.warning : THEME.success,
            }}
          >
            {formatTime(timer)}
          </motion.div>
        </div>

        <div style={{ marginBottom: '12px', maxHeight: '80px', overflowY: 'auto' }}>
          {order.items?.map(item => (
            <p key={item.id} style={{ margin: '4px 0', fontSize: '13px', fontWeight: '600' }}>
              {item.cantidad}x {item.Product?.nombre}
            </p>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAdvance(order);
          }}
          style={{
            width: '100%',
            padding: '10px',
            background: config.color,
            color: THEME.dark,
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {config.action}
        </motion.button>
      </motion.div>
    </Reorder.Item>
  );
}

export default Kitchen;