"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface HomeVideosSectionProps {
    userId: string;
}

export const VideosSection = (props: HomeVideosSectionProps) => {
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
        <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-4 [@media(min-width:2200px)]:grid-cols-4">
            {/* menampilkan video dengan grid */}
            {Array.from({ length: 18 }).map((_, index) => ( // membuat array baru (-, index) => nilai tersebut tidak digunakan sampai index yang dipakai key
                    <VideoGridCardSkeleton key={index} />
                ))
            }
        </div>
    )
}

const VideosSectionSuspense = ({ userId }: HomeVideosSectionProps) => {
    const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery( // mengambil data video halaman per halaman (useSuspenseInfiniteQuery)
        { userId, limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    return (
        <div>
            <div className="gap-4 max-w-[1500px] mx-auto gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-4 [@media(min-width:2200px)]:grid-cols-4">
                {/* menampilkan video dengan grid */}
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))
                }
            </div>

            <InfiniteScroll 
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </div>
    )
}