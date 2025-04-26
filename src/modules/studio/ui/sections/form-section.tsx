// PAGE FORM DETAILS VIDEO

"use client";

import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, TrashIcon, CopyIcon, CopyCheckIcon, Globe2Icon, LockIcon, ImagePlusIcon, SparklesIcon, RotateCcwIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { videoUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    FormItem
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface FormSectionProps {
    videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
    return (
        <Suspense fallback={<FormSectionSkeleton />} >
            <ErrorBoundary fallback={<p>Error</p>} >
                <FormSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const FormSectionSkeleton = () => {
    return (
        <div>
            <div className="flex items-center justify-between lg:w-[1600px] mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 justify-between lg:w-[1600px]">
                <div className="space-y-6 lg:col-span-3">
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-[950px]" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-[220px] w-[950px]" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-[170px] w-[320px]" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-[950px]" />
                    </div>
                </div>
                <div className="flex flex-col gap-y-8 lg:col-span-2">
                    <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden">
                        <Skeleton className="aspect-video" />
                        <div className="px-4 py-4 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 mt-6">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
    const router = useRouter();
    const utils = trpc.useUtils();

    const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false); // set change thumbnail
    const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] = useState(false); // set change thumbnail

    const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    // update title and description video studio
    const update = trpc.videos.update.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: videoId });
            toast.success("Video details updated successfully");
            router.push("/studio");
        },
        onError: () => {
            toast.error("Error updating video details");
        }
    });

    // remove video studio
    const remove = trpc.videos.remove.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            toast.success("Video removed");
            router.push("/studio");
        },
        onError: () => {
            toast.error("Error updating video details");
        }
    });

    
    const generateDescription = trpc.videos.generateDesc.useMutation({
        onSuccess: () => {
            toast.success("Background job started", { description: "This may take some time" });
            // router.push("/studio");
        },
        onError: () => {
            toast.error("Error updating video details");
        }
    });

    const generateTitle = trpc.videos.generateTitle.useMutation({
        onSuccess: () => {
            toast.success("Background job started", { description: "This may take some time" });
            // router.push("/studio");
        },
        onError: () => {
            toast.error("Error updating video details");
        }
    });

    // mengembalikan thumbnail
    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: videoId });
            toast.success("Thumbnail Restore");
            // router.push("/studio");
        },
        onError: () => {
            toast.error("Error updating video details");
        }
    });

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
    });

    const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
        update.mutate(data);
    };

    // build link url video
    const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${video.id}`;
    const [isCopied, setIsCopied] = useState(false);

    // copy URL video
    const onCopy = async () => {
        await navigator.clipboard.writeText(fullUrl);
        setIsCopied(true);

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    return (
        <>
            {/* change thumbnail */}
            <ThumbnailGenerateModal 
                open={thumbnailGenerateModalOpen}
                onOpenChange={setThumbnailGenerateModalOpen}
                videoId={videoId}
            />

            <ThumbnailUploadModal 
                open={thumbnailModalOpen}
                onOpenChange={setThumbnailModalOpen}
                videoId={videoId}
            />

            <Form {...form}>
                <form className="w-[1600px]" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Video details</h1>
                            <p className="text-xs text-muted-foreground">Manage your video details</p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <Button type="submit" disabled={update.isPending}>
                                Save
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVerticalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="left" >
                                    <DropdownMenuItem onClick={() => remove.mutate({ id: videoId })}>
                                        <TrashIcon className="size-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="space-y-6 lg:col-span-3">
                            <FormField 
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="flex items-center gap-x-2">
                                                Title
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    type="button"
                                                    className="rounded-full size-6 [&_svg]:size-3"
                                                    onClick={() => generateTitle.mutate({ id: videoId })}
                                                    disabled={generateTitle.isPending || !video.muxTrackId}
                                                    aria-label="Generate title"
                                                >
                                                    {generateTitle.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                                                </Button>
                                            </div>
                                            {/* Add AI generate button */}
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                placeholder="Add a title to your video"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                        <div className="flex items-center gap-x-2">
                                            Description
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    type="button"
                                                    className="rounded-full size-6 [&_svg]:size-3"
                                                    onClick={() => generateDescription.mutate({ id: videoId })}
                                                    disabled={generateDescription.isPending || !video.muxTrackId}
                                                    aria-label="Generate title"
                                                >
                                                    {generateDescription.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                                                </Button>
                                            </div>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field}
                                                value={field.value ?? ""}
                                                rows={10}
                                                className="resize-none pr-10"
                                                placeholder="Add a description to your video"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="thumbnailUrl"
                                control={form.control}
                                render={() => (
                                    <FormItem>
                                        <FormLabel>
                                            Thumbnail
                                        </FormLabel>
                                        <FormControl>
                                            <div className="p-0.5 border border-dashed border-neutral-400 relative h-[180px] w-[320px] group">
                                                <Image 
                                                    src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                                                    fill 
                                                    alt="Thumbnail"
                                                    className="object-cover" />

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                                                            >
                                                                <MoreVerticalIcon className="text-white" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        {/* dropdown at thumbnail */}
                                                        <DropdownMenuContent align="start" side="right">
                                                            <DropdownMenuItem className="cursor-pointer" onClick={() => setThumbnailModalOpen(true)} >
                                                                <ImagePlusIcon className="size-4 mr-1" />
                                                                Change
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setThumbnailGenerateModalOpen(true)}
                                                                className="cursor-pointer"
                                                            >
                                                                <SparklesIcon className="size-4 mr-1" />
                                                                AI-generated
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer" 
                                                                onClick={() => restoreThumbnail.mutate({ id: videoId })}>
                                                                <RotateCcwIcon className="size-4 mr-1" />
                                                                Restore
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Add thumbnail field here */}
                            <FormField 
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Category
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value ?? undefined} >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Add a create category option */}
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                        </div>
                        <div className="flex flex-col gap-y-8 lg:col-span-2">
                            <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                                <div className="aspect-video overflow-hidden relative">
                                    <VideoPlayer 
                                        playbackId={video.muxPlaybackId}
                                        thumbnailUrl={video.thumbnailUrl}
                                    />
                                </div>
                                <div className="p-4 flex flex-col gap-y-6">
                                    <div className="flex justify-between items-center gap-x-2">
                                        <div className="flex flex-col gap-y-1">
                                            <p className="text-muted-foreground text-xs">Video Link</p>
                                            <div className="flex items-center gap-x-2">
                                                <Link href={`/videos/${video.id}`}>
                                                    <p className="line-clamp-1 text-sm text-blue-500">
                                                        {fullUrl}
                                                    </p>
                                                </Link>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="shrink-0"
                                                    onClick={onCopy}
                                                    disabled={isCopied}
                                                >
                                                    {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-y-1">
                                        <p className="text-muted-foreground text-xs">Status</p>
                                        <p className="text-sm">
                                            {snakeCaseToTitle(video.muxStatus || "preparing")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-y-1">
                                        <p className="text-muted-foreground text-xs">Subtitles status</p>
                                        <p className="text-sm ">
                                            {snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}
                                        </p>
                                    </div>
                                </div>    
                                </div>
                            </div>

                            <FormField 
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Visibility
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value ?? undefined} >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="public">
                                                    <div className="flex items-center">
                                                        <Globe2Icon className="size-4 mr-2" />
                                                        Public
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="private">
                                                    <div className="flex items-center">
                                                        <LockIcon className="size-4 mr-2" />
                                                        Private
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                    </div>
                </form>
            </Form>
        </>
    )
}