import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../../trpc';
import aboutService from './service';

const updateAboutSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
});

export const aboutRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    return aboutService.get(ctx.db);
  }),

  update: adminProcedure.input(updateAboutSchema).mutation(async ({ ctx, input }) => {
    return aboutService.update(ctx.db, input.content);
  }),
});

export default aboutRouter;
