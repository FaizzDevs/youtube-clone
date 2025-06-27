"use client"

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item";

export const SubscriptionsSection = () => {
    return (
        <Suspense fallback={<SubscriptionsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <SubscriptionsSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const SubscriptionsSectionSkeleton = () => {
    return (
            <div className="flex flex-col gap-4 gap-y-10">
                {/* menampilkan video dengan grid */}
                {Array.from({ length: 10 }).map((_, index) => ( // membuat array baru (-, index) => nilai tersebut tidak digunakan sampai index yang dipakai key
                        <SubscriptionItemSkeleton key={index} />
                    ))
                }
            </div>
    )
}

const SubscriptionsSectionSuspense = () => {
    const utils = trpc.useUtils();
    const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery( // mengambil data video
        { limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: (data) => {
            toast.success("Unsubscribe");

            utils.subscriptions.getMany.invalidate();
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({ id: data.creatorId });
        },

        // jika tidak bisa subscribe, akan muncul untuk login
        onError: () => {
            toast.error("Gagal Subscribe");
        }
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* menampilkan video dengan grid */}
                {subscriptions.pages
                    .flatMap((page) => page.items)
                    .map((subscription) => (
                        <Link key={subscription.creatorId} href={`/users/${subscription.user.id}`}>
                            <SubscriptionItem 
                                name={subscription.user.name}
                                imageUrl={subscription.user.imageUrl}
                                subscriberCount={subscription.user.subscriberCount}
                                onUnsubscribe={() => {
                                    unsubscribe.mutate({ userId: subscription.creatorId })
                                }}
                                disabled={unsubscribe.isPending}
                            />
                        </Link>
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