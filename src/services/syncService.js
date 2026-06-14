import { storageRepository } from '../repositories/storageRepository';

const SYNC_API_URL = process.env.EXPO_PUBLIC_SYNC_API_URL;
let activeSync = null;

async function sendOperation(operation) {
  const response = await fetch(`${SYNC_API_URL}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operation),
  });
  if (!response.ok) throw new Error(`Falha de sincronização: HTTP ${response.status}`);
}

export const syncService = {
  isConfigured: Boolean(SYNC_API_URL),
  async synchronize() {
    if (activeSync) return activeSync;
    if (!SYNC_API_URL) return { synced: 0, pending: (await storageRepository.getSyncQueue()).length };
    activeSync = (async () => {
      const queue = await storageRepository.getSyncQueue();
      let synced = 0;
      for (const operation of queue) {
        try {
          await sendOperation(operation);
          await storageRepository.removeSyncOperation(operation.id);
          synced += 1;
        } catch (error) {
          await storageRepository.markSyncAttempt(operation.id, error.message);
          break;
        }
      }
      return { synced, pending: (await storageRepository.getSyncQueue()).length };
    })();
    try {
      return await activeSync;
    } finally {
      activeSync = null;
    }
  },
};
