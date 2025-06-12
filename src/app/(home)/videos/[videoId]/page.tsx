// UI VIDEO HOME
import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{
        videoId: string
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { videoId } = await params;

    void trpc.videos.getOne.prefetch({ id: videoId }); // mengambil data sebelum komponen di render
    void trpc.comments.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT }); // mengambil daftar komentar (prefetchInfinite=infinite scroll)
    void trpc.suggestions.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT }); // mengambil suggest/saran video

    return (
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    );
};

export default Page;