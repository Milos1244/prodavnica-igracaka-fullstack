'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';


const TIPOVI = ['Slagalica', 'Slikovnica', 'Figura', 'Vozilo', 'Plišana igračka', 'Društvena igra', 'Konstruktorski set', 'Muzička igračka', 'Edukativna igračka', 'Kreativni set'];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    favoriteTypes: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Lozinke se ne poklapaju!');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Ime, prezime i email su obavezna polja!');
      return;
    }

    const favoriteTypesArray = formData.favoriteTypes ? [formData.favoriteTypes] : [];

    const success = register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
      favoriteTypes: favoriteTypesArray
    });

    if (success) {
      router.push('/');
    } else {
      setError('Korisnik sa ovim email-om već postoji!');
    }
  };

  return (
    <div className="form-container">
      <h1>📝 Registracija</h1>
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
          <label>Lozinka * (min. 6 karaktera)</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Ponovite lozinku *</label>
          <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
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
          <label>Omiljena vrsta</label>
          <select
            name="favoriteTypes"
            value={formData.favoriteTypes}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '2px solid #e2e8f0', fontSize: '16px', backgroundColor: 'white' }}
          >
            <option value="">Izaberite omiljenu vrstu (opciono)</option>
            {TIPOVI.map((tip) => (
              <option key={tip} value={tip}>{tip}</option>
            ))}
          </select>
        </div>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px', textAlign: 'center', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
          Registruj se
        </button>
        <p className="text-center mt-20">
          Imaš nalog? <Link href="/login" style={{ color: '#4CAF50' }}>Prijavi se</Link>
        </p>
      </form>
    </div>
  );
}