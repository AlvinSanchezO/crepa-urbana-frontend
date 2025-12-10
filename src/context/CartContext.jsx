import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'crepa_urbana_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Inicializar desde localStorage
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from storage:', e);
      return [];
    }
  });

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      console.log('💾 Cart saved to localStorage:', cart);
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [cart]);

  const addToCart = (product) => {
    console.log('🛒 addToCart called with:', product.nombre);
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        console.log('📝 Item exists, incrementing');
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        console.log('✨ New item, adding to cart');
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, cantidad: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
