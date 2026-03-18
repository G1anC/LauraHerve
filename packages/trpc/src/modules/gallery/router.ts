import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../../trpc';
import galleryService from './service';
import {
  createGalleryItemSchema,
  updateGalleryItemSchema,
  reorderItemsSchema,
} from './types';

export const galleryRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return galleryService.list(ctx.db, ctx.requestOrigin);
  }),

  listAll: adminProcedure.query(async ({ ctx }) => {
    return galleryService.listAll(ctx.db, ctx.requestOrigin);
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
