import { DEFAULT_LIMIT } from "@/constants";
import { VideosView } from "@/modules/playlists/ui/views/videos-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic"; // harus selalu dirender ulang setiap kali ada perubahan data

interface PageProps {
    params: Promise<{ playlistId: string }> // params => parameter untuk mengambil bagian dari url
    // promise digunakan untuk menunggu nilai yang akan datang
}

const Page = async ({ params }: PageProps) => {
    const { playlistId } = await params; // await digunakan untuk menunggu promise yang akan datang

    // memanggil server
    void trpc.playlists.getOne.prefetch({ id:  playlistId });
    void trpc.playlists.getVideos.prefetchInfinite({ playlistId, limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            {/* melanjutkan ke custom playlist page */}
            <VideosView playlistId={playlistId} />
        </HydrateClient>
    )
}

export default Page;