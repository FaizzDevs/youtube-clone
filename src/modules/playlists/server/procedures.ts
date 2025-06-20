import { db } from "@/db";
import { playlist, playlistVideos, users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import { z } from "zod";

export const playlistsRouter = createTRPCRouter({
    remove: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {  // mutation => menghapus data dari playlist 
            const { id } = input; // data yang dikirim ke backend
            const { id: userId } = ctx.user; // data user login

            const [deletedPlaylist] = await db
                .delete(playlist)
                .where(and(
                    eq(playlist.id, id),
                    eq(playlist.userId, userId)
                ))
                .returning()

            if(!deletedPlaylist) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            return deletedPlaylist;
        }),

    getOne: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            const { id } = input; // data yang dikirim ke backend
            const { id: userId } = ctx.user; // data user login

            const [existingPlaylist] = await db // pengecekan playlist
                .select()
                .from(playlist)
                .where(and(
                    eq(playlist.id, id),
                    eq(playlist.userId, userId)
                ))

            if(!existingPlaylist) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            return existingPlaylist;
        }),

    getVideos: protectedProcedure // mengambil video ketika open playlist
        .input(
            z.object({
                playlistId: z.string().uuid(),
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(), // mengambil waktu viewed
                })
                .nullish(),
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;
            const { cursor, limit, playlistId } = input;

            const [existingPlaylist] = await db
                .select()
                .from(playlist)
                .where(and(
                    eq(playlist.id, playlistId),
                    eq(playlist.userId, userId)
                ));
            
            if(!existingPlaylist) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const videoFromPlaylist = db.$with("playlist_videos").as(
                db 
                    .select({
                        videoId: playlistVideos.videoId,
                    })
                    .from(playlistVideos)
                    .where(eq(playlistVideos.playlistId, playlistId))
            )

            const data = await db
                .with(videoFromPlaylist) // menggabungkan tabel
                .select({
                    ...getTableColumns(videos), // mengambil semua column pada tabel
                    user: users,
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // hitung total views dari video
                    likeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, "like"),
                    )),

                    dislikeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, "dislike"),
                    )),
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id)) // menggabungkan tabel user dan videos
                .innerJoin(videoFromPlaylist, eq(videos.id, videoFromPlaylist.videoId))
                .where(and(
                    eq(videos.visibility, "public"),
                    cursor ? or(
                        lt(videos.updatedAt, cursor.updatedAt),
                        and(
                            eq(videos.updatedAt, cursor.updatedAt),
                            lt(videos.id, cursor.id)
                        )
                    ) : undefined,
                )).orderBy(desc(videos.updatedAt), desc(videos.id))
                // Add 1 to the limit to check if there is more data
                .limit(limit + 1)

                const hasMore = data.length > limit;
                // remove the last item if there more data
                const items = hasMore ? data.slice(0, -1) : data;
                // set the next cursor to the last item if there is more data
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                } : null;

            return { items, nextCursor };
        }),

    removeVideo: protectedProcedure
        .input(z.object({ 
            playlistId: z.string().uuid(),
            videoId: z.string().uuid(),
         }))
        .mutation(async ({ input, ctx }) => {
            const { playlistId, videoId } = input;  // data yang dikirim ke backend
            const { id: userId } = ctx.user  // data login user

            const [exisitngPlaylist] = await db //pengecekan Playlist
                .select()
                .from(playlist)
                .where(and(
                    eq(playlist.id, playlistId),
                    eq(playlist.userId, userId),
                ));

            if(!exisitngPlaylist) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const [exisitngVideo] = await db // pengecekan video
                .select()
                .from(videos)
                .where(eq(videos.id, videoId));

            if(!exisitngVideo) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const [existingPlaylistVideo] = await db // pengecekan data playlistVideo
                .select()
                .from(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId)
                ))

            if(!existingPlaylistVideo) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const [deletedPlaylistVideo] = await db // menghapus video dari playlist
                .delete(playlistVideos)
                .where(
                    and(
                        eq(playlistVideos.playlistId, playlistId),
                        eq(playlistVideos.videoId, videoId)
                    )
                )
                .returning()

            return deletedPlaylistVideo;
        }),

    addVideo: protectedProcedure
        .input(z.object({ 
            playlistId: z.string().uuid(),
            videoId: z.string().uuid(),
         }))
        .mutation(async ({ input, ctx }) => {
            const { playlistId, videoId } = input;  // data yang dikirim ke backend
            const { id: userId } = ctx.user  // data login user

            const [exisitngPlaylist] = await db //pengecekan Playlist
                .select()
                .from(playlist)
                .where(and(
                    eq(playlist.id, playlistId),
                    eq(playlist.userId, userId),
                ));

            if(!exisitngPlaylist) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const [exisitngVideo] = await db // pengecekan video
                .select()
                .from(videos)
                .where(eq(videos.id, videoId));

            if(!exisitngVideo) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const [existingPlaylistVideo] = await db // pengecekan data playlistVideo
                .select()
                .from(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId)
                ))

            if(existingPlaylistVideo) {
                throw new TRPCError({ code: "CONFLICT" });
            }

            const [createdPlaylistVideo] = await db // menambahkan video ke playlist
                .insert(playlistVideos)
                .values({ playlistId, videoId })
                .returning()

            return createdPlaylistVideo;
        }),


    getManyForVideo: protectedProcedure
        .input(
            z.object({
                videoId: z.string().uuid(), // id video yang akan diambil playlistnya
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(), // mengambil waktu update
                })
                .nullish(),
                limit: z.number().min(1).max(100),  //batas jumlah data yang diambil
            }),
        )
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;
            const { cursor, limit, videoId } = input;

            const data = await db
                .select({
                    ...getTableColumns(playlist), // mengambil semua column pada tabel
                    videoCount: db.$count(  // hitung total video pada playlist
                        playlistVideos,
                        eq(playlist.id, playlistVideos.playlistId)
                    ),
                    user: users,
                    containsVideo: videoId 
                        ? sql<boolean>`(
                            SELECT EXISTS (
                                SELECT 1 
                                FROM ${playlistVideos} pv  
                                WHERE pv.playlist_id = ${playlist.id} AND pv.video_id = ${videoId}
                            ) 
                        )` 
                        : sql<boolean>`false`, // kalo videoId ada maka akan true dan nama custom sesuai pilihan
                })
                .from(playlist)
                .innerJoin(users, eq(playlist.userId, users.id)) // menggabungkan tabel user dan playlist
                .where(and(
                    eq(playlist.userId, userId), // hanya ambil playlist milik user yang login
                    cursor ? or( // cursor => penunjuk data yang terakhir diambil
                        lt(playlist.updatedAt, cursor.updatedAt),  // lt => kurang dari
                        and(
                            eq(playlist.updatedAt, cursor.updatedAt), // eq => sama dengan
                            lt(playlist.id, cursor.id) 
                        )
                    ) : undefined,
                )).orderBy(desc(playlist.updatedAt), desc(playlist.id))
                // Add 1 to the limit to check if there is more data
                .limit(limit + 1)

                const hasMore = data.length > limit;
                // remove the last item if there more data
                const items = hasMore ? data.slice(0, -1) : data;
                // set the next cursor to the last item if there is more data
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                } : null;

            return { items, nextCursor };
    }),

    getMany: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(), // mengambil waktu update
                })
                .nullish(),
                limit: z.number().min(1).max(100),  //batas jumlah data yang diambil
            }),
        )
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;
            const { cursor, limit } = input;

            const data = await db
                .select({
                    ...getTableColumns(playlist), // mengambil semua column pada tabel
                    videoCount: db.$count(  // hitung total video pada playlist
                        playlistVideos,
                        eq(playlist.id, playlistVideos.playlistId)
                    ),
                    user: users,
                    // mengambil thumbnail video terakhir yang ditambahkan ke playlist dari database
                    thumbnailUrl: sql<string | null>`( 
                        SELECT v.thumbnail_url
                        FROM ${playlistVideos} pv
                        JOIN ${videos} v ON v.id = pv.video_id
                        WHERE pv.playlist_id = ${playlist.id}
                        ORDER BY pv.updated_at DESC
                        LIMIT 1
                    )`
                })
                .from(playlist)
                .innerJoin(users, eq(playlist.userId, users.id)) // menggabungkan tabel user dan playlist
                .where(and(
                    eq(playlist.userId, userId), // hanya ambil playlist milik user yang login
                    cursor ? or( // cursor => penunjuk data yang terakhir diambil
                        lt(playlist.updatedAt, cursor.updatedAt),  // lt => kurang dari
                        and(
                            eq(playlist.updatedAt, cursor.updatedAt), // eq => sama dengan
                            lt(playlist.id, cursor.id) 
                        )
                    ) : undefined,
                )).orderBy(desc(playlist.updatedAt), desc(playlist.id))
                // Add 1 to the limit to check if there is more data
                .limit(limit + 1)

                const hasMore = data.length > limit;
                // remove the last item if there more data
                const items = hasMore ? data.slice(0, -1) : data;
                // set the next cursor to the last item if there is more data
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                } : null;

            return { items, nextCursor };
    }),
    
    create: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            const { name } = input;  // data yang dikirim ke backend
            const { id: userId } = ctx.user  // data login user

            // menyimpan data ke database pada tabel playlist
            const [createdPlaylists] = await db
                .insert(playlist)
                .values({ userId, name })
                .returning()

            if(!createdPlaylists) {
                throw new TRPCError({ code: "BAD_REQUEST" })
            }

            return createdPlaylists;
        }),

    // server video yang liked
    getLiked: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    likedAt: z.date(), // mengambil waktu viewed
                })
                .nullish(),
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;
            const { cursor, limit } = input;

            const viewerVideoReactions = db.$with("viewer_video_reactions").as(
                db 
                    .select({
                        videoId: videoReactions.videoId,
                        likedAt: videoReactions.updatedAt,
                    })
                    .from(videoReactions)
                    .where(and(
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, "like"),
                    )),
            );

            const data = await db
                .with(viewerVideoReactions) // menggabungkan tabel
                .select({
                    ...getTableColumns(videos), // mengambil semua column pada tabel
                    user: users,
                    likedAt: viewerVideoReactions.likedAt,
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // hitung total views dari video
                    likeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, "like"),
                    )),

                    dislikeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, "dislike"),
                    )),
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id)) // menggabungkan tabel user dan videos
                .innerJoin(viewerVideoReactions, eq(videos.id, viewerVideoReactions.videoId))
                .where(and(
                    eq(videos.visibility, "public"),
                    cursor ? or(
                        lt(viewerVideoReactions.likedAt, cursor.likedAt),
                        and(
                            eq(viewerVideoReactions.likedAt, cursor.likedAt),
                            lt(videos.id, cursor.id)
                        )
                    ) : undefined,
                )).orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id))
                // Add 1 to the limit to check if there is more data
                .limit(limit + 1)

                const hasMore = data.length > limit;
                // remove the last item if there more data
                const items = hasMore ? data.slice(0, -1) : data;
                // set the next cursor to the last item if there is more data
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {
                    id: lastItem.id,
                    likedAt: lastItem.likedAt,
                } : null;

            return { items, nextCursor };
        }),

    // server hsitory
    getHistory: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    viewedAt: z.date(), // mengambil waktu viewed
                })
                .nullish(),
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;
            const { cursor, limit } = input;

            const viewerVideoViews = db.$with("viewer_video_views").as(
                db 
                    .select({
                        videoId: videoViews.videoId,
                        viewedAt: videoViews.updatedAt,
                    })
                    .from(videoViews)
                    .where(eq(videoViews.userId, userId))
            )

            const data = await db
                .with(viewerVideoViews) // menggabungkan tabel
                .select({
                    ...getTableColumns(videos), // mengambil semua column pada tabel
                    user: users,
                    viewedAt: viewerVideoViews.viewedAt,
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // hitung total views dari video
                    likeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, "like"),
                    )),

                    dislikeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, "dislike"),
                    )),
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id)) // menggabungkan tabel user dan videos
                .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
                .where(and(
                    eq(videos.visibility, "public"),
                    cursor ? or(
                        lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                        and(
                            eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                            lt(videos.id, cursor.id)
                        )
                    ) : undefined,
                )).orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
                // Add 1 to the limit to check if there is more data
                .limit(limit + 1)

                const hasMore = data.length > limit;
                // remove the last item if there more data
                const items = hasMore ? data.slice(0, -1) : data;
                // set the next cursor to the last item if there is more data
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {
                    id: lastItem.id,
                    viewedAt: lastItem.viewedAt,
                } : null;

            return { items, nextCursor };
        }),
});