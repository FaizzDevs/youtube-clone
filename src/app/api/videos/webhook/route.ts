import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";
import { db } from "@/db";
import { UTApi } from "uploadthing/server";
import {
    VideoAssetCreatedWebhookEvent,
    VideoAssetErroredWebhookEvent,
    VideoAssetReadyWebhookEvent,
    VideoAssetTrackReadyWebhookEvent,
    VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
    | VideoAssetCreatedWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetTrackReadyWebhookEvent
    | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
    if(!SIGNING_SECRET) {
        throw new Error("MUX_WEBHOOK_SECRET is not set");
    }

    const headersPayload = await headers();
    const muxSignature = headersPayload.get("mux-signature");

    if (!muxSignature) {
        return new Response("No signature found", { status: 401 });
    }

    // const payload = await request.json();
    // const body = JSON.stringify(payload);

    const rawBody = await request.text()

    if(!rawBody) {
        return new Response("Empty body", { status: 400 })
    }

    let payload: unknown;
    try {
        payload = JSON.parse(rawBody);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return new Response("Invalid JSON", { status: 400 })    
    }

    // Narrow payload to expected type
    if (
        typeof payload === "object" &&
        payload !== null &&
        "type" in payload &&
        "data" in payload
    ) {
        // payload is now typed as { type: string; data: unknown }
    } else {
        return new Response("Invalid payload structure", { status: 400 });
    }
    const typedPayload = payload as { type: WebhookEvent["type"]; data: unknown };

    const body = JSON.stringify(payload);

    mux.webhooks.verifySignature(
        body, {
            "mux-signature": muxSignature
        },
        SIGNING_SECRET,
    );

    switch (typedPayload.type as WebhookEvent["type"]) {
        case "video.asset.created": {
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("No upload ID found", { status: 400 });
            }

            console.log("Creating video: ", { uploadId: data.upload_id });

            await db
                .update(videos)
                .set({
                    muxAssetId: data.id,
                    muxStatus: data.status,
                })
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }

        case "video.asset.ready": {
            const data = payload.data as VideoAssetReadyWebhookEvent["data"];
            const playbackId = data.playback_ids?.[0]?.id;

            if (!data.upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }

            if (!playbackId) {
                return new Response("Missing playback ID", { status: 400 });
            }

            // thumbnail video
            const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
            const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
            const duration = data.duration ? Math.round(data.duration * 1000) : 0;

            const utapi = new UTApi();
            const [
                uploadedThumbnail,
                uploadedPreview
            ] = await utapi.uploadFilesFromUrl([
                tempThumbnailUrl,
                tempPreviewUrl
            ]);

            if (!uploadedThumbnail.data || !uploadedPreview.data){
                return new Response("Failed to upload thumbnail or preview", { status: 500 });
            }

            const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;
            const { key: previewKey, url: previewUrl } = uploadedPreview.data;

            await db
                .update(videos)
                .set({
                    muxStatus: data.status,
                    muxPlaybackId: playbackId,
                    muxAssetId: data.id,
                    thumbnailUrl,
                    thumbnailKey,
                    previewUrl,
                    previewKey,
                    duration,
                })
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }

        case "video.asset.errored": {
            const data = payload.data as VideoAssetErroredWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }

            await db
                .update(videos)
                .set({
                    muxStatus: data.status,
                })
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }

        case "video.asset.deleted": {
            const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }

            console.log("Deleting video: ", { uploadId: data.upload_id });

            await db
                .delete(videos)
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }

        case "video.asset.track.ready": {
            const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
                asset_id: string;
            }

            console.log("Track ready!");

            const assetId = data.asset_id;
            const trackId = data.id;
            const status = data.status;

            if (!assetId) {
                return new Response("Missing asset ID", { status: 400 });
            }

            await db
                .update(videos)
                .set({
                    muxTrackId: trackId,
                    muxTrackStatus: status,
                })
                .where(eq(videos.muxAssetId, assetId));
            break;
        }
    }

    return new Response("Webhook received", { status: 200 });
};