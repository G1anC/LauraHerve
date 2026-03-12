import { UniversalAuthStore } from '@repo/auth-shared';
import { browser } from '$app/environment';

const webStorage = {
  getItem: (key: string) => (browser ? localStorage.getItem(key) : null),
  setItem: (key: string, val: string) => browser && localStorage.setItem(key, val),
  removeItem: (key: string) => browser && localStorage.removeItem(key),
};

export const authStore = new UniversalAuthStore(
  { user: null, session: null, loading: true },
  webStorage,
  undefined
);

export default authStore;
