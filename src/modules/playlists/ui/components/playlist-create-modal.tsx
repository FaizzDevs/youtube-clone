// PAGE UPLOAD THUMBNAIL    

import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PlaylistCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
    name: z.string().min(1), // hanya menerima input bernama name dan minimal 1 karakter
})

export const PlaylistCreateModal = ({
    open,
    onOpenChange,
}: PlaylistCreateModalProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), //validasi form
        defaultValues: {  // nilai name kosong
            name: "",
        },
    });

    const create = trpc.playlists.create.useMutation({  // variable create => mengirim data ke server
        onSuccess: () => {
            toast.success("Playlist Berhasil");
            form.reset();
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Ada Kesalahan");
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        create.mutate(values);
    }
    
    return (
        <ResponsiveModal
            title="Create a Playlist"
            open={open}
            onOpenChange={onOpenChange}    
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4" 
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field}
                                        placeholder="My Favorite Videos"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            disabled={create.isPending}
                            type="submit"
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    )
}