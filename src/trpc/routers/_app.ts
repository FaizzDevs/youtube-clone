// ROUTER AGAR BISA DI PANGGIL DALAM SISI FRONT END

import { studioRouter } from '@/modules/studio/server/procedures';
import { createTRPCRouter } from '../init';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';
import { videoReactionsRouter } from '@/modules/video-reactions/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedure';
import { commentsRouter } from '@/modules/comments/server/procedures';
import { commentReactionsRouter } from '@/modules/comment-reactions/server/procedures';
import { sugesstionsRouter } from '@/modules/suggestions/server/procedures';
import { searchRouter } from '@/modules/search/server/procedures';
import { playlistsRouter } from '@/modules/playlists/server/procedures';
import { usersRouter } from '@/modules/users/server/procedures';

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
  commentReactions: commentReactionsRouter,
  suggestions: sugesstionsRouter,
  search: searchRouter,
  playlists: playlistsRouter,
  users: usersRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;