import { z } from 'zod';

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const publicEnvSchema = baseSchema.extend({
  API_URL: z.string().url(),
});

export const serverEnvSchema = baseSchema.extend({
  PORT: z.coerce.number().default(3001),
  TRUSTED_ORIGINS: z.string().transform((s) => s.split(',').map((u) => u.trim())),

  JWT_SECRET: z.string().min(32),

  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
  MINIO_BUCKET_NAME: z.string(),
  MINIO_ENDPOINT: z.string().url(),
  MINIO_PUBLIC_URL: z.string().url(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;
