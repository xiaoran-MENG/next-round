import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { revalidateInterviewCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertInterview(
  interview: typeof InterviewTable.$inferInsert
) {
  const [row] = await db
    .insert(InterviewTable)
    .values(interview)
    .returning(); // 新 API：不传参

  // 仅用到少量字段就挑出来
  const result = { id: row.id, jobInfoId: row.jobInfoId };

  revalidateInterviewCache(result);
  return result;
}

export async function updateInterview(
  id: string,
  interview: Partial<typeof InterviewTable.$inferInsert>
) {
  const [row] = await db
    .update(InterviewTable)
    .set(interview)
    .where(eq(InterviewTable.id, id))
    .returning(); // 新 API

  const result = { id: row.id, jobInfoId: row.jobInfoId };

  revalidateInterviewCache(result);
  return result;
}
