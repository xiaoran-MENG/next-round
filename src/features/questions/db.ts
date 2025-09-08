import { db } from "@/drizzle/db"
import { QuestionTable } from "@/drizzle/schema"
import { revalidateQuestionCache } from "./dbCache"

export async function insertQuestion(
  question: typeof QuestionTable.$inferInsert
) {
  const [row] = await db
    .insert(QuestionTable)
    .values(question)
    .returning(); // 新 API：不传参数，返回整行

  const result = {
    id: row.id,
    jobInfoId: row.jobInfoId,
  }

  revalidateQuestionCache(result)

  return result
}
