import { UserAvatar } from "@/features/users/components/UserAvatar"
import { cn } from "@/lib/utils"
import { BrainCircuitIcon } from "lucide-react"

export function CondensedMessages({
    messages,
    user,
    className,
    maxFft
}: {
    messages: {
        isUser: boolean,
        content: string[]
    }[],
    user: {
        name: string,
        imageUrl: string
    },
    className?: string,
    maxFft?: number
}) {
    return <div className={cn("flex flex-col gap-4 w-full", className)}>
        {messages.map((message, i) => {
            const animate = i === messages.length - 1 && maxFft && maxFft > 0
            return <div 
                key={i} 
                className={cn("flex items-center gap-5 pl-4 pr-6 py-4 rounded max-w-3/4", message.isUser ? "self-end" : "self-start")}
            >
                {message.isUser 
                    ? <UserAvatar 
                        user={user} 
                        className="size-6 flex-shrink-0" 
                    /> 
                    : <div className="relative">
                        <div className={cn("absolute inset-0 border-primary/50 border-4 rounded-full", animate ? "animate-ping" : "hidden")} />
                        <BrainCircuitIcon
                            className="relative size-6 flex-shrink-0"
                            style={animate ? { scale: maxFft / 8 + 1 } : undefined}
                        />
                    </div>}
                <div className="flex flex-col gap-1">
                    {message.content.map((text, j) => 
                        <span key={j}>{text}</span>)}
                </div>
            </div>
        })}
    </div>
}