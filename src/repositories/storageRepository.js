import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_EVENTS, eventService } from '../services/eventService';

const SYNC_QUEUE_KEY = '@jardinagem_weber:sync_queue';

async function readJson(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function enqueueSync(entity, action, payload) {
  const queue = await readJson(SYNC_QUEUE_KEY, []);
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    entity,
    action,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
  });
  await writeJson(SYNC_QUEUE_KEY, queue);
  eventService.emit(APP_EVENTS.SYNC_QUEUE_CHANGED, queue);
}

async function updateSyncQueue(mapper) {
  const queue = await readJson(SYNC_QUEUE_KEY, []);
  const updated = mapper(queue);
  await writeJson(SYNC_QUEUE_KEY, updated);
  eventService.emit(APP_EVENTS.SYNC_QUEUE_CHANGED, updated);
  return updated;
}

export const storageRepository = {
  readJson,
  writeJson,
  getString: (key) => AsyncStorage.getItem(key),
  setString: (key, value) => AsyncStorage.setItem(key, value),
  remove: (key) => AsyncStorage.removeItem(key),
  enqueueSync,
  getSyncQueue: () => readJson(SYNC_QUEUE_KEY, []),
  removeSyncOperation: (id) => updateSyncQueue((queue) => queue.filter((item) => item.id !== id)),
  markSyncAttempt: (id, error) => updateSyncQueue((queue) => queue.map((item) => (
    item.id === id
      ? { ...item, attempts: item.attempts + 1, lastError: error, lastAttemptAt: new Date().toISOString() }
      : item
  ))),
};
