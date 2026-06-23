'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    favoriteTypes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        favoriteTypes: user.favoriteTypes?.join(', ') || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const favoriteTypesArray = formData.favoriteTypes.split(',').map(s => s.trim()).filter(Boolean);
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      favoriteTypes: favoriteTypesArray
    });
    setMessage('Podaci su uspešno ažurirani!');
    setIsEditing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>👤 Profil korisnika</h1>
        <Link href="/" className="btn btn-secondary">← Nazad</Link>
      </div>

      {message && (
        <div style={{ padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <div className="detail-card">
        {!isEditing ? (
          <div>
            <p><strong>Ime:</strong> {user.firstName}</p>
            <p><strong>Prezime:</strong> {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Telefon:</strong> {user.phone || 'Nije uneto'}</p>
            <p><strong>Adresa:</strong> {user.address || 'Nije uneta'}</p>
            <p><strong>Omiljene vrste:</strong> {user.favoriteTypes?.length ? user.favoriteTypes.join(', ') : 'Nije odabrano'}</p>
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ marginTop: '15px' }}>
              Izmeni podatke
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ime *</label>
              <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Prezime *</label>
              <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Adresa</label>
              <input name="address" type="text" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Omiljene vrste (odvojene zarezom)</label>
              <input name="favoriteTypes" type="text" value={formData.favoriteTypes} onChange={handleChange} placeholder="npr. slagalica, figura, vozilo" />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-success">Sačuvaj izmene</button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (user) {
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      favoriteTypes: user.favoriteTypes?.join(', ') || ''
                    });
                  }
                }}
                className="btn btn-danger"
              >
                Otkaži
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}