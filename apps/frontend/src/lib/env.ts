import { publicEnvSchema } from '@repo/env';
import { env as dynamicEnv } from '$env/dynamic/public';

export const env = publicEnvSchema.parse({
  VITE_API_URL: dynamicEnv.PUBLIC_API_URL || import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.MODE,
});

export default env;
