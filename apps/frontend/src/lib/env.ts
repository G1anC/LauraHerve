import { publicEnvSchema } from '@repo/env';

// In production (Railway), PUBLIC_API_URL is set as a runtime environment variable
// During build/check-env, we fall back to VITE_API_URL or a default
const apiUrl = typeof process !== 'undefined' && process.env.PUBLIC_API_URL
  ? process.env.PUBLIC_API_URL
  : import.meta.env.VITE_API_URL || 'http://localhost:3001';

let env;
try {
  env = publicEnvSchema.parse({
    VITE_API_URL: apiUrl,
    NODE_ENV: import.meta.env.MODE || 'development',
  });
} catch (error) {
  console.error('❌ Environment validation failed!');
  console.error('PUBLIC_API_URL:', process.env.PUBLIC_API_URL);
  console.error('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.error('Computed apiUrl:', apiUrl);
  console.error('Validation error:', error);
  throw error;
}

export { env };
export default env;
