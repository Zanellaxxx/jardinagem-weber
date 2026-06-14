import { storageRepository } from './storageRepository';
import { APP_EVENTS, eventService } from '../services/eventService';

const REQUESTS_KEY = '@jardinagem_weber:requests';
let cache = null;

async function persist(requests) {
  cache = requests;
  await storageRepository.writeJson(REQUESTS_KEY, requests);
  eventService.emit(APP_EVENTS.REQUESTS_CHANGED, requests);
}

export const requestRepository = {
  async getAll() {
    if (!cache) cache = await storageRepository.readJson(REQUESTS_KEY, []);
    return cache;
  },
  async add(request) {
    const requests = await this.getAll();
    const updated = [...requests, request];
    await persist(updated);
    await storageRepository.enqueueSync('requests', 'create', request);
    return updated;
  },
  async update(id, changes) {
    const requests = await this.getAll();
    const updatedAt = new Date().toISOString();
    const updated = requests.map((request) => (
      request.id === id ? { ...request, ...changes, updatedAt } : request
    ));
    await persist(updated);
    const changed = updated.find((request) => request.id === id);
    await storageRepository.enqueueSync('requests', 'update', changed);
    return updated;
  },
};
