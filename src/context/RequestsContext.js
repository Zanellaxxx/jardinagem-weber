import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@jardinagem_weber:requests';

const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([]);

  const loadRequests = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setRequests(JSON.parse(stored));
    } catch {}
  }, []);

  const addRequest = useCallback(async (requestData) => {
    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      quotedValue: null,
      adminResponse: null,
      createdAt: new Date().toISOString(),
    };
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : [];
    const updated = [...current, newRequest];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRequests(updated);
    return newRequest;
  }, []);

  const updateRequest = useCallback(async (id, changes) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : [];
    const updated = current.map((r) => (r.id === id ? { ...r, ...changes } : r));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRequests(updated);
  }, []);

  return (
    <RequestsContext.Provider value={{ requests, loadRequests, addRequest, updateRequest }}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestsContext);
  if (!context) throw new Error('useRequests deve ser usado dentro de RequestsProvider');
  return context;
}
