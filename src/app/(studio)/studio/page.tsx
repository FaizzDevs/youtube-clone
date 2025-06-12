import { DEFAULT_LIMIT } from "@/constants";
import { StudioView } from "@/modules/studio/ui/views/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic"; // halaman yang terdapat kode itu harus selalu dirender

const Page = async () => {
    void trpc.studio.getMany.prefetchInfinite({
        limit:  DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            <StudioView />
        </HydrateClient>
    )
}

export default Page;