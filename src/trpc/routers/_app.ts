// import { z } from 'zod';
import { studioRouter } from '@/modules/studio/server/procedures';
import { createTRPCRouter } from '../init';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';

export const appRouter = createTRPCRouter({
  // hello: baseProcedure.query(() => {
  //   return {hello : "world"};
  // }),
  studio: studioRouter,
  categories: categoriesRouter,
  videos: videosRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;