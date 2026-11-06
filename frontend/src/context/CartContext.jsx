import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI
} from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cloudcart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when user logs in or on mount if authenticated
  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await getCart();
      if (res && res.cart && Array.isArray(res.cart.items)) {
        // Backend items: [{ _id, product: { _id, name, price, imageUrl, ... }, quantity }]
        setCartItems(res.cart.items);
      }
    } catch (error) {
      console.error('Error fetching backend cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCart();
    } else {
      // Load from localStorage for guest
      try {
        const saved = localStorage.getItem('cloudcart_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
    }
  }, [isAuthenticated, fetchBackendCart]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cloudcart_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Computed totals
  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price ?? item.price ?? 0;
      return acc + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Helper to extract product ID
  const getProductId = (productOrItem) => {
    if (!productOrItem) return null;
    if (typeof productOrItem === 'string') return productOrItem;
    return productOrItem._id || productOrItem.id || (productOrItem.product?._id || productOrItem.product?.id);
  };

  // Add to cart
  const addToCart = async (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const productId = getProductId(product);

    if (!productId) {
      toast.error('Unable to add item: invalid product');
      return;
    }

    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await addToCartAPI(productId, qty);
        if (res && res.cart && Array.isArray(res.cart.items)) {
          setCartItems(res.cart.items);
        } else {
          await fetchBackendCart();
        }
        toast.success(`Added ${product.name || 'item'} to cart!`);
      } catch (error) {
        const msg = error.response?.data?.message || 'Could not add item to cart';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest local storage
      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => getProductId(item.product) === productId
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          const newQty = updated[existingIndex].quantity + qty;
          const maxStock = product.stock ?? 999;
          if (newQty > maxStock) {
            toast.warning(`Only ${maxStock} items available in stock`);
            updated[existingIndex].quantity = maxStock;
          } else {
            updated[existingIndex].quantity = newQty;
            toast.success(`Updated ${product.name} quantity to ${newQty}`);
          }
          return updated;
        } else {
          toast.success(`Added ${product.name} to cart!`);
          return [
            ...prevItems,
            {
              _id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              product: {
                _id: productId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                category: product.category,
                stock: product.stock
              },
              quantity: qty
            }
          ];
        }
      });
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await removeFromCartAPI(productId);
        if (res && res.cart && Array.isArray(res.cart.items)) {
          setCartItems(res.cart.items);
        } else {
          await fetchBackendCart();
        }
        toast.info('Item removed from cart');
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to remove item';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) =>
        prev.filter((item) => getProductId(item.product) !== productId && item._id !== productId)
      );
      toast.info('Item removed from cart');
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await updateCartItemAPI(productId, qty);
        if (res && res.cart && Array.isArray(res.cart.items)) {
          setCartItems(res.cart.items);
        } else {
          await fetchBackendCart();
        }
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to update quantity';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          if (getProductId(item.product) === productId || item._id === productId) {
            const stock = item.product?.stock ?? 999;
            const finalQty = qty > stock ? stock : qty;
            if (qty > stock) {
              toast.warning(`Maximum available stock is ${stock}`);
            }
            return { ...item, quantity: finalQty };
          }
          return item;
        })
      );
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await clearCartAPI();
        setCartItems([]);
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to clear cart';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cloudcart_cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchBackendCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
