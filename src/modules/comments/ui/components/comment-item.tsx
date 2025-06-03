// MENAMPILKAN COMMENT PADA UI

import Link from "next/link";
import { CommentGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, MessageSquareIcon, MoreVerticalIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";



interface CommentItemProps {
    comment: CommentGetManyOutput["items"][number];
    variant?: "reply" | "comment",
};

export const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
    const { userId } = useAuth();
    const clerk = useClerk();
    const utils = trpc.useUtils(); // cek pengguna

    const [isReplyOpen, setIsReplyOpen] = useState(false); // react state hook
    const [isRepliesOpen, setIsRepliesOpen] = useState(false); // react state hook

    // remove comment hanya bisa dilakukan oleh pengguna
    const remove = trpc.comments.remove.useMutation({
        onSuccess: () => {
            toast.success("Comment deleted");
            utils.comments.getMany.invalidate({ videoId: comment.videoId })
        },
        onError: (error) => {
            toast.error("Gagal dihapus")

            if(error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    // memberikan like
    const like = trpc.commentReactions.like.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId: comment.videoId }); // menampilkan value baru pada UI
        },
        onError: (error) => {
            toast.error("Ada kesalahan")

            if(error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    // memberikan dislike
    const dislike = trpc.commentReactions.dislike.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId: comment.videoId }); // menampilkan value baru pada UI
        },
        onError: (error) => {
            toast.error("Ada kesalahan")

            if(error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    return (
        <div>
            <div className="flex gap-4">
                <Link href={`/users/${comment.userId}`}>
                    <UserAvatar 
                        size="lg"
                        imageUrl={comment.user.imageUrl}
                        name={comment.user.name}
                    />
                </Link>

                {/* Menampilkan comment pada UI */}
                <div className="flex-1 min-w-0">
                    <Link href={`/users/${comment.userId}`}> 
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm pb-0.5">
                                {comment.user.name}
                            </span>

                            {/* Waktu pembuatan comment */}
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(comment.createdAt,{
                                addSuffix: true,
                            })}</span>
                        </div>
                    </Link>
                    <p className="text-sm">{comment.value}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                            <Button
                                disabled={like.isPending}
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => like.mutate({ commentId: comment.id })}
                            >
                                <ThumbsUpIcon 
                                    className={cn(
                                        comment.viewerReaction === "like" && "fill-black",
                                    )}
                                />
                            </Button>
                            {/* total like */}
                            <span className="text-xs text-muted-foreground">{comment.likeCount}</span>

                            <Button
                                disabled={dislike.isPending}
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => dislike.mutate({ commentId: comment.id })}
                            >
                                <ThumbsDownIcon 
                                    className={cn(
                                        // ketika di klik berubah menjadi hitam
                                        comment.viewerReaction === "dislike" && "fill-black",
                                    )}
                                />
                            </Button>
                            {/* total dislike */}
                            <span className="text-xs text-muted-foreground">{comment.dislikeCount}</span>
                        </div>
                        
                        {/* button reply comment */}
                        {variant === "comment" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => setIsReplyOpen(true)}
                            >
                                Reply
                            </Button>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <MoreVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                        {variant === "comment" && (
                            <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                                <MessageSquareIcon className="size-4"/>
                                Reply
                            </DropdownMenuItem>
                        )}

                        {/* remove komen muncul pada sisi pengguna itu sendiri */}
                        {comment.user.clerkId === userId && (
                            <DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })}>
                                <Trash2Icon className="size-4"/>
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* open UI comment ketika klik reply */}
            {isReplyOpen && variant === "comment" && (
                <div className="mt-4 pl-14">
                    <CommentForm 
                        variant="reply"
                        parentId={comment.id}
                        videoId={comment.videoId}
                        onCancel={() => setIsReplyOpen(false)}
                        onSuccess={() => {
                            setIsReplyOpen(false);
                            setIsRepliesOpen(true);
                        }}
                    />
                </div>
            )}

            {/* button total replies */}
            {comment.replyCount > 0 && variant === "comment" && (
                <div className="pl-14">
                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => setIsRepliesOpen((current) => !current)}
                    >
                        {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        {comment.replyCount} replies
                    </Button>
                </div>
            )}

            {/* UI replies komen */}
            {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
                <CommentReplies 
                    parentId = {comment.id}
                    videoId={comment.videoId}
                />
            )}
        </div>
    )

}