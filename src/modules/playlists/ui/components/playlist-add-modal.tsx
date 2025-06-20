// Page add playlist via video menu

import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoId: string;
};

export const PlaylistAddModal = ({
    open,
    onOpenChange,
    videoId
}: PlaylistAddModalProps) => {
    const utils = trpc.useUtils();
    const { data: playlists, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = trpc.playlists.getManyForVideo.useInfiniteQuery({  // useInfiniteQuery => mengambil data berhalaman (cocok untuk scroll / loadmore)
        limit: DEFAULT_LIMIT,
        videoId,
    }, {
        getNextPageParam: lastPage => lastPage.nextCursor, // fungsi untuk mendapatkan halaman selanjutnya
        enabled: !!videoId && open, // query hanya akan dijalankan jika videoId ada dan modal terbuka
    });

    const addVideo = trpc.playlists.addVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video Berhasil ditambahkan");
            utils.playlists.getMany.invalidate(); // invalidate cache untuk mengambil data terbaru
            utils.playlists.getManyForVideo.invalidate({ videoId }); // invalidate cache untuk mengambil data terbaru berdasarkan videoId
            utils.playlists.getOne.invalidate({ id: data.playlistId })
            utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Video Gagal Ditambahkan")
        }
    });

    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video Berhasil dihapus");
            utils.playlists.getMany.invalidate(); // invalidate cache untuk mengambil data terbaru
            utils.playlists.getManyForVideo.invalidate({ videoId }); // invalidate cache untuk mengambil data terbaru berdasarkan videoId
            utils.playlists.getOne.invalidate({ id: data.playlistId })
            utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Video Gagal dihapus")
        }
    })

    return (
        <ResponsiveModal
            title="Tambah ke Playlist"
            open={open}
            onOpenChange={onOpenChange}    
        >
            <div className="flex flex-col gap-2">
                {isLoading && (
                    <div className="flex justify-center p-4">
                        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!isLoading &&
                    playlists?.pages
                        .flatMap((page) => page.items)
                        .map((playlist) => (
                            <Button 
                                key={playlist.id} 
                                variant="ghost"
                                className="w-full justify-start px-2 [&_svg]:size-5"
                                size="lg"
                                onClick={() => {
                                    if(playlist.containsVideo) {
                                        removeVideo.mutate({ playlistId: playlist.id, videoId })
                                    } else {
                                        addVideo.mutate({ playlistId: playlist.id, videoId })
                                    }
                                }}
                                disabled={addVideo.isPending || removeVideo.isPending}
                                >
                                    {playlist.containsVideo ? (
                                        <SquareCheckIcon className="mr-2" />
                                    ) : (
                                        <SquareIcon className="mr-2" />
                                    )}
                                    {playlist.name}
                            </Button>
                        ))
                }

                {!isLoading && (
                    <InfiniteScroll
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        isManual
                    />
                )}
            </div>
        </ResponsiveModal>
    )
}