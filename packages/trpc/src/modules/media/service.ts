import type { PrismaClient } from '@repo/database';
import type { StorageService } from '@repo/storage';
import type { UploadUrlInput, CreateMediaInput } from './types';

export const mediaService = {
  generateUploadUrl: async (
    storage: StorageService,
    userId: string,
    data: UploadUrlInput
  ) => {
    const fileKey = `gallery/${userId}/${Date.now()}-${data.fileName}`;

    const uploadUrl = storage.getPresignedUrl(fileKey, 'PUT');

    return {
      uploadUrl,
      fileKey,
      publicUrl: storage.getFileUrl(fileKey),
    };
  },

  createMedia: async (
    db: PrismaClient,
    data: CreateMediaInput
  ) => {
    return db.media.create({
      data: {
        url: data.url,
        key: data.key,
        mimeType: data.mimeType,
        size: data.size,
      },
    });
  },

  deleteMedia: async (db: PrismaClient, storage: StorageService, mediaId: string) => {
    const media = await db.media.findUnique({ where: { id: mediaId } });
    if (!media) return null;

    await storage.delete(media.key);
    return db.media.delete({ where: { id: mediaId } });
  },
};

export default mediaService;
