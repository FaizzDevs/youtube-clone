import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, and, or, lt, desc } from "drizzle-orm"
import { TRPCError } from "@trpc/server";

export const sugesstionsRouter = createTRPCRouter({
    getMany: baseProcedure // base untuk publik - protected untuk login saja
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
        const { cursor, limit, videoId } = input;

        // mengecek apakah video terdapat dalam database
        const [existingVideo] = await db
            .select()
            .from(videos)
            .where(eq(videos.id, videoId));

        if(!existingVideo) {
            throw new TRPCError({ code: "NOT_FOUND" })
        }

        const data = await db
            .select()
            .from(videos)
            .where(and(
                existingVideo.categoryId ? eq(videos.categoryId, existingVideo.categoryId) : undefined, // eq (equal = "=")
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
});