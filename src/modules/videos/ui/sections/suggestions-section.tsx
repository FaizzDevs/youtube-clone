// MENAMPILKAN UI PADA BAGIAN SUGGESTION

"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/video-grid-card";

interface SuggestionsSectionProps {
    videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
    const [suggestions] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({ // data sudah siap saat dibutuhkan dan tidak perlu loading ulang.
        videoId,
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    return (
        <>
            <div className="hidden md:block space-y-3">

                {/* menampilkan semua video pada database untuk ditampilkan pada suggestions */}
                {suggestions.pages.flatMap((page) => page.items.map((video) => (
                    <VideoRowCard 
                        key={video.id}
                        data={video}
                        size="compact"
                    />
                )))}
            </div>

            <div className="block md:hidden space-y-10">
                {suggestions.pages.flatMap((page) => page.items.map((video) => (
                    <VideoGridCard 
                        key={video.id}
                        data={video}
                    />
                )))}
            </div>
        </>
    )
}