import { serve } from "@upstash/workflow/nextjs"
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string
  videoId: string
  prompt: string
  description: string
};

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType;
    const { userId, videoId, prompt } = input;

    const video = await context.run("get-video", async () => {
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
    });
    
    const { body } = await context.call<{ url: string }>("generate-thumbnail", {
      url: "https://api.openai.com/v1/images/generations",
      method: "POST",
      body: {
        prompt,
        n: 1,
        model: "dall-e-3",
        size: "1792x1024",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const tempThumbnailUrl = body.data[0].url;
    
    if(!description) {
      throw new Error("Bad request");
    }

    await context.run("update-video", async () => {
      await db 
        .update(videos)
        .set({
          description: description || video.description,
        })
        .where(and(
          eq(videos.id, video.id),
          eq(videos.userId, userId),
        ))
    })    
  }
);