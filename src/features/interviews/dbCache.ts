import { globalTag, idTag, jobInfoTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function interviewGlobalTag() {
  return globalTag("interviews")
}
export function interviewJobInfoTag(jobInfoId: string) {
  return jobInfoTag("interviews", jobInfoId)
}

export function interviewIdTag(id: string) {
  return idTag("interviews", id)
}

export function revalidateInterviewCache({ id, jobInfoId }: { id: string, jobInfoId: string }) {
  revalidateTag(interviewGlobalTag())
  revalidateTag(interviewIdTag(id))
  revalidateTag(interviewJobInfoTag(jobInfoId))
}
