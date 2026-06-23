'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, removeFromCart, updateStatus, updateQuantity, getTotalPrice, clearCart } = useCart();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
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
          <div key={item.toyId} className="cart-item">
            <div className="info">
              <h3 style={{ margin: '0' }}>{item.name}</h3>
              <p style={{ margin: '5px 0' }}>
                Cena: {item.price} din. × {item.quantity} = {item.price * item.quantity} din.
              </p>
              <p style={{ margin: '5px 0' }}>
                Status: <strong>{item.status}</strong>
              </p>
              {item.rating && (
                <p style={{ margin: '5px 0', color: '#FF9800' }}>
                  ⭐ Tvoja ocena: {item.rating}/5
                </p>
              )}
            </div>
            <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              {/* DODATO: Dugmad za promenu količine */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => updateQuantity(item.toyId, item.quantity - 1)}
                  className="btn btn-secondary"
                  disabled={item.quantity <= 1}
                  style={{ padding: '4px 12px' }}
                >-</button>
                <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.toyId, item.quantity + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px' }}
                >+</button>
              </div>

              {/* Postojeća dugmad */}
              {item.status === 'rezervisano' && (
                <button
                  onClick={() => updateStatus(item.toyId, 'pristiglo')}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Označi kao pristiglo
                </button>
              )}
              {item.status === 'pristiglo' && (
                <button
                  onClick={() => removeFromCart(item.toyId)}
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                >
                  Obriši
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Ukupno: {getTotalPrice()} din.</h2>
        <button onClick={clearCart} className="btn btn-danger">
          Isprazni korpu
        </button>
      </div>
    </div>
  );
}