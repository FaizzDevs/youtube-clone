import { UserAvatar } from "@/components/user-avatar";
import { UserGetOneOutput } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useSubscribtion } from "@/modules/subscriptions/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageInfoProps {
    user: UserGetOneOutput;
}

export const UserPageInfoSkeleton = () => {
    return (
        <div className="py-6">
            {/* mobile layout */}
            <div className="flex flex-col md:hidden">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-[40px] w-[40px] rounded-full" />

                    <div className="flex-1 min-w-0">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </div>
                </div>

                <Skeleton className="h-10 w-full mt-3 rounded-full" />
            </div>
        </div>
    )
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
    const { userId, isLoaded } = useAuth();
    const clerk = useClerk();

    // fungsi ketika subscribe & unsubscribe
    const { isPending, onClick } = useSubscribtion({
        userId: user.id,
        isSubscribed: user.viewerSubscribed,
    })

    return (
        <div className="py-6">

            {/* mobile layout */}
            <div className="flex flex-col md:hidden">
                <div className="flex items-center gap-3">
                    <UserAvatar 
                        size="lg"
                        imageUrl={user.imageUrl}
                        name={user.name}
                        className="h-[40px] w-[40px]"
                        onClick={() => { // jika user merupakan user itu sendiri maka open User Profile
                            if (user.clerkId === userId) {
                                clerk.openUserProfile();
                            }
                        }}
                    />

                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">{user.name}</h1>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <span>{user.subscriberCount} subscribers</span>
                            <span>&bull;</span>
                            <span>{user.videoCount} videos</span>
                        </div>
                    </div>
                </div>

                {userId === user.clerkId ? (
                    <Button
                        variant="secondary"
                        asChild // tidak terpengaruh sebagai button, dan Link menjadi komponen utama
                        className="w-full mt-4 rounded-full"
                    >
                        <Link href="/studio">Go to Studio</Link>
                    </Button>
                ) : (
                    <SubscriptionButton 
                        disabled={isPending || !isLoaded}
                        isSubscribed={user.viewerSubscribed}
                        onClick={onClick}
                        className="w-full mt-4"
                    />
                )}
            </div>

            {/* desktop layout */}
            <div className="hidden md:flex items-start gap-4">
                <UserAvatar 
                    size="xl"
                    imageUrl={user.imageUrl}
                    name={user.name}
                    className={cn(userId === user.clerkId && "cursor-pointer hover:opacity-80 transition-opacity duration-300")}
                    onClick={() => { // jika user merupakan user itu sendiri maka open User Profile
                        if (user.clerkId === userId) {
                            clerk.openUserProfile();
                        }
                    }}
                />

                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                        <span>{user.subscriberCount} subscribers</span>
                        <span>&bull;</span>
                        <span>{user.videoCount} videos</span>
                    </div>

                    {userId === user.clerkId ? (
                        <Button
                            variant="secondary"
                            asChild // tidak terpengaruh sebagai button, dan Link menjadi komponen utama
                            className="mt-4 rounded-full"
                        >
                            <Link href="/studio">Go to Studio</Link>
                        </Button>
                    ) : (
                        <SubscriptionButton 
                            disabled={isPending || !isLoaded}
                            isSubscribed={user.viewerSubscribed}
                            onClick={onClick}
                            className="mt-4"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}