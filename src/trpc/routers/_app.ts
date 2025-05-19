// import { z } from 'zod';
import { studioRouter } from '@/modules/studio/server/procedures';
import { createTRPCRouter } from '../init';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';
import { videoReactionsRouter } from '@/modules/video-reactions/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedure';
import { commentsRouter } from '@/modules/comments/server/procedures';

export const appRouter = createTRPCRouter({
  // hello: baseProcedure.query(() => {
  //   return {hello : "world"};
  // }),
  studio: studioRouter,
  categories: categoriesRouter,
  videos: videosRouter,
  videoView: videoViewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;