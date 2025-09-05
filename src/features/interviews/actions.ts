"use server"

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { jobInfoIdTag } from "../jobInfos/dbCache"
import { db } from "@/drizzle/db"
import { and, eq } from "drizzle-orm"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { insertInterview, updateInterview } from "./db"
import { interviewIdTag } from "./dbCache"
import { canCreateInterviews } from "./permissions"
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/errorToast"
import arcjet, { tokenBucket, request } from "@arcjet/next"
import { env } from "@/data/env/server"
import { generateInterviewFeedback } from "@/services/ai/interviews"

const aj = arcjet({
    characteristics: ['userId'],
    key: env.ARCJET_KEY,
    rules: [
        tokenBucket({
            capacity: 12,
            refillRate: 4,
            interval: '1d',
            mode: 'LIVE'
        })
    ]
})

export async function syncInterviewWithChat(
    id: string,
    data: {
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

    await updateInterview(id, data)

    return { error: false }
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

    if (!(await canCreateInterviews())) {
        return {
            error: true,
            message: PLAN_LIMIT_MESSAGE
        }
    }

    const decistion = await aj.protect(await request(), {
        userId,
        requested: 1 // Consumes 1 token for createing an interview
    })

    if (decistion.isDenied()) {
        return {
            error: true,
            message: RATE_LIMIT_MESSAGE
        }
    }

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
                    userId: true,
                    description: true,
                    title: true,
                    experienceLevel: true
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

export async function generateFeedback(id: string) {
    const { userId, user } = await getCurrentUser({ allData: true })
    if (userId == null || user == null) return {
        error: true,
        message: "You don't have permission to do this"
    }

    const interview = await getInterview(id, userId)
    if (interview == null) return {
        error: true,
        message: "Interview is not found"
    }

    if (interview.humeChatId == null) return {
        error: true,
        message: "Interview is not linked to a chat"
    }

    const feedback = await generateInterviewFeedback({
        humeChatId: interview.humeChatId,
        jobInfo: interview.jobInfo,
        userName: user.name
    })

    if (feedback == null) return {
        error: true,
        message: "Failed to generate feedback"
    }

    await updateInterview(id, { feedback })

    return { error: false }
}