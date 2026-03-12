import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../../trpc';
import socialService from './service';

const updateSocialLinksSchema = z.object({
  instagram: z.string().url('Must be a valid URL').optional().nullable(),
  facebook: z.string().url('Must be a valid URL').optional().nullable(),
  email: z.string().email('Must be a valid email').optional().nullable(),
});

export const socialRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    return socialService.get(ctx.db);
  }),

  update: adminProcedure.input(updateSocialLinksSchema).mutation(async ({ ctx, input }) => {
    return socialService.update(ctx.db, input);
  }),
});

export default socialRouter;
