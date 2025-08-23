import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { revalidateJobInfoCache } from "./dbCache";
import { eq } from "drizzle-orm";
import { log } from "console";

export async function insertJobInfo(jobInfo: typeof JobInfoTable.$inferInsert) {
    const [result] = await db.insert(JobInfoTable)
        .values(jobInfo)
        .returning({
            id: JobInfoTable.id,
            userId: JobInfoTable.userId
        })
    revalidateJobInfoCache(result)
    return result
}

export async function updateJobInfo(id: string, jobInfo: Partial<typeof JobInfoTable.$inferInsert>) {
    log('update: ', jobInfo)
    const [result] = await db.update(JobInfoTable)
        .set(jobInfo)
        .where(eq(JobInfoTable.id, id))
        .returning({
            id: JobInfoTable.id,
            userId: JobInfoTable.userId
        })
    revalidateJobInfoCache(result)
    return result
}