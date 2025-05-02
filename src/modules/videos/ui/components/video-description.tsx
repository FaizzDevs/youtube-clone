import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

interface VideoDescriptionProps {
    compactViews: string;
    expendedViews: string;
    compactDate: string;
    expendedDate: string;
    description?: string | null;
}

export const VideoDescription = ({
    compactViews,
    expendedViews,
    compactDate,
    expendedDate,
    description
}: VideoDescriptionProps) => {
    const [isExpanded, setIsExpended] = useState(false);

    return (
        <div 
            onClick={() => setIsExpended((current) => !current)}
            className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70"
        >
            <div className="flex gap-2 text-sm mb-2">
                <span className="font-medium">
                    {isExpanded ? expendedViews : compactViews} views
                </span>
                <span className="font-medium">
                    {isExpanded ? expendedDate : compactDate}
                </span>
            </div>
            <div className="relative">
                <p
                    className={cn(
                        "text-sm whitespace-pre-wrap'",
                        !isExpanded && "line-clamp-2"
                    )}
                >
                    {description || "No Description"}
                </p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium">
                    {isExpanded ? (
                        <>
                            Show Less <ChevronUpIcon className="size-4" />
                        </>
                    ) : (
                        <>
                            Show More <ChevronDownIcon className="size-4" />
                        </>
                    ) }
                </div>
            </div>
        </div>
    )
}