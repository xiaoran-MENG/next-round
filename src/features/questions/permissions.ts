import { db } from "@/drizzle/db";
import { JobInfoTable, QuestionTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/lib/hasPermission";
import { count, eq } from "drizzle-orm";

export async function canCreateQuestions() {
    return await Promise.any([
        hasPermission("unlimited_questions").then(result => result || Promise.reject()), // Faster
        Promise.all([
            hasPermission("5_questions"),
            countQuestionsForUser()
        ]).then(([result, count]) => {
            if (result && count < 5) return true
            return Promise.reject()
        })
    ]).catch(() => false)
}

async function countQuestionsForUser() {
    const { userId } = await getCurrentUser()
    if (userId == null) return 0
    return countQuestionsByUserId(userId)
}

async function countQuestionsByUserId(userId: string) {
    const [{ count: result }] = await db
        .select({ count: count() })
        .from(QuestionTable)
        .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
        .where(eq(JobInfoTable.userId, userId))
    return result
}