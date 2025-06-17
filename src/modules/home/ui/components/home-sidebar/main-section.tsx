// TAMPILAN UI SIDEBAR

"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { HomeIcon, PlaySquareIcon, FlameIcon } from "lucide-react"
import Link from "next/link"
import { useAuth, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

const items = [
    {
        title: "Home",
        url: "/",
        icon: HomeIcon
    },
    {
        title: "Subscriptions",
        url: "/feed/subscribed",
        icon: PlaySquareIcon,
        auth: true,
    },
    {
        title: "Trending",
        url: "/feed/trending",
        icon: FlameIcon,
    },
]

export const MainSection = () => {
    const { isSignedIn } = useAuth();
    const clerk = useClerk();
    const pathName = usePathname(); // mengambil alamat url pada page yang sedang dibuka (tanpa domain dan query string)

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                tooltip={item.title}
                                asChild
                                isActive={pathName === item.url} 
                                onClick={(e) => {
                                    if (!isSignedIn && item.auth) { // memastikan user sudah login
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