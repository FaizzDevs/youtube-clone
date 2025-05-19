import { db } from "@/db";
import { comments } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq } from "drizzle-orm";

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
        .input(
            z.object({
                videoId: z.string().uuid(),
            }),
        )
        .query(async ({ input }) => {
            const { videoId } = input;

            const data = await db
                .select()
                .from(comments)
                .where(eq(comments.videoId, videoId))
            
            return data;
        }),
});