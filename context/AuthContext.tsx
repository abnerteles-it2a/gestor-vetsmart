import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vet' | 'receptionist';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'admin' | 'vet' | 'receptionist') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('vetsmart_user');
    const token = localStorage.getItem('vetsmart_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('vetsmart_user');
        localStorage.removeItem('vetsmart_token');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: any, token: string) => {
    const userData: User = {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.name.substring(0, 2).toUpperCase()
    };

    setUser(userData);
    localStorage.setItem('vetsmart_user', JSON.stringify(userData));
    localStorage.setItem('vetsmart_token', token);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await apiService.login({ email, password });
        const { user, token } = response.data;
        handleAuthSuccess(user, token);
        return true;
    } catch (error) {
        console.error('Login failed', error);
        return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'vet' | 'receptionist' = 'vet'): Promise<boolean> => {
    try {
        const response = await apiService.register({ name, email, password, role });
        const { user, token } = response.data;
        handleAuthSuccess(user, token);
        return true;
    } catch (error) {
        console.error('Registration failed', error);
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vetsmart_user');
    localStorage.removeItem('vetsmart_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
