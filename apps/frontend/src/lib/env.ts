import { publicEnvSchema } from '@repo/env';
import { building } from '$app/environment';

// Get API URL from multiple sources with priority:
// 1. Runtime env (Railway production)
// 2. Build-time env (local dev)
// 3. Fallback to localhost
function getApiUrl(): string {
  // Server-side: check process.env
  if (typeof process !== 'undefined' && process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL;
  }

  // Build-time: use Vite's import.meta.env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback for development
  return 'http://localhost:3001';
}

const apiUrl = getApiUrl();

// During build, we might not have the final URL yet, so we make validation optional
let env;
if (building) {
  // During build, just use defaults - actual validation happens at runtime
  env = {
    VITE_API_URL: apiUrl,
    NODE_ENV: import.meta.env.MODE || 'development',
  };
} else {
  // At runtime, do full validation
  try {
    env = publicEnvSchema.parse({
      VITE_API_URL: apiUrl,
      NODE_ENV: import.meta.env.MODE || 'development',
    });
  } catch (error) {
    console.error('❌ Environment validation failed!');
    console.error('PUBLIC_API_URL (process.env):', typeof process !== 'undefined' ? process.env.PUBLIC_API_URL : 'N/A');
    console.error('VITE_API_URL (import.meta.env):', import.meta.env.VITE_API_URL);
    console.error('Computed apiUrl:', apiUrl);
    console.error('Validation error:', error);
    throw error;
  }
}

export { env };
export default env;
