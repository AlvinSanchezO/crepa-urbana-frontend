import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import productService from '../services/productService';
import authService from '../services/authService';
import orderService from '../services/orderService';
import PaymentModal from '../components/PaymentModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Search,
  LogOut,
  Star,
  Clock,
  Heart,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_YOUR_KEY');

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

function Menu() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('menu_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  // Categorías disponibles
  const categories = ['Todos', 'Crepas Dulces', 'Crepas Saladas', 'Bebidas', 'Postres'];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Escuchar evento de checkout desde Navbar
  useEffect(() => {
    const handleCheckout = () => {
      handleCheckoutFromCart();
    };
    
    window.addEventListener('checkoutRequested', handleCheckout);
    
    return () => {
      window.removeEventListener('checkoutRequested', handleCheckout);
    };
  }, [cart]);

  // Sincronizar carrito con localStorage
  useEffect(() => {
    localStorage.setItem('menu_cart', JSON.stringify(cart));
    console.log('📦 Carrito guardado en localStorage:', cart);
    
    // Notificar a otros componentes que el carrito cambió
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  // Filtrar productos por búsqueda y categoría
  useEffect(() => {
    let filtered = products;

    // Filtro por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.categoria === selectedCategory);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Error al cargar el menú');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleAddToCart = (product) => {
    if (addingToCart) return; // Evitar clicks múltiples
    
    setAddingToCart(true);
    
    console.log('🛒 handleAddToCart called with:', product);
    if (!product.disponible) {
      toast.error('Este producto no está disponible');
      setAddingToCart(false);
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let newCart;
      
      if (existingItem) {
        console.log('📝 Producto ya existe, incrementando cantidad');
        newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        console.log('✨ Añadiendo producto nuevo al carrito');
        newCart = [...prevCart, { ...product, cantidad: 1 }];
      }
      
      return newCart;
    });
    
    toast.success('Agregado al carrito');
    
    // Reactivar después de 500ms para evitar clicks múltiples
    setTimeout(() => setAddingToCart(false), 500);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Producto eliminado');
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, cantidad: newQuantity }
          : item
      ));
    }
  };

  const handleCheckoutFromCart = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // Crear órdenes para todos los productos en el carrito
      const orderPayload = cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        notas: "Pedido Web - Pagado con Stripe"
      }));
      
      const response = await orderService.create(orderPayload);

      const puntosGanados = response.data.puntos_ganados || 0;
      const nuevosPuntos = user.puntos_actuales + puntosGanados;
      const updatedUser = { ...user, puntos_actuales: nuevosPuntos };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setShowPaymentModal(false);
      setCart([]);

      toast.success(`¡Pago y pedido exitoso! Ganaste ${puntosGanados} puntos 🎉`);

      setTimeout(() => {
        if (window.confirm('¿Quieres ver el estado de tu pedido?')) {
          navigate('/my-orders');
        }
      }, 500);
    } catch (error) {
      console.error('Error al crear la orden:', error);
      toast.error('Pago completado pero hubo error al crear la orden. Contacta soporte.');
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const itemsCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Elements stripe={stripePromise}>
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
          minHeight: '100vh',
          color: THEME.text,
          paddingBottom: '80px',
        }}
      >
        {/* HEADER CON BÚSQUEDA Y CATEGORÍAS */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
            borderBottom: `1px solid ${THEME.border}`,
            padding: '20px 0',
            marginTop: '70px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              <Search
                size={18}
                color={THEME.gold}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Busca crepas, bebidas, postres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: THEME.darker,
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: '10px',
                  color: THEME.text,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = THEME.gold;
                  e.target.style.boxShadow = `0 0 0 3px ${THEME.gold}20`;
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = THEME.border;
                }}
              />
            </motion.div>

            {/* Categories Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollBehavior: 'smooth',
              }}
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    background:
                      selectedCategory === cat
                        ? `linear-gradient(135deg, ${THEME.gold}, #c9a227)`
                        : THEME.card,
                    color: selectedCategory === cat ? THEME.dark : THEME.text,
                    border:
                      selectedCategory === cat
                        ? `1px solid ${THEME.gold}`
                        : `1px solid ${THEME.border}`,
                  }}
                >
                  {cat}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.header>

        {/* MAIN CONTENT */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 20px' }}>
          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: THEME.textMuted,
              fontSize: '13px',
              marginBottom: '24px',
              marginTop: 0,
            }}
          >
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado
            {searchTerm && ` para "${searchTerm}"`}
          </motion.p>

          {/* Products Grid */}
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              <motion.div
                layout
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '24px',
                }}
              >
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    style={{
                      background: `linear-gradient(135deg, ${THEME.card} 0%, #252525 100%)`,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 20px 40px rgba(212, 175, 55, 0.15)`;
                      e.currentTarget.style.borderColor = THEME.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = THEME.border;
                    }}
                  >
                    {/* Image Container */}
                    <div style={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                      <img
                        src={product.imagen_url || 'https://via.placeholder.com/240x180?text=Crepa'}
                        alt={product.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                      {!product.disponible && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: THEME.text,
                            fontWeight: 'bold',
                            fontSize: '16px',
                          }}
                        >
                          Agotado
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: `${THEME.gold}20`,
                          border: `1.5px solid ${THEME.gold}`,
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Heart size={18} color={THEME.gold} />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        padding: '16px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <h3
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: THEME.text,
                          }}
                        >
                          {product.nombre}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            color: THEME.textMuted,
                            fontSize: '12px',
                            lineHeight: '1.4',
                          }}
                        >
                          {product.descripcion?.substring(0, 50)}...
                        </p>
                      </div>

                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < 4 ? THEME.gold : THEME.border}
                            color={i < 4 ? THEME.gold : THEME.border}
                          />
                        ))}
                        <span style={{ color: THEME.textMuted, fontSize: '11px', marginLeft: '4px' }}>
                          4.0
                        </span>
                      </div>

                      {/* Price + Status */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                          paddingBottom: '12px',
                          borderBottom: `1px solid ${THEME.border}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: THEME.gold,
                          }}
                        >
                          ${product.precio}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: product.disponible ? THEME.success : THEME.danger,
                            fontWeight: '600',
                            background: product.disponible ? `${THEME.success}20` : `${THEME.danger}20`,
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {product.disponible ? '✅ Disponible' : '❌ Agotado'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            handleAddToCart(product);
                          }}
                          disabled={addingToCart}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: addingToCart 
                              ? '#999' 
                              : `linear-gradient(135deg, ${THEME.gold}, #c9a227)`,
                            color: THEME.dark,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: addingToCart ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: addingToCart ? 0.6 : 1,
                          }}
                        >
                          {addingToCart ? '⏳ Agregando...' : '🛒 Agregar'}
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Abrir modal de detalles del producto
                            toast.info('Funcionalidad de detalles próximamente');
                          }}
                          disabled={!product.disponible}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: product.disponible
                              ? `linear-gradient(135deg, ${THEME.primary}, #2563eb)`
                              : `${THEME.border}`,
                            color: product.disponible ? THEME.text : THEME.textMuted,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: product.disponible ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          ⭐ Ver Detalles
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: THEME.textMuted,
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0' }}>No hay productos</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Intenta con otra búsqueda o categoría
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Payment Modal */}
        {showPaymentModal && cart.length > 0 && (
          <PaymentModal
            products={cart}
            total={totalCart}
            user={user}
            onSuccess={handlePaymentSuccess}
            onClose={() => {
              setShowPaymentModal(false);
            }}
          />
        )}
      </div>
    </Elements>
  );
}

export default Menu;