import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { Navbar } from "./_Navbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const { userId, user } = await getCurrentUser({ allData: true })

    if (userId == null) redirect('/')
    if (user == null) redirect('/onboarding')
    
    return <>
        <Navbar user={user} />
        {children}
    </>
}