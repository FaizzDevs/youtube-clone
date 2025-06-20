import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistsView } from "@/modules/playlists/ui/views/playlist-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic"; // harus selalu dirender ulang setiap kali ada perubahan data

const Page = () => {
    void trpc.playlists.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT })

    return (
        <HydrateClient> 
            <PlaylistsView />
        </HydrateClient>
    )
}

export default Page;

// HydrateClient mennyambung data server ke client tanpa harus fetch ulang