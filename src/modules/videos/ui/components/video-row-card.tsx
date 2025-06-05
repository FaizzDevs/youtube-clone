// MENAMPILKAN VIDEO SUGGESTION

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { UserInfo } from "@/modules/users/ui/components/user-info"
import { UserAvatar } from "@/components/user-avatar"
import { VideoMenu } from "./video-menu"
import { VideoThumbnail } from "./video-thumbnail"
import { VideoGetManyOutput } from "../../types"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

const videoRowCardVariants = cva("group flex min-w-0", {  // cva (mengelola class CSS secara modular dan fleksibel)
    variants: {
        size: {
            default: "gap-4",
            compact: "gap-2"
        },
    },
    defaultVariants: { // Jika size tidak ditentukan, maka otomatis akan memakai "default"
        size: "default",
    }
})

const thumbnailVariants = cva("relative flex-none", {
    variants: {
        size: {
            default: "w-[38%]",
            compact: "w-[168px]",
        },
    },
    defaultVariants: {
        size: "default",
    }
})

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
    data: VideoGetManyOutput["items"][number]; // menampilkan satu video
    onRemove?: () => void;
}

export const VideoRowCardSkeleton = () => {
    return (
        <div>
            <Skeleton />
        </div>
    )
}

export const VideoRowCard = ({
    data,
    size,
    onRemove
}: VideoRowCardProps) => {

    // mengubah angka menjadi format compact
    const compactViews = useMemo(() => {  // useMemo (agar tidak dihitung ulang ketika render)
        return Intl.NumberFormat("en", {  // API js menformat angka
            notation: "compact"  // contoh 1200 => 1.2k
        }).format(data.viewCount);
    }, [data.viewCount])

    const compactLikes = useMemo(() => {  // useMemo (agar tidak dihitung ulang ketika render)
        return Intl.NumberFormat("en", {  // API js menformat angka
            notation: "compact"  // contoh 1200 => 1.2k
        }).format(data.likeCount);
    }, [data.likeCount])

    return (
        <div className={videoRowCardVariants({ size })}>
            <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>

                {/* menampilkan data data yang diperlukan pada video */}
                <VideoThumbnail 
                    imageUrl={data.thumbnailUrl ?? undefined}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration}
                />
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-x-2">
                    <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">

                      {/* menampilkan title video */}
                        <h3
                            className={cn(
                                "font-medium line-clamp-2",
                                size === "compact" ? "text-sm" : "text-base",
                            )}
                        >
                            {data.title}
                        </h3>

                        {/* menampilkan total views dan likes */}
                        {size === "default" && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {compactViews} views • {compactLikes} likes
                            </p>
                        )}

                        {/* menampilkan user dan nama pemilik video */}
                        {size === "default" && (
                            <>
                                <div className="flex mt-1 gap-2">
                                    <UserAvatar 
                                        size="sm"
                                        imageUrl={data.user.imageUrl}
                                        name={data.user.name}
                                    />
                                    <UserInfo size="sm" name={data.user.name} />
                                </div>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="text-xs text-muted-foreground w-fit mt-1 line-clamp-2">
                                            {data.description ?? "No description"}
                                        </p>
                                    </TooltipTrigger>

                                    <TooltipContent side="bottom" align="center" className="bg-black/70">
                                        <p>From the video description</p>
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}

                        {size === "compact" && (
                            <UserInfo className="mt-1" size="sm" name={data.user.name} />
                        )}

                        {size === "compact" && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {compactViews} views • {compactLikes} likes
                            </p>
                        )}
                    </Link>

                    <div className="flex-none">
                        <VideoMenu videoId={data.id} onRemove={onRemove} />
                    </div>
                </div>
            </div>
        </div>
    )
}