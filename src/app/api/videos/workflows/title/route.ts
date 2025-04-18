import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string
  videoId: string
};

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType;
    const { userId, videoId } = input;

    const video = context.run("get-video", async () => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(
          eq(videos.id, videoId),
          eq(videos.userId, userId),
        ));

        if (!existingVideo) {
          throw new Error("Video not found");
        }

        return existingVideo;
    })  

    await context.run("update-video", async () => {
      await db 
        .update(videos)
        .set({
          title: "New Title"
        })
        .where(and(
          eq(videos.id, videoId),
          eq(videos.userId, userId),
        ))
    })

    await context.run("second-step", () => {
      console.log("second step ran")
    })
  }
);