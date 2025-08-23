import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_client";

export default async function OnboardingPage() {
    const { userId, user } = await getCurrentUser({ allData: true })

    if (userId == null) redirect('/')
    if (user != null) redirect('/app')
    
    return (
        <div className="container flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-4xl">Creating your account...</h1>
            <OnboardingClient userId={userId} />
        </div>
    )
}