import { z } from 'zod';

export const uploadUrlSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
});

export const createMediaSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type CreateMediaInput = z.infer<typeof createMediaSchema>;
