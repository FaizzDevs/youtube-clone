import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistGetManyOutput } from "@/modules/playlists/types";

interface PlaylistInfoProp {
    data: PlaylistGetManyOutput["items"][number]
};

export const PlaylistInfoSkeleton = () => {
    return (
        <div className="flex gap-3">
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-[90%]" />
                <Skeleton className="h-5 w-[70%]" />
                <Skeleton className="h-5 w-[50%]" />
            </div>
        </div>
    )
}

export const PlaylistInfo = ({ data }: PlaylistInfoProp) => {
    return (
        <div className="flex gap-3">
            <div className="min-w-0 flex-1">
                <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
                    {/* menampilkan nama playlist yang dibuat user */}
                    {data.name}
                </h3>
                <p className="text-sm text-muted-foreground">Playlist</p>
                <p className="text-sm text-muted-foreground font-semibold hover:text-primary">View full your playlist</p>
            </div>
        </div>
    )
}