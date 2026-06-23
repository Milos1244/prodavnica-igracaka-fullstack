'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  favoriteTypes: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (userData: Omit<User, 'id'>) => boolean;
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'password'>>) => void; // DODAJ OVO
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const INITIAL_USERS: User[] = [
  {
    id: 1,
    email: 'pera@test.com',
    password: 'password123',
    firstName: 'Pera',
    lastName: 'Perić',
    phone: '061111111',
    address: 'Neka 1, Beograd',
    favoriteTypes: ['slagalica', 'kreativni set']
  },
  {
    id: 2,
    email: 'mika@test.com',
    password: 'password123',
    firstName: 'Mika',
    lastName: 'Mikić',
    phone: '062222222',
    address: 'Neka 2, Novi Sad',
    favoriteTypes: ['vozilo', 'figura']
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('currentUser', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id'>): boolean => {
    if (users.find(u => u.email === userData.email)) {
      return false;
    }
    const newUser: User = {
      ...userData,
      id: Date.now()
    };
    setUsers([...users, newUser]);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // ažuriranje korisnika
  const updateUser = (data: Partial<Omit<User, 'id' | 'password'>>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    
    // Ažuriraj u listi svih korisnika
    setUsers(prevUsers =>
      prevUsers.map(u => u.id === user.id ? updatedUser : u)
    );
    
    // Ažuriraj trenutnog korisnika
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser, // DODAJ OVO
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth mora biti korišćen unutar AuthProvider-a');
  }
  return context;
}