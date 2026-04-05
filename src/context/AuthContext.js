import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// Guarda todos os usuários cadastrados (inclui senha)
const USERS_KEY = '@jardinagem_weber:users';
// Guarda apenas o e-mail do usuário logado atualmente
const SESSION_KEY = '@jardinagem_weber:session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const sessionEmail = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionEmail === 'admin@jardinagem.com') {
        setUser({ id: 'admin', name: 'Admin Weber', email: sessionEmail, isAdmin: true });
        return;
      }
      if (sessionEmail) {
        const usersRaw = await AsyncStorage.getItem(USERS_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const found = users.find((u) => u.email === sessionEmail);
        if (found) {
          const { password: _, ...safeUser } = found;
          setUser(safeUser);
        }
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }

  async function register({ name, email, phone, password }) {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find((u) => u.email === email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const newUser = { id: Date.now().toString(), name, email, phone, password };
    const updated = [...users, newUser];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(SESSION_KEY, email);

    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
  }

  async function login({ email, password }) {
    // Login do administrador
    if (email === 'admin@jardinagem.com' && password === 'admin123') {
      const adminUser = { id: 'admin', name: 'Admin Weber', email, isAdmin: true };
      await AsyncStorage.setItem(SESSION_KEY, email);
      setUser(adminUser);
      return;
    }

    // Login do cliente
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find((u) => u.email === email);

    if (!found) {
      throw new Error('Usuário não encontrado. Faça o cadastro primeiro.');
    }
    if (found.password !== password) {
      throw new Error('E-mail ou senha inválidos.');
    }

    await AsyncStorage.setItem(SESSION_KEY, email);
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
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
