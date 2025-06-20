// UI Video menu samping like

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";
// import { APP_URL } from "@/constants";
import { ListPlusIcon, MoreVerticalIcon, Share2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void;
}

export const VideoMenu = ({
    videoId,
    variant = "ghost",
    onRemove
}: VideoMenuProps) => {
    const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false); // state untuk mengontrol modal playlist add

    // share URL video
    const OnShare = () => {
        const fullUrl = `http://localhost:3000/videos/${videoId}`; // `${APP_URL}` ||
        navigator.clipboard.writeText(fullUrl)
        toast.success("Link copied at the clipboard")
    }

    return (
        <>
            <PlaylistAddModal 
                videoId={videoId} // id video yang akan ditambahkan ke playlist
                open={isOpenPlaylistAddModal} // modal untuk menambah video ke playlist
                onOpenChange={setIsOpenPlaylistAddModal} // fungsi untuk mengubah state modal
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={variant} size="icon" className="rounded-full">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation}>
                    <DropdownMenuItem onClick={OnShare} className="cursor-pointer">
                        <Share2Icon className="mr-2 size-4" />
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => setIsOpenPlaylistAddModal(true)} 
                        className="cursor-pointer">
                        <ListPlusIcon className="mr-2 size-4" />
                        Add to Playlist
                    </DropdownMenuItem>
                    {onRemove && (
                        <DropdownMenuItem onClick={onRemove}>
                            <Trash2Icon className="mr-2 size-4" />
                            Remove
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};