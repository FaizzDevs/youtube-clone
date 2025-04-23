import { serve } from "@upstash/workflow/nextjs"
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string
  videoId: string
};

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summerize the transcript of a video. Please follow these guidelines:
- Be crief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Use clear and concise language to ensure the summary is easy to understand.
- Focus on the most relevant information, avoiding unnecessary details or tangents.
- Maintain the original meaning and context of the content while rephrasing it in your own words.
- Ensure the summary is coherent and flows logically from one point to the next.
- Use bullet points or numbered lists if appropriate to enhance readability.`

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType;
    const { userId, videoId } = input;

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

    const transcript = await context.run("get-transcript", async () => {
      const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
      const response = await fetch(trackUrl);
      const text = response.text();

      if (!text) {
        throw new Error("Bad Request");
      }

      return text;
    })
    
    const { body } = await context.api.openai.call(
      "generate-description",
      {
        token: process.env.OPENAI_API_KEY!,
        operation: "chat.completions.create",
        body: {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: DESCRIPTION_SYSTEM_PROMPT, 
            },
            {
              role: "user",
              content: transcript,
            }
          ],
        },
      }
    );

    const description = body.choices?.[0]?.message?.content || "Description Video Project ";
    
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