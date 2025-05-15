import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const videoReactionsRouter = createTRPCRouter({
    like: protectedProcedure

        //memvalidasi sudah login ketika like
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            //memanggil data pada database
            const[existingVideoReactionLike] = await db
                .select()
                .from(videoReactions)
                .where(
                    and(
                        eq(videoReactions.videoId, videoId,),
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, "like"),
                    )
                );

            // menghapus value ketika klik double
            if(existingVideoReactionLike){
                const [deletedViewerReaction] = await db
                    .delete(videoReactions)
                    .where(
                        and(
                            eq(videoReactions.userId, userId),
                            eq(videoReactions.videoId, videoId)
                        )
                    )
                    .returning()

                return deletedViewerReaction;
            }

            //menambahkan value ke database
            const [createdVideoReaction] = await db
                .insert(videoReactions)
                .values({userId, videoId, type: "like"})
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "like"
                    }
                })
                .returning();

                return createdVideoReaction
        }),

    dislike: protectedProcedure

        //memvalidasi sudah login ketika like
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            //memanggil data pada database
            const[existingVideoReactionDislike] = await db
                .select()
                .from(videoReactions)
                .where(
                    and(
                        eq(videoReactions.videoId, videoId,),
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, "dislike"),
                    )
                );

            // menghapus value ketika klik double
            if(existingVideoReactionDislike){
                const [deletedViewerReaction] = await db
                    .delete(videoReactions)
                    .where(
                        and(
                            eq(videoReactions.userId, userId),
                            eq(videoReactions.videoId, videoId)
                        )
                    )
                    .returning()

                return deletedViewerReaction;
            }

            //menambahkan value ke database
            const [createdVideoReaction] = await db
                .insert(videoReactions)
                .values({userId, videoId, type: "dislike"})
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "dislike"
                    }
                })
                .returning();

                return createdVideoReaction
        }),
});