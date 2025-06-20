import Link from "next/link";
import { VideoGetManyOutput } from "../../types"
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoGridCardProps {
    data: VideoGetManyOutput["items"][number];
    onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <VideoThumbnailSkeleton />
            <VideoInfoSkeleton />
        </div>
    )
}

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <Link href={`/videos/${data.id}`}>
                <VideoThumbnail 
                    imageUrl={data.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration ?? 0}
                /> 
            </Link>

            <VideoInfo data={data} onRemove={onRemove} />
        </div>
    )
}