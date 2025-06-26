"use client"

import { Button } from "@/components/ui/button"
import { ClapperboardIcon, UserCircleIcon, UserIcon } from "lucide-react"
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"

export const AuthButton = () => {
    // TODO: add different auth states
    return ( 
        <>
            <SignedIn>
                <UserButton>
                    <UserButton.MenuItems>
                        {/* Add user profile menu button */}
                        <UserButton.Link 
                            label="My Profile"
                            href="/users/current"
                            labelIcon={<UserIcon className="size-4" />}  />

                        <UserButton.Link 
                            label="Studio"
                            href="/studio"
                            labelIcon={<ClapperboardIcon className="size-4" />}  />
                        <UserButton.Action label="manageAccount" />
                    </UserButton.MenuItems>
                </UserButton>
                {/* add menu items for studio and user profile */}
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500 rounded-full shadow-none [&_svg]:size-5" >
                        <UserCircleIcon />
                        Sign In
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    )
}