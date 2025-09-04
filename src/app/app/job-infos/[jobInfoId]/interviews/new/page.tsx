import { db } from "@/drizzle/db"
import { JobInfoTable } from "@/drizzle/schema"
import { jobInfoIdTag } from "@/features/jobInfos/dbCache"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { and, eq } from "drizzle-orm"
import { Loader2Icon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { fetchAccessToken } from "hume"
import { env } from "@/data/env/server"
import { VoiceProvider } from "@humeai/voice-react"
import { StartCall } from "./StartCall"
import { canCreateInterviews } from "@/features/interviews/permissions"

export default async function NewInterviewPage({
    params
}: {
    params: Promise<{ jobInfoId: string }>
}) {
    const { jobInfoId } = await params
    return <Suspense fallback={
       <div className="h-screen-header flex items-center justify-center">
         <Loader2Icon className="size-24 animate-spin m-auto" />
       </div>
    }>
        <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
    const { userId, redirectToSignIn, user } = await getCurrentUser({ allData: true })
    if (userId == null || user == null) {
        return redirectToSignIn()
    }

    if (!(await canCreateInterviews())) {
        return redirect("/app/upgrade")
    }

    const jobInfo = await getJobInfo(jobInfoId, userId)
    if (jobInfo == null) {
        return notFound()
    }

    const accessToken = await fetchAccessToken({
        apiKey: String(env.HUME_API_KEY),
        secretKey: String(env.HUME_SECRET_KEY)
    })

    return <VoiceProvider>
        <StartCall 
            jobInfo={jobInfo} 
            user={user}
            accessToken={accessToken}
        />
    </VoiceProvider>
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(jobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(
      eq(JobInfoTable.id, id),
      eq(JobInfoTable.userId, userId)
    ),
  })
}
