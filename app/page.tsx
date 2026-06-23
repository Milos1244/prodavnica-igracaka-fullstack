'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // DODATO
import toys from '../lib/toys.json';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

export default function Home() {
  const { user, logout } = useAuth();
  const { allRatings } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const types = [...new Set(toys.map((toy: any) => toy.type?.name).filter(Boolean))];

  const getAverageRating = (toyId: number) => {
    const toyRatings = allRatings.filter(r => r.toyId === toyId);
    if (toyRatings.length === 0) return null;
    const sum = toyRatings.reduce((total, r) => total + r.value, 0);
    return (sum / toyRatings.length).toFixed(1);
  };

  const filteredToys = toys.filter((toy: any) => {
    const matchesName = toy.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || toy.type?.name === selectedType;
    const price = toy.price;
    const matchesMin = minPrice === '' || price >= Number(minPrice);
    const matchesMax = maxPrice === '' || price <= Number(maxPrice);
    return matchesName && matchesType && matchesMin && matchesMax;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🧸 Prodavnica igračaka</h1>
        <nav className="header-nav">
          <Link href="/cart" className="btn btn-primary">🛒 Korpa</Link>
          {user ? (
            <>
              <Link href="/profile" className="btn btn-purple">👤 Profil</Link>
              <span>👋 {user.firstName}</span>
              <button onClick={logout} className="btn btn-danger">Odjavi se</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Prijava</Link>
              <Link href="/register" className="btn btn-accent">Registracija</Link>
            </>
          )}
        </nav>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Pretraži po nazivu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">Svi tipovi</option>
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min cena"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max cena"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button onClick={resetFilters} className="btn btn-danger">Resetuj filtere</button>
      </div>

      <p className="text-center">
        Prikazano: <strong>{filteredToys.length}</strong> od {toys.length} igračaka
      </p>

      <div className="card-grid">
        {filteredToys.map((toy: any) => {
          const avgRating = getAverageRating(toy.toyId);
          // Ako slika ne postoji, koristi placeholder
          const imageSrc = toy.imageUrl || '/img/placeholder.png';
          
          return (
            <Link key={toy.toyId} href={`/toy/${toy.toyId}`} className="card">
              <div className="card-image-wrapper">
                <Image
                  src={imageSrc}
                  alt={toy.name}
                  width={200}
                  height={200}
                  className="card-image"
                  onError={(e) => {
                    // Ako slika ne postoji, zameni sa placeholderom
                    (e.target as HTMLImageElement).src = '/img/placeholder.png';
                  }}
                />
              </div>
              <h3>{toy.name}</h3>
              <p>{toy.description}</p>
              <p className="price">💰 {toy.price} din.</p>
              <p>📌 Tip: {toy.type?.name || 'N/A'}</p>
              <p>🎂 Uzrast: {toy.ageGroup?.name || 'N/A'}</p>
              <p>⭐ Ocena: {avgRating ? `${avgRating}/5` : 'Nema ocena'}</p>
            </Link>
          );
        })}
      </div>

      {filteredToys.length === 0 && (
        <p className="text-center mt-20" style={{ fontSize: '18px' }}>
          Nema igračaka koje odgovaraju kriterijumima.
        </p>
      )}
    </div>
  );
}