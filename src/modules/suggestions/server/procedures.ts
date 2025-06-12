import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, and, or, lt, desc, getTableColumns, not } from "drizzle-orm"
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

        // mengambil data viewers, like and dislike
        const data = await db
            .select({
                ...getTableColumns(videos), // mengambil semua kolom dari tabel
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
            .where(and(
                not(eq(videos.id, existingVideo.id)), // kecuali video yang sedang ditampilkan
                eq(videos.visibility, "public"), // video yang ditampilkan hanya yang visibility "Public"
                existingVideo.categoryId ? eq(videos.categoryId, existingVideo.categoryId) : undefined, // eq (equal = "=")
                cursor ? or( 
                    lt(videos.updatedAt, cursor.updatedAt), // ambil data yang diupdate lebih lama
                    and(
                        eq(videos.updatedAt, cursor.updatedAt),
                        lt(videos.id, cursor.id) // jika sama, maka ambil data dengan id lebih kecil
                    )
                ) : undefined,
            )).orderBy(desc(videos.updatedAt), desc(videos.id)) // urutkan video dari yang paling baru ke paling lama
            .limit(limit + 1) // pengecekan apakah masih ada data berikutnya

            const hasMore = data.length > limit; 
            const items = hasMore ? data.slice(0, -1) : data;
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? {
                id: lastItem.id,
                updatedAt: lastItem.updatedAt,
            } : null;

        return { items, nextCursor };
    }),
});