import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import React from "react";

export function UserAvatar({ 
    user, 
    ...props 
}: { 
    user: { name: string; imageUrl: string }
} & React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar className="cursor-pointer" {...props}>
    <AvatarImage src={user.imageUrl} alt={user.name} />
    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}