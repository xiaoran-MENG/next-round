import { db } from "@/drizzle/db";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/lib/hasPermission";
import { and, count, eq, isNotNull } from "drizzle-orm";

export async function canCreateInterviews() {
    // All failed returns false
    // Any succeeded returns true
    return await Promise.any([
        hasPermission("unlimited_interviews").then(result => result || Promise.reject()), // Faster
        Promise.all([
            hasPermission("1_interview"),
            countInterviewsForUser()
        ]).then(([result, count]) => {
            if (result && count < 1) return true
            return Promise.reject()
        })
    ]).catch(() => false)
}

async function countInterviewsForUser() {
    const { userId } = await getCurrentUser()
    if (userId == null) return 0
    return countInterviewsByUserId(userId)
}

async function countInterviewsByUserId(userId: string) {
    const [{ count: result }] = await db
        .select({ count: count() })
        .from(InterviewTable)
        .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
        .where(
            and(
                eq(JobInfoTable.userId, userId),
                isNotNull(InterviewTable.humeChatId)
            )
        )
    return result
}