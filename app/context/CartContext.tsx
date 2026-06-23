'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Tip za stavku u korpi
interface CartItem {
  toyId: number;
  name: string;
  price: number;
  quantity: number;
  status: 'rezervisano' | 'pristiglo' | 'otkazano';
  rating?: number;
}

// Tip za globalnu ocenu
interface GlobalRating {
  id: number;
  toyId: number;
  userId: number;
  value: number;
  comment?: string;
  date: Date;
}

interface CartContextType {
  cart: CartItem[];
  allRatings: GlobalRating[];
  addToCart: (toy: { toyId: number; name: string; price: number }) => void;
  removeFromCart: (toyId: number) => void;
  updateStatus: (toyId: number, status: 'rezervisano' | 'pristiglo' | 'otkazano') => void;
  addRating: (toyId: number, rating: number, comment?: string) => void;
  updateQuantity: (toyId: number, newQuantity: number) => void; // NOVO
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allRatings, setAllRatings] = useState<GlobalRating[]>([]);

  // Dodavanje u korpu 
  const addToCart = (toy: { toyId: number; name: string; price: number }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.toyId === toy.toyId);
      if (existingItem) {
        return prevCart.map(item =>
          item.toyId === toy.toyId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          toyId: toy.toyId,
          name: toy.name,
          price: toy.price,
          quantity: 1,
          status: 'rezervisano'
        }];
      }
    });
  };

  // Brisanje iz korpe
  const removeFromCart = (toyId: number) => {
    setCart((prevCart) => {
      const item = prevCart.find(i => i.toyId === toyId);
      if (item && item.status !== 'pristiglo') {
        alert('Možete obrisati samo igračke u statusu "pristiglo"!');
        return prevCart;
      }
      return prevCart.filter(item => item.toyId !== toyId);
    });
  };

  // Promena statusa
  const updateStatus = (toyId: number, status: 'rezervisano' | 'pristiglo' | 'otkazano') => {
    setCart((prevCart) => {
      const item = prevCart.find(i => i.toyId === toyId);
      if (item && item.status !== 'rezervisano' && status !== 'rezervisano') {
        alert('Možete menjati status samo za igračke u statusu "rezervisano"!');
        return prevCart;
      }
      return prevCart.map(item =>
        item.toyId === toyId ? { ...item, status } : item
      );
    });
  };

  //Ažuriranje količine
  const updateQuantity = (toyId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // ne dozvoljava 0 ili negativno
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.toyId === toyId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Ocenjivanje
  const addRating = (toyId: number, value: number, comment?: string) => {
    const cartItem = cart.find(i => i.toyId === toyId);
    if (!cartItem) {
      alert('Igračka nije u korpi!');
      return;
    }
    if (cartItem.status !== 'pristiglo') {
      alert('Možete oceniti samo igračke u statusu "pristiglo"!');
      return;
    }
    const newRating: GlobalRating = {
      id: Date.now(),
      toyId,
      userId: 1,
      value,
      comment,
      date: new Date()
    };
    setAllRatings([...allRatings, newRating]);
    setCart(prevCart =>
      prevCart.map(item =>
        item.toyId === toyId ? { ...item, rating: value } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      allRatings,
      addToCart,
      removeFromCart,
      updateStatus,
      addRating,
      updateQuantity, // izloženo
      clearCart,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart mora biti korišćen unutar CartProvider-a');
  }
  return context;
}