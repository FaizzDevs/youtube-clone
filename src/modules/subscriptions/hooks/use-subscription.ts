import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";

interface useSubscriptionProps {
    userId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
}