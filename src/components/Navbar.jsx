import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEME = {
  dark: '#0f0f0f',
  darker: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
  gold: '#d4af37',
  text: '#ffffff',
  textMuted: '#a0a0a0',
  danger: '#ef4444',
};

export default function Navbar({ user = {}, onLogout = () => {}, onCheckout = () => {} }) {
  const [showCartModal, setShowCartModal] = useState(false);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar carrito de localStorage y actualizar cuando cambie
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('menu_cart');
        const parsed = saved ? JSON.parse(saved) : [];
        setCart(parsed);
        console.log('🔄 Navbar: Carrito actualizado desde localStorage', parsed);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    };

    // Cargar inicial
    handleStorageChange();

    // Escuchar cambios en localStorage (desde otra pestaña o componente)
    window.addEventListener('storage', handleStorageChange);
    
    // También crear un evento personalizado para cuando Menu.jsx actualice el carrito
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);
  
  const isActive = (path) => location.pathname === path;
  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  console.log('✅ NAVBAR RENDERING - Current cart:', cart);

  // Funciones para manipular el carrito
  const removeFromCart = (productId) => {
    const updated = cart.filter(item => item.id !== productId);
    localStorage.setItem('menu_cart', JSON.stringify(updated));
    setCart(updated);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      const updated = cart.map(item =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item
      );
      localStorage.setItem('menu_cart', JSON.stringify(updated));
      setCart(updated);
    }
  };

  return (
    <>
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{
        background: `linear-gradient(135deg, ${THEME.dark} 0%, #1a1a2e 100%)`,
        borderBottom: `2px solid ${THEME.gold}`,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.15), 0 4px 16px rgba(0, 0, 0, 0.5)',
        padding: '0 40px',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* LOGO */}
        <motion.div onClick={() => navigate('/menu')} whileHover={{ scale: 1.05 }} style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: 'fit-content',
        }}>
          <span style={{ fontSize: '28px' }}>🌯</span>
          <span style={{ color: THEME.gold, fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>CREPA URBANA</span>
        </motion.div>

        {/* CENTER NAV */}
        <div style={{
          display: 'flex',
          gap: '50px',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}>
          {/* MENÚ */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/menu')} style={{
            background: 'none',
            border: 'none',
            color: isActive('/menu') ? THEME.gold : THEME.text,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: isActive('/menu') ? `3px solid ${THEME.gold}` : '3px solid transparent',
          }}>
            <span>🍽️</span>
            <span>MENÚ</span>
          </motion.button>

          {/* CARRITO */}
          <div style={{ position: 'relative' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCartModal(true)} style={{
              background: 'none',
              border: 'none',
              color: THEME.text,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '3px solid transparent',
            }} onMouseEnter={(e) => (e.currentTarget.style.color = THEME.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = THEME.text)}>
              <span>🛒</span>
              <span>CARRITO</span>
            </motion.button>
            {cart.length > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.15 }} style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: `linear-gradient(135deg, ${THEME.gold}, #f5c857)`,
                color: THEME.dark,
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: `0 0 15px ${THEME.gold}60, 0 0 30px ${THEME.gold}20`,
                border: `2px solid ${THEME.dark}`,
              }}>
                {cart.length}
              </motion.div>
            )}
          </div>

          {/* PEDIDOS */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/my-orders')} style={{
            background: 'none',
            border: 'none',
            color: isActive('/my-orders') ? THEME.gold : THEME.text,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: isActive('/my-orders') ? `3px solid ${THEME.gold}` : '3px solid transparent',
          }}>
            <span>📦</span>
            <span>PEDIDOS</span>
          </motion.button>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 'fit-content' }}>
          {user && user.puntos_actuales !== undefined && (
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <span style={{ color: THEME.gold, fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⭐ {user.puntos_actuales}</span>
            </motion.div>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onLogout} style={{
            background: `linear-gradient(135deg, ${THEME.danger}, #dc2626)`,
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: `0 4px 15px ${THEME.danger}40`,
            transition: 'all 0.3s ease',
          }}>
            <LogOut size={16} />
            <span>Salir</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* CART MODAL */}
      <AnimatePresence>
        {showCartModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartModal(false)} style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 100,
              backdropFilter: 'blur(4px)',
            }} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} style={{
              position: 'fixed',
              top: '70px',
              right: '20px',
              maxWidth: '500px',
              width: 'calc(100% - 40px)',
              maxHeight: 'calc(100vh - 110px)',
              overflowY: 'auto',
              background: `linear-gradient(135deg, ${THEME.card} 0%, #252535 100%)`,
              border: `2px solid ${THEME.gold}`,
              borderRadius: '16px',
              padding: '32px',
              zIndex: 101,
              boxShadow: '0 25px 60px rgba(212, 175, 55, 0.2), 0 10px 30px rgba(0, 0, 0, 0.6)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: THEME.gold, margin: 0, display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>🛒</span>
                  <span>MI CARRITO</span>
                </h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCartModal(false)} style={{
                  background: 'none',
                  border: 'none',
                  color: THEME.textMuted,
                  cursor: 'pointer',
                  fontSize: '28px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  ✕
                </motion.button>
              </div>

              {cart.length > 0 ? (
                <>
                  <div style={{ marginBottom: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                    {cart.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{
                        background: `linear-gradient(135deg, #0f0f0f 0%, ${THEME.darker} 100%)`,
                        padding: '16px',
                        marginBottom: '12px',
                        borderRadius: '12px',
                        border: `1.5px solid ${THEME.border}`,
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '700', color: THEME.text, margin: '0 0 6px 0' }}>{item.nombre}</h4>
                          <p style={{ fontSize: '13px', color: THEME.gold, fontWeight: 'bold', margin: 0 }}>${item.precio.toFixed(2)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: THEME.darker, padding: '4px', borderRadius: '8px' }}>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, item.cantidad - 1)} style={{ background: THEME.gold, border: 'none', color: THEME.dark, width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s' }}>−</motion.button>
                          <span style={{ color: THEME.text, fontWeight: 'bold', minWidth: '32px', textAlign: 'center', fontSize: '14px' }}>{item.cantidad}</span>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, item.cantidad + 1)} style={{ background: THEME.gold, border: 'none', color: THEME.dark, width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s' }}>+</motion.button>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                          <p style={{ fontSize: '15px', fontWeight: 'bold', color: THEME.gold, margin: 0 }}>${(item.precio * item.cantidad).toFixed(2)}</p>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => removeFromCart(item.id)} style={{ background: THEME.danger, color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', marginTop: '6px', transition: 'all 0.2s' }}>Eliminar</motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div style={{ borderTop: `2px solid ${THEME.gold}`, paddingTop: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: THEME.textMuted, fontSize: '14px', fontWeight: '500' }}>Subtotal:</span>
                      <span style={{ color: THEME.text, fontSize: '14px', fontWeight: 'bold' }}>${total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: `${THEME.gold}15`, padding: '12px', borderRadius: '8px' }}>
                      <span style={{ color: THEME.gold, fontSize: '18px', fontWeight: 'bold' }}>TOTAL:</span>
                      <span style={{ color: THEME.gold, fontSize: '20px', fontWeight: 'bold' }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { 
                    setShowCartModal(false);
                    // Dispatchear evento para que Menu.jsx abra el modal de pago
                    window.dispatchEvent(new Event('checkoutRequested'));
                  }} style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${THEME.gold}, #f5c857)`,
                    color: THEME.dark,
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: `0 8px 20px ${THEME.gold}40`,
                    transition: 'all 0.3s ease',
                  }}>
                    💳 PROCEDER AL PAGO
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCartModal(false)} style={{
                    width: '100%',
                    padding: '14px',
                    background: 'none',
                    color: THEME.gold,
                    border: `2px solid ${THEME.gold}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                  }}>
                    SEGUIR COMPRANDO
                  </motion.button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
                  <p style={{ color: THEME.textMuted, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Tu carrito está vacío<br />¡Agrega productos para comenzar!</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
