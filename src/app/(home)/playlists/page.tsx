import { PlaylistsView } from "@/modules/playlists/ui/views/playlist-view";
import { HydrateClient } from "@/trpc/server";

const Page = () => {
    return (
        <HydrateClient> 
            <PlaylistsView />
        </HydrateClient>
    )
}

export default Page;

// HydrateClient mennyambung data server ke client tanpa harus fetch ulang