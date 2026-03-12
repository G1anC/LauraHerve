import { createUniversalTrpcClient } from '@repo/trpc-client';
import { authStore } from './auth-store';
import { get } from 'svelte/store';
import env from '../lib/env';
import { browser } from '$app/environment';

export const trpc = createUniversalTrpcClient({
  baseUrl: `${env.VITE_API_URL}/trpc`,

  getToken: () => {
    const state = get(authStore);
    return state.session?.token || null;
  },
  onUnauthorized: async () => {
    await authStore.clear();
    if (browser) {
      window.location.href = '/login';
    }
  },
});

export default trpc;
