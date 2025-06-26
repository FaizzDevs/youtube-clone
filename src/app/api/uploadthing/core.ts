import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

// upload thumbnail
export const ourFileRouter = {
  bannerUploader: f({
    image: {
      maxFileSize: "4MB", // max 4mb
      maxFileCount: 1, // max 1 thumbnail
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [existingUser] = await db // melakukan pengecekan user
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

        if (!existingUser) throw new UploadThingError("Unauthorized");

          if (existingUser.bannerKey) {
            const utapi = new UTApi();

            await utapi.deleteFiles(existingUser.bannerKey);
            await db
              .update(users)
              .set({ bannerKey: null, bannerUrl: null })
              .where(and(
                eq(users.id, existingUser.id)
              ));
          }

      return { userId: existingUser.id };
    })

    .onUploadComplete(async ({ metadata, file }) => { // ketika sukses upload, akan diperbarui db
      await db
        .update(users)
        .set({
          bannerUrl: file.url,
          bannerKey: file.key,
        })
        .where(and(
          eq(users.id, metadata.userId)
        ))

        return { uploadedBy: metadata.userId };
    }),

  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB", // max 4mb
      maxFileCount: 1, // max 1 thumbnail
    },
  })
    .input(z.object({
      videoId: z.string().uuid(),
    }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db // melakukan pengecekan user
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

        if (!user) throw new UploadThingError("Unauthorized");

        const [existingVideo] = await db //pengecekan video
          .select({ thumbnailKey: videos.thumbnailKey })
          .from(videos)
          .where(and(
            eq(videos.id, input.videoId),
            eq(videos.userId, user.id)
          ))

          if (!existingVideo) throw new UploadThingError("Not Found");

          if (existingVideo.thumbnailKey) {
            const utapi = new UTApi();

            await utapi.deleteFiles(existingVideo.thumbnailKey);
            await db
              .update(videos)
              .set({ thumbnailKey: null, thumbnailUrl: null })
              .where(and(
                eq(videos.id, input.videoId),
                eq(videos.userId, user.id)
              ));
          }

      return { user, ...input };
    })

    .onUploadComplete(async ({ metadata, file }) => { // ketika sukses upload, akan diperbarui db
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.url,
          thumbnailKey: file.key,
        })
        .where(and(
          eq(videos.id, metadata.videoId),
          eq(videos.userId, metadata.user.id),
        ))

        return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
