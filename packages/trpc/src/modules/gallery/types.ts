import { z } from 'zod';

export const createGalleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  link: z.string().url('Must be a valid URL').optional().nullable(),
  mediaId: z.string().uuid(),
});

export const updateGalleryItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional().nullable(),
});

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    })
  ),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
export type ReorderItem = ReorderItemsInput['items'][number];
