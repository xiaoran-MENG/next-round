"use client";

import { BrainCircuitIcon, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar({ user }: { user: { name: string; imageUrl: string } }) {
  const { openUserProfile } = useClerk();

  return (
    <nav className="h-header border-b">
      <div className="container h-full flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <BrainCircuitIcon className="size-8 text-primary" />
          <span className="text-xl font-bold">Next Round</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback className="uppercase">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-30">
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <User className="mr-2" />
                Profile
              </DropdownMenuItem>
              <SignOutButton>
                <DropdownMenuItem>
                    <LogOut className="mr-2" />
                    Logout
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}