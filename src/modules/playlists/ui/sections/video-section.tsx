"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosSectionsProps {
    playlistId: string;
}

export const VideosSection = (props: VideosSectionsProps) => {
    return (
        <Suspense fallback={<VideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <VideosSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}

const VideosSectionSkeleton = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {/* menampilkan video dengan grid */}
                {Array.from({ length: 18 }).map((_, index) => ( // membuat array baru (-, index) => nilai tersebut tidak digunakan sampai index yang dipakai key
                        <VideoGridCardSkeleton key={index} />
                    ))
                }
            </div>

            <div className="hidden flex-col gap-4 md:flex">
                {/* menampilkan video dengan grid */}
                {Array.from({ length: 18 }).map((_, index) => ( // membuat array baru (-, index) => nilai tersebut tidak digunakan sampai index yang dipakai key
                        <VideoRowCardSkeleton key={index} size="compact" />
                    ))
                }
            </div>
        </div>
    )
}

const VideosSectionSuspense = ({ playlistId }: VideosSectionsProps) => {
    const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery( // mengambil data video
        { limit: DEFAULT_LIMIT, playlistId },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const utils = trpc.useUtils();

    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video Berhasil dihapus");
            utils.playlists.getMany.invalidate(); // invalidate cache untuk mengambil data terbaru
            utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId }); // invalidate cache untuk mengambil data terbaru berdasarkan videoId
            utils.playlists.getOne.invalidate({ id: data.playlistId })
            utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Video Gagal dihapus")
        }
    })

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {/* menampilkan video dengan grid */}
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard 
                            key={video.id} 
                            data={video} 
                            onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id })} />
                    ))
                }
            </div>

            <div className="hidden flex-col gap-4 md:flex">
                {/* menampilkan video dengan grid */}
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard 
                            key={video.id} 
                            data={video} size="compact" 
                            onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id })} />
                    ))
                }
            </div>

            <InfiniteScroll 
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </>
    )
}