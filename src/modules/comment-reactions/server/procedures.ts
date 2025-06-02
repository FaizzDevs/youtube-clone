import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const commentReactionsRouter = createTRPCRouter({
    like: protectedProcedure

        //memvalidasi sudah login ketika like
        .input(z.object({ commentId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { commentId } = input;
            const { id: userId } = ctx.user;

            //memanggil data pada database
            const[existingCommentReactionLike] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.commentId, commentId,),
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.type, "like"),
                    )
                );

            // menghapus value ketika klik double
            if(existingCommentReactionLike){
                const [deletedViewerReaction] = await db
                    .delete(commentReactions)
                    .where(
                        and(
                            eq(commentReactions.userId, userId),
                            eq(commentReactions.commentId, commentId)
                        )
                    )
                    .returning()

                return deletedViewerReaction;
            }

            //menambahkan value ke database
            const [createdCommentReaction] = await db
                .insert(commentReactions)
                .values({userId, commentId, type: "like"})
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: {
                        type: "like"
                    }
                })
                .returning();

                return createdCommentReaction
        }),

    dislike: protectedProcedure

        //memvalidasi sudah login ketika like
        .input(z.object({ commentId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { commentId } = input;
            const { id: userId } = ctx.user;

            //memanggil data pada database
            const[existingCommentReactionDislike] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.commentId, commentId,),
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.type, "dislike"),
                    )
                );

            // menghapus value ketika klik double
            if(existingCommentReactionDislike){
                const [deletedViewerReaction] = await db
                    .delete(commentReactions)
                    .where(
                        and(
                            eq(commentReactions.userId, userId),
                            eq(commentReactions.commentId, commentId)
                        )
                    )
                    .returning()

                return deletedViewerReaction;
            }

            //menambahkan value ke database
            const [createdCommentReaction] = await db
                .insert(commentReactions)
                .values({userId, commentId, type: "dislike"})
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: {
                        type: "dislike"
                    }
                })
                .returning();

                return createdCommentReaction
        }),
});