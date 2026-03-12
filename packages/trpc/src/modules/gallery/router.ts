import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../../trpc';
import galleryService from './service';

const createGalleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  link: z.string().url('Must be a valid URL').optional().nullable(),
  mediaId: z.string().uuid(),
});

const updateGalleryItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional().nullable(),
});

const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    })
  ),
});

export const galleryRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return galleryService.list(ctx.db);
  }),

  listAll: adminProcedure.query(async ({ ctx }) => {
    return galleryService.listAll(ctx.db);
  }),

  create: adminProcedure.input(createGalleryItemSchema).mutation(async ({ ctx, input }) => {
    return galleryService.create(ctx.db, input);
  }),

  update: adminProcedure.input(updateGalleryItemSchema).mutation(async ({ ctx, input }) => {
    return galleryService.update(ctx.db, input);
  }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return galleryService.delete(ctx.db, input.id);
    }),

  reorder: adminProcedure.input(reorderItemsSchema).mutation(async ({ ctx, input }) => {
    return galleryService.reorder(ctx.db, input.items);
  }),
});

export default galleryRouter;
