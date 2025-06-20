import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface PlaylistThumbnailProps {
    title: string;
    videoCount: number;
    className?: string;
    imageUrl?: string | null;
}

export const PlaylistThumbnailSkeleton = () => {
    return (
        <div className="relative w-full overflow-hidden rounded-xl aspect-video">
            <Skeleton className="size-full" />
        </div>
    )
}

export const PlaylistThumbnail = ({
    title,
    videoCount,
    className,
    imageUrl,
}:PlaylistThumbnailProps) => {

    const compactViews = useMemo(() => { // useMemo => untuk mengoptimalkan performa, hanya akan menghitung ulang jika videoCount berubah
        return Intl.NumberFormat("en", { // Intl.NumberFormat => untuk format angka
            notation: "compact"  // tampilkan dalam bentuk pendek (misal 1K, 1M, 1B)
        }).format(videoCount);
    }, [videoCount]);

    return (
        // cn => menggabungkan tailwind className dengan className tambahah/props
        <div className={cn("relative pt-3", className)}>  
            <div className="relative">
                {/* className ini muncul sebanyak playlist yang dipunya, mengacu pada file playlist-section */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video" />
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video" />

                {/* menampilkan thumbnail playlist */}
                <div className="relative overflow-hidden w-full rounded-xl aspect-video">
                    <Image 
                        src={imageUrl || THUMBNAIL_FALLBACK}
                        alt={title}
                        className="w-full h-full object-cover"
                        fill
                    />

                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-x-2">
                            <PlayIcon className="size-5 text-white fill-white" />
                            <span className="text-white font-medium">Play All</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1">
                <ListVideoIcon className="size-4" />
                {compactViews} video
            </div>
        </div>
    )
}