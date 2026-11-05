import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { calculateTotals } from '../utils/pricing.js';

const CartContext = createContext(null);
const CART_KEY = 'luma_cart_v1';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item._id === 'string' &&
          typeof item.name === 'string' &&
          Number.isFinite(Number(item.price)) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0
      )
      .map((item) => ({
        _id: item._id,
        name: item.name,
        brand: item.brand || '',
        image: item.image || '',
        price: Number(item.price),
        stock: Number(item.stock) || 0,
        quantity: item.quantity,
      }));
  } catch {
    return [];
  }
}

function makeSnapshot(product, quantity) {
  return {
    _id: product._id,
    name: product.name,
    brand: product.brand || '',
    image: product.image || '',
    price: Number(product.price),
    stock: Number(product.stock) || 0,
    quantity,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private mode / quota). The cart still
      // works for the current session.
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    const stock = Number(product?.stock ?? 0);

    if (!product?._id || stock <= 0) {
      return false;
    }

    const amount = Math.max(1, Math.floor(Number(quantity) || 1));

    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);

      if (existing) {
        const nextQuantity = Math.min(
          stock,
          existing.quantity + amount
        );

        return current.map((item) =>
          item._id === product._id
            ? { ...item, ...makeSnapshot(product, nextQuantity) }
            : item
        );
      }

      return [...current, makeSnapshot(product, Math.min(amount, stock))];
    });

    return true;
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const amount = Math.max(1, Math.floor(Number(quantity) || 1));

    setItems((current) =>
      current.map((item) => {
        if (item._id !== id) return item;
        const max = item.stock > 0 ? item.stock : 99;
        return { ...item, quantity: Math.min(max, amount) };
      })
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item._id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => calculateTotals(items), [items]);
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      ...totals,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, totals, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider.');
  }

  return context;
}
