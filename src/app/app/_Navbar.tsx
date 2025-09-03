"use client";

import { BookOpenIcon, BrainCircuitIcon, FileSlidersIcon, LogOut, SpeechIcon, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navLinks = [
  {
    name: "Interviews",
    href: "interviews",
    Icon: SpeechIcon
  },
  {
    name: "Questions",
    href: "questions",
    Icon: BookOpenIcon
  },
  {
    name: "Resume",
    href: "resume",
    Icon: FileSlidersIcon
  }
]

export function Navbar({ user }: { user: { name: string; imageUrl: string } }) {
  const { openUserProfile } = useClerk();
  const { jobInfoId } = useParams()
  const pathName = usePathname()

  return (
    <nav className="h-header border-b">
      <div className="container h-full flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <BrainCircuitIcon className="size-8 text-primary" />
          <span className="text-xl font-bold">Next Round</span>
        </Link>

        <div className="flex items-center gap-4">
          {typeof jobInfoId === 'string' && navLinks.map(({ name, href, Icon }) => {
            const path = `/app/jobInfos/${jobInfoId}/${href}`
            const active = pathName === path
            return <Button
              variant={active ? "secondary" : "ghost"}
              key={name}
              className="cursor-pointer max-sm:hidden"
              asChild
            >
              <Link href={path}>
                <Icon />
                {name}
              </Link>
            </Button>
          })}
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