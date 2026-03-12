import { createUniversalTrpcClient } from '@repo/trpc-client';
import { get } from 'svelte/store';
import env from '../lib/env';

export const trpc = createUniversalTrpcClient({
  baseUrl: `${env.VITE_API_URL}/trpc`,

  getToken: () => {
    const { authStore } = require('./auth-store');
    const state = get(authStore);
    return state.session?.token || null;
  },
  onUnauthorized: () => {
    const { authStore } = require('./auth-store');
    authStore.logout();
  },
});

export default trpc;
