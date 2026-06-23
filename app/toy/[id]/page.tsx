'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import toys from '../../../lib/toys.json';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ToyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { addToCart, cart, addRating, allRatings } = useCart();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [quantity, setQuantity] = useState(1); // DODATO
  
  const toy = toys.find((t: any) => t.toyId === id);

  if (!toy) {
    return (
      <div className="container text-center">
        <h1>Igračka nije pronađena</h1>
        <Link href="/" className="btn btn-secondary">← Vrati se na početnu</Link>
      </div>
    );
  }

  const handleReserve = () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste rezervisali!');
      router.push('/login');
      return;
    }
    // Dodati u korpu onoliko puta koliko je quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        toyId: toy.toyId,
        name: toy.name,
        price: toy.price
      });
    }
    router.push('/cart');
  };

  const cartItem = cart.find(item => item.toyId === toy.toyId);
  const canRate = cartItem && cartItem.status === 'pristiglo';

  const handleRate = () => {
    if (rating < 1 || rating > 5) {
      alert('Ocena mora biti između 1 i 5!');
      return;
    }
    addRating(toy.toyId, rating, comment || undefined);
    setShowRating(false);
    setRating(0);
    setComment('');
    alert(`Hvala na oceni! ${toy.name} je dobila ${rating} zvezdica.`);
  };

  const toyRatings = allRatings.filter(r => r.toyId === toy.toyId);
  const avgRating = toyRatings.length > 0
    ? (toyRatings.reduce((sum, r) => sum + r.value, 0) / toyRatings.length).toFixed(1)
    : 'Nema ocena';

  return (
    <div className="container">
      <Link href="/" className="btn btn-secondary">← Nazad na listu</Link>

      <div className="detail-card">
        <h1>{toy.name}</h1>
        <p className="description">{toy.description}</p>
        
        <div className="info">
          <p><strong>Tip:</strong> {toy.type?.name || 'N/A'}</p>
          <p><strong>Uzrast:</strong> {toy.ageGroup?.name || 'N/A'}</p>
          <p><strong>Ciljna grupa:</strong> {toy.targetGroup}</p>
          <p><strong>Datum proizvodnje:</strong> {toy.productionDate}</p>
          <p><strong>Cena:</strong> {toy.price * quantity} din.</p>
          <p><strong>Prosečna ocena:</strong> ⭐ {avgRating}</p>
        </div>

        
        <div className="flex-center" style={{ marginTop: '15px' }}>
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="btn btn-secondary"
          >-</button>
          <span style={{ margin: '0 15px', fontSize: '20px', fontWeight: 'bold' }}>
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="btn btn-secondary"
          >+</button>
          <span style={{ marginLeft: '20px' }}>Kom.</span>
        </div>

        {toyRatings.length > 0 && (
          <div className="reviews">
            <h3>Recenzije korisnika:</h3>
            {toyRatings.map((r) => (
              <div key={r.id} className="review-item">
                <p className="rating">⭐ {r.value}/5</p>
                {r.comment && <p>{r.comment}</p>}
                <p className="date">{new Date(r.date).toLocaleDateString('sr-RS')}</p>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button onClick={handleReserve} className="btn btn-success">
            Rezerviši {quantity > 1 ? `${quantity} komada` : 'igračku'}
          </button>

          {canRate && (
            <button
              onClick={() => setShowRating(!showRating)}
              className="btn btn-accent"
            >
              {showRating ? 'Zatvori' : 'Oceni igračku'}
            </button>
          )}
        </div>

        {showRating && canRate && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            border: '1px solid #ffb74d'
          }}>
            <h3>Oceni {toy.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="flex-center">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '60px' }}
                />
                <span>⭐ (1-5)</span>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Komentar (opciono)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', maxWidth: '300px' }}
                />
              </div>
              <button onClick={handleRate} className="btn btn-success" style={{ alignSelf: 'flex-start' }}>
                Pošalji ocenu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}