import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.restoreSession()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function register(data) {
    setUser(await authService.register(data));
  }

  async function login(data) {
    setUser(await authService.login(data));
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout,
    requestPasswordReset: authService.requestPasswordReset,
    resetPassword: authService.resetPassword,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
