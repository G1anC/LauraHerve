import { Hono } from 'hono';
import { loggerMiddleware } from './middleware/logger.middleware';
import env from './lib/env';
import { AuthManager } from '@repo/auth';
import { prisma } from '@repo/database';
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

function inferMimeType(path: string) {
  const extension = path.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

app.use('*', corsHandler(env.TRUSTED_ORIGINS));
app.use('*', loggerMiddleware);

app.get('/openapi.json', openApiHandler);

app.get('/media/*', async (c) => {
  const rawKey = c.req.param('*');

  if (!rawKey) {
    return c.json({ error: 'Media key is required' }, 400);
  }

  const key = decodeURIComponent(rawKey);
  const [exists, media] = await Promise.all([
    storage.exists(key).catch(() => false),
    prisma.media.findUnique({ where: { key } }).catch(() => null),
  ]);

  if (!exists) {
    return c.json({ error: 'Media not found' }, 404);
  }

  const file = await storage.download(key).catch(() => null);

  if (!file) {
    return c.json({ error: 'Media not found' }, 404);
  }

  return new Response(file, {
    status: 200,
    headers: {
      'Content-Type': media?.mimeType || inferMimeType(key),
      'Cache-Control': 'public, max-age=31536000, immutable',
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
