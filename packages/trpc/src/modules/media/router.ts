import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import mediaService from './service';
import { uploadUrlSchema, createMediaSchema } from './types';

export const mediaRouter = router({
  getUploadUrl: protectedProcedure.input(uploadUrlSchema).mutation(async ({ ctx, input }) => {
    return mediaService.generateUploadUrl(ctx.storage, ctx.user.id, input);
  }),

  create: protectedProcedure.input(createMediaSchema).mutation(async ({ ctx, input }) => {
    return mediaService.createMedia(ctx.db, input);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return mediaService.deleteMedia(ctx.db, ctx.storage, input.id);
    }),
});

export default mediaRouter;
