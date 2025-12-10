import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';

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
};

function ShoppingCart({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
  loading = false,
}) {
  const total = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 50,
            }}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              width: 'min(100%, 420px)',
              height: '100vh',
              background: `linear-gradient(135deg, ${THEME.card} 0%, ${THEME.darker} 100%)`,
              border: `1px solid ${THEME.border}`,
              borderRight: 'none',
              zIndex: 51,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: `1px solid ${THEME.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingCart size={24} color={THEME.gold} />
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: THEME.gold }}>
                  Mi Carrito
                </h2>
                {itemCount > 0 && (
                  <span
                    style={{
                      background: THEME.danger,
                      color: 'white',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: THEME.textMuted,
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Items Container */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
              }}
            >
              <AnimatePresence mode="popLayout">
                {cartItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '300px',
                      gap: '16px',
                    }}
                  >
                    <ShoppingCart size={48} color={THEME.textMuted} />
                    <p style={{ color: THEME.textMuted, textAlign: 'center' }}>
                      Tu carrito está vacío
                    </p>
                    <p style={{ color: THEME.textMuted, fontSize: '12px', textAlign: 'center' }}>
                      Agrega productos del menú para comenzar
                    </p>
                  </motion.div>
                ) : (
                  cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        background: THEME.darker,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '12px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Imagen */}
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          background: `${THEME.card}`,
                          border: `1px solid ${THEME.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '32px' }}>🌯</span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: THEME.text,
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.nombre}
                        </h4>
                        <p
                          style={{
                            fontSize: '12px',
                            color: THEME.textMuted,
                            marginBottom: '8px',
                          }}
                        >
                          ${item.precio.toFixed(2)}
                        </p>

                        {/* Cantidad */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: THEME.card,
                            borderRadius: '6px',
                            padding: '4px 8px',
                            width: 'fit-content',
                          }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                item.cantidad - 1
                              )
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: THEME.gold,
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span
                            style={{
                              color: THEME.text,
                              fontSize: '12px',
                              fontWeight: 'bold',
                              minWidth: '20px',
                              textAlign: 'center',
                            }}
                          >
                            {item.cantidad}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                item.cantidad + 1
                              )
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: THEME.gold,
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Precio total del item */}
                      <div
                        style={{
                          textAlign: 'right',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: THEME.gold,
                          }}
                        >
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            background: THEME.danger,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          Eliminar
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div
                style={{
                  borderTop: `1px solid ${THEME.border}`,
                  padding: '16px',
                  background: THEME.darker,
                }}
              >
                {/* Subtotal */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${THEME.border}`,
                  }}
                >
                  <span style={{ color: THEME.textMuted }}>Subtotal:</span>
                  <span style={{ color: THEME.text, fontWeight: 'bold' }}>
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: THEME.text }}>
                    Total:
                  </span>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: THEME.gold,
                    }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: `linear-gradient(135deg, ${THEME.gold} 0%, #e6c200 100%)`,
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: `3px solid #000`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Ir al Pago <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                {/* Continue Shopping */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'none',
                    color: THEME.gold,
                    border: `1.5px solid ${THEME.gold}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  Seguir Comprando
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

export default ShoppingCart;
