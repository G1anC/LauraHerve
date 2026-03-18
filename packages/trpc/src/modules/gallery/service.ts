import type { PrismaClient } from '@repo/database';
import type { StorageService } from '@repo/storage';
import { TRPCError } from '@trpc/server';
import type {
  CreateGalleryItemInput,
  UpdateGalleryItemInput,
  ReorderItem,
} from './types';

function withPublicMediaUrls<T extends { media: { key: string; url: string } | null }>(
  items: T[],
  storage: StorageService
) {
  return items.map((item) => ({
    ...item,
    media: item.media
      ? {
          ...item.media,
          url: storage.getFileUrl(item.media.key),
        }
      : item.media,
  }));
}

export const galleryService = {
  list: async (db: PrismaClient, storage: StorageService) => {
    const items = await db.galleryItem.findMany({
      orderBy: { order: 'asc' },
      include: {
        media: {
          select: {
            url: true,
            key: true,
            mimeType: true,
          },
        },
      },
    });

    return withPublicMediaUrls(items, storage);
  },

  listAll: async (db: PrismaClient, storage: StorageService) => {
    const items = await db.galleryItem.findMany({
      orderBy: { order: 'asc' },
      include: {
        media: true,
      },
    });

    return withPublicMediaUrls(items, storage);
  },

  create: async (db: PrismaClient, data: CreateGalleryItemInput) => {
    const count = await db.galleryItem.count();
    if (count >= 4) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Gallery is full. Maximum 4 items allowed. Please delete an item first.',
      });
    }

    const maxOrder = await db.galleryItem.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    return db.galleryItem.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        link: data.link,
        mediaId: data.mediaId,
        order: nextOrder,
      },
      include: {
        media: true,
      },
    });
  },

  update: async (db: PrismaClient, data: UpdateGalleryItemInput) => {
    const { id, ...updateData } = data;

    const exists = await db.galleryItem.findUnique({ where: { id } });
    if (!exists) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Gallery item not found' });
    }

    return db.galleryItem.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
      },
    });
  },

  delete: async (db: PrismaClient, id: string) => {
    const item = await db.galleryItem.findUnique({ where: { id } });
    if (!item) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Gallery item not found' });
    }

    await db.galleryItem.delete({ where: { id } });

    const remainingItems = await db.galleryItem.findMany({
      orderBy: { order: 'asc' },
    });

    const updates = remainingItems.map((item, index) =>
      db.galleryItem.update({
        where: { id: item.id },
        data: { order: index },
      })
    );

    await db.$transaction(updates);

    return { success: true };
  },

  reorder: async (db: PrismaClient, items: ReorderItem[]) => {
    const updates = items.map((item) =>
      db.galleryItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await db.$transaction(updates);

    return { success: true, updated: items.length };
  },
};

export default galleryService;
