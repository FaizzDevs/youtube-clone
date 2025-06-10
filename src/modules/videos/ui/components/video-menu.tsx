// UI Video menu samping like

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
// import { APP_URL } from "@/constants";
import { ListPlusIcon, MoreVerticalIcon, Share2Icon, Trash2Icon } from "lucide-react";
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
    // share URL video
    const OnShare = () => {
        const fullUrl = `http://localhost:3000/videos/${videoId}`; // `${APP_URL}` ||
        navigator.clipboard.writeText(fullUrl)
        toast.success("Link copied at the clipboard")
    }

    return (
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
                <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
                    <ListPlusIcon className="mr-2 size-4" />
                    Add to Playlist
                </DropdownMenuItem>
                {onRemove && (
                    <DropdownMenuItem onClick={() => {}}>
                        <Trash2Icon className="mr-2 size-4" />
                        Remove
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};