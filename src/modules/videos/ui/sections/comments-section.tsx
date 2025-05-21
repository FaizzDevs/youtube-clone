// UI MENAMPILKAN COMMENTS SECTION

"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
    videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <CommentsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}


const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
    const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery({
         videoId,
         limit: DEFAULT_LIMIT // batasan comment yang ditampilkan yaitu 5 value
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
    
    // // Kalkulasi total comments yang ada pada videId
    // const totalComments = comments.pages.reduce(
    //     (acc, page) => acc + page.items.length,
    //     0
    // );

    return (
        <div className="mt-4">
            <div className="flex flex-col gap-6">
                <h1 className="text-lg font-semibold">
                    {comments.pages[0].items[0].totalCount} Comments 
                    {/* SAMPAI SINI DULU YAAA */}
                </h1>
                <CommentForm videoId={videoId} />

                {/* Menampilkan semua comment pada UI */}
                <div className="flex flex-col gap-4 mt-2">
                    {/* {comments.pages.flatMap((page) => */}
                    {comments.pages.flatMap((page) => page.items).map((comment) => (
                        
                            <CommentItem 
                                key={comment.id}
                                comment={comment}
                            />

                    ))}

                    {/* Scroll batasan comment yang ditampilkan */}
                    <InfiniteScroll
                        isManual 
                        hasNextPage={query.hasNextPage}
                        isFetchingNextPage={query.isFetchingNextPage}
                        fetchNextPage={query.fetchNextPage}
                    />
                </div>
            </div>
            
        </div>
    )
}