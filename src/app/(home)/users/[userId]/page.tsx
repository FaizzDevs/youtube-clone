import { DEFAULT_LIMIT } from "@/constants";
import { VideosSection } from "@/modules/users/ui/sections/videos-section";
import { UserView } from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";

interface PageProps {
    params: Promise <{ userId: string }>
}

const Page = async ({ params }: PageProps) => {
    const { userId } = await params;

    // connect to server users.getOne
    void trpc.users.getOne.prefetch({ id: userId }); // prefetch => untuk jumlah data kecil seperti userId
    void trpc.videos.getMany.prefetchInfinite({ userId, limit: DEFAULT_LIMIT }) // prefetch => untuk jumlah data besar dan ada loadmore

    return (
        <HydrateClient>
            <UserView userId={userId} />
            <VideosSection userId={userId} />
        </HydrateClient>
    )
}

export default Page;