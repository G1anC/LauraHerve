import type { PrismaClient } from '@repo/database';
import type { StorageService } from '@repo/storage';

export const mediaService = {
  generateUploadUrl: async (
    storage: StorageService,
    userId: string,
    data: { fileName: string; fileType: string }
  ) => {
    const fileKey = `gallery/${userId}/${Date.now()}-${data.fileName}`;

    const uploadUrl = storage.client.file(fileKey).presign({
      expiresIn: 900,
      method: 'PUT',
    });

    return {
      uploadUrl,
      fileKey,
      publicUrl: storage.getFileUrl(fileKey),
    };
  },

  createMedia: async (
    db: PrismaClient,
    data: { url: string; key: string; mimeType: string; size: number }
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
