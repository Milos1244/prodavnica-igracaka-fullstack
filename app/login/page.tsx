'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Pogrešan email ili lozinka!');
    }
  };

  return (
    <div className="form-container">
      <h1>🔐 Prijava</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Lozinka:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px', textAlign: 'center', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
          Prijavi se
        </button>
        <p className="text-center mt-20">
          Nemaš nalog? <Link href="/register" style={{ color: '#4CAF50' }}>Registruj se</Link>
        </p>
      </form>
    </div>
  );
}