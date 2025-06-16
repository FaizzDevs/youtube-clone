"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const HistoryVideosSection = () => {
    return (
        <Suspense fallback={<HistoryVideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <HistoryVideosSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const HistoryVideosSectionSkeleton = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {/* menampilkan video dengan grid */}
                {Array.from({ length: 18 }).map((_, index) => ( // membuat array baru (-, index) => nilai tersebut tidak digunakan sampai index yang dipakai key
                        <VideoGridCardSkeleton key={index} />
                    ))
                }
            </div>

            <div className="hidden flex-col gap-4 gap-y-10 md:flex">
                {/* menampilkan video dengan grid */}
                {Array.from({ length: 18 }).map((_, index) => ( // membuat array baru (-, index) => nilai tersebut tidak digunakan sampai index yang dipakai key
                        <VideoRowCardSkeleton key={index} size="compact" />
                    ))
                }
            </div>
        </div>
    )
}

const HistoryVideosSectionSuspense = () => {
    const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery( // mengambil data video
        { limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    return (
        <div>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {/* menampilkan video dengan grid */}
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))
                }
            </div>

            <div className="hidden flex-col gap-4 md:flex">
                {/* menampilkan video dengan grid */}
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard key={video.id} data={video} size="compact" />
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