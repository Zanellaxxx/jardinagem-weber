import * as Crypto from 'expo-crypto';
import bcrypt from 'bcryptjs';
import { providerRepository } from '../repositories/providerRepository';
import { userRepository } from '../repositories/userRepository';
import { emailService } from './emailService';

const RESET_EXPIRATION_MS = 15 * 60 * 1000;
const BCRYPT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_CREDENTIALS_MESSAGE = 'Usuário ou senha inválidos.';

bcrypt.setRandomFallback((length) => Array.from(Crypto.getRandomBytes(length)));

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

function publicUser(user) {
  if (!user) return null;
  const {
    password,
    passwordHash,
    passwordSalt,
    passwordAlgorithm,
    resetCodeHash,
    resetExpiresAt,
    resetRequestedAt,
    resetUsedAt,
    ...safeUser
  } = user;
  return safeUser;
}

async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
}

async function createCredential(password) {
  return {
    passwordAlgorithm: 'bcrypt',
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    passwordSalt: undefined,
  };
}

function validateEmail(email) {
  if (!EMAIL_PATTERN.test(email)) throw new Error('Informe um e-mail válido.');
}

function validatePassword(password) {
  if (password.length < 8) throw new Error('A senha deve ter no mínimo 8 caracteres.');
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('A senha deve conter letras e números.');
  }
  if (bcrypt.truncates(password)) throw new Error('A senha é muito longa.');
}

function configuredAdmins() {
  try {
    return JSON.parse(process.env.EXPO_PUBLIC_PROVIDER_ADMINS_JSON || '[]');
  } catch {
    return [];
  }
}

async function bootstrapAdmins() {
  const defaultProvider = await providerRepository.getDefault();
  const defaultEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL;
  const defaultHash = process.env.EXPO_PUBLIC_ADMIN_PASSWORD_HASH;
  const legacyPassword = process.env.EXPO_PUBLIC_ADMIN_PASSWORD;
  const admins = [
    ...(defaultEmail && (defaultHash || legacyPassword) ? [{
      id: 'admin',
      name: process.env.EXPO_PUBLIC_ADMIN_NAME || 'Administrador',
      email: defaultEmail,
      passwordHash: defaultHash,
      password: legacyPassword,
      providerId: defaultProvider.id,
    }] : []),
    ...configuredAdmins(),
  ];

  for (const admin of admins) {
    if (!admin.email || (!isBcryptHash(admin.passwordHash) && !admin.password)) continue;
    const normalized = userRepository.normalizeEmail(admin.email);
    const existing = await userRepository.findByEmail(normalized);
    if (existing) {
      const configuredHash = isBcryptHash(admin.passwordHash) ? admin.passwordHash : null;
      const needsUpdate = !existing.providerId
        || !existing.isAdmin
        || (configuredHash && existing.passwordHash !== configuredHash);
      if (needsUpdate) {
        await userRepository.upsert({
          ...existing,
          isAdmin: true,
          providerId: admin.providerId || defaultProvider.id,
          ...(configuredHash ? { passwordAlgorithm: 'bcrypt', passwordHash: configuredHash } : {}),
        });
      }
      continue;
    }
    const credential = isBcryptHash(admin.passwordHash)
      ? { passwordAlgorithm: 'bcrypt', passwordHash: admin.passwordHash }
      : await createCredential(admin.password);
    await userRepository.upsert({
      id: admin.id || `admin-${Date.now()}`,
      name: admin.name || 'Administrador',
      email: normalized,
      isAdmin: true,
      providerId: admin.providerId || defaultProvider.id,
      ...credential,
      createdAt: new Date().toISOString(),
    });
  }
}

export const authService = {
  validateEmail,
  validatePassword,
  async restoreSession() {
    await bootstrapAdmins();
    const sessionId = await userRepository.getSession();
    if (!sessionId) return null;
    const users = await userRepository.getAll();
    return publicUser(users.find((user) => user.id === sessionId || user.email === sessionId));
  },
  async register({ name, email, phone, password }) {
    const normalized = userRepository.normalizeEmail(email);
    validateEmail(normalized);
    validatePassword(password);
    if (await userRepository.findByEmail(normalized)) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    const credential = await createCredential(password);
    const user = {
      id: `${Date.now()}`,
      name: name.trim(),
      email: normalized,
      phone: phone.trim(),
      isAdmin: false,
      ...credential,
      createdAt: new Date().toISOString(),
    };
    await userRepository.upsert(user);
    await userRepository.setSession(user.id);
    return publicUser(user);
  },
  async login({ email, password }) {
    const normalized = userRepository.normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalized)) throw new Error(INVALID_CREDENTIALS_MESSAGE);
    const user = await userRepository.findByEmail(normalized);
    if (!user) throw new Error(INVALID_CREDENTIALS_MESSAGE);

    let valid = false;
    if (user.passwordAlgorithm === 'bcrypt' || user.passwordHash?.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.passwordHash);
    } else if (user.passwordHash && user.passwordSalt) {
      valid = (await hashPassword(password, user.passwordSalt)) === user.passwordHash;
    } else if (user.password) {
      valid = user.password === password;
    }
    if (!valid) throw new Error(INVALID_CREDENTIALS_MESSAGE);
    if (user.passwordAlgorithm !== 'bcrypt') {
      const credential = await createCredential(password);
      await userRepository.upsert({ ...user, password: undefined, ...credential });
    }
    await userRepository.setSession(user.id);
    return publicUser(user);
  },
  async requestPasswordReset(email) {
    const normalized = userRepository.normalizeEmail(email);
    validateEmail(normalized);
    const user = await userRepository.findByEmail(normalized);
    if (!user || user.isAdmin) throw new Error('Não há uma conta de cliente com este e-mail.');

    const random = Crypto.getRandomBytes(4);
    const randomNumber = random.reduce((total, byte) => (total * 256) + byte, 0);
    const code = `${100000 + (randomNumber % 900000)}`;
    const resetCodeHash = await hashPassword(code, user.id);
    const resetUser = {
      ...user,
      resetCodeHash,
      resetExpiresAt: Date.now() + RESET_EXPIRATION_MS,
      resetRequestedAt: new Date().toISOString(),
    };
    await userRepository.upsert(resetUser);
    try {
      await emailService.sendPasswordReset({
        email: user.email,
        name: user.name,
        code,
        expiresInMinutes: RESET_EXPIRATION_MS / 60000,
      });
    } catch (error) {
      await userRepository.upsert({
        ...resetUser,
        resetCodeHash: undefined,
        resetExpiresAt: undefined,
        resetRequestedAt: undefined,
      });
      throw error;
    }
  },
  async resetPassword({ email, code, password }) {
    validatePassword(password);
    const user = await userRepository.findByEmail(email);
    if (!user || !user.resetCodeHash || user.resetExpiresAt < Date.now()) {
      throw new Error('Código inválido ou expirado. Solicite um novo código.');
    }
    const codeHash = await hashPassword(code.trim(), user.id);
    if (codeHash !== user.resetCodeHash) throw new Error('Código inválido ou expirado.');
    const credential = await createCredential(password);
    await userRepository.upsert({
      ...user,
      ...credential,
      password: undefined,
      resetCodeHash: undefined,
      resetExpiresAt: undefined,
      resetRequestedAt: undefined,
      resetUsedAt: new Date().toISOString(),
    });
  },
  logout: () => userRepository.clearSession(),
};
