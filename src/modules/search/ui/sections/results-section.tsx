"use client"

import { DEFAULT_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"

interface ResultsSectionProps {
    query: string | undefined,
    categoryId: string | undefined
}

export const ResultsSection = (props: ResultsSectionProps) => {
    return (
        <Suspense 
            key={`${props.query}-${props.categoryId}`} // loading tiap pencarian atau tiap category
            fallback={<ResultsSectionSkeleton />}
        >
            <ErrorBoundary fallback={<p>Error...</p>}>
                <ResultsSectionsSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}

const ResultsSectionSkeleton = () => {
    return (
        <div>
            {/* versi desktop */}
            <div className="hidden flex-col gap-4 md:flex">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoRowCardSkeleton key={index} />
                ))}
            </div>
                
            {/* versi mobile */}
            <div className="flex flex-col gap-4 p-4 gap-y-10 pt-6 md:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
        </div>
    )
}

const ResultsSectionsSuspense = ({ query, categoryId }: ResultsSectionProps) => {

    const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
        { query, categoryId, limit: DEFAULT_LIMIT },
        { 
            getNextPageParam: (lastPage) => lastPage.nextCursor, 
        }
    );

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {results.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))
                }
            </div>
            
            <div className="hidden flex-col gap-4 md:flex">
                {results.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard key={video.id} data={video} />
                    ))
                }
            </div>

            {/* scroll maksimal video ditampilkan */}
            <InfiniteScroll 
                hasNextPage={resultsQuery.hasNextPage}
                isFetchingNextPage={resultsQuery.isFetchingNextPage}
                fetchNextPage={resultsQuery.fetchNextPage}
            />
        </>
    )
}