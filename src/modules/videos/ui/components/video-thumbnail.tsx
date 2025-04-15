import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoThumbnailProps {
    imageUrl?: string;
    previewUrl?: string | null;
    title: string;
    duration: number;
}

export const VideoThumbnail = ({
    imageUrl,
    title,
    previewUrl,
    duration,
}: VideoThumbnailProps) => {
    return (
        <div className="relative group">
            {/* Thumbanil wrapper */}
            <div className="relative w-full overflow-hidden rounded-xl aspect-video">
                <Image 
                    src={imageUrl || THUMBNAIL_FALLBACK} 
                    alt={title} 
                    fill 
                    className="w-full h-full object-cover group-hover:opacity-0" />
                <Image 
                    unoptimized={!!previewUrl}
                    src={previewUrl || THUMBNAIL_FALLBACK} 
                    alt={title} 
                    fill 
                    className="w-full h-full object-cover opacity-0 group-hover:opacity-100" />
            </div>

            {/* video duration box */}
            <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                {formatDuration(duration)}
            </div>
            {/* add video duration box */}
        </div>
    );
};