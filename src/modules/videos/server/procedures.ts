import { db } from "@/db";
import { subscriptions, users, videoReactions, videos, videoUpdateSchema, videoViews } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNotNull, sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({

    getOne: baseProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx;

            let userId;

            const [user] = await db
                .select()
                .from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

            if (user) {
                userId = user.id;
            }

            const viewerReactions = db.$with("viewer_reactions").as(
                db
                    .select({
                        videoId: videoReactions.videoId,
                        type: videoReactions.type,
                    })
                    .from(videoReactions)
                    .where(inArray(videoReactions.userId, userId ? [userId] : []))
            );

            const viewerSubcriptions = db.$with("viewer_subscriptions").as(
                db
                    .select()
                    .from(subscriptions)
                    .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
            )

            // yang ada pada videoId
            const [existingVideo] = await db
                .with(viewerReactions, viewerSubcriptions)
                .select({
                    ...getTableColumns(videos),
                    user: {
                        ...getTableColumns(users),
                        subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)), // menghitung subscriber
                        viewerSubscribed: sql<boolean>`bool_or(${isNotNull(viewerSubcriptions.viewerId)})`.as("viewer_subscribed"),
                    },
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),

                    //total like
                    likeCount: db.$count(
                        videoReactions, 
                        and(
                            eq(videoReactions.videoId, videos.id),
                            eq(videoReactions.type, "like")
                        ),
                    ),

                    // total dislike
                    dislikeCount: db.$count(
                        videoReactions, 
                        and(
                            eq(videoReactions.videoId, videos.id),
                            eq(videoReactions.type, "dislike"),
                        ),
                    ),
                    viewerReaction: viewerReactions.type,
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
                .leftJoin(viewerSubcriptions, eq(viewerSubcriptions.creatorId, users.id))
                .where(eq(videos.id, input.id))
                // .limit(1)
                .groupBy(
                    videos.id,
                    users.id,
                    viewerReactions.type,
                )

            if (!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            return existingVideo;
        }),

        // generate deskripsi di schema
    generateDesc: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
                body: { userId, videoId: input.id },
            });

            return workflowRunId;
        }),

    //generate title di schema    
    generateTitle: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
                body: { userId, videoId: input.id },
            });

            return workflowRunId;
        }),

    // generate thumbnail di schema    
    generateThumbnail: protectedProcedure
        .input(z.object({ id: z.string().uuid(), prompt: z.string().min(10) }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
                body: { userId, videoId: input.id, prompt: input.prompt },
            });

            return workflowRunId;
        }),

    // memvalidasi video di mux dan di database agar status nya sama
    revalidate: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId),
                ));
            if(!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            if(!existingVideo.muxUploadId) {
                throw new TRPCError({ code: "BAD_REQUEST" })
            }

            const upload = await mux.video.uploads.retrieve(
                existingVideo.muxUploadId
            )

            if(!upload || !upload.asset_id) {
                throw new TRPCError({ code: "BAD_REQUEST" })
            }

            const asset = await mux.video.assets.retrieve(
                upload.asset_id
            );

            if(!asset) {
                throw new TRPCError({ code: "BAD_REQUEST" })
            }

            const playbackId = asset.playback_ids?.[0].id;
            const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

            // TODO: Potentially find a  way to revalidate trackId and trackStatus as well

            const  [updatedVideo] = await db
                .update(videos)
                .set({
                    muxStatus: asset.status,
                    muxPlaybackId: playbackId,
                    muxAssetId: asset.id,
                    duration, 
                })
                .where(eq(videos.id, input.id))
                .returning();
            
            return updatedVideo;
        }),

    // mengembalikan thumbnail
    restoreThumbnail: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId),
                ));

            if (!existingVideo){
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (existingVideo.thumbnailKey){
                const utapi = new UTApi();

                await utapi.deleteFiles(existingVideo.thumbnailKey);
                await db
                .update(videos)
                .set({ thumbnailKey: null, thumbnailUrl: null })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ));
            }

            if (!existingVideo.muxPlaybackId){
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const utapi = new UTApi();
            
            // upload auto thumbnail video
            const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
            const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

            if (!uploadedThumbnail.data){
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;

            const [updatedVideo] = await db
                .update(videos)
                .set({ thumbnailUrl, thumbnailKey })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId),
                ))
                .returning()

                return updatedVideo;
        }),

    // remove video studio
    remove: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            const [removedVideo] = await db
                .delete(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();

            if (!removedVideo) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return removedVideo;
        }),

    // update details video studio
    update: protectedProcedure
        .input(videoUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            if (!input.id) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const [updatedVideo] = await db
                .update(videos)
                .set({
                    title: input.title,
                    description: input.description,
                    categoryId: input.categoryId,
                    visibility: input.visibility,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();

            if (!updatedVideo) {
                throw new TRPCError({ code: "NOT_FOUND" })
            }

            return updatedVideo;
        }),

    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { id: userId } = ctx.user;

        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                passthrough: userId,
                playback_policy: ["public"],
                input: [
                    {
                        generated_subtitles: [
                            {
                                language_code: "en",
                                name: "English",
                            },
                        ],
                    },
                ],
            },
            cors_origin: "*", //in production, set to your url
        });

        const [video] = await db
            .insert(videos)
            .values({
                userId,
                title: "Untitled",
                muxStatus: "waiting",
                muxUploadId: upload.id,            
            })
            .returning();

        return {
            video: video,
            url: upload.url 
        };
    }),
});