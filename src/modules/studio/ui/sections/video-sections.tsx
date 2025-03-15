"use client"

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";

export const VideoSection = () => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <VideoSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
};

const  VideoSectionSuspense = () => {
    const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    return (
        <div>
            <div className="border-y">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 w-[700px]">Video</TableHead>
                            <TableHead >Visibility</TableHead>
                            <TableHead >Status</TableHead>
                            <TableHead >Date</TableHead>
                            <TableHead >Views</TableHead>
                            <TableHead >Comments</TableHead>
                            <TableHead className="pr-6">Likes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {videos.pages.flatMap((page) => page.items).map((video) => (
                            <Link href={`/studio/video/${video.id}`} key={video.id} legacyBehavior >
                                <TableRow className="cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="relative aspect-video w-36 shrink-0">
                                                <VideoThumbnail />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        visbility
                                    </TableCell>
                                    <TableCell>
                                        status
                                    </TableCell>
                                    <TableCell>
                                        date
                                    </TableCell>
                                    <TableCell>
                                        views
                                    </TableCell>
                                    <TableCell>
                                        comments
                                    </TableCell>
                                    <TableCell>
                                        likes
                                    </TableCell>
                                </TableRow>
                            </Link>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <InfiniteScroll 
                isManual
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}    />
        </div>
    );
};