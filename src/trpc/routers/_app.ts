// import { z } from 'zod';
import { studioRouter } from '@/modules/studio/server/procedures';
import { createTRPCRouter } from '../init';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';
// import { videoViews } from '@/db/schema';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';

export const appRouter = createTRPCRouter({
  // hello: baseProcedure.query(() => {
  //   return {hello : "world"};
  // }),
  studio: studioRouter,
  categories: categoriesRouter,
  videos: videosRouter,
  videoView: videoViewsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;