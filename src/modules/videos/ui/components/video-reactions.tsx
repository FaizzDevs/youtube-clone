// PAGE LIKE AND DISLIKE

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { VideoGetOneOutput } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface VideoReactionsProps {
    videoId: string;
    likes: number;
    dislike: number;
    viewerReaction: VideoGetOneOutput["viewerReaction"];
}

export const VideoReactions = ({
    videoId,
    likes,
    dislike,
    viewerReaction,
}: VideoReactionsProps) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    // button like
    const like = trpc.videoReactions.like.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId });
        },
        onError: (error) => {
            toast.error("Ada kesalahan");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    // button dislike
    const dislikeMutation = trpc.videoReactions.dislike.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId });
            utils.playlists.getLiked.invalidate();
        },
        onError: (error) => {
            toast.error("Ada kesalahan");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    return (
        <div className="flex items-center flex-none">

            {/* UI button like */}
            <Button
                onClick={() => like.mutate({ videoId })}
                disabled={like.isPending || dislikeMutation.isPending}
                className="rounded-l-full rounded-r-none gap-2 pr-4"
                variant="secondary"
            >
                <ThumbsUpIcon className={cn("size-5", viewerReaction === "like" && "fill-black")} />
                {likes}  
            </Button>
            <Separator orientation="vertical" className="h-7" />

            {/* UI button dislike */}
            <Button
                onClick={() => dislikeMutation.mutate({ videoId })}
                disabled={like.isPending || dislikeMutation.isPending}
                className="rounded-r-full rounded-l-none gap-2 pl-4"
                variant="secondary"
            >
                <ThumbsDownIcon className={cn("size-5", viewerReaction === "dislike" && "fill-black")} />
                {dislike}  
            </Button>
        </div>
    )
}