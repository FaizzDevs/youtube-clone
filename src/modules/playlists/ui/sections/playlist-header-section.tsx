"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistHeaderSectionProps {
    playlistId: string;
}

export const PlaylistHeaderSection = ({ playlistId }: PlaylistHeaderSectionProps) => {
    return (
        <Suspense fallback={<PlaylistHeaderSectionSkeleton />} >
            <ErrorBoundary fallback={<p>Error...</p>}>
                <PlaylistHeaderSectionSuspense playlistId={playlistId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const PlaylistHeaderSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    )
}

const PlaylistHeaderSectionSuspense = ({ playlistId }: PlaylistHeaderSectionProps) => {
    const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

    const router = useRouter();
    const utils = trpc.useUtils();
    const remove = trpc.playlists.remove.useMutation({
        onSuccess: () => {
            toast.success("Playlist berhasil dihapus");
            utils.playlists.getMany.invalidate(); // tanpa refresh page
            router.push("/playlists"); // kembali ke halaman daftar playlist
        },
        onError: () => {
            toast.error("Gagal menghapus");
        }
    })

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <p className="text-xs text-muted-foreground">Video dari playlist</p>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => remove.mutate({ id: playlistId })} // menghapus playlist
                disabled={remove.isPending}
            >
                <Trash2Icon />
            </Button>
        </div>
    )
}