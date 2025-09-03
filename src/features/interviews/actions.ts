"use server"

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { jobInfoIdTag } from "../jobInfos/dbCache"
import { db } from "@/drizzle/db"
import { and, eq } from "drizzle-orm"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { insertInterview, updateInterview } from "./db"
import { interviewIdTag } from "./dbCache"

export async function syncInterviewWithChat(
    id: string,
    {
        humeChatId,
        duration
    }: {
        humeChatId?: string,
        duration?: string
    }
) {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return {
            error: true,
            message: "You don't have permission to do this"
        }
    }

    const result = await getInterview(id, userId)
    if (result == null) {
        return {
            error: true,
            message: "Interview not found"
        }
    }

    await updateInterview(id, {
        duration: duration ?? "00:00:00",
        humeChatId,
        jobInfoId: result.jobInfo.id
    })

    return {
        error: false
    }
}

export async function createInterview({
    jobInfoId
}: {
    jobInfoId: string
}): Promise<{
    error: true,
    message: string
} | {
    error: false,
    id: string
}> {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return {
            error: true,
            message: "You don't have permission to create interview"
        }
    }

    // TODO: permission and rate limit

    const jobInfo = await getJobInfo(jobInfoId, userId)
    if (jobInfo == null) {
        return {
            error: true,
            message: "You don't have permission to create interview"
        }   
    }

    const interview = await insertInterview({
        jobInfoId,
        duration: "00:00:00"
    })

    return {
        error: false,
        id: interview.id
    }
}

async function getJobInfo(id: string, userId: string) {
    'use cache'
    cacheTag(jobInfoIdTag(id))
    return db.query.JobInfoTable.findFirst({
        where: and(
            eq(JobInfoTable.id, id),
            eq(JobInfoTable.userId, userId)
        )
    })
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

    // In case user ID on job info changes
    cacheTag(jobInfoIdTag(interview.jobInfo.id))

    if (interview.jobInfo.userId !== userId) return null

    return interview
} 