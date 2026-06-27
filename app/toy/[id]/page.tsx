'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toys from '../../../lib/toys.json';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface Rating {
  id: number;
  userId: number;
  toyId: number;
  value: number;
  comment?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

// Globalni keš za ocene – traje 5 minuta
const ratingsCache = new Map<number, { ratings: Rating[]; avg: string | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuta

export default function ToyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { addToCart, cart, addRating } = useCart();
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toyRatings, setToyRatings] = useState<Rating[]>([]);
  const [avgRating, setAvgRating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  
  const toy = toys.find((t: any) => t.toyId === id);

  //  Dohvati ocene SAMO ako nema keša ili je istekao
  useEffect(() => {
    if (toyRatings.length > 0 && avgRating !== null) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      const cached = ratingsCache.get(id);
      const now = Date.now();
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setToyRatings(cached.ratings);
        setAvgRating(cached.avg);
        setLoading(false);
        fetchedRef.current = true;
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/ratings?toyId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setToyRatings(data);
          let avg = null;
          if (data.length > 0) {
            const sum = data.reduce((acc: number, r: Rating) => acc + r.value, 0);
            avg = (sum / data.length).toFixed(1);
          }
          setAvgRating(avg);
          ratingsCache.set(id, { ratings: data, avg, timestamp: Date.now() });
        }
      } catch (error) {
        console.error('Greška pri dohvatanju ocena:', error);
      } finally {
        setLoading(false);
        fetchedRef.current = true;
      }
    };

    if (!fetchedRef.current) {
      fetchRatings();
    }
  }, [id, toyRatings.length, avgRating]);

  // Ako igračka ne postoji, prikaži poruku i prekini
  if (!toy) {
    return (
      <div className="container text-center">
        <h1>Igračka nije pronađena</h1>
        <Link href="/" className="btn btn-secondary">← Vrati se na početnu</Link>
      </div>
    );
  }

  //  Nakon provere, `toy` je sigurno definisan – koristimo ga direktno
  const currentToy = toy; // Ovo je više radi jasnoće, ali možemo koristiti toy

  const displayAvgRating = useMemo(() => {
    return avgRating ? `⭐ ${avgRating}` : 'Nema ocena';
  }, [avgRating]);

  const handleReserve = useCallback(async () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste rezervisali!');
      router.push('/login');
      return;
    }
    await addToCart(currentToy.toyId, quantity);
  }, [user, currentToy, quantity, addToCart, router]);

  const handleRate = useCallback(async () => {
    if (rating < 1 || rating > 5) {
      alert('Ocena mora biti između 1 i 5!');
      return;
    }
    await addRating(currentToy.toyId, rating, comment || undefined);
    setShowRating(false);
    setRating(0);
    setComment('');
    alert(`Hvala na oceni! ${currentToy.name} je dobila ${rating} zvezdica.`);
    
    const res = await fetch(`/api/ratings?toyId=${currentToy.toyId}`);
    if (res.ok) {
      const data = await res.json();
      setToyRatings(data);
      let avg = null;
      if (data.length > 0) {
        const sum = data.reduce((acc: number, r: Rating) => acc + r.value, 0);
        avg = (sum / data.length).toFixed(1);
      }
      setAvgRating(avg);
      ratingsCache.set(currentToy.toyId, { ratings: data, avg, timestamp: Date.now() });
    }
  }, [rating, comment, currentToy, addRating]);

  const cartItem = cart.find(item => item.toyId === currentToy.toyId);
  const canRate = cartItem && cartItem.status === 'ARRIVED';

  return (
    <div className="container">
      <Link href="/" className="btn btn-secondary">← Nazad na listu</Link>

      <div className="detail-card">
        <h1>{currentToy.name}</h1>
        <p className="description">{currentToy.description}</p>
        
        <div className="info">
          <p><strong>Tip:</strong> {currentToy.type?.name || 'N/A'}</p>
          <p><strong>Uzrast:</strong> {currentToy.ageGroup?.name || 'N/A'}</p>
          <p><strong>Ciljna grupa:</strong> {currentToy.targetGroup}</p>
          <p><strong>Datum proizvodnje:</strong> {currentToy.productionDate}</p>
          <p><strong>Cena:</strong> {currentToy.price * quantity} din.</p>
          <p><strong>Prosečna ocena:</strong> {loading ? 'Učitavanje...' : displayAvgRating}</p>
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
                <p className="date">{new Date(r.createdAt).toLocaleDateString('sr-RS')}</p>
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
            <h3>Oceni {currentToy.name}</h3>
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