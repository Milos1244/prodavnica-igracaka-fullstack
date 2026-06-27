'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  toyId: number;
  quantity: number;
  status: string;
  totalPrice: number;
  toy: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  fetchCart: (force?: boolean) => Promise<void>;
  addToCart: (toyId: number, quantity: number) => Promise<void>;
  updateStatus: (orderId: number, status: string) => Promise<void>;
  removeFromCart: (orderId: number) => Promise<void>;
  addRating: (toyId: number, value: number, comment?: string) => Promise<void>;
  getTotalPrice: () => number;
  updateQuantity: (orderId: number, newQuantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const isFetching = useRef(false); //  Sprečava duple zahteve

  const fetchCart = async (force: boolean = false) => {
    if (!token) {
      setCart([]);
      setLastFetch(0);
      return;
    }

    // Sprečava duple zahteve dok je jedan u toku
    if (isFetching.current) {
      console.log('⏳ Već se učitava korpa, preskačem...');
      return;
    }

    const now = Date.now();
   
    if (!force && cart.length > 0 && (now - lastFetch) < 60000) {
      console.log('⏳ Korpa je već učitana (keš)');
      return;
    }

    try {
      isFetching.current = true;
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        setLastFetch(now);
      } else {
        console.error('Greška pri dohvatanju korpe');
      }
    } catch (error) {
      console.error('fetchCart error:', error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Dodaj u korpu (kreira porudžbinu)
  const addToCart = async (toyId: number, quantity: number = 1) => {
    if (!token) {
      alert('Morate biti prijavljeni da biste rezervisali');
      return;
    }
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toyId, quantity }),
      });
      if (response.ok) {
        await fetchCart(true);
        alert('Uspešno ste rezervisali igračku!');
      } else {
        const error = await response.json();
        alert(error.error || 'Greška pri rezervaciji');
      }
    } catch (error) {
      console.error('addToCart error:', error);
    }
  };

  // Promena statusa (opciono)
  const updateStatus = async (orderId: number, status: string) => {
    console.log('updateStatus:', orderId, status);
    
  };

  // Brisanje iz korpe (otkazivanje)
  const removeFromCart = async (orderId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchCart(true);
        alert('Porudžbina je otkazana');
      } else {
        alert('Greška pri otkazivanju');
      }
    } catch (error) {
      console.error('removeFromCart error:', error);
    }
  };

  // Ocenjivanje
  const addRating = async (toyId: number, value: number, comment?: string) => {
    if (!token) {
      alert('Morate biti prijavljeni da biste ocenili');
      return;
    }
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toyId, value, comment }),
      });
      if (response.ok) {
        alert('Hvala na oceni!');
      } else {
        const error = await response.json();
        alert(error.error || 'Greška pri ocenjivanju');
      }
    } catch (error) {
      console.error('addRating error:', error);
    }
  };

  // Ukupna cena
  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.toy.price * item.quantity), 0);
  };

  // Ažuriranje količine
  const updateQuantity = async (orderId: number, newQuantity: number) => {
    if (!token) return;
    if (newQuantity < 1) {
      alert('Količina mora biti veća od 0');
      return;
    }
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (response.ok) {
        await fetchCart(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Greška pri ažuriranju količine');
      }
    } catch (error) {
      console.error('updateQuantity error:', error);
    }
  };

  // Inicijalno učitavanje – ako token postoji, učitaj korpu 
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart([]);
      setLastFetch(0);
    }
    
  }, [token]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateStatus,
        removeFromCart,
        updateQuantity,
        addRating,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}