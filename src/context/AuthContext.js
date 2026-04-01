import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEY = '@jardinagem_weber:user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // storage error — ignore, user stays null
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, email, phone, password }) {
    // TODO: substituir por chamada real à API
    const newUser = { id: Date.now().toString(), name, email, phone };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  async function login({ email, password }) {
    // TODO: substituir por chamada real à API com validação
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      throw new Error('Usuário não encontrado. Faça o cadastro primeiro.');
    }
    const savedUser = JSON.parse(stored);
    if (savedUser.email !== email) {
      throw new Error('E-mail ou senha inválidos.');
    }
    setUser(savedUser);
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
