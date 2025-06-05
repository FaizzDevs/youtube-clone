import { VideoGetManyOutput } from "../../types"

interface VideoInfoProps {
    data: VideoGetManyOutput["items"][number];
    onRemove?: () => void;
}

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
    return (
        <div>
            
        </div>
    )
}