import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";

interface useSubscriptionProps {
    userId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
}

export const useSubscribtion = ({
    userId,
    isSubscribed,
    fromVideoId
}: useSubscriptionProps) => {
    const clerk = useClerk(); // mengelola pengguna
    const utils = trpc.useUtils(); // membuat api untuk mengelola schema

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess: () => {
            toast.success("Berhasil Subscribe");
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
        },

        // jika tidak bisa subscribe, akan muncul untuk login
        onError: (error) => {
            toast.error("Gagal Subscribe");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn(); // login akun
            }
        }

    });
    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: () => {
            toast.success("Berhasil Subscribe");
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
        },

        // jika tidak bisa subscribe, akan muncul untuk login
        onError: (error) => {
            toast.error("Gagal Subscribe");

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn(); // login akun
            }
        }
    });

    const isPending = subscribe.isPending || unsubscribe.isPending;

    // handle subscribe
    const onClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({ userId });
        } else {
            subscribe.mutate({ userId });
        }
    };

    return { isPending, onClick };
}