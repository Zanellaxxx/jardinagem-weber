import { APP_EVENTS, eventService } from '../services/eventService';
import { DEFAULT_PROVIDER } from '../constants/providers';
import { storageRepository } from './storageRepository';

const PROVIDERS_KEY = '@jardinagem_weber:providers';

let cache = null;

function configuredProviders() {
  try {
    const providers = JSON.parse(process.env.EXPO_PUBLIC_PROVIDERS_JSON || '[]');
    return providers
      .filter((provider) => provider.id && provider.name)
      .map((provider) => ({ type: 'company', active: true, ...provider }));
  } catch {
    return [];
  }
}

async function persist(providers) {
  cache = providers;
  await storageRepository.writeJson(PROVIDERS_KEY, providers);
  eventService.emit(APP_EVENTS.PROVIDERS_CHANGED, providers);
}

export const providerRepository = {
  async getAll() {
    if (cache) return cache;
    const stored = await storageRepository.readJson(PROVIDERS_KEY, []);
    cache = [DEFAULT_PROVIDER, ...stored, ...configuredProviders()]
      .filter((provider, index, all) => all.findIndex((item) => item.id === provider.id) === index);
    if (cache.length !== stored.length) await persist(cache);
    return cache;
  },
  async getDefault() {
    const providers = await this.getAll();
    return providers.find((provider) => provider.id === DEFAULT_PROVIDER.id) || providers[0];
  },
  async findById(id) {
    return (await this.getAll()).find((provider) => provider.id === id) || null;
  },
  async upsert(provider) {
    const providers = await this.getAll();
    const exists = providers.some((item) => item.id === provider.id);
    const updated = exists
      ? providers.map((item) => (item.id === provider.id ? { ...item, ...provider } : item))
      : [...providers, provider];
    await persist(updated);
    await storageRepository.enqueueSync('providers', 'upsert', provider);
    return provider;
  },
};
