'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, removeFromCart, updateQuantity, getTotalPrice, fetchCart } = useCart();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchCart();
    }
  }, [user, router]);

  if (!user) return null;

  if (loading) {
    return <div className="container text-center">Učitavanje korpe...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="container text-center">
        <h1>🛒 Korpa je prazna</h1>
        <Link href="/" className="btn btn-secondary">Vrati se na listu igračaka</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛒 Moja korpa</h1>
      <Link href="/" className="btn btn-secondary">← Nastavi sa kupovinom</Link>

      <div style={{ marginTop: '20px' }}>
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="info">
              <h3 style={{ margin: '0' }}>{item.toy.name}</h3>
              <p style={{ margin: '5px 0' }}>
                Cena: {item.toy.price} din. × {item.quantity} = {item.toy.price * item.quantity} din.
              </p>
              <p style={{ margin: '5px 0' }}>
                Status: <strong>{item.status}</strong>
              </p>
            </div>
            <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              {/* Dugmad za promenu količine */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="btn btn-secondary"
                  disabled={item.quantity <= 1}
                  style={{ padding: '4px 12px' }}
                >-</button>
                <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px' }}
                >+</button>
              </div>

              {/* Dugme za otkazivanje (brisanje) */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                Otkaži porudžbinu
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Ukupno: {getTotalPrice()} din.</h2>
      </div>
    </div>
  );
}