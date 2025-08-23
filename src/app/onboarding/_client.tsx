'use client'

import { getUser } from "@/features/users/actions"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function OnboardingClient({ userId }: { userId: string }) {
    const router = useRouter()
    
    useEffect(() => { 
        const interval = setInterval(async () => {
            const user = await getUser(userId)
            if (user == null) return
            router.replace('/app')
            clearInterval(interval)
        }, 250)
        return () => clearInterval(interval)
    }, [userId, router])

    return <Loader2Icon className="animate-spin size-24" />
}