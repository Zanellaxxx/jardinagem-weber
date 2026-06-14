import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { storageRepository } from '../repositories/storageRepository';
import { APP_EVENTS, eventService } from '../services/eventService';
import { syncService } from '../services/syncService';

const SyncContext = createContext({ isConnected: true, pendingChanges: 0, syncing: false });

export function SyncProvider({ children }) {
  const [isConnected, setConnected] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const refreshQueue = useCallback(
    () => storageRepository.getSyncQueue().then((queue) => setPendingChanges(queue.length)),
    [],
  );

  const synchronize = useCallback(async () => {
    if (!syncService.isConfigured || syncing) return;
    setSyncing(true);
    try {
      await syncService.synchronize();
      setLastSyncAt(new Date().toISOString());
    } finally {
      setSyncing(false);
      refreshQueue();
    }
  }, [refreshQueue, syncing]);

  useEffect(() => {
    refreshQueue();
    const unsubscribeQueue = eventService.subscribe(APP_EVENTS.SYNC_QUEUE_CHANGED, (queue) => {
      setPendingChanges(queue.length);
      if (isConnected && queue.length) synchronize();
    });
    const unsubscribeNetwork = NetInfo.addEventListener((state) => {
      setConnected(Boolean(state.isConnected));
      if (state.isConnected) synchronize();
    });
    return () => {
      unsubscribeQueue();
      unsubscribeNetwork();
    };
  }, [isConnected, refreshQueue, synchronize]);

  const value = useMemo(() => ({
    isConnected,
    pendingChanges,
    syncing,
    lastSyncAt,
    syncConfigured: syncService.isConfigured,
    synchronize,
  }), [isConnected, pendingChanges, syncing, lastSyncAt, synchronize]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  return useContext(SyncContext);
}
