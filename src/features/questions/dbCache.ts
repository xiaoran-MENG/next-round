import { globalTag, idTag, jobInfoTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function questionGlobalTag() {
  return globalTag("questions")
}

export function questionJobInfoTag(jobInfoId: string) {
  return jobInfoTag("questions", jobInfoId)
}

export function questionIdTag(id: string) {
  return idTag("questions", id)
}

export function revalidateQuestionCache({
  id,
  jobInfoId,
}: {
  id: string
  jobInfoId: string
}) {
  revalidateTag(questionGlobalTag())
  revalidateTag(questionJobInfoTag(jobInfoId))
  revalidateTag(questionIdTag(id))
}