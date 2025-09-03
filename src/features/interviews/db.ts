import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { revalidateInterviewCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertInterview(interview: typeof InterviewTable.$inferInsert) {
    const [result] = await db
        .insert(InterviewTable)
        .values(interview)
        .returning({
            id: InterviewTable.id,
            jobInfoId: InterviewTable.jobInfoId
        })
    revalidateInterviewCache(result)
    return result
}

export async function updateInterview(
    id: string,
    interview: typeof InterviewTable.$inferInsert
) {
    const [result] = await db
        .update(InterviewTable)
        .set(interview)
        .where(eq(InterviewTable.id, id))
        .returning({
            id: InterviewTable.id,
            jobInfoId: InterviewTable.jobInfoId
        })
    revalidateInterviewCache(result)
    console.log('updated interview', result)
    return result
}