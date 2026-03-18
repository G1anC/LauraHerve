import { Hono } from 'hono';
import { loggerMiddleware } from './middleware/logger.middleware';
import env from './lib/env';
import { AuthManager } from '@repo/auth';
import { StorageService } from '@repo/storage';
import corsHandler from './handlers/cors';
import trpcHandler from './handlers/trpc';
import { openApiHandler } from './handlers/openapi';
import {
  createHealthCheckHandler,
  createLivenessHandler,
  createReadinessHandler,
} from './handlers/health';

const app = new Hono();

const authManager = new AuthManager({
  jwtSecret: env.ENCRYPTION_SECRET,
});

const storage = new StorageService({
  endpoint: env.MINIO_ENDPOINT,
  accessKeyId: env.MINIO_ROOT_USER,
  secretAccessKey: env.MINIO_ROOT_PASSWORD,
  bucket: env.MINIO_BUCKET_NAME,
  publicUrl: env.MINIO_PUBLIC_URL,
});

app.use('*', corsHandler(env.TRUSTED_ORIGINS));
app.use('*', loggerMiddleware);

app.get('/openapi.json', openApiHandler);

app.get('/media/*', async (c) => {
  const rawKey = c.req.param('*');

  if (!rawKey) {
    return c.json({ error: 'Media key is required' }, 400);
  }

  const key = decodeURIComponent(rawKey);
  const exists = await storage.exists(key).catch(() => false);

  if (!exists) {
    return c.json({ error: 'Media not found' }, 404);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: storage.getPresignedUrl(key, 'GET'),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store',
    },
  });
});

app.get('/health', createHealthCheckHandler({ storage }));
app.get('/health/live', createLivenessHandler());
app.get('/health/ready', createReadinessHandler());

app.all(
  '/trpc/*',
  trpcHandler({
    authManager,
    storage,
    env,
  })
);

app.get('/', (c) => c.json({ message: 'Laura Herve Portfolio API' }));

const port = Number(env.PORT);

export default { port, fetch: app.fetch };
