import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, getTableColumns, desc, and, or, lt } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
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
        .query(async ({ input }) => {
            const { videoId, cursor, limit } = input;

            // mendapatkan comments dari database
            const data = await db
                .select({
                    ...getTableColumns(comments), // ambil semua tabel comments
                    user: users,
                    totalCount: db.$count(comments, eq(comments.videoId, videoId)), // ambil total comment
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
                .orderBy(desc(comments.createdAt), desc(comments.id))
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
            
            return {
                items,
                nextCursor,
            };
        }),
});