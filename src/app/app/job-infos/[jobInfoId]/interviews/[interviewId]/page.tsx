import { BackLink } from "@/components/BackLink"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Skeleton, SkeletonButton } from "@/components/Skeleton"
import { SuspendedItem } from "@/components/SuspendedItem"
import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { db } from "@/drizzle/db"
import { InterviewTable } from "@/drizzle/schema"
import { generateFeedback } from "@/features/interviews/actions"
import { interviewIdTag } from "@/features/interviews/dbCache"
import { jobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatDateTime } from "@/lib/formatters"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { CondensedMessages } from "@/services/hume/components/CondensedMessages"
import { getChatMessages } from "@/services/hume/lib/api"
import { condense } from "@/services/hume/lib/condense"
import { eq } from "drizzle-orm"
import { Loader2Icon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export default async function InterviewPage({ params }: {
    params: Promise<{
        jobInfoId: string
        interviewId: string
    }>
}) {
    const {
        jobInfoId,
        interviewId
    } = await params

    const interview = getCurrentUser()
        .then(async ({ userId, redirectToSignIn }) => {
            if (userId == null) return redirectToSignIn()
            const interview = await getInterview(interviewId, userId)
            if (interview == null) return notFound()
            return interview
        })

    return <div className="container my-4 space-y-4">
        <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
            Back to Interviews
        </BackLink>
        <div className="space-y-6">
            <div className="flex gap-2 justify-between">
                <div className="space-y-2 mb-6">
                    <h1 className="text-3xl md:text-4xl">
                        Interview: <SuspendedItem 
                            item={interview} 
                            fallback={<Skeleton className="w-48" />}
                            result={i => formatDateTime(i.createdAt)}
                        />
                    </h1>
                    <p className="text-muted-foreground">
                        <SuspendedItem
                            item={interview}
                            fallback={<Skeleton className="w-24" />}
                            result={i => i.duration}
                        />
                    </p>
                </div>
                <SuspendedItem
                    item={interview}
                    fallback={<SkeletonButton className="w-32" />}
                    result={i => i.feedback == null ? (
                        <ActionButton action={generateFeedback.bind(null, i.id)}>Generate Feedback</ActionButton>
                    ) : <Dialog>
                        <DialogTrigger asChild>
                            <Button>View Feedback</Button>
                        </DialogTrigger>
                        <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col">
                            <DialogTitle>Feedback</DialogTitle>
                            <MarkdownRenderer>{i.feedback}</MarkdownRenderer>
                        </DialogContent>
                    </Dialog>}
                />
            </div>
            <Suspense fallback={<Loader2Icon className="animate-spin size-24 mx-auto" />}>
                <Messages interview={interview} />
            </Suspense>
        </div>
    </div>
}

async function Messages({ interview } : { interview: Promise<{ humeChatId: string | null }> }) {
    const { 
        user,
        redirectToSignIn
    } = await getCurrentUser({ allData: true })
    if (user == null) return redirectToSignIn()
    const { humeChatId } = await interview
    if (humeChatId == null) return notFound()
    const messages = await getChatMessages(humeChatId)
    const condensed = condense(messages)
    return <CondensedMessages
        messages={condensed}
        user={user}
        className="max-w-5xl mx-auto"
    />
}

async function getInterview(id: string, userId: string) {
    'use cache'
    cacheTag(interviewIdTag(id))
    const interview = await db.query.InterviewTable.findFirst({
        where: eq(InterviewTable.id, id),
        with: {
            jobInfo: {
                columns: {
                    id: true,
                    userId: true
                }
            }
        }
    })

    if (interview == null) return null

    cacheTag(jobInfoIdTag(interview.jobInfo.id))
    if (interview.jobInfo.userId !== userId) return null

    return interview
}