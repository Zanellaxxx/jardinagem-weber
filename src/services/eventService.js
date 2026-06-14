const listeners = new Map();

export const APP_EVENTS = Object.freeze({
  REQUESTS_CHANGED: 'requests_changed',
  USERS_CHANGED: 'users_changed',
  PROVIDERS_CHANGED: 'providers_changed',
  SYNC_QUEUE_CHANGED: 'sync_queue_changed',
});

export const eventService = {
  emit(event, payload) {
    listeners.get(event)?.forEach((listener) => listener(payload));
  },
  subscribe(event, listener) {
    const eventListeners = listeners.get(event) || new Set();
    eventListeners.add(listener);
    listeners.set(event, eventListeners);
    return () => {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) listeners.delete(event);
    };
  },
};

