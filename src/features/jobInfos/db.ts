import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { revalidateJobInfoCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertJobInfo(jobInfo: typeof JobInfoTable.$inferInsert) {
  const [row] = await db
    .insert(JobInfoTable)
    .values(jobInfo)
    .returning(); // 新 API：不传参数

  // 只挑需要的字段
  const result = { id: row.id, userId: row.userId };

  revalidateJobInfoCache(result);
  return result;
}

export async function updateJobInfo(
  id: string,
  jobInfo: Partial<typeof JobInfoTable.$inferInsert>
) {
  const [row] = await db
    .update(JobInfoTable)
    .set(jobInfo)
    .where(eq(JobInfoTable.id, id))
    .returning();

  const result = { id: row.id, userId: row.userId };

  revalidateJobInfoCache(result);
  return result;
}
