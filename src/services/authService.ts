import usersData from '../data/users.json';
import { User } from '../types';

const STORAGE_KEY = 'tutorsphere_users';
const SEED_HASH_KEY = 'tutorsphere_users_hash';

/** Simple hash of the seed data so we can detect changes */
function seedHash(): string {
  return JSON.stringify(usersData);
}

function getUsers(): User[] {
  const currentHash = seedHash();
  const storedHash = localStorage.getItem(SEED_HASH_KEY);

  // Re-seed if the source data has changed (or first load)
  if (storedHash !== currentHash) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersData));
    localStorage.setItem(SEED_HASH_KEY, currentHash);
    return usersData as User[];
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to seed
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usersData));
  localStorage.setItem(SEED_HASH_KEY, currentHash);
  return usersData as User[];
}

export const authService = {
  login(email: string, password: string): User | null {
    const users = getUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  },

  getUserById(id: string): User | null {
    const users = getUsers();
    return users.find(u => u.id === id) || null;
  },

  getAllUsers(): User[] {
    return getUsers();
  },
};
