import { router } from './trpc';
import { userRouter } from './modules/user/router';
import { mediaRouter } from './modules/media/router';
import { authRouter } from './modules/auth/router';
import { galleryRouter } from './modules/gallery/router';
import { aboutRouter } from './modules/about/router';
import { socialRouter } from './modules/social/router';
import { createOpenApiDocument } from './openapi';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  media: mediaRouter,
  gallery: galleryRouter,
  about: aboutRouter,
  social: socialRouter,
});
export const openApiDocument = createOpenApiDocument(appRouter);

export type AppRouter = typeof appRouter;

export { createContext, type Context, type CreateContextOptions } from './context';
export { publicProcedure, protectedProcedure, adminProcedure } from './trpc';
export { globalCacheFactory } from './cache';
