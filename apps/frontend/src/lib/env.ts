import { publicEnvSchema } from '@repo/env';

// Get API URL from Vite env (build-time injection)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const env = publicEnvSchema.parse({
  VITE_API_URL: apiUrl,
  NODE_ENV: import.meta.env.MODE || 'development',
});

export { env };
export default env;
