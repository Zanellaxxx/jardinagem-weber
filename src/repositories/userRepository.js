import { storageRepository } from './storageRepository';
import { APP_EVENTS, eventService } from '../services/eventService';

const USERS_KEY = '@jardinagem_weber:users';
const SESSION_KEY = '@jardinagem_weber:session';
let cache = null;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export const userRepository = {
  async getAll() {
    if (!cache) cache = await storageRepository.readJson(USERS_KEY, []);
    return cache;
  },
  async findByEmail(email) {
    const normalized = normalizeEmail(email);
    const users = await this.getAll();
    return users.find((user) => user.email?.trim().toLowerCase() === normalized) || null;
  },
  async saveAll(users) {
    cache = users;
    await storageRepository.writeJson(USERS_KEY, users);
    eventService.emit(APP_EVENTS.USERS_CHANGED, users);
  },
  async upsert(user) {
    const users = await this.getAll();
    const index = users.findIndex((item) => item.id === user.id);
    const updated = index >= 0
      ? users.map((item) => (item.id === user.id ? user : item))
      : [...users, user];
    await this.saveAll(updated);
    const syncUser = {
      ...user,
      password: undefined,
      passwordHash: undefined,
      passwordSalt: undefined,
      passwordAlgorithm: undefined,
      resetCodeHash: undefined,
      resetExpiresAt: undefined,
      resetRequestedAt: undefined,
      resetUsedAt: undefined,
    };
    await storageRepository.enqueueSync('users', 'upsert', syncUser);
    return user;
  },
  getSession: () => storageRepository.getString(SESSION_KEY),
  setSession: (userId) => storageRepository.setString(SESSION_KEY, userId),
  clearSession: () => storageRepository.remove(SESSION_KEY),
  normalizeEmail,
};
