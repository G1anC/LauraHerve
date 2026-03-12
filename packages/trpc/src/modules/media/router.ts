import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import mediaService from './service';

const uploadUrlSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
});

const createMediaSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

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
