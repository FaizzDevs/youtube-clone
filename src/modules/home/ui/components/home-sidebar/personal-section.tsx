"use client"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { HistoryIcon, ThumbsUpIcon, ListVideoIcon } from "lucide-react"
import Link from "next/link"
import { useAuth, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

const items = [
    {
        title: "History",
        url: "/playlists/history",
        icon: HistoryIcon,
        auth: true,
    },
    {
        title: "Liked Videos",
        url: "/playlists/liked",
        icon: ThumbsUpIcon,
        auth: true,
    },
    {
        title: "All Playlist",
        url: "/playlists",
        icon: ListVideoIcon,
        auth: true,
    },
]

export const PersonalSection = () => {
    const clerk = useClerk();
    const { isSignedIn } = useAuth();
    const pathName = usePathname(); //mengambil alamat url pada page yang sedang dibuka (tanpa domain dan query string)

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Kamu</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                tooltip={item.title}
                                asChild
                                isActive={pathName === item.url} 
                                onClick={(e) => {
                                    if (!isSignedIn && item.auth) {
                                        e.preventDefault();
                                        return clerk.openSignIn();
                                    }
                                }}>
                                <Link href={item.url} className="flex items-center gap-4">
                                    <item.icon />
                                    <span className="text-sm">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}