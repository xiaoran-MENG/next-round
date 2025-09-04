import { cn } from "@/lib/utils"
import { ComponentProps } from "react"
import Markdown from 'react-markdown'

export function MarkdownRenderer({
    className, 
    ...props
}: { className?: string } & ComponentProps<typeof Markdown>) {
    // @tailwindcss/typography plugin needs to be installed and imported to use prose
    return <div className={cn("max-w-none prose prose-neutral dark:prose-invert font-sans", className)}>
        <Markdown {...props} />
    </div>
}