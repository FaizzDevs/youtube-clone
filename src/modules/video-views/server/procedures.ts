import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const videoViewsRouter = createTRPCRouter({
    create: protectedProcedure
        //memastikan login sesuai akun/userId
        .input(z.object({ videoId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            //memanggil data pada database
            const[existingVideoView] = await db
                .select()
                .from(videoViews)
                .where(
                    and(
                        eq(videoViews.videoId, videoId,),
                        eq(videoViews.userId, userId),
                    )
                );

            if(existingVideoView){
                return existingVideoView;
            }

            //menambahkan value ke database
            const [createdVideoView] = await db
                .insert(videoViews)
                .values({userId, videoId})
                .returning();

                return createdVideoView
        }),
});