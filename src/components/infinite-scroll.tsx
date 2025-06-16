// KONDISI UI KETIKA SCROOL

import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "@/components/ui/button"

interface InfiniteScrollProps {
    isManual?: boolean; // jika true, maka load lewat button
    hasNextPage: boolean; // cek apakah masih ada data
    isFetchingNextPage: boolean; // apakah sedang mengambil data berikutnya
    fetchNextPage: () => void; // untuk mengambil data berikutnya
}

export const InfiniteScroll = ({
    isManual = false,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: InfiniteScrollProps) => {
    const { targetRef, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: "100px",
    });

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, isManual, fetchNextPage])

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div ref={ targetRef } className="h-1" />
            {hasNextPage ? (
                <Button
                    variant="secondary"
                    disabled={!hasNextPage || isFetchingNextPage}
                    onClick={() => fetchNextPage()} >
                    {isFetchingNextPage ? "Loading..." : "Loadmore"}
                </Button>
            ) : (
                <p className="text-xs text-muted-foreground">
                    Sudah mencapai batas akhir.
                </p>
            )}
        </div>
    )
}