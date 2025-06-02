import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, getTableColumns, desc, and, or, lt, count, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const commentsRouter = createTRPCRouter({
    remove: protectedProcedure

        // input comment to database
        .input(z.object({
            id: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id } = input;
            const { id: userId } = ctx.user;

            //menambahkan value ke database
            const [deletedComments] = await db
                .delete(comments)
                .where(and(
                    eq(comments.id, id),
                    eq(comments.userId, userId),
                ))
                .returning();

            if(!deletedComments) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return deletedComments
        }),

    create: protectedProcedure

        // input comment to database
        .input(z.object({
            videoId: z.string().uuid(),
            value: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { videoId, value } = input;
            const { id: userId } = ctx.user;

            //menambahkan value ke database
            const [createdComments] = await db
                .insert(comments)
                .values({userId, videoId, value})
                .returning();

            return createdComments
        }),

    // get comment by videoId from database
    getMany: baseProcedure
        
        // input videoId to get comments
        .input(
            z.object({
                videoId: z.string().uuid(),
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(),
                })
                .nullish(),
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx;
            const { videoId, cursor, limit } = input;

            let userId;

            const [user] = await db 
                .select()
                .from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

            if (user) {
                userId = user.id;
            }

            const viewerReactions = db.$with("viewer_reactions").as(
                db
                    .select({
                        commentId: commentReactions.commentId,
                        type: commentReactions.type,
                    })
                    .from(commentReactions)
                    .where(inArray(commentReactions.userId, userId ? [userId] : []))
            )

            // mengambil komen dan total komen pada videoId
            const [totalData, data] = await Promise.all([
                db
                    .select({
                        count: count(),
                    })
                    .from(comments)
                    .where(eq(comments.videoId, videoId)),

                db
                    .with(viewerReactions)
                    .select({
                    ...getTableColumns(comments), // ambil semua tabel comments
                    user: users,
                    viewerReaction: viewerReactions.type,
                    likeCount: db.$count(
                        commentReactions,
                        and(
                            eq(commentReactions.type, "like"),
                            eq(commentReactions.commentId, comments.id),
                        )
                    ),
                    dislikeCount: db.$count(
                        commentReactions,
                        and(
                            eq(commentReactions.type, "dislike"),
                            eq(commentReactions.commentId, comments.id),
                        )
                    )
                        })
                    .from(comments)
                    .where(and(
                        eq(comments.videoId, videoId), // ambil comment sesuai videoId
                        cursor ? or(
                            lt(comments.createdAt, cursor.updatedAt),
                            and(
                                eq(comments.createdAt, cursor.updatedAt),
                                lt(comments.id, cursor.id)
                            )
                        ) : undefined,
                    ))
                    .innerJoin(users, eq(comments.userId, users.id))
                    .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
                    .orderBy(desc(comments.createdAt), desc(comments.id))
                    .limit(limit + 1)
            ]);
            const hasMore = data.length > limit;
            // remove the last item if there more data
            const items = hasMore ? data.slice(0, -1) : data;
            // set the next cursor to the last item if there is more data
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? {
                id: lastItem.id,
                updatedAt: lastItem.updatedAt,
            } : null;
            
            return {
                totalCount: totalData[0].count,
                items,
                nextCursor,
            };
        }),
});